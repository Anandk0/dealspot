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

// ─── Breed lists per slug ────────────────────────────────────────────────────

const BREEDS: Record<string, string[]> = {
  "livestock-cow": ["ಗೀರ್ (Gir)", "ಸಾಹಿವಾಲ್ (Sahiwal)", "HF (Holstein Friesian)", "ಜರ್ಸಿ (Jersey)", "ಅಮೃತಮಹಲ್ (Amrit Mahal)", "ಹಳ್ಳಿಕಾರ್ (Hallikar)", "ಕೃಷ್ಣಾ ವ್ಯಾಲಿ (Krishna Valley)", "ಮಲೆನಾಡು ಗಿಡ್ಡ (Malnad Gidda)", "ದೇಸಿ ಹಸು (Desi Cow)", "ಇತರೆ (Other)"],
  "livestock-buffalo": ["ಮುರ್ರಾ (Murrah)", "ಜಾಫರಾಬಾದಿ (Jaffarabadi)", "ಮೆಹಸಾನಾ (Mehsana)", "ಸುರ್ತಿ (Surti)", "ನಾಗಪುರಿ (Nagpuri)", "ದೇಸಿ ಎಮ್ಮೆ (Desi)", "ಇತರೆ (Other)"],
  "livestock-bull": ["ಹಳ್ಳಿಕಾರ್ (Hallikar)", "ಅಮೃತ್‌ಮಹಲ್ (Amrit Mahal)", "ಖಿಲಾರಿ (Khillari)", "ದೇವಣಿ (Deoni)", "ಸ್ಥಳೀಯ ತಳಿ (Local)", "ಇತರೆ (Other)"],
  "livestock-goat": ["ಉಸ್ಮಾನಾಬಾದಿ (Osmanabadi)", "ಬೀಟಲ್ (Beetal)", "ಜಮುನಾಪಾರಿ (Jamunapari)", "ಬೋಯರ್ (Boer)", "ಸಿರೋಹಿ (Sirohi)", "ಜಖರಾನಾ (Jakhrana)", "ಸ್ಥಳೀಯ ತಳಿ (Local)", "ಇತರೆ (Other)"],
  "livestock-sheep": ["ಬಂಡೂರು (Bandur)", "ಡೆಕ್ಕನಿ (Deccani)", "ಬೆಳ್ಳಾರಿ (Bellary)", "ನೆಲ್ಲೂರು (Nellore)", "ಮಂಡ್ಯ (Mandya)", "ಸ್ಥಳೀಯ ತಳಿ (Local)", "ಇತರೆ (Other)"],
};

const TEETH_OPTIONS = [
  "ಹಲ್ಲು ಇಲ್ಲ (No Teeth)",
  "2 ಹಲ್ಲು (2 Teeth)",
  "4 ಹಲ್ಲು (4 Teeth)",
  "6 ಹಲ್ಲು (6 Teeth)",
  "8 ಹಲ್ಲು / ಪೂರ್ಣ (Full Mouth)",
  "ಹಲ್ಲು ಸವೆದಿವೆ (Worn Teeth)",
  "ಗೊತ್ತಿಲ್ಲ (Unknown)",
];

const HEALTH = ["Healthy / ಆರೋಗ್ಯಕರ", "Under Treatment / ಚಿಕಿತ್ಸೆ ನಡೆಯುತ್ತಿದೆ", "Other / ಇತರ"];
const SELLER_TYPES = ["Owner / ಮಾಲೀಕ", "Farmer / ರೈತ", "Dealer / ವ್ಯಾಪಾರಿ"];
const PRICE_TYPES = ["Per Animal / ಪ್ರತಿ ಪ್ರಾಣಿ", "Pair Price / ಜೋಡಿ ಬೆಲೆ", "Total Price / ಒಟ್ಟು ಬೆಲೆ", "For All Animals / ಎಲ್ಲಾ ಪ್ರಾಣಿ"];

