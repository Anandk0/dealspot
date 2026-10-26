"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Plus, X, Loader2, Lock, ShoppingCart, Tractor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useLang } from "@/lib/lang-context";
import LocationFields, { type LocationValue } from "@/components/LocationFields";
import { sanitizeByType } from "@/lib/fieldSanitize";

const EQUIPMENT_TYPES = [
  "Tractor / ಟ್ರ್ಯಾಕ್ಟರ್",
  "Rotavator / ರೋಟಾವೇಟರ್",
  "Cultivator / ಕಲ್ಟಿವೇಟರ್",
  "Plough / ನೇಗಿಲು",
  "Harvester / ಕೊಯ್ಲು ಯಂತ್ರ",
  "Seed Drill / ಬಿತ್ತನೆ ಯಂತ್ರ",
  "Sprayer / ಸಿಂಪಡಣೆ",
  "Water Pump / ನೀರಿನ ಪಂಪ್",
  "Thresher / ಒಕ್ಕಣೆ ಯಂತ್ರ",
  "Trailer / ಟ್ರೈಲರ್",
  "Power Tiller / ಪವರ್ ಟಿಲ್ಲರ್",
  "Fertilizer Machine / ಗೊಬ್ಬರ ಯಂತ್ರ",
  "Other Equipment / ಇತರ",
];

const RENT_TYPES = ["Per Hour / ಗಂಟೆಗೆ", "Per Day / ದಿನಕ್ಕೆ", "Per Acre / ಎಕರೆಗೆ"];

