"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Plus, X, Loader2, Lock, Home, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useLang } from "@/lib/lang-context";
import LocationFields, { type LocationValue } from "@/components/LocationFields";
import { sanitizeByType } from "@/lib/fieldSanitize";

const RENT_PROPERTY_TYPES = ["House / ಮನೆ", "Flat / ಫ್ಲಾಟ್", "Shop / ಅಂಗಡಿ", "Office / ಕಚೇರಿ", "Commercial Building / ವಾಣಿಜ್ಯ", "PG / ಪಿಜಿ", "Room / ರೂಮ್", "Vacant Land / ಖಾಲಿ ನಿವೇಶನ", "Agricultural Land / ಕೃಷಿ ಜಮೀನು"];
const LEASE_PROPERTY_TYPES = ["House / ಮನೆ", "Flat / ಫ್ಲಾಟ್", "Shop / ಅಂಗಡಿ", "Office / ಕಚೇರಿ", "Commercial Building / ವಾಣಿಜ್ಯ", "Agricultural Land / ಕೃಷಿ ಜಮೀನು", "Vacant Land / ಖಾಲಿ ನಿವೇಶನ", "Commercial Land / ವಾಣಿಜ್ಯ ಭೂಮಿ", "Warehouse / ಗೋದಾಮು"];

// Map a property-rent subcategory slug → the property type it implies, so the
// form opens already matching the category the user chose. Some types are
// land/lease-oriented and should default the mode to Lease.
const SUBCATEGORY_TYPE: Record<string, { type: string; defaultMode: "rent" | "lease" }> = {
  "property-rent-house": { type: "House / ಮನೆ", defaultMode: "rent" },
  "property-rent-shop": { type: "Shop / ಅಂಗಡಿ", defaultMode: "rent" },
  "property-rent-pg-room": { type: "PG / ಪಿಜಿ", defaultMode: "rent" },
  "property-rent-agricultural-land": { type: "Agricultural Land / ಕೃಷಿ ಜಮೀನು", defaultMode: "lease" },
  "property-rent-vacant-land": { type: "Vacant Land / ಖಾಲಿ ನಿವೇಶನ", defaultMode: "lease" },
};

const RENT_FACILITIES = [
  "24-Hour Water / 24-ಗಂಟೆ ನೀರು", "Borewell / Municipal Water", "Electricity / ವಿದ್ಯುತ್", "Separate Meter / ಪ್ರತ್ಯೇಕ ಮೀಟರ್",
  "Solar Power / ಸೌರಶಕ್ತಿ", "Bathroom/Toilet", "Kitchen / ಅಡುಗೆಮನೆ", "Parking / ಪಾರ್ಕಿಂಗ್", "Lift / ಲಿಫ್ಟ್",
  "Balcony / ಬಾಲ್ಕನಿ", "Terrace / ಟೆರೇಸ್", "Garden / ಉದ್ಯಾನ", "CCTV / Security", "Gated Community",
  "Main Road Access", "Drainage / ಚರಂಡಿ", "Waste Collection", "Other / ಇತರ",
];
const LEASE_FACILITIES = [
  "Water Supply / ನೀರು", "Borewell / Open Well", "Electricity / ವಿದ್ಯುತ್", "Separate Meter / ಪ್ರತ್ಯೇಕ ಮೀಟರ್",
  "Solar Power / ಸೌರಶಕ್ತಿ", "Bathroom/Toilet", "Kitchen / ಅಡುಗೆಮನೆ", "Parking / ಪಾರ್ಕಿಂಗ್", "Lift / ಲಿಫ್ಟ್",
  "Storage Space", "Loading/Unloading Area", "Main Road Access", "Truck Access", "Drainage / ಚರಂಡಿ",
  "CCTV / Security", "Boundary Wall / Fencing", "Garden / Open Space", "Other / ಇತರ",
];

