"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Plus, X, Lock } from "lucide-react";
import LeafLoader from "@/components/LeafLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useLang } from "@/lib/lang-context";
import LocationFields, { type LocationValue } from "@/components/LocationFields";
import { sanitizeByType } from "@/lib/fieldSanitize";

const DOG_BREEDS = ["Labrador Retriever", "Golden Retriever", "German Shepherd", "Rottweiler", "Pug", "Beagle", "Pomeranian", "Shih Tzu", "Doberman", "Indian Pariah Dog / ನಾಡ ನಾಯಿ", "Rajapalayam / ರಾಜಪಾಳಯಂ", "Mudhol Hound / ಮುದೋಳ್", "Other / ಇತರೆ"];
const CAT_BREEDS = ["Persian / ಪರ್ಷಿಯನ್", "Siamese / ಸಯಾಮೀಸ್", "Bengal / ಬೆಂಗಾಲ್", "Maine Coon", "British Shorthair", "Himalayan / ಹಿಮಾಲಯನ್", "Indian Domestic Cat / ನಾಡ ಬೆಕ್ಕು", "Other / ಇತರೆ"];

const PET_LABELS: Record<string, { kn: string; en: string; breeds: string[] }> = {
  "pets-dogs-wanted": { kn: "ನಾಯಿ", en: "Dog", breeds: DOG_BREEDS },
  "pets-pet-cats": { kn: "ಬೆಕ್ಕು", en: "Cat", breeds: CAT_BREEDS },
};

const HEALTH_STATUS = ["Healthy / ಆರೋಗ್ಯಕರ", "Vaccinated / ಲಸಿಕೆ ಹಾಕಿದೆ", "Under Treatment / ಚಿಕಿತ್ಸೆ", "Other / ಇತರ"];

