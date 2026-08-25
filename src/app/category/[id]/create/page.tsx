"use client";
import { useParams, useRouter } from "next/navigation";
import { Camera, Plus, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { categories } from "@/lib/categories";
import { api } from "@/lib/api";
import AppLayout from "@/components/AppLayout";
import AgentRegistration from "@/components/AgentRegistration";
import { useRef, useState } from "react";

export default function CreateListingPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;
  const category = categories.find((c) => c.id === categoryId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (categoryId === "agents" || categoryId === "agent") {
    return (
      <AppLayout>
        <AgentRegistration />
      </AppLayout>
    );
  }

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      toast.error("ಗರಿಷ್ಠ 5 ಫೋಟೋಗಳು ಮಾತ್ರ (Max 5 photos)");
      return;
    }
    const newImages = [...images, ...files];
    setImages(newImages);

    // Generate previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const getFields = (): { key: string; label: string }[] => {
    switch (categoryId) {
      case "property-sales":
      case "property":
        return [
          { key: "title", label: "ಆಸ್ತಿ ವಿವರ / ಶೀರ್ಷಿಕೆ (Property Title)" },
          { key: "area", label: "ವಿಸ್ತೀರ್ಣ (Area / Sq.ft / Acres)" },
          { key: "price", label: "ಮಾರಾಟ ಬೆಲೆ (Selling Price ₹)" },
          { key: "location", label: "ಸ್ಥಳ / ಗ್ರಾಮ (Location / Village)" },
          { key: "district", label: "ಜಿಲ್ಲೆ (District)" },
        ];
      case "property-rent":
        return [
          { key: "title", label: "ಆಸ್ತಿ ವಿವರ (Property Title)" },
          { key: "rateInfo", label: "ತಿಂಗಳ ಬಾಡಿಗೆ (Monthly Rent ₹/mo)" },
          { key: "price", label: "ಅಡ್ವಾನ್ಸ್ / ಡೆಪಾಸಿಟ್ (Deposit ₹)" },
          { key: "location", label: "ಸ್ಥಳ (Location)" },
          { key: "district", label: "ಜಿಲ್ಲೆ (District)" },
        ];
      case "agriculture-equipment":
      case "farm-equipment":
      case "tractor-rental":
        return [
          { key: "title", label: "ಉಪಕರಣ ಹೆಸರು (Equipment Name)" },
          { key: "condition", label: "ಸ್ಥಿತಿ (Condition - New/Used)" },
          { key: "price", label: "ಬೆಲೆ / ಬಾಡಿಗೆ ದರ (Price/Rate ₹)" },
          { key: "location", label: "ಸ್ಥಳ (Location)" },
        ];
      case "agents":
      case "agent":
      case "labor":
        return [
          { key: "title", label: "ಏಜೆಂಟ್ ಹೆಸರು (Agent Name)" },
          { key: "skill", label: "ಸೇವೆ ಪ್ರಕಾರ (Specialization / Domain)" },
          { key: "experience", label: "ಅನುಭವ (Experience)" },
          { key: "location", label: "ಸ್ಥಳ / ವ್ಯಾಪ್ತಿ (Service Location)" },
        ];
      case "danakarugalu":
      case "livestock":
        return [
          { key: "title", label: "ದನಕರು ವಿವರ (Cattle - Cow/Bull/Buffalo)" },
          { key: "breed", label: "ತಳಿ (Breed)" },
          { key: "age", label: "ವಯಸ್ಸು / ಹಾಲು (Age / Details)" },
          { key: "price", label: "ಬೆಲೆ (Price ₹)" },
          { key: "location", label: "ಸ್ಥಳ (Location)" },
        ];
      case "pets":
      case "animals-pets":
        return [
          { key: "title", label: "ಪೆಟ್ ಹೆಸರು (Pet Name / Type)" },
          { key: "breed", label: "ತಳಿ (Breed)" },
          { key: "age", label: "ವಯಸ್ಸು (Age)" },
          { key: "price", label: "ಬೆಲೆ (Price ₹)" },
          { key: "location", label: "ಸ್ಥಳ (Location)" },
        ];
      case "vehicle-rent":
      case "car-auto-rent":
      case "vehicle-rental":
        return [
          { key: "title", label: "ವಾಹನ ಹೆಸರು (Vehicle Name / Model)" },
          { key: "vehicleType", label: "ವಿಧ (Car / Auto / Van)" },
          { key: "rateInfo", label: "ಬಾಡಿಗೆ ದರ (Rate ₹/km or ₹/day)" },
          { key: "location", label: "ಸ್ಥಳ (Location)" },
        ];
      case "services":
        return [
          { key: "title", label: "ಸೇವೆ ಹೆಸರು (Service)" },
          { key: "rateInfo", label: "ದರ (Rate Info)" },
          { key: "experience", label: "ಅನುಭವ (Experience)" },
          { key: "location", label: "ಸ್ಥಳ (Location)" },
        ];
      default:
        return [
          { key: "title", label: "ಹೆಸರು (Name)" },
          { key: "price", label: "ಬೆಲೆ (Price ₹)" },
          { key: "location", label: "ಸ್ಥಳ (Location)" },
        ];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!api.getToken()) {
      toast.error("ಜಾಹೀರಾತು ಹಾಕಲು ದಯವಿಟ್ಟು ಮೊದಲು ಲಾಗಿನ್ ಮಾಡಿ (Please login first to post an ad)");
      router.push("/login");
      return;
    }

    // Validation
    const fields = getFields();
    const titleField = fields[0].key;
    if (!formData[titleField]) {
      toast.error(`${fields[0].label} ಅಗತ್ಯ (${fields[0].label} is required)`);
      return;
    }

    setLoading(true);
    try {
      const rawPrice = formData.price ? String(formData.price).replace(/[^0-9.]/g, "") : "";
      const parsedPrice = rawPrice ? parseFloat(rawPrice) : null;

      const listingData: Record<string, unknown> = {
        title: (formData.title || formData[titleField] || "").trim(),
        category: categoryId,
        description: formData.description?.trim() || "",
        location: formData.location?.trim() || "",
        district: formData.district?.trim() || "",
        price: parsedPrice && !isNaN(parsedPrice) ? parsedPrice : null,
        priceUnit: formData.priceUnit?.trim() || "",
        breed: formData.breed?.trim() || null,
        age: formData.age?.trim() || null,
        condition: formData.condition?.trim() || null,
        hp: formData.hp?.trim() || null,
        area: formData.area?.trim() || null,
        skill: formData.skill?.trim() || null,
        experience: formData.experience?.trim() || null,
        vehicleType: formData.vehicleType?.trim() || null,
        rateInfo: formData.rateInfo?.trim() || null,
      };

      await api.createListing(listingData, images.length > 0 ? images : undefined);
      toast.success("ಲಿಸ್ಟಿಂಗ್ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ! (Listing Submitted Successfully)");
      setTimeout(() => router.push(`/category/${categoryId}`), 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "ಸಲ್ಲಿಕೆ ವಿಫಲವಾಗಿದೆ";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-4 sm:p-6 pb-28 lg:pb-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 overflow-x-auto">
          <Link href="/home" className="hover:text-primary shrink-0">ಹೋಮ್</Link>
          <span>/</span>
          <Link href={`/category/${categoryId}`} className="hover:text-primary shrink-0">{category?.nameEn}</Link>
          <span>/</span>
          <span className="text-foreground font-medium shrink-0">ಹೊಸ ಜಾಹೀರಾತು</span>
        </div>

        <div className="bg-card rounded-2xl p-4 sm:p-8 shadow-sm border border-border">
          <h1 className="text-lg sm:text-xl font-bold text-foreground mb-1">ಹೊಸ ಜಾಹೀರಾತು (New Listing)</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mb-5 sm:mb-6">{category?.name} • {category?.nameEn}</p>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Photo upload */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                ಫೋಟೋಗಳು (Photos) — ಗರಿಷ್ಠ 5
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
              <div className="flex gap-2.5 sm:gap-3 flex-wrap">
                {previews.map((preview, i) => (
                  <div key={i} className="relative w-20 h-20 sm:w-24 sm:h-24">
                    <img src={preview} alt="" className="w-full h-full object-cover rounded-xl border border-border" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition bg-muted/30"
                  >
                    {images.length === 0 ? <Camera size={22} /> : <Plus size={18} />}
                    <span className="text-[10px] mt-1">{images.length === 0 ? "ಸೇರಿಸಿ" : "ಇನ್ನಷ್ಟು"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Dynamic Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {getFields().map((field) => (
                <div key={field.key}>
                  <label className="text-xs sm:text-sm font-medium text-foreground mb-1 block">{field.label}</label>
                  <Input
                    value={formData[field.key] || ""}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.label}
                    className="h-10 sm:h-11"
                    type={field.key === "price" ? "number" : "text"}
                  />
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <label className="text-xs sm:text-sm font-medium text-foreground mb-1 block">
                ವಿವರಣೆ (Description)
              </label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ..."
                rows={4}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              <Button type="submit" disabled={loading} className="bg-primary w-full sm:w-auto px-8 h-11 text-sm font-medium">
                {loading ? (
                  <><Loader2 size={16} className="mr-2 animate-spin" /> ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...</>
                ) : (
                  "ಸಲ್ಲಿಸಿ (Submit Listing)"
                )}
              </Button>
              <Link href={`/category/${categoryId}`} className="w-full sm:w-auto">
                <Button type="button" variant="outline" className="w-full h-11 text-sm">
                  ರದ್ದುಮಾಡಿ (Cancel)
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