export default function AgricultureEquipmentForm({ categoryId }: { categoryId: string }) {
  const router = useRouter();
  const { t } = useLang();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<"sale" | "rent">("sale");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loc, setLoc] = useState<LocationValue>({ pincode: "", district: "", taluk: "", area: "" });

  const [equipmentType, setEquipmentType] = useState("");
  const [equipmentTypeOther, setEquipmentTypeOther] = useState("");
  const [equipmentName, setEquipmentName] = useState("");
  const [brand, setBrand] = useState("");
  const [year, setYear] = useState("");
  const [condition, setCondition] = useState("");
  const [price, setPrice] = useState("");
  const [negotiable, setNegotiable] = useState("");
  // Rent-specific
  const [rentType, setRentType] = useState("");
  const [deposit, setDeposit] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [deliveryAvailable, setDeliveryAvailable] = useState("");
  const [operatorAvailable, setOperatorAvailable] = useState("");
  const [fuelIncluded, setFuelIncluded] = useState("");
  // Contact (locked)
  const [ownerName, setOwnerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [description, setDescription] = useState("");

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) { toast.error("Max 5 photos"); return; }
    setImages((p) => [...p, ...files]);
    files.forEach((f) => { const r = new FileReader(); r.onload = (ev) => setPreviews((p) => [...p, ev.target?.result as string]); r.readAsDataURL(f); });
    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api.getToken()) { toast.error("Please login"); router.push("/login"); return; }
    if (!equipmentType && !equipmentName.trim()) { toast.error("ಉಪಕರಣ ಆಯ್ಕೆ ಮಾಡಿ (Select equipment type)"); return; }
    const typeIsOther = equipmentType.includes("Other");
    if (typeIsOther && !equipmentTypeOther.trim() && !equipmentName.trim()) { toast.error(t("ಉಪಕರಣ ಹೆಸರು ನಮೂದಿಸಿ", "Please specify the equipment")); return; }
    // Phone numbers, if provided, must be a full 10 digits.
    if (mobile && mobile.replace(/\D/g, "").length !== 10) { toast.error(t("ಸರಿಯಾದ 10 ಅಂಕಿಗಳ ಮೊಬೈಲ್", "Enter a valid 10-digit mobile number")); return; }
    if (whatsapp && whatsapp.replace(/\D/g, "").length !== 10) { toast.error(t("ಸರಿಯಾದ 10 ಅಂಕಿಗಳ WhatsApp", "Enter a valid 10-digit WhatsApp number")); return; }
    const resolvedType = typeIsOther && equipmentTypeOther.trim() ? equipmentTypeOther.trim() : equipmentType;

    setLoading(true);
    try {
      const details = {
        mode,
        equipmentType: resolvedType || null,
        brand,
        year: year || null,
        condition,
        negotiable,
        rentType: mode === "rent" ? rentType : null,
        deposit: mode === "rent" ? (deposit || null) : null,
        availableFrom: mode === "rent" ? (availableFrom || null) : null,
        deliveryAvailable: mode === "rent" ? deliveryAvailable : null,
        operatorAvailable: mode === "rent" ? operatorAvailable : null,
        fuelIncluded: mode === "rent" ? fuelIncluded : null,
        private: {
          ownerName: ownerName.trim() || null,
          mobile: mobile.trim() || null,
          whatsapp: whatsapp.trim() || null,
        },
      };

      await api.createListing(
        {
          title: `${equipmentName.trim() || equipmentType} — ${mode === "sale" ? "For Sale" : "For Rent"}`,
          category: categoryId,
          listingType: mode === "sale" ? "SALE" : "RENT",
          description: description.trim(),
          location: loc.area.trim(),
          district: loc.district,
          taluk: loc.taluk || null,
          pincode: loc.pincode || null,
          condition: condition || null,
          price: price ? parseFloat(price.replace(/[^0-9.]/g, "")) || null : null,
          rateInfo: mode === "rent" && price ? `₹${price} ${rentType}`.trim() : null,
          details: JSON.stringify(details),
        },
        images.length > 0 ? images : undefined
      );
      toast.success(t("ಉಪಕರಣ ಜಾಹೀರಾತು ಸಲ್ಲಿಸಲಾಗಿದೆ!", "Equipment listing posted!"));
      setTimeout(() => router.push(`/category/${categoryId}`), 1200);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Mode toggle — Sale vs Rent (segmented control) */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-muted rounded-2xl">
        <button type="button" onClick={() => setMode("sale")}
          className={`h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition ${mode === "sale" ? "bg-primary text-white shadow-md" : "bg-card text-foreground border border-border hover:border-primary/40"}`}>
          <ShoppingCart size={16} /> {t("ಮಾರಾಟ (For Sale)", "For Sale")}
        </button>
        <button type="button" onClick={() => setMode("rent")}
          className={`h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition ${mode === "rent" ? "bg-primary text-white shadow-md" : "bg-card text-foreground border border-border hover:border-primary/40"}`}>
          <Tractor size={16} /> {t("ಬಾಡಿಗೆ (For Rent)", "For Rent")}
        </button>
      </div>

      {/* Photos */}
      <Section title={t("ಫೋಟೋಗಳು (ಗರಿಷ್ಠ 5)", "Photos (max 5)")}>
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
        <div className="flex gap-2.5 flex-wrap">
          {previews.map((p, i) => (
            <div key={i} className="relative w-20 h-20">
              <img src={p} alt="" className="w-full h-full object-cover rounded-xl border border-border" />
              <button type="button" onClick={() => { setImages((a) => a.filter((_, j) => j !== i)); setPreviews((a) => a.filter((_, j) => j !== i)); }} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"><X size={12} /></button>
            </div>
          ))}
          {images.length < 5 && (
            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-20 h-20 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground hover:border-primary bg-muted/30 transition">
              {images.length === 0 ? <Camera size={22} /> : <Plus size={18} />}
              <span className="text-[10px] mt-1">{images.length === 0 ? "Add" : "More"}</span>
            </button>
          )}
        </div>
      </Section>

      {/* 1. Equipment type */}
      <Section title={t("1. ಉಪಕರಣ ವಿಧ (Equipment Type)", "1. Equipment Type")}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {EQUIPMENT_TYPES.map((eq) => (
            <button key={eq} type="button" onClick={() => { setEquipmentType(eq); if (!equipmentName && !eq.includes("Other")) setEquipmentName(eq.split(" / ")[0]); }}
              className={`px-3 py-2.5 rounded-xl border text-xs font-medium text-left transition ${equipmentType === eq ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>{eq}</button>
          ))}
        </div>
        {equipmentType.includes("Other") && (
          <div className="mt-3">
            <EF label={t("ಉಪಕರಣ ಹೆಸರು ನಮೂದಿಸಿ (Specify Equipment)", "Specify the equipment")} value={equipmentTypeOther} onChange={setEquipmentTypeOther} placeholder={t("ಉಪಕರಣ ಹೆಸರು", "Enter equipment name")} />
          </div>
        )}
      </Section>

      {/* 2. Equipment details */}
      <Section title={t("2. ಉಪಕರಣ ವಿವರಗಳು (Equipment Details)", "2. Equipment Details")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <EF label="Equipment Name / ಉಪಕರಣ ಹೆಸರು *" value={equipmentName} onChange={setEquipmentName} required />
          <EF label="Brand & Model / ಬ್ರ್ಯಾಂಡ್" value={brand} onChange={setBrand} />
          {mode === "sale" && <EF label="Manufacturing Year / ವರ್ಷ" value={year} onChange={setYear} type="number" placeholder="e.g. 2019" />}
        </div>
        <div className="mt-2">
          <p className="text-xs font-medium text-muted-foreground mb-2">{t("ಸ್ಥಿತಿ (Condition)", "Condition")}</p>
          <div className="flex flex-wrap gap-2">
            {["New / ಹೊಸ", "Used – Good / ಬಳಸಿದ – ಒಳ್ಳೆ", "Used – Fair / ಬಳಸಿದ – ಸಾಧಾರಣ"].map((c) => (
              <button key={c} type="button" onClick={() => setCondition(c)}
                className={`px-3 py-2 rounded-xl border text-xs font-medium transition ${condition === c ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>{c}</button>
            ))}
          </div>
        </div>
      </Section>

      {/* 3. Pricing */}
      <Section title={mode === "sale" ? t("3. ಮಾರಾಟ ವಿವರ (Sale Details)", "3. Sale Details") : t("3. ಬಾಡಿಗೆ ವಿವರ (Rent Details)", "3. Rent Details")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <EF label={mode === "sale" ? "Selling Price ₹ / ಮಾರಾಟ ಬೆಲೆ" : "Rent Amount ₹ / ಬಾಡಿಗೆ ದರ"} value={price} onChange={setPrice} type="number" />
          {mode === "rent" && (
            <>
              <div>
                <label className="text-xs sm:text-sm font-medium text-foreground mb-1 block">Rent Type / ದರ ಆಧಾರ</label>
                <select value={rentType} onChange={(e) => setRentType(e.target.value)} className="w-full h-10 sm:h-11 rounded-md border border-border bg-card text-foreground px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">Select</option>
                  {RENT_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <EF label="Security Deposit ₹ / ಠೇವಣಿ (optional)" value={deposit} onChange={setDeposit} type="number" />
              <EF label="Available From / ಲಭ್ಯ ದಿನಾಂಕ" value={availableFrom} onChange={setAvailableFrom} type="date" />
            </>
          )}
        </div>
        <div className="mt-2">
          <p className="text-xs font-medium text-muted-foreground mb-2">{t("ಬೆಲೆ ಮಾತುಕತೆ (Negotiable)", "Negotiable")}</p>
          <div className="flex gap-2">
            {["Yes / ಹೌದು", "No / ಇಲ್ಲ"].map((n) => (
              <button key={n} type="button" onClick={() => setNegotiable(n)}
                className={`flex-1 h-10 rounded-xl border text-sm font-medium transition ${negotiable === n ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>{n}</button>
            ))}
          </div>
        </div>
        {mode === "rent" && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { label: "Delivery Available / ಡೆಲಿವರಿ", value: deliveryAvailable, set: setDeliveryAvailable },
              { label: "Operator Included / ಆಪರೇಟರ್", value: operatorAvailable, set: setOperatorAvailable },
              { label: "Fuel Included / ಇಂಧನ", value: fuelIncluded, set: setFuelIncluded },
            ].map(({ label, value, set }) => (
              <div key={label}>
                <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
                <div className="flex gap-1">
                  {["Yes", "No"].map((o) => (
                    <button key={o} type="button" onClick={() => set(o)}
                      className={`flex-1 h-9 rounded-lg border text-xs font-medium transition ${value === o ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>{o}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* 4. Location */}
      <Section title={t("4. ಸ್ಥಳ (Location)", "4. Location")}>
        <LocationFields value={loc} onChange={setLoc} />
      </Section>

      {/* 5. Owner — locked */}
      <Section title={t("5. ಮಾಲೀಕರ ವಿವರ 🔒", "5. Owner Details 🔒")}>
        <p className="text-xs text-muted-foreground flex items-center gap-1 -mt-1 mb-2"><Lock size={11} />{t("ಅನ್‌ಲಾಕ್ ನಂತರ ಮಾತ್ರ ಕಾಣಿಸುತ್ತದೆ", "Shown after unlock")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <EF label="Owner Name / ಮಾಲೀಕರ ಹೆಸರು" value={ownerName} onChange={setOwnerName} />
          <EF label="Mobile / ಮೊಬೈಲ್" value={mobile} onChange={setMobile} type="tel" />
          <EF label="WhatsApp (Optional)" value={whatsapp} onChange={setWhatsapp} type="tel" />
        </div>
      </Section>

      {/* Description */}
      <Section title={t("6. ವಿವರಣೆ (Optional)", "6. Description (Optional)")}>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Any additional information..." />
      </Section>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading} className="bg-primary px-8 h-11 font-medium">
          {loading ? <><Loader2 size={16} className="mr-2 animate-spin" />Posting...</> : t("ಪೋಸ್ಟ್ ಮಾಡಿ (Post Listing)", "Post Listing")}
        </Button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="bg-card rounded-2xl p-4 sm:p-5 border border-border shadow-sm space-y-3"><h3 className="text-sm font-semibold text-foreground">{title}</h3>{children}</div>;
}
function EF({ label, value, onChange, type = "text", placeholder, required }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean }) {
  const inputMode = type === "number" || type === "tel" ? "numeric" : undefined;
  return <div><label className="text-xs sm:text-sm font-medium text-foreground mb-1 block">{label}{required && <span className="text-red-500"> *</span>}</label><Input value={value} onChange={(e) => onChange(sanitizeByType(e.target.value, { type, key: label }))} type={type === "number" ? "text" : type} inputMode={inputMode} placeholder={placeholder || label} className="h-10 sm:h-11" /></div>;
}