export default function PetForm({ categoryId }: { categoryId: string }) {
  const router = useRouter();
  const { t } = useLang();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const config = PET_LABELS[categoryId] || { kn: "ಸಾಕು ಪ್ರಾಣಿ", en: "Pet", breeds: [] };

  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loc, setLoc] = useState<LocationValue>({ pincode: "", district: "", taluk: "", area: "" });

  const [breed, setBreed] = useState("");
  const [breedOther, setBreedOther] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [health, setHealth] = useState("");
  const [vaccination, setVaccination] = useState("");
  const [price, setPrice] = useState("");
  const [negotiable, setNegotiable] = useState("");
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
    if (!breed) { toast.error("ತಳಿ ಆಯ್ಕೆ ಮಾಡಿ (Select breed)"); return; }
    const isOther = breed.includes("Other") || breed.includes("ಇತರೆ");
    if (isOther && !breedOther.trim()) { toast.error(t("ತಳಿ ಹೆಸರು ನಮೂದಿಸಿ", "Please specify the breed")); return; }
    const resolvedBreed = isOther ? breedOther.trim() : breed;

    setLoading(true);
    try {
      const details = {
        breed: resolvedBreed,
        gender,
        color,
        quantity,
        health,
        vaccination: categoryId === "pets-dogs-wanted" ? vaccination : null,
        negotiable,
        private: {
          ownerName: ownerName.trim() || null,
          mobile: mobile.trim() || null,
          whatsapp: whatsapp.trim() || null,
        },
      };

      await api.createListing(
        {
          title: `${resolvedBreed} ${config.en}`,
          category: categoryId,
          description: description.trim(),
          location: loc.area.trim(),
          district: loc.district,
          taluk: loc.taluk || null,
          pincode: loc.pincode || null,
          breed: resolvedBreed,
          age,
          price: price ? parseFloat(price.replace(/[^0-9.]/g, "")) || null : null,
          details: JSON.stringify(details),
        },
        images.length > 0 ? images : undefined
      );
      toast.success(t("ಜಾಹೀರಾತು ಸಲ್ಲಿಸಲಾಗಿದೆ!", "Listing posted!"));
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

      {/* 1. Breed */}
      {config.breeds.length > 0 && (
        <Section title={`1. ${config.kn} ತಳಿ (${config.en} Breed) *`}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {config.breeds.map((b) => (
              <button key={b} type="button" onClick={() => setBreed(b)}
                className={`px-3 py-2.5 rounded-xl border text-xs font-medium text-left transition ${breed === b ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>{b}</button>
            ))}
          </div>
          {(breed.includes("Other") || breed.includes("ಇತರೆ")) && (
            <div className="mt-3">
              <PF label={t("ತಳಿ ಹೆಸರು ನಮೂದಿಸಿ (Specify Breed)", "Specify the breed")} value={breedOther} onChange={setBreedOther} placeholder={t("ತಳಿ ಹೆಸರು", "Enter breed name")} />
            </div>
          )}
        </Section>
      )}

      {/* 2. Pet details */}
      <Section title={t("2. ಪ್ರಾಣಿಯ ವಿವರಗಳು (Pet Details)", "2. Pet Details")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PF label={t("ವಯಸ್ಸು (Age)", "Age")} value={age} onChange={setAge} placeholder="e.g. 3 months" />
          <PF label={t("ಬಣ್ಣ (Color)", "Color")} value={color} onChange={setColor} />
          <PF label={t("ಸಂಖ್ಯೆ (Quantity)", "Quantity")} value={quantity} onChange={setQuantity} type="number" />
        </div>
        <div className="mt-2">
          <p className="text-xs font-medium text-muted-foreground mb-2">{t("ಲಿಂಗ (Gender)", "Gender")}</p>
          <div className="flex flex-wrap gap-2">
            {["Male / ಗಂಡು", "Female / ಹೆಣ್ಣು", "Pair / ಜೋಡಿ"].map((g) => (
              <button key={g} type="button" onClick={() => setGender(g)}
                className={`px-3 py-2 rounded-xl border text-xs font-medium transition ${gender === g ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>{g}</button>
            ))}
          </div>
        </div>
        <div className="mt-2">
          <p className="text-xs font-medium text-muted-foreground mb-2">{t("ಆರೋಗ್ಯ ಸ್ಥಿತಿ (Health)", "Health Status")}</p>
          <div className="flex flex-wrap gap-2">
            {HEALTH_STATUS.map((h) => (
              <button key={h} type="button" onClick={() => setHealth(h)}
                className={`px-3 py-2 rounded-xl border text-xs font-medium transition ${health === h ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>{h}</button>
            ))}
          </div>
        </div>
        {categoryId === "pets-dogs-wanted" && (
          <div className="mt-2">
            <p className="text-xs font-medium text-muted-foreground mb-2">{t("ಲಸಿಕೆ ವಿವರ (Vaccination)", "Vaccination Details")}</p>
            <div className="flex flex-wrap gap-2">
              {["Fully Vaccinated / ಪೂರ್ಣ ಲಸಿಕೆ", "Partially / ಅರ್ಧ ಲಸಿಕೆ", "Not Vaccinated / ಇಲ್ಲ", "Unknown / ಗೊತ್ತಿಲ್ಲ"].map((v) => (
                <button key={v} type="button" onClick={() => setVaccination(v)}
                  className={`px-3 py-2 rounded-xl border text-xs font-medium transition ${vaccination === v ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>{v}</button>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* 3. Sale details */}
      <Section title={t("3. ಮಾರಾಟ ವಿವರಗಳು (Sale Details)", "3. Sale Details")}>
        <PF label={t("ಬೆಲೆ ₹ (Price)", "Price ₹")} value={price} onChange={setPrice} type="number" />
        <div className="mt-2">
          <p className="text-xs font-medium text-muted-foreground mb-2">{t("ಬೆಲೆ ಮಾತುಕತೆ (Negotiable)", "Negotiable")}</p>
          <div className="flex gap-2">
            {["Yes / ಹೌದು", "No / ಇಲ್ಲ"].map((n) => (
              <button key={n} type="button" onClick={() => setNegotiable(n)}
                className={`flex-1 h-10 rounded-xl border text-sm font-medium transition ${negotiable === n ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>{n}</button>
            ))}
          </div>
        </div>
        <Textarea className="mt-3" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Description / ಹೆಚ್ಚಿನ ವಿವರ..." />
      </Section>

      {/* 4. Location */}
      <Section title={t("4. ಸ್ಥಳ (Location)", "4. Location")}>
        <LocationFields value={loc} onChange={setLoc} />
      </Section>

      {/* 5. Owner — locked */}
      <Section title={t("5. ಮಾಲೀಕರ ವಿವರ 🔒", "5. Owner Details 🔒")}>
        <p className="text-xs text-muted-foreground flex items-center gap-1 -mt-1 mb-2"><Lock size={11} />{t("ಅನ್‌ಲಾಕ್ ನಂತರ ಮಾತ್ರ ಕಾಣಿಸುತ್ತದೆ", "Shown after unlock")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PF label={t("ಮಾಲೀಕರ ಹೆಸರು", "Owner Name")} value={ownerName} onChange={setOwnerName} />
          <PF label="Mobile / ಮೊಬೈಲ್" value={mobile} onChange={setMobile} type="tel" />
          <PF label="WhatsApp (Optional)" value={whatsapp} onChange={setWhatsapp} type="tel" />
        </div>
      </Section>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading} className="bg-primary px-8 h-11 font-medium">
          {loading ? <><LeafLoader variant="trio" size={18} /><span className="ml-2">Posting...</span></> : t("ಪೋಸ್ಟ್ ಮಾಡಿ", "Post Listing")}
        </Button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="bg-card rounded-2xl p-4 sm:p-5 border border-border shadow-sm space-y-3"><h3 className="text-sm font-semibold text-foreground">{title}</h3>{children}</div>;
}
function PF({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return <div><label className="text-xs sm:text-sm font-medium text-foreground mb-1 block">{label}</label><Input value={value} onChange={(e) => onChange(sanitizeByType(e.target.value, { type, key: label }))} type={type === "number" ? "text" : type} inputMode={type === "number" || type === "tel" ? "numeric" : undefined} placeholder={placeholder || label} className="h-10 sm:h-11" /></div>;
}
