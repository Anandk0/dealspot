"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Plus, X, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useLang } from "@/lib/lang-context";
import LocationFields, { type LocationValue } from "@/components/LocationFields";
import { sanitizeByType } from "@/lib/fieldSanitize";

const VEHICLE_NAMES: Record<string, string> = {
  "vehicle-car": "ಕಾರು (Car)",
  "vehicle-auto": "ಆಟೋ (Auto Rickshaw)",
  "vehicle-tempo": "ಟೆಂಪೋ (Tempo)",
  "vehicle-mini-truck": "ಮಿನಿ ಟ್ರಕ್ (Mini Truck)",
};

const FUEL_TYPES = ["Petrol / ಪೆಟ್ರೋಲ್", "Diesel / ಡೀಸೆಲ್", "CNG", "Electric / ಎಲೆಕ್ಟ್ರಿಕ್", "Other / ಇತರ"];
const SERVICE_TYPES = ["With Driver / ಚಾಲಕರೊಂದಿಗೆ", "Without Driver / ಚಾಲಕರಿಲ್ಲದೆ", "Goods Transport / ಸರಕು ಸಾಗಣೆ", "Agriculture Work / ಕೃಷಿ ಕೆಲಸ"];
const RENT_TYPES = ["Per Hour / ಗಂಟೆಗೆ", "Per Day / ದಿನಕ್ಕೆ", "Per KM / ಕಿ.ಮೀ.ಗೆ", "Per Trip / ಟ್ರಿಪ್‌ಗೆ", "Per Month / ತಿಂಗಳಿಗೆ"];

export default function VehicleRentForm({ categoryId }: { categoryId: string }) {
  const router = useRouter();
  const { t } = useLang();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const vehicleLabel = VEHICLE_NAMES[categoryId] || "ವಾಹನ (Vehicle)";

  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loc, setLoc] = useState<LocationValue>({ pincode: "", district: "", taluk: "", area: "" });

  const [vehicleName, setVehicleName] = useState("");
  const [brand, setBrand] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [fuel, setFuel] = useState("");
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [rent, setRent] = useState("");
  const [rentType, setRentType] = useState("");
  const [deposit, setDeposit] = useState("");
  const [fullAddress, setFullAddress] = useState("");
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

  const toggleService = (s: string) =>
    setServiceTypes((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api.getToken()) { toast.error("Please login"); router.push("/login"); return; }
    if (!vehicleName.trim()) { toast.error("ವಾಹನ ಹೆಸರು ಅಗತ್ಯ (Vehicle name required)"); return; }

    setLoading(true);
    try {
      const details = {
        brand,
        vehicleNumber,
        fuel,
        serviceTypes,
        rentType,
        deposit: deposit || null,
        fullAddress: fullAddress || null,
        private: {
          ownerName: ownerName.trim() || null,
          mobile: mobile.trim() || null,
          whatsapp: whatsapp.trim() || null,
        },
      };

      await api.createListing(
        {
          title: `${vehicleName.trim()} — ${vehicleLabel}`,
          category: categoryId,
          description: description.trim(),
          location: loc.area.trim(),
          district: loc.district,
          taluk: loc.taluk || null,
          pincode: loc.pincode || null,
          vehicleType: vehicleLabel,
          rateInfo: rent ? `₹${rent} ${rentType}`.trim() : null,
          price: rent ? parseFloat(rent.replace(/[^0-9.]/g, "")) || null : null,
          details: JSON.stringify(details),
        },
        images.length > 0 ? images : undefined
      );
      toast.success(t("ವಾಹನ ಜಾಹೀರಾತು ಸಲ್ಲಿಸಲಾಗಿದೆ!", "Vehicle listing posted!"));
      setTimeout(() => router.push(`/category/${categoryId}`), 1200);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Photos */}
      <Section title={t("ಫೋಟೋಗಳು (max 5)", "Photos (max 5)")}>
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

      {/* 1. Vehicle details */}
      <Section title={t("1. ವಾಹನದ ವಿವರಗಳು (Vehicle Details)", "1. Vehicle Details")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <F label={`${vehicleLabel} Name *`} value={vehicleName} onChange={setVehicleName} required />
          <F label="Brand & Model / ಕಂಪನಿ ಮಾಡೆಲ್" value={brand} onChange={setBrand} />
          <F label="Vehicle Number / ವಾಹನ ಸಂಖ್ಯೆ" value={vehicleNumber} onChange={setVehicleNumber} />
          <SF label="Fuel Type / ಇಂಧನ ವಿಧ" value={fuel} onChange={setFuel} options={FUEL_TYPES} />
        </div>
      </Section>

      {/* 2. Service type */}
      <Section title={t("2. ಸೇವೆಯ ವಿಧ (Service Type)", "2. Service Type")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SERVICE_TYPES.map((s) => (
            <button key={s} type="button" onClick={() => toggleService(s)}
              className={`px-3 py-2.5 rounded-xl border text-xs sm:text-sm font-medium text-left transition ${serviceTypes.includes(s) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>{s}</button>
          ))}
        </div>
      </Section>

      {/* 3. Rent details */}
      <Section title={t("3. ಬಾಡಿಗೆ ವಿವರಗಳು (Rent Details)", "3. Rent Details")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <F label="Rent Price ₹ / ಬಾಡಿಗೆ ದರ" value={rent} onChange={setRent} type="number" />
          <SF label="Rent Type / ದರ ಆಧಾರ" value={rentType} onChange={setRentType} options={RENT_TYPES} />
          <F label="Security Deposit ₹ / ಭದ್ರತಾ ಠೇವಣಿ (optional)" value={deposit} onChange={setDeposit} type="number" />
        </div>
      </Section>

      {/* 4. Location */}
      <Section title={t("4. ಸ್ಥಳ (Location)", "4. Location")}>
        <LocationFields value={loc} onChange={setLoc} />
        <F label="Full Address / ಪೂರ್ಣ ವಿಳಾಸ (optional)" value={fullAddress} onChange={setFullAddress} />
      </Section>

      {/* 5. Owner — locked */}
      <Section title={t("5. ಮಾಲೀಕರ ವಿವರ 🔒 (Owner Details)", "5. Owner Details 🔒")}>
        <p className="text-xs text-muted-foreground flex items-center gap-1 -mt-1 mb-2"><Lock size={11} />{t("ಖರೀದಿದಾರರಿಗೆ ಅನ್‌ಲಾಕ್ ನಂತರ ಮಾತ್ರ", "Shown after unlock")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <F label="Owner Name / ಮಾಲೀಕರ ಹೆಸರು" value={ownerName} onChange={setOwnerName} />
          <F label="Mobile / ಮೊಬೈಲ್" value={mobile} onChange={setMobile} type="tel" />
          <F label="WhatsApp" value={whatsapp} onChange={setWhatsapp} type="tel" placeholder="Optional" />
        </div>
      </Section>

      {/* Description */}
      <Section title={t("6. ಹೆಚ್ಚಿನ ವಿವರಗಳು (Optional)", "6. Additional Details")}>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Any additional info..." />
      </Section>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading} className="bg-primary px-8 h-11 font-medium">
          {loading ? <><Loader2 size={16} className="mr-2 animate-spin" />Posting...</> : t("ಪೋಸ್ಟ್ ಮಾಡಿ", "Post Vehicle")}
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