export default function LivestockForm({ categoryId }: { categoryId: string }) {
  const router = useRouter();
  const { t } = useLang();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const breeds = BREEDS[categoryId] || [];
  const isCowOrBuffalo = categoryId === "livestock-cow" || categoryId === "livestock-buffalo";
  const isBull = categoryId === "livestock-bull";

  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loc, setLoc] = useState<LocationValue>({ pincode: "", district: "", taluk: "", area: "" });

  const [breed, setBreed] = useState("");
  const [breedOther, setBreedOther] = useState("");
  const [age, setAge] = useState("");
  const [teeth, setTeeth] = useState("");
  const [gender, setGender] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [weight, setWeight] = useState("");
  const [health, setHealth] = useState("");
  const [pregnancy, setPregnancy] = useState("");
  const [milkYield, setMilkYield] = useState("");
  const [calvings, setCalvings] = useState("");
  const [farmWork, setFarmWork] = useState("");
  const [price, setPrice] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [priceType, setPriceType] = useState("");
  const [negotiable, setNegotiable] = useState("");
  const [sellerType, setSellerType] = useState("");
  const [sellerName, setSellerName] = useState("");
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
        teeth,
        gender,
        quantity,
        weight,
        health,
        pregnancy: isCowOrBuffalo ? pregnancy : null,
        milkYield: isCowOrBuffalo ? milkYield : null,
        calvings: isCowOrBuffalo ? calvings : null,
        farmWork: isBull ? farmWork : null,
        priceType,
        totalPrice: totalPrice || null,
        negotiable,
        sellerType,
        private: {
          ownerName: sellerName.trim() || null,
          mobile: mobile.trim() || null,
          whatsapp: whatsapp.trim() || null,
        },
      };

      await api.createListing(
        {
          title: `${resolvedBreed} — ${categoryId.replace("livestock-", "")}`,
          category: categoryId,
          description: description.trim(),
          location: loc.area.trim(),
          district: loc.district,
          taluk: loc.taluk || null,
          pincode: loc.pincode || null,
          breed: resolvedBreed,
          age,
          price: price ? parseFloat(price.replace(/[^0-9.]/g, "")) : null,
          details: JSON.stringify(details),
        },
        images.length > 0 ? images : undefined
      );
      toast.success(t("ಜಾಹೀರಾತು ಸಲ್ಲಿಸಲಾಗಿದೆ!", "Listing posted!"));
      setTimeout(() => router.push(`/category/${categoryId}`), 1200);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
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
              <span className="text-[10px] mt-1">{images.length === 0 ? "ಸೇರಿಸಿ" : "ಇನ್ನಷ್ಟು"}</span>
            </button>
          )}
        </div>
      </Section>

      {/* 1. Breed */}
      <Section title={t("1. ತಳಿ ಆಯ್ಕೆ (Select Breed)", "1. Select Breed")}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {breeds.map((b) => (
            <button key={b} type="button" onClick={() => setBreed(b)}
              className={`px-3 py-2.5 rounded-xl border text-xs font-medium text-left transition ${breed === b ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>{b}</button>
          ))}
        </div>
        {(breed.includes("Other") || breed.includes("ಇತರೆ")) && (
          <div className="mt-3">
            <SField label={t("ತಳಿ ಹೆಸರು ನಮೂದಿಸಿ (Specify Breed)", "Specify the breed")} value={breedOther} onChange={setBreedOther} placeholder={t("ತಳಿ ಹೆಸರು", "Enter breed name")} />
          </div>
        )}
      </Section>

      {/* 2. Animal details */}
      <Section title={t("2. ಪ್ರಾಣಿಯ ವಿವರಗಳು (Animal Details)", "2. Animal Details")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SField label={t("ವಯಸ್ಸು (Age)", "Age")} value={age} onChange={setAge} placeholder="e.g. 3 Years / 8 Months" />
          <SField label={t("ಪ್ರಾಣಿಗಳ ಸಂಖ್ಯೆ (Quantity)", "Number of Animals")} value={quantity} onChange={setQuantity} type="number" />
          <SField label={t("ಅಂದಾಜು ತೂಕ ಕೆ.ಜಿ. (Weight)", "Approx. Weight (kg)")} value={weight} onChange={setWeight} type="number" />
          {!isBull && (
            <div>
              <label className="text-xs sm:text-sm font-medium text-foreground mb-1 block">{t("ಲಿಂಗ (Gender)", "Gender")}</label>
              <div className="flex gap-2">
                {["Male / ಗಂಡು", "Female / ಹೆಣ್ಣು"].map((g) => (
                  <button key={g} type="button" onClick={() => setGender(g)}
                    className={`flex-1 h-10 rounded-xl border text-sm font-medium transition ${gender === g ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>{g}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Teeth */}
        <div className="mt-3">
          <p className="text-xs font-medium text-muted-foreground mb-2">{t("ಹಲ್ಲಿನ ವಿವರ (Teeth Details)", "Teeth Details")}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TEETH_OPTIONS.map((o) => (
              <button key={o} type="button" onClick={() => setTeeth(o)}
                className={`px-3 py-2 rounded-xl border text-xs font-medium transition ${teeth === o ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>{o}</button>
            ))}
          </div>
        </div>

        {/* Health */}
        <div className="mt-3">
          <p className="text-xs font-medium text-muted-foreground mb-2">{t("ಆರೋಗ್ಯ ಸ್ಥಿತಿ (Health)", "Health Condition")}</p>
          <div className="flex flex-wrap gap-2">
            {HEALTH.map((h) => (
              <button key={h} type="button" onClick={() => setHealth(h)}
                className={`px-3 py-2 rounded-xl border text-xs font-medium transition ${health === h ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>{h}</button>
            ))}
          </div>
        </div>

        {/* Dairy fields */}
        {isCowOrBuffalo && (
          <div className="mt-3 space-y-3">
            <YesNo label={t("ಗರ್ಭಿಣಿ (Pregnancy Status)", "Pregnancy Status")} value={pregnancy} onChange={setPregnancy} options={["Yes / ಹೌದು", "No / ಇಲ್ಲ", "Not Applicable", "Unknown / ಗೊತ್ತಿಲ್ಲ"]} />
            <SField label={t("ದಿನಕ್ಕೆ ಹಾಲು (ಲೀಟರ್) Milk Yield/Day", "Milk Yield Per Day (Litres)")} value={milkYield} onChange={setMilkYield} type="number" />
            <SField label={t("ಕರು ಹಾಕಿದ ಸಂಖ್ಯೆ (Number of Calvings)", "Number of Calvings (optional)")} value={calvings} onChange={setCalvings} type="number" />
          </div>
        )}

        {/* Bull farm work */}
        {isBull && (
          <div className="mt-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">{t("ಕೃಷಿ ಕೆಲಸದ ವಿವರ (Farm Work)", "Farm Work Details")}</p>
            <SField label={t("ಕೃಷಿ ತರಬೇತಿ / ವಿಶೇಷ ಸಾಮರ್ಥ್ಯ", "Training / Capabilities")} value={farmWork} onChange={setFarmWork} placeholder="e.g. Ploughing, Cart Pulling" />
          </div>
        )}
      </Section>

      {/* 3. Sale details */}
      <Section title={t("3. ಮಾರಾಟ ವಿವರಗಳು (Sale Details)", "3. Sale Details")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SField label={t("ಬೆಲೆ ₹ (Selling Price)", "Selling Price ₹")} value={price} onChange={setPrice} type="number" />
          <SField label={t("ಒಟ್ಟು ಬೆಲೆ ₹ (Total Price)", "Total Price ₹ (for all)")} value={totalPrice} onChange={setTotalPrice} type="number" />
        </div>
        <div className="mt-2">
          <p className="text-xs font-medium text-muted-foreground mb-2">{t("ಬೆಲೆ ವಿಧ (Price Type)", "Price Type")}</p>
          <div className="grid grid-cols-2 gap-2">
            {PRICE_TYPES.map((p) => (
              <button key={p} type="button" onClick={() => setPriceType(p)}
                className={`px-3 py-2 rounded-xl border text-xs font-medium transition ${priceType === p ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>{p}</button>
            ))}
          </div>
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

      {/* 4. Location */}
      <Section title={t("4. ಸ್ಥಳ (Location)", "4. Location")}>
        <LocationFields value={loc} onChange={setLoc} />
      </Section>

      {/* 5. Seller details — locked */}
      <Section title={t("5. ಮಾರಾಟಗಾರರ ವಿವರ 🔒", "5. Seller Details 🔒")}>
        <p className="text-xs text-muted-foreground -mt-1 mb-2 flex items-center gap-1">
          <Lock size={11} className="shrink-0" />
          {t("ಈ ವಿವರಗಳು ಖರೀದಿದಾರರಿಗೆ ಅನ್‌ಲಾಕ್ ನಂತರ ಮಾತ್ರ ಕಾಣಿಸುತ್ತವೆ", "Shown to buyers only after unlock")}
        </p>
        <div className="mt-1 mb-3">
          <p className="text-xs font-medium text-muted-foreground mb-2">{t("ಮಾರಾಟಗಾರ ವಿಧ (Seller Type)", "Seller Type")}</p>
          <div className="flex flex-wrap gap-2">
            {SELLER_TYPES.map((s) => (
              <button key={s} type="button" onClick={() => setSellerType(s)}
                className={`px-3 py-2 rounded-xl border text-xs font-medium transition ${sellerType === s ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>{s}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SField label={t("ಮಾರಾಟಗಾರ ಹೆಸರು (Seller Name)", "Seller Name")} value={sellerName} onChange={setSellerName} />
          <SField label={t("ಮೊಬೈಲ್ ನಂಬರ್", "Mobile Number")} value={mobile} onChange={setMobile} type="tel" />
          <SField label="WhatsApp" value={whatsapp} onChange={setWhatsapp} type="tel" placeholder="Optional" />
        </div>
      </Section>

      {/* 6. Description */}
      <Section title={t("6. ಹೆಚ್ಚಿನ ವಿವರಗಳು (Optional)", "6. Additional Details")}>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("ಪ್ರಾಣಿಯ ಬಗ್ಗೆ ವಿವರಣೆ...", "Describe the animal...")} rows={3} />
      </Section>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading} className="bg-primary px-8 h-11 font-medium">
          {loading ? <><Loader2 size={16} className="mr-2 animate-spin" /> {t("ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...", "Posting...")}</> : t("ಪೋಸ್ಟ್ ಮಾಡಿ", "Post Listing")}
        </Button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl p-4 sm:p-5 border border-border shadow-sm space-y-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  );
}
function SField({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs sm:text-sm font-medium text-foreground mb-1 block">{label}</label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} type={type} placeholder={placeholder || label} className="h-10 sm:h-11" />
    </div>
  );
}
function YesNo({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options?: string[] }) {
  const opts = options || ["Yes / ಹೌದು", "No / ಇಲ್ಲ"];
  return (
    <div>
      <p className="text-xs sm:text-sm font-medium text-foreground mb-1">{label}</p>
      <div className="flex flex-wrap gap-2">
        {opts.map((o) => (
          <button key={o} type="button" onClick={() => onChange(o)}
            className={`px-3 py-2 rounded-xl border text-xs font-medium transition ${value === o ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>{o}</button>
        ))}
      </div>
    </div>
  );
}