const FURNISHING = ["Furnished / ಪೂರ್ಣ ಸಜ್ಜಿತ", "Semi-Furnished / ಅರ್ಧ", "Unfurnished / ಸಜ್ಜಿತವಲ್ಲ"];
const AREA_UNITS = ["Sq.Ft / ಚ.ಅಡಿ", "Acre / ಎಕರೆ", "Gunta / ಗುಂಟೆ"];
const LEASE_DURATIONS = ["1 Year", "3 Years", "5 Years", "10 Years", "Other / ಇತರ"];

export default function PropertyRentForm({ categoryId }: { categoryId: string }) {
  const router = useRouter();
  const { t } = useLang();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derive the implied property type + default mode from the subcategory slug
  // so the form matches the category the user picked (e.g. Agricultural Land).
  const preset = SUBCATEGORY_TYPE[categoryId];

  const [mode, setMode] = useState<"rent" | "lease">(preset?.defaultMode ?? "rent");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loc, setLoc] = useState<LocationValue>({ pincode: "", district: "", taluk: "", area: "" });

  const [propertyType, setPropertyType] = useState(preset?.type ?? "");
  const [title, setTitle] = useState("");
  const [bhk, setBhk] = useState("");
  const [size, setSize] = useState("");
  const [areaUnit, setAreaUnit] = useState("");
  const [furnishing, setFurnishing] = useState("");
  const [condition, setCondition] = useState("");
  const [fullAddress, setFullAddress] = useState("");

  // Rent/Lease amounts
  const [amount, setAmount] = useState("");
  const [deposit, setDeposit] = useState("");
  const [maintenance, setMaintenance] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [leaseDuration, setLeaseDuration] = useState("");
  const [leaseStart, setLeaseStart] = useState("");
  const [leaseEnd, setLeaseEnd] = useState("");
  const [negotiable, setNegotiable] = useState("");

  const [facilities, setFacilities] = useState<string[]>([]);

  // House rules (rent only)
  const [familyAllowed, setFamilyAllowed] = useState("");
  const [bachelorsAllowed, setBachelorsAllowed] = useState("");
  const [petsAllowed, setPetsAllowed] = useState("");

  // Agricultural land options (lease only)
  const [irrigation, setIrrigation] = useState("");
  const [roadAccess, setRoadAccess] = useState("");

  // Contact — locked
  const [ownerName, setOwnerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [description, setDescription] = useState("");

  const isAgriLand = propertyType.startsWith("Agricultural Land");

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) { toast.error("Max 5 photos"); return; }
    setImages((p) => [...p, ...files]);
    files.forEach((f) => { const r = new FileReader(); r.onload = (ev) => setPreviews((p) => [...p, ev.target?.result as string]); r.readAsDataURL(f); });
    e.target.value = "";
  };

  const toggleFacility = (fa: string) =>
    setFacilities((p) => p.includes(fa) ? p.filter((x) => x !== fa) : [...p, fa]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api.getToken()) { toast.error(t("ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಮಾಡಿ", "Please login first")); router.push("/login"); return; }
    if (!title.trim()) { toast.error(t("ಆಸ್ತಿ ಶೀರ್ಷಿಕೆ ಅಗತ್ಯ", "Property title is required")); return; }
    // Phone numbers, if provided, must be a full 10 digits.
    if (mobile && mobile.replace(/\D/g, "").length !== 10) { toast.error(t("ಸರಿಯಾದ 10 ಅಂಕಿಗಳ ಮೊಬೈಲ್", "Enter a valid 10-digit mobile number")); return; }
    if (whatsapp && whatsapp.replace(/\D/g, "").length !== 10) { toast.error(t("ಸರಿಯಾದ 10 ಅಂಕಿಗಳ WhatsApp", "Enter a valid 10-digit WhatsApp number")); return; }

    setLoading(true);
    try {
      const details = {
        mode,
        propertyType: propertyType || null,
        bhk: mode === "rent" ? (bhk || null) : null,
        size: size || null,
        areaUnit: mode === "lease" ? (areaUnit || null) : null,
        furnishing: mode === "rent" ? (furnishing || null) : null,
        condition: mode === "lease" ? (condition || null) : null,
        deposit: deposit || null,
        maintenance: mode === "rent" ? (maintenance || null) : null,
        availableFrom: mode === "rent" ? (availableFrom || null) : null,
        leaseDuration: mode === "lease" ? (leaseDuration || null) : null,
        leaseStart: mode === "lease" ? (leaseStart || null) : null,
        leaseEnd: mode === "lease" ? (leaseEnd || null) : null,
        negotiable: negotiable || null,
        facilities,
        houseRules: mode === "rent" ? { familyAllowed, bachelorsAllowed, petsAllowed } : null,
        agriLand: isAgriLand ? { irrigation, roadAccess } : null,
        private: {
          ownerName: ownerName.trim() || null,
          mobile: mobile.trim() || null,
          whatsapp: whatsapp.trim() || null,
          fullAddress: fullAddress.trim() || null,
        },
      };

      await api.createListing(
        {
          title: title.trim(),
          category: categoryId,
          listingType: mode === "rent" ? "RENT" : "LEASE",
          description: description.trim(),
          location: loc.area.trim(),
          district: loc.district,
          taluk: loc.taluk || null,
          pincode: loc.pincode || null,
          area: size || null,
          price: amount ? parseFloat(amount.replace(/[^0-9.]/g, "")) || null : null,
          rateInfo: amount ? `₹${amount} ${mode === "rent" ? "/month" : "lease"}`.trim() : null,
          details: JSON.stringify(details),
        },
        images.length > 0 ? images : undefined
      );
      toast.success(t("ಆಸ್ತಿ ಜಾಹೀರಾತು ಸಲ್ಲಿಸಲಾಗಿದೆ!", "Property posted!"));
      setTimeout(() => router.push(`/category/${categoryId}`), 1200);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const propertyTypes = mode === "rent" ? RENT_PROPERTY_TYPES : LEASE_PROPERTY_TYPES;
  const facilitiesList = mode === "rent" ? RENT_FACILITIES : LEASE_FACILITIES;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Mode toggle (segmented control) */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-muted rounded-2xl">
        <button type="button" onClick={() => { setMode("rent"); setPropertyType(preset?.type ?? ""); setFacilities([]); }}
          className={`h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition ${mode === "rent" ? "bg-primary text-white shadow-md" : "bg-card text-foreground border border-border hover:border-primary/40"}`}>
          <Home size={16} /> {t("ಬಾಡಿಗೆ (Rent)", "Rent")}
        </button>
        <button type="button" onClick={() => { setMode("lease"); setPropertyType(preset?.type ?? ""); setFacilities([]); }}
          className={`h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition ${mode === "lease" ? "bg-primary text-white shadow-md" : "bg-card text-foreground border border-border hover:border-primary/40"}`}>
          <FileText size={16} /> {t("ಲೀಸ್ (Lease)", "Lease")}
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

      {/* 1. Property type */}
      <Section title={t("1. ಆಸ್ತಿ ವಿಧ (Property Type)", "1. Property Type")}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {propertyTypes.map((p) => (
            <button key={p} type="button" onClick={() => setPropertyType(p)}
              className={`px-3 py-2.5 rounded-xl border text-xs font-medium text-left transition ${propertyType === p ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>{p}</button>
          ))}
        </div>
      </Section>

      {/* 2. Property details */}
      <Section title={t("2. ಆಸ್ತಿ ವಿವರಗಳು (Property Details)", "2. Property Details")}>
        <F label={t("ಆಸ್ತಿ ಶೀರ್ಷಿಕೆ (Property Title)", "Property Title")} value={title} onChange={setTitle} required />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {mode === "rent" && <F label="BHK / Number of Rooms" value={bhk} onChange={setBhk} placeholder="e.g. 2BHK" />}
          <F label={t("ಆಸ್ತಿ ವಿಸ್ತೀರ್ಣ (Size)", "Property Size")} value={size} onChange={setSize} placeholder="e.g. 1200" />
          {mode === "lease" && <SF label="Area Unit / ವಿಸ್ತೀರ್ಣ ಘಟಕ" value={areaUnit} onChange={setAreaUnit} options={AREA_UNITS} />}
          {mode === "rent" && <SF label="Furnishing / ಸಜ್ಜೀಕರಣ" value={furnishing} onChange={setFurnishing} options={FURNISHING} />}
          {mode === "lease" && <F label="Property Condition / ಸ್ಥಿತಿ" value={condition} onChange={setCondition} />}
        </div>
      </Section>

      {/* 3. Rent / Lease details */}
      <Section title={mode === "rent" ? t("3. ಬಾಡಿಗೆ ವಿವರ (Rent Details)", "3. Rent Details") : t("3. ಲೀಸ್ ವಿವರ (Lease Details)", "3. Lease Details")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <F label={mode === "rent" ? "Monthly Rent ₹ / ಮಾಸಿಕ ಬಾಡಿಗೆ" : "Lease Amount ₹ / ಲೀಸ್ ಮೊತ್ತ"} value={amount} onChange={setAmount} type="number" />
          <F label="Advance / Deposit ₹ / ಅಡ್ವಾನ್ಸ್" value={deposit} onChange={setDeposit} type="number" />
          {mode === "rent" && <F label="Maintenance ₹ / ನಿರ್ವಹಣೆ" value={maintenance} onChange={setMaintenance} type="number" />}
          {mode === "rent" && <F label="Available From / ಲಭ್ಯ ದಿನಾಂಕ" value={availableFrom} onChange={setAvailableFrom} type="date" />}
          {mode === "lease" && <SF label="Lease Duration / ಅವಧಿ" value={leaseDuration} onChange={setLeaseDuration} options={LEASE_DURATIONS} />}
          {mode === "lease" && <F label="Lease Start / ಆರಂಭ" value={leaseStart} onChange={setLeaseStart} type="date" />}
          {mode === "lease" && <F label="Lease End / ಕೊನೆ" value={leaseEnd} onChange={setLeaseEnd} type="date" />}
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
      </Section>

      {/* 4. Facilities */}
      <Section title={t("4. ಸೌಲಭ್ಯಗಳು (Facilities)", "4. Facilities")}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {facilitiesList.map((fa) => (
            <button key={fa} type="button" onClick={() => toggleFacility(fa)}
              className={`px-3 py-2 rounded-xl border text-xs font-medium text-left transition flex items-center gap-1.5 ${facilities.includes(fa) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>
              <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${facilities.includes(fa) ? "bg-primary border-primary" : "border-muted-foreground"}`}>
                {facilities.includes(fa) && <span className="text-white text-[9px]">✓</span>}
              </span>
              {fa}
            </button>
          ))}
        </div>
      </Section>

      {/* 5. House rules (rent) */}
      {mode === "rent" && (
        <Section title={t("5. ಮನೆ ನಿಯಮಗಳು (House Rules)", "5. House Rules")}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <YesNo label={t("ಕುಟುಂಬ (Family Allowed)", "Family Allowed")} value={familyAllowed} onChange={setFamilyAllowed} />
            <YesNo label={t("ಬ್ಯಾಚುಲರ್ಸ್ (Bachelors)", "Bachelors Allowed")} value={bachelorsAllowed} onChange={setBachelorsAllowed} />
            <YesNo label={t("ಸಾಕುಪ್ರಾಣಿ (Pets Allowed)", "Pets Allowed")} value={petsAllowed} onChange={setPetsAllowed} />
          </div>
        </Section>
      )}

      {/* 5b. Agricultural land options (lease) */}
      {mode === "lease" && isAgriLand && (
        <Section title={t("ಕೃಷಿ ಜಮೀನು ವಿವರ (Agricultural Land)", "Agricultural Land Options")}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <F label="Irrigation / ನೀರಾವರಿ" value={irrigation} onChange={setIrrigation} placeholder="e.g. Borewell, Canal" />
            <F label="Road Access / ರಸ್ತೆ ಪ್ರವೇಶ" value={roadAccess} onChange={setRoadAccess} />
          </div>
        </Section>
      )}

      {/* 6. Location */}
      <Section title={t("6. ಸ್ಥಳ (Location)", "6. Location")}>
        <LocationFields value={loc} onChange={setLoc} />
      </Section>

      {/* 7. Owner — locked */}
      <Section title={t("7. ಮಾಲೀಕ / ಏಜೆಂಟ್ 🔒", "7. Owner / Agent 🔒")}>
        <p className="text-xs text-muted-foreground flex items-center gap-1 -mt-1 mb-2"><Lock size={11} />{t("ಅನ್‌ಲಾಕ್ ನಂತರ ಮಾತ್ರ ಕಾಣಿಸುತ್ತದೆ", "Shown after unlock")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <F label="Owner / Agent Name / ಹೆಸರು" value={ownerName} onChange={setOwnerName} />
          <F label="Mobile Number / ಮೊಬೈಲ್" value={mobile} onChange={setMobile} type="tel" />
          <F label="WhatsApp (Optional)" value={whatsapp} onChange={setWhatsapp} type="tel" />
          <F label="Full Address / ಪೂರ್ಣ ವಿಳಾಸ (Optional)" value={fullAddress} onChange={setFullAddress} />
        </div>
      </Section>

      {/* 8. Description */}
      <Section title={t("8. ವಿವರಣೆ (Property Description)", "8. Property Description")}>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder={t("ಆಸ್ತಿಯ ಬಗ್ಗೆ ವಿವರ...", "Describe the property...")} />
      </Section>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading} className="bg-primary px-8 h-11 font-medium">
          {loading ? <><Loader2 size={16} className="mr-2 animate-spin" />{t("ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...", "Posting...")}</> : t("ಆಸ್ತಿ ಪೋಸ್ಟ್ ಮಾಡಿ (Post Property)", "Post Property")}
        </Button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="bg-card rounded-2xl p-4 sm:p-5 border border-border shadow-sm space-y-3"><h3 className="text-sm font-semibold text-foreground">{title}</h3>{children}</div>;
}
function F({ label, value, onChange, type = "text", placeholder, required }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean }) {
  const inputMode = type === "number" || type === "tel" ? "numeric" : undefined;
  return <div><label className="text-xs sm:text-sm font-medium text-foreground mb-1 block">{label}{required && <span className="text-red-500"> *</span>}</label><Input value={value} onChange={(e) => onChange(sanitizeByType(e.target.value, { type, key: label }))} type={type === "number" ? "text" : type} inputMode={inputMode} placeholder={placeholder || label} className="h-10 sm:h-11" /></div>;
}
function SF({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return <div><label className="text-xs sm:text-sm font-medium text-foreground mb-1 block">{label}</label><select value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-10 sm:h-11 rounded-md border border-border bg-card text-foreground px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"><option value="">Select</option>{options.map((o) => <option key={o} value={o}>{o}</option>)}</select></div>;
}
function YesNo({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="text-xs sm:text-sm font-medium text-foreground mb-1">{label}</p>
      <div className="flex gap-2">
        {["Yes / ಹೌದು", "No / ಇಲ್ಲ"].map((o) => (
          <button key={o} type="button" onClick={() => onChange(o)}
            className={`flex-1 h-10 rounded-xl border text-sm font-medium transition ${value === o ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>{o}</button>
        ))}
      </div>
    </div>
  );
}
