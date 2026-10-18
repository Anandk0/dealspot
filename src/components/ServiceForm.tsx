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

// ─── Config per service slug ─────────────────────────────────────────────────

interface ServiceConfig {
  titleKn: string;
  titleEn: string;
  nameLabel: string;
  serviceTypes: string[];
  experienceLevels: string[];
  pricingBases: string[];
  extras?: "driver" | "cctv" | "carpenter" | "painter" | "generic";
}

const EXPERIENCE = [
  "Fresher / ಅನನುಭವಿ",
  "1–3 Years / 1–3 ವರ್ಷ",
  "3–5 Years / 3–5 ವರ್ಷ",
  "5+ Years / 5+ ವರ್ಷ",
];

const CONFIGS: Record<string, ServiceConfig> = {
  "Vehicle-Drivers-Hire": {
    titleKn: "ವಾಹನ ಚಾಲಕ ನೇಮಕ",
    titleEn: "Vehicle Driver Hire",
    nameLabel: "Driver Name / ಚಾಲಕರ ಹೆಸರು",
    serviceTypes: [
      "Car Driver / ಕಾರು ಚಾಲಕ",
      "Auto Driver / ಆಟೋ ಚಾಲಕ",
      "Truck Driver / ಟ್ರಕ್ ಚಾಲಕ",
      "Bus Driver / ಬಸ್ ಚಾಲಕ",
      "Tractor Driver / ಟ್ರ್ಯಾಕ್ಟರ್ ಚಾಲಕ",
      "Other Driver / ಇತರ ಚಾಲಕ",
    ],
    experienceLevels: EXPERIENCE,
    pricingBases: ["Per Day / ದಿನಕ್ಕೆ", "Per Month / ತಿಂಗಳಿಗೆ", "Per Trip / ಟ್ರಿಪ್‌ಗೆ"],
    extras: "driver",
  },
  "service-electrician": {
    titleKn: "ಎಲೆಕ್ಟ್ರಿಷಿಯನ್ ಸೇವೆ",
    titleEn: "Electrician Service",
    nameLabel: "Electrician / Business Name / ಹೆಸರು",
    serviceTypes: [
      "Home Wiring / ಮನೆ ವೈರಿಂಗ್",
      "Electrical Repair / ವಿದ್ಯುತ್ ದುರಸ್ತಿ",
      "Fan/Light Installation / ಫ್ಯಾನ್ ಅಳವಡಿಕೆ",
      "Inverter Installation / ಇನ್ವರ್ಟರ್",
      "Industrial Electrical Work / ಕೈಗಾರಿಕಾ",
      "Other / ಇತರ",
    ],
    experienceLevels: EXPERIENCE,
    pricingBases: ["Per Visit / ಭೇಟಿಗೆ", "Per Hour / ಗಂಟೆಗೆ", "Per Day / ದಿನಕ್ಕೆ", "Quotation / ಕೋಟೇಶನ್"],
    extras: "generic",
  },
  "service-plumber": {
    titleKn: "ಪ್ಲಂಬರ್ ಸೇವೆ",
    titleEn: "Plumber Service",
    nameLabel: "Plumber / Business Name / ಹೆಸರು",
    serviceTypes: [
      "Pipe Fitting / ಪೈಪ್ ಫಿಟ್ಟಿಂಗ್",
      "Water Leakage Repair / ಸೋರಿಕೆ ದುರಸ್ತಿ",
      "Tap Repair / ನಲ್ಲಿ ದುರಸ್ತಿ",
      "Bathroom Fitting / ಬಾತ್‌ರೂಮ್ ಫಿಟ್ಟಿಂಗ್",
      "Water Motor Repair / ಮೋಟಾರ್ ದುರಸ್ತಿ",
      "Drainage Repair / ಚರಂಡಿ ದುರಸ್ತಿ",
      "Other / ಇತರ",
    ],
    experienceLevels: EXPERIENCE,
    pricingBases: ["Per Visit / ಭೇಟಿಗೆ", "Per Hour / ಗಂಟೆಗೆ", "Per Day / ದಿನಕ್ಕೆ", "Quotation / ಕೋಟೇಶನ್"],
    extras: "generic",
  },
  "service-carpenter": {
    titleKn: "ಕಾರ್ಪೆಂಟರ್ ಸೇವೆ",
    titleEn: "Carpenter Service",
    nameLabel: "Carpenter / Business Name / ಹೆಸರು",
    serviceTypes: [
      "Furniture Making / ಪೀಠೋಪಕರಣ",
      "Door/Window Work / ಬಾಗಿಲು/ಕಿಟಕಿ",
      "Modular Kitchen / ಮಾಡ್ಯುಲರ್ ಕಿಚನ್",
      "Furniture Repair / ದುರಸ್ತಿ",
      "Interior Woodwork / ಒಳಾಂಗಣ ಕಾರ್ಯ",
      "Other / ಇತರ",
    ],
    experienceLevels: EXPERIENCE,
    pricingBases: ["Per Day / ದಿನಕ್ಕೆ", "Per Item / ಐಟಂಗೆ", "Per Sq.Ft / ಚ.ಅಡಿಗೆ", "Contract / ಕಾಂಟ್ರ್ಯಾಕ್ಟ್"],
    extras: "carpenter",
  },
  "service-painter": {
    titleKn: "ಪೇಂಟರ್ ಸೇವೆ",
    titleEn: "Painter Service",
    nameLabel: "Painter / Business Name / ಹೆಸರು",
    serviceTypes: [
      "Interior Painting / ಒಳ ಪೇಂಟಿಂಗ್",
      "Exterior Painting / ಹೊರ ಪೇಂಟಿಂಗ್",
      "Texture Painting / ಟೆಕ್ಸ್ಚರ್",
      "Putty/Primer Work / ಪುಟ್ಟಿ/ಪ್ರೈಮರ್",
      "Commercial Painting / ವಾಣಿಜ್ಯ",
      "Other / ಇತರ",
    ],
    experienceLevels: EXPERIENCE,
    pricingBases: ["Per Sq.Ft / ಚ.ಅಡಿಗೆ", "Per Day / ದಿನಕ್ಕೆ", "Contract / ಕಾಂಟ್ರ್ಯಾಕ್ಟ್"],
    extras: "painter",
  },
  "service-cctv": {
    titleKn: "ಸಿಸಿಟಿವಿ ಸೇವೆ",
    titleEn: "CCTV Service",
    nameLabel: "Technician / Business Name / ಹೆಸರು",
    serviceTypes: [
      "New CCTV Installation / ಹೊಸ ಅಳವಡಿಕೆ",
      "Camera Repair / ಕ್ಯಾಮೆರಾ ದುರಸ್ತಿ",
      "Maintenance / ನಿರ್ವಹಣೆ",
      "DVR/NVR Setup / DVR ಸೆಟಪ್",
      "Mobile Viewing Setup / ಮೊಬೈಲ್ ವ್ಯೂ",
      "Other / ಇತರ",
    ],
    experienceLevels: EXPERIENCE,
    pricingBases: ["Per Camera / ಕ್ಯಾಮೆರಾಗೆ", "Per Visit / ಭೇಟಿಗೆ", "Complete Package / ಪ್ಯಾಕೇಜ್", "Quotation / ಕೋಟೇಶನ್"],
    extras: "cctv",
  },
};

