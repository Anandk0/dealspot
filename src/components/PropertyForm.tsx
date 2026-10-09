"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Plus, X, Loader2, LocateFixed, Check, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { api, type DistrictOption } from "@/lib/api";
import { useLocation } from "@/lib/location-context";
import { useLang } from "@/lib/lang-context";

/**
 * Detailed property form for property-sales and property-rent categories.
 * Collects basic info, property details, documents, contact and (optionally)
 * a pinned map location. Public fields go to top-level columns + details JSON;
 * contact + exact map coordinates go into details.private (hidden until unlock).
 */
export default function PropertyForm({
  categoryId,
  rent,
}: {
  categoryId: string;
  rent: boolean;
}) {
  const router = useRouter();
  const { t } = useLang();
  const { setCoords: setBuyerCoords } = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [pinning, setPinning] = useState(false);

  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [taluks, setTaluks] = useState<string[]>([]);

  // Form state
  const [f, setF] = useState({
    title: "",
    location: "",
    district: "",
    taluk: "",
    propertyArea: "",
    price: "",
    pricePerUnit: "",
    negotiable: "",
    roadFacing: "",
    roadType: "",
    cornerProperty: "",
    water: "",
    electricity: "",
    borewell: "",
    rtc: "",
    saleDeed: "",
    khata: "",
    ec: "",
    otherDocuments: "",
    ownerAgent: "",
    mobile: "",
    whatsapp: "",
    preferredTime: "",
    description: "",
  });

  const set = (k: keyof typeof f, v: string) => setF((prev) => ({ ...prev, [k]: v }));

  useEffect(() => {
    api.getDistricts().then(setDistricts).catch(() => setDistricts([]));
  }, []);

  // Load taluks when district changes.
  useEffect(() => {
    if (!f.district) {
      setTaluks([]);
      return;
    }
    api.getTaluks(f.district).then(setTaluks).catch(() => setTaluks([]));
  }, [f.district]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      toast.error(t("ಗರಿಷ್ಠ 5 ಫೋಟೋಗಳು ಮಾತ್ರ", "Max 5 photos"));
      return;
    }
    setImages([...images, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviews((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (i: number) => {
    setImages(images.filter((_, idx) => idx !== i));
    setPreviews(previews.filter((_, idx) => idx !== i));
  };

  const pinLocation = () => {
    if (!("geolocation" in navigator)) {
      toast.error(t("ಲೊಕೇಶನ್ ಲಭ್ಯವಿಲ್ಲ", "Location not available"));
      return;
    }
    setPinning(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(c);
        setBuyerCoords(c);
        setPinning(false);
        toast.success(t("ಲೊಕೇಶನ್ ಪಿನ್ ಆಗಿದೆ", "Location pinned"));
      },
      () => {
        setPinning(false);
        toast.error(t("ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ", "Permission denied"));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api.getToken()) {
      toast.error(t("ದಯವಿಟ್ಟು ಮೊದಲು ಲಾಗಿನ್ ಮಾಡಿ", "Please login first"));
      router.push("/login");
      return;
    }
    if (!f.title.trim()) {
      toast.error(t("ಆಸ್ತಿ ಶೀರ್ಷಿಕೆ ಅಗತ್ಯ", "Property title is required"));
      return;
    }

    setLoading(true);
    try {
      const rawPrice = f.price ? f.price.replace(/[^0-9.]/g, "") : "";
      const parsedPrice = rawPrice ? parseFloat(rawPrice) : null;

      // details JSON: public attributes + a private block (contact + exact map)
      // that the backend hides until the viewer unlocks the listing.
      const details = {
        taluk: f.taluk || null,
        propertyArea: f.propertyArea || null,
        pricePerUnit: f.pricePerUnit || null,
        negotiable: f.negotiable || null,
        roadFacing: f.roadFacing || null,
        roadType: f.roadType || null,
        cornerProperty: f.cornerProperty || null,
        water: f.water || null,
        electricity: f.electricity || null,
        borewell: f.borewell || null,
        documents: {
          rtc: f.rtc || null,
          saleDeed: f.saleDeed || null,
          khata: f.khata || null,
          ec: f.ec || null,
          other: f.otherDocuments || null,
        },
        private: {
          ownerAgent: f.ownerAgent || null,
          mobile: f.mobile || null,
          whatsapp: f.whatsapp || null,
          preferredTime: f.preferredTime || null,
          mapLat: coords?.lat ?? null,
          mapLng: coords?.lng ?? null,
        },
      };

      const listingData: Record<string, unknown> = {
        title: f.title.trim(),
        category: categoryId,
        description: f.description.trim() || "",
        location: f.location.trim() || "",
        district: f.district || "",
        area: f.propertyArea.trim() || null,
        price: parsedPrice && !isNaN(parsedPrice) ? parsedPrice : null,
        // We do NOT store exact lat/lng on the top-level columns (those show the
        // distance publicly). The precise pin lives only in details.private.
        details: JSON.stringify(details),
      };

      await api.createListing(listingData, images.length > 0 ? images : undefined);
      toast.success(t("ಜಾಹೀರಾತು ಸಲ್ಲಿಸಲಾಗಿದೆ!", "Listing submitted!"));
      setTimeout(() => router.push(`/category/${categoryId}`), 1200);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("ಸಲ್ಲಿಕೆ ವಿಫಲ", "Submission failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Photos */}
      <Section title={t("ಫೋಟೋಗಳು (ಗರಿಷ್ಠ 5)", "Photos (max 5)")}>
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
        <div className="flex gap-2.5 flex-wrap">
          {previews.map((p, i) => (
            <div key={i} className="relative w-20 h-20 sm:w-24 sm:h-24">
              <img src={p} alt="" className="w-full h-full object-cover rounded-xl border border-border" />
              <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow">
                <X size={12} />
              </button>
            </div>
          ))}
          {images.length < 5 && (
            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition bg-muted/30">
              {images.length === 0 ? <Camera size={22} /> : <Plus size={18} />}
              <span className="text-[10px] mt-1">{images.length === 0 ? t("ಸೇರಿಸಿ", "Add") : t("ಇನ್ನಷ್ಟು", "More")}</span>
            </button>
          )}
        </div>
      </Section>

      {/* 1. Basic Details */}
      <Section title={t("1. ಮೂಲ ವಿವರಗಳು", "1. Basic Details")}>
        <TextField label={t("ಆಸ್ತಿ ಶೀರ್ಷಿಕೆ (Property Title)", "Property Title")} value={f.title} onChange={(v) => set("title", v)} required />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextField label={t("ಸ್ಥಳ / ಗ್ರಾಮ (Location / Village)", "Location / Village")} value={f.location} onChange={(v) => set("location", v)} />
          <SelectField
            label={t("ಜಿಲ್ಲೆ (District)", "District")}
            value={f.district}
            onChange={(v) => { set("district", v); set("taluk", ""); }}
            options={districts.map((d) => ({ value: d.nameEn, label: `${d.name} (${d.nameEn})` }))}
            placeholder={t("ಆಯ್ಕೆಮಾಡಿ", "Select")}
          />
          <SelectField
            label={t("ತಾಲೂಕು (Taluk)", "Taluk")}
            value={f.taluk}
            onChange={(v) => set("taluk", v)}
            options={taluks.map((tk) => ({ value: tk, label: tk }))}
            placeholder={f.district ? t("ಆಯ್ಕೆಮಾಡಿ", "Select") : t("ಮೊದಲು ಜಿಲ್ಲೆ ಆಯ್ಕೆಮಾಡಿ", "Select district first")}
            disabled={!f.district}
          />
          <TextField label={t("ಆಸ್ತಿ ವಿಸ್ತೀರ್ಣ (Property Area)", "Property Area")} value={f.propertyArea} onChange={(v) => set("propertyArea", v)} placeholder={t("ಉದಾ: 2400 sq.ft / 1 acre", "e.g. 2400 sq.ft / 1 acre")} />
          <TextField label={t("ನಿರೀಕ್ಷಿತ ಬೆಲೆ (Expected Price ₹)", "Expected Price ₹")} value={f.price} onChange={(v) => set("price", v)} type="number" />
          <TextField label={t("ಪ್ರತಿ Sq.ft / Acre ಬೆಲೆ", "Price per Sq.ft / Acre")} value={f.pricePerUnit} onChange={(v) => set("pricePerUnit", v)} />
        </div>
        <YesNoField label={t("ಚೌಕಾಸಿ (Negotiable)", "Negotiable")} value={f.negotiable} onChange={(v) => set("negotiable", v)} />
      </Section>

      {/* 2. Property Details */}
      <Section title={t("2. ಆಸ್ತಿ ವಿವರಗಳು", "2. Property Details")}>
        <YesNoField label={t("ರಸ್ತೆ ಮುಖ (Road Facing)", "Road Facing")} value={f.roadFacing} onChange={(v) => set("roadFacing", v)} />
        <SelectField
          label={t("ರಸ್ತೆ ಪ್ರಕಾರ (Road Type)", "Road Type")}
          value={f.roadType}
          onChange={(v) => set("roadType", v)}
          options={[
            { value: "Main Road", label: t("ಮುಖ್ಯ ರಸ್ತೆ (Main Road)", "Main Road") },
            { value: "Interior Road", label: t("ಒಳ ರಸ್ತೆ (Interior Road)", "Interior Road") },
          ]}
          placeholder={t("ಆಯ್ಕೆಮಾಡಿ", "Select")}
        />
        <YesNoField label={t("ಮೂಲೆ ಆಸ್ತಿ (Corner Property)", "Corner Property")} value={f.cornerProperty} onChange={(v) => set("cornerProperty", v)} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <YesNoField label={t("ನೀರು (Water)", "Water Facility")} value={f.water} onChange={(v) => set("water", v)} />
          <YesNoField label={t("ವಿದ್ಯುತ್ (Electricity)", "Electricity")} value={f.electricity} onChange={(v) => set("electricity", v)} />
          <YesNoField label={t("ಬೋರ್‌ವೆಲ್ (Borewell)", "Borewell")} value={f.borewell} onChange={(v) => set("borewell", v)} />
        </div>
      </Section>

      {/* 3. Documents */}
      <Section title={t("3. ದಾಖಲೆಗಳು", "3. Documents")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <YesNoField label="RTC" value={f.rtc} onChange={(v) => set("rtc", v)} />
          <YesNoField label={t("ಸೇಲ್ ಡೀಡ್ (Sale Deed)", "Sale Deed")} value={f.saleDeed} onChange={(v) => set("saleDeed", v)} />
          <YesNoField label={t("ಖಾತಾ (Khata)", "Khata")} value={f.khata} onChange={(v) => set("khata", v)} />
          <YesNoField label="EC" value={f.ec} onChange={(v) => set("ec", v)} />
        </div>
        <TextField label={t("ಇತರ ದಾಖಲೆಗಳು (Other Documents)", "Other Documents")} value={f.otherDocuments} onChange={(v) => set("otherDocuments", v)} />
      </Section>

      {/* 4. Contact (private) */}
      <Section title={t("4. ಸಂಪರ್ಕ (ಪಾವತಿ ನಂತರ ಗೋಚರ)", "4. Contact (shown to buyers after unlock)")}>
        <p className="text-xs text-muted-foreground -mt-1">
          {t("ಈ ವಿವರಗಳು ಖರೀದಿದಾರರಿಗೆ ಅನ್‌ಲಾಕ್ ನಂತರ ಮಾತ್ರ ಕಾಣಿಸುತ್ತವೆ", "These details are revealed to buyers only after they unlock the contact.")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextField label={t("ಮಾಲೀಕ / ಏಜೆಂಟ್ (Owner / Agent)", "Owner / Agent")} value={f.ownerAgent} onChange={(v) => set("ownerAgent", v)} />
          <TextField label={t("ಮೊಬೈಲ್ ನಂಬರ್ (Mobile Number)", "Mobile Number")} value={f.mobile} onChange={(v) => set("mobile", v)} type="tel" />
          <TextField label={t("ವಾಟ್ಸಾಪ್ (WhatsApp)", "WhatsApp")} value={f.whatsapp} onChange={(v) => set("whatsapp", v)} type="tel" />
          <TextField label={t("ಇಷ್ಟದ ಸಂಪರ್ಕ ಸಮಯ (Preferred Contact Time)", "Preferred Contact Time")} value={f.preferredTime} onChange={(v) => set("preferredTime", v)} placeholder={t("ಉದಾ: ಬೆಳಿಗ್ಗೆ 9-11", "e.g. 9-11 AM")} />
        </div>
      </Section>

      {/* 5. Map Location (private) */}
      <Section title={t("5. ಗೂಗಲ್ ಮ್ಯಾಪ್ ಲೊಕೇಶನ್ (ಪಾವತಿ ನಂತರ)", "5. Map Location (shown after unlock)")}>
        <p className="text-xs text-muted-foreground -mt-1">
          {t("ನಿಖರ ಲೊಕೇಶನ್ ಖರೀದಿದಾರರಿಗೆ ಅನ್‌ಲಾಕ್ ನಂತರ ತೆರೆಯುತ್ತದೆ", "The exact map pin opens for buyers only after they unlock.")}
        </p>
        <button
          type="button"
          onClick={pinLocation}
          disabled={pinning}
          className={`flex items-center gap-2 w-full sm:w-auto px-4 h-11 rounded-xl border text-sm transition ${
            coords ? "border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400" : "border-border bg-background text-foreground hover:border-primary/50"
          }`}
        >
          {pinning ? <><Loader2 size={16} className="animate-spin" /> {t("ಪತ್ತೆ ಮಾಡಲಾಗುತ್ತಿದೆ...", "Detecting...")}</>
            : coords ? <><Check size={16} /> {t("ಲೊಕೇಶನ್ ಪಿನ್ ಆಗಿದೆ", "Location pinned")}</>
            : <><LocateFixed size={16} /> {t("ಆಸ್ತಿಯ ಲೊಕೇಶನ್ ಪಿನ್ ಮಾಡಿ", "Pin property location")}</>}
        </button>
      </Section>

      {/* Description */}
      <Section title={t("ವಿವರಣೆ (Description)", "Description")}>
        <Textarea value={f.description} onChange={(e) => set("description", e.target.value)} placeholder={t("ಹೆಚ್ಚಿನ ವಿವರಗಳು...", "Additional details...")} rows={4} />
      </Section>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button type="submit" disabled={loading} className="bg-primary w-full sm:w-auto px-8 h-11 text-sm font-medium">
          {loading ? <><Loader2 size={16} className="mr-2 animate-spin" /> {t("ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...", "Submitting...")}</> : t("ಸಲ್ಲಿಸಿ (Submit Listing)", "Submit Listing")}
        </Button>
      </div>
    </form>
  );
}

// ── Small presentational helpers ──
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl p-4 sm:p-5 border border-border shadow-sm space-y-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  );
}

function TextField({ label, value, onChange, type = "text", placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs sm:text-sm font-medium text-foreground mb-1 block">
        {label}{required && <span className="text-red-500"> *</span>}
      </label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} type={type} placeholder={placeholder || label} className="h-10 sm:h-11" />
    </div>
  );
}

function SelectField({ label, value, onChange, options, placeholder, disabled }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; placeholder?: string; disabled?: boolean;
}) {
  return (
    <div>
      <label className="text-xs sm:text-sm font-medium text-foreground mb-1 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full h-10 sm:h-11 rounded-md border border-border bg-card text-foreground px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
      >
        <option value="">{placeholder || "Select"}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function YesNoField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs sm:text-sm font-medium text-foreground mb-1 block">{label}</label>
      <div className="flex gap-2">
        {["Yes", "No"].map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(value === opt ? "" : opt)}
            className={`flex-1 h-10 rounded-lg border text-sm font-medium transition ${
              value === opt
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {opt === "Yes" ? "Yes / ಹೌದು" : "No / ಇಲ್ಲ"}
          </button>
        ))}
      </div>
    </div>
  );
}