const WORK_TYPES_DRIVER = [
  "Daily Rental / ದಿನ ಬಾಡಿಗೆ",
  "Monthly Salary / ತಿಂಗಳ ಸಂಬಳ",
  "Trip Basis / ಟ್ರಿಪ್",
  "Full-Time Job / ಪೂರ್ಣ ಸಮಯ",
];

const MATERIAL_BY = ["Customer / ಗ್ರಾಹಕ", "Service Provider / ಸೇವಾ ಪೂರೈಕೆದಾರ", "Both / ಇಬ್ಬರೂ"];

const CAMERA_TYPES = ["Indoor / ಒಳಾಂಗಣ", "Outdoor / ಹೊರಾಂಗಣ", "Wireless / ವೈರ್‌ಲೆಸ್", "IP Camera", "All Types / ಎಲ್ಲಾ"];

// ─── Component ───────────────────────────────────────────────────────────────

export default function ServiceForm({ categoryId }: { categoryId: string }) {
  const router = useRouter();
  const { t } = useLang();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const config = CONFIGS[categoryId] ?? CONFIGS["service-electrician"];
  const isDriver = config.extras === "driver";
  const isCCTV = config.extras === "cctv";
  const isCarpenter = config.extras === "carpenter";
  const isPainter = config.extras === "painter";

  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loc, setLoc] = useState<LocationValue>({ pincode: "", district: "", taluk: "", area: "" });

  // ── Form state ──
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [experience, setExperience] = useState("");
  const [charge, setCharge] = useState("");
  const [pricingBasis, setPricingBasis] = useState("");
  const [homeVisit, setHomeVisit] = useState("");
  const [workingHours, setWorkingHours] = useState("");
  const [description, setDescription] = useState("");

  // Driver-specific
  const [workType, setWorkType] = useState("");
  const [hasLicence, setHasLicence] = useState("");
  const [licenceImage, setLicenceImage] = useState<File | null>(null);
  const [licencePreview, setLicencePreview] = useState("");

  // Carpenter / Painter specific
  const [materialBy, setMaterialBy] = useState("");

  // CCTV specific
  const [cameraType, setCameraType] = useState("");

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) { toast.error(t("ಗರಿಷ್ಠ 5 ಫೋಟೋ", "Max 5 photos")); return; }
    setImages((p) => [...p, ...files]);
    files.forEach((f) => {
      const r = new FileReader();
      r.onload = (ev) => setPreviews((p) => [...p, ev.target?.result as string]);
      r.readAsDataURL(f);
    });
    e.target.value = "";
  };

  const handleLicenceSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setLicenceImage(f);
    const r = new FileReader();
    r.onload = (ev) => setLicencePreview(ev.target?.result as string);
    r.readAsDataURL(f);
  };

  const toggleService = (s: string) =>
    setSelectedServices((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api.getToken()) { toast.error(t("ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಮಾಡಿ", "Please login first")); router.push("/login"); return; }
    if (!name.trim()) { toast.error(t("ಹೆಸರು ಅಗತ್ಯ", "Name is required")); return; }
    if (selectedServices.length === 0) { toast.error(t("ಸೇವೆ ಆಯ್ಕೆ ಮಾಡಿ", "Select at least one service type")); return; }

    setLoading(true);
    try {
      const details = {
        serviceTypes: selectedServices,
        workType: workType || null,
        hasLicence: hasLicence || null,
        materialBy: materialBy || null,
        cameraType: cameraType || null,
        pricingBasis: pricingBasis || null,
        homeVisit: homeVisit || null,
        workingHours: workingHours || null,
        private: {
          ownerName: name.trim(),
          mobile: mobile.trim() || null,
          whatsapp: whatsapp.trim() || null,
        },
      };

      const allImages = [...images];
      if (licenceImage) allImages.push(licenceImage);

      await api.createListing(
        {
          title: name.trim(),
          category: categoryId,
          description: description.trim(),
          location: loc.area.trim(),
          district: loc.district,
          taluk: loc.taluk || null,
          pincode: loc.pincode || null,
          experience: experience || null,
          rateInfo: charge ? `${charge} ${pricingBasis}`.trim() : null,
          skill: selectedServices.join(", "),
          details: JSON.stringify(details),
        },
        allImages.length > 0 ? allImages : undefined
      );
      toast.success(t("ಸೇವೆ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!", "Service posted successfully!"));
      setTimeout(() => router.push(`/category/${categoryId}`), 1200);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("ಸಲ್ಲಿಕೆ ವಿಫಲ", "Submission failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ── Photos ── */}
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
            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-20 h-20 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary bg-muted/30 transition">
              {images.length === 0 ? <Camera size={22} /> : <Plus size={18} />}
              <span className="text-[10px] mt-1">{images.length === 0 ? t("ಸೇರಿಸಿ", "Add") : t("ಇನ್ನಷ್ಟು", "More")}</span>
            </button>
          )}
        </div>
      </Section>

      {/* ── Name & Mobile ── */}
      <Section title={t("1. ಮೂಲ ವಿವರಗಳು", "1. Basic Details")}>
        <Field label={config.nameLabel} value={name} onChange={setName} required />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label={t("ಮೊಬೈಲ್ ನಂಬರ್", "Mobile Number")} value={mobile} onChange={setMobile} type="tel" />
          {isDriver && <SelectField label={t("ಕೆಲಸದ ರೀತಿ (Work Type)", "Work Type")} value={workType} onChange={setWorkType} options={WORK_TYPES_DRIVER} />}
          <SelectField label={t("ಅನುಭವ (Experience)", "Experience")} value={experience} onChange={setExperience} options={config.experienceLevels} />
        </div>
      </Section>

      {/* ── Service Type ── */}
      <Section title={t("2. ಸೇವೆಯ ವಿಧ (Service Type)", "2. Service Type")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {config.serviceTypes.map((s) => (
            <button key={s} type="button" onClick={() => toggleService(s)}
              className={`px-3 py-2.5 rounded-xl border text-xs sm:text-sm font-medium text-left transition ${selectedServices.includes(s) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>
              {s}
            </button>
          ))}
        </div>
        {isCCTV && (
          <div className="mt-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">{t("ಕ್ಯಾಮೆರಾ ವಿಧ (Camera Type)", "Camera Type")}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CAMERA_TYPES.map((c) => (
                <button key={c} type="button" onClick={() => setCameraType(c)}
                  className={`px-3 py-2 rounded-xl border text-xs font-medium transition ${cameraType === c ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>{c}</button>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* ── Pricing ── */}
      <Section title={t("3. ದರ ವಿವರಗಳು (Pricing)", "3. Pricing Details")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label={isDriver ? t("ನಿರೀಕ್ಷಿತ ಸಂಬಳ ₹", "Expected Salary/Rate ₹") : t("ಶುಲ್ಕ ₹ (Service Charge)", "Service Charge ₹")} value={charge} onChange={setCharge} type="number" />
          <SelectField label={t("ಬೆಲೆ ಆಧಾರ (Pricing Basis)", "Pricing Basis")} value={pricingBasis} onChange={setPricingBasis} options={config.pricingBases} />
        </div>
        {(isCarpenter || isPainter) && (
          <div className="mt-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">{t("ಸಾಮಗ್ರಿ ಒದಗಿಸುವವರು (Material Supplied By)", "Material Supplied By")}</p>
            <div className="flex flex-wrap gap-2">
              {MATERIAL_BY.map((m) => (
                <button key={m} type="button" onClick={() => setMaterialBy(m)}
                  className={`px-3 py-2 rounded-xl border text-xs font-medium transition ${materialBy === m ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>{m}</button>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* ── Driver: Licence ── */}
      {isDriver && (
        <Section title={t("4. ಡ್ರೈವಿಂಗ್ ಲೈಸೆನ್ಸ್", "4. Driving Licence")}>
          <div className="flex gap-2 mb-3">
            {["Yes / ಇದೆ", "No / ಇಲ್ಲ"].map((opt) => (
              <button key={opt} type="button" onClick={() => setHasLicence(opt)}
                className={`flex-1 h-10 rounded-xl border text-sm font-medium transition ${hasLicence === opt ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>{opt}</button>
            ))}
          </div>
          {hasLicence.startsWith("Yes") && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">{t("ಲೈಸೆನ್ಸ್ ಫೋಟೋ (ಐಚ್ಛಿಕ)", "Licence Photo (optional)")}</p>
              <label className="block w-28 h-20 border-2 border-dashed border-border rounded-xl overflow-hidden cursor-pointer hover:border-primary">
                {licencePreview ? <img src={licencePreview} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Camera size={20} /></div>}
                <input type="file" accept="image/*" className="hidden" onChange={handleLicenceSelect} />
              </label>
            </div>
          )}
        </Section>
      )}

      {/* ── Service availability ── */}
      {!isDriver && (
        <Section title={t("4. ಸೇವೆ ಲಭ್ಯತೆ", "4. Availability")}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">{t("ಮನೆ ಭೇಟಿ (Home Visit)", "Home Visit Available")}</p>
              <div className="flex gap-2">
                {["Yes / ಹೌದು", "No / ಇಲ್ಲ"].map((o) => (
                  <button key={o} type="button" onClick={() => setHomeVisit(o)}
                    className={`flex-1 h-10 rounded-xl border text-sm font-medium transition ${homeVisit === o ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>{o}</button>
                ))}
              </div>
            </div>
            <Field label={t("ಕೆಲಸದ ಸಮಯ (Working Hours)", "Working Hours")} value={workingHours} onChange={setWorkingHours} placeholder="e.g. 9 AM – 6 PM" />
          </div>
        </Section>
      )}

      {/* ── Location ── */}
      <Section title={t("5. ಸ್ಥಳ", "5. Location")}>
        <LocationFields value={loc} onChange={setLoc} />
      </Section>

      {/* ── Contact (locked) ── */}
      <Section title={t("6. ಸಂಪರ್ಕ ವಿವರ (ಪಾವತಿ ನಂತರ) 🔒", "6. Contact Details (after unlock) 🔒")}>
        <p className="text-xs text-muted-foreground -mt-1 mb-2 flex items-center gap-1">
          <Lock size={11} className="shrink-0" />
          {t("ಈ ವಿವರಗಳು ಗ್ರಾಹಕರಿಗೆ ಅನ್‌ಲಾಕ್ ನಂತರ ಮಾತ್ರ ಕಾಣಿಸುತ್ತವೆ", "Shown to customers only after unlock")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label={t("ಮೊಬೈಲ್ ನಂಬರ್", "Mobile Number")} value={mobile} onChange={setMobile} type="tel" placeholder="+91 XXXXX XXXXX" />
          <Field label="WhatsApp" value={whatsapp} onChange={setWhatsapp} type="tel" placeholder="+91 XXXXX XXXXX" />
        </div>
      </Section>

      {/* ── Description ── */}
      <Section title={t("7. ಹೆಚ್ಚಿನ ವಿವರಗಳು (Optional)", "7. Additional Details (Optional)")}>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("ಹೆಚ್ಚಿನ ಮಾಹಿತಿ...", "Any additional information...")} rows={3} />
      </Section>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading} className="bg-primary px-8 h-11 font-medium">
          {loading ? <><Loader2 size={16} className="mr-2 animate-spin" /> {t("ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...", "Posting...")}</> : t("ಸೇವೆಯನ್ನು ಪೋಸ್ಟ್ ಮಾಡಿ", "Post Service")}
        </Button>
      </div>
    </form>
  );
}

// ── Small helpers ────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl p-4 sm:p-5 border border-border shadow-sm space-y-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean;
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

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div>
      <label className="text-xs sm:text-sm font-medium text-foreground mb-1 block">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 sm:h-11 rounded-md border border-border bg-card text-foreground px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
        <option value="">ಆಯ್ಕೆ ಮಾಡಿ / Select</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
