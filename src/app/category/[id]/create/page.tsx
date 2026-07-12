"use client";
import { useParams, useRouter } from "next/navigation";
import { Camera, Plus, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { categories } from "@/lib/mock-data";
import { api } from "@/lib/api";
import AppLayout from "@/components/AppLayout";
import { useRef, useState } from "react";

export default function CreateListingPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;
  const category = categories.find((c) => c.id === categoryId);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      case "agricultural-products":
        return [
          { key: "title", label: "ಬೆಳೆ ಹೆಸರು (Crop Name)" },
          { key: "priceUnit", label: "ಪ್ರಮಾಣ (Quantity)" },
          { key: "price", label: "ಬೆಲೆ (Price ₹)" },
          { key: "location", label: "ಸ್ಥಳ (Location)" },
        ];
      case "livestock":
        return [
          { key: "title", label: "ಪ್ರಾಣಿ ಹೆಸರು (Animal)" },
          { key: "breed", label: "ತಳಿ (Breed)" },
          { key: "age", label: "ವಯಸ್ಸು (Age)" },
          { key: "price", label: "ಬೆಲೆ (Price ₹)" },
        ];
      case "farm-equipment":
        return [
          { key: "title", label: "ಉಪಕರಣ ಹೆಸರು (Equipment)" },
          { key: "condition", label: "ಸ್ಥಿತಿ (Condition)" },
          { key: "price", label: "ಬೆಲೆ (Price ₹)" },
          { key: "location", label: "ಸ್ಥಳ (Location)" },
        ];
      case "tractor-rental":
        return [
          { key: "title", label: "ಟ್ರ್ಯಾಕ್ಟರ್ ಹೆಸರು (Tractor)" },
          { key: "hp", label: "HP" },
          { key: "rateInfo", label: "ಬಾಡಿಗೆ ದರ (Rate ₹/hr)" },
          { key: "location", label: "ಸ್ಥಳ (Location)" },
        ];
      case "vehicle-rental":
        return [
          { key: "title", label: "ವಾಹನ ಹೆಸರು (Vehicle)" },
          { key: "vehicleType", label: "ವಿಧ (Type)" },
          { key: "rateInfo", label: "ಬಾಡಿಗೆ ದರ (Rate ₹/km)" },
          { key: "location", label: "ಸ್ಥಳ (Location)" },
        ];
      case "labor":
        return [
          { key: "title", label: "ಹೆಸರು (Name)" },
          { key: "skill", label: "ಕೌಶಲ (Skill)" },
          { key: "experience", label: "ಅನುಭವ (Experience)" },
          { key: "price", label: "ದೈನಿಕ ವೇತನ (Daily Wage ₹)" },
        ];
      case "land":
        return [
          { key: "area", label: "ವಿಸ್ತೀರ್ಣ (Area)" },
          { key: "price", label: "ಬೆಲೆ (Price ₹)" },
          { key: "location", label: "ಗ್ರಾಮ (Village)" },
          { key: "district", label: "ಜಿಲ್ಲೆ (District)" },
        ];
      case "services":
        return [
          { key: "title", label: "ಸೇವೆ ಹೆಸರು (Service)" },
          { key: "rateInfo", label: "ದರ (Rate)" },
          { key: "location", label: "ಸ್ಥಳ (Location)" },
          { key: "experience", label: "ಅನುಭವ (Experience)" },
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

    // Validation
    const fields = getFields();
    const titleField = fields[0].key;
    if (!formData[titleField]) {
      toast.error(`${fields[0].label} ಅಗತ್ಯ`);
      return;
    }

    setLoading(true);
    try {
      const listingData: Record<string, unknown> = {
        title: formData.title || formData[titleField],
        category: categoryId,
        description: formData.description || "",
        location: formData.location || "",
        district: formData.district || "",
        price: formData.price ? parseFloat(formData.price) : null,
        priceUnit: formData.priceUnit || "",
        breed: formData.breed || null,
        age: formData.age || null,
        condition: formData.condition || null,
        hp: formData.hp || null,
        area: formData.area || null,
        skill: formData.skill || null,
        experience: formData.experience || null,
        vehicleType: formData.vehicleType || null,
        rateInfo: formData.rateInfo || null,
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
      <div className="max-w-3xl mx-auto p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/home" className="hover:text-primary">ಹೋಮ್</Link>
          <span>/</span>
          <Link href={`/category/${categoryId}`} className="hover:text-primary">{category?.nameEn}</Link>
          <span>/</span>
          <span className="text-gray-800">ಹೊಸ ಜಾಹೀರಾತು</span>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h1 className="text-xl font-bold text-gray-800 mb-1">ಹೊಸ ಜಾಹೀರಾತು (New Listing)</h1>
          <p className="text-sm text-gray-500 mb-6">{category?.name} • {category?.nameEn}</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Photo upload */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
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
              <div className="flex gap-3 flex-wrap">
                {previews.map((preview, i) => (
                  <div key={i} className="relative w-24 h-24">
                    <img src={preview} alt="" className="w-full h-full object-cover rounded-xl border" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition"
                  >
                    {images.length === 0 ? <Camera size={24} /> : <Plus size={20} />}
                    <span className="text-[10px] mt-1">{images.length === 0 ? "ಸೇರಿಸಿ" : "ಇನ್ನಷ್ಟು"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Dynamic Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {getFields().map((field) => (
                <div key={field.key}>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">{field.label}</label>
                  <Input
                    value={formData[field.key] || ""}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.label}
                    className="h-11"
                    type={field.key === "price" ? "number" : "text"}
                  />
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                ವಿವರಣೆ (Description)
              </label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ..."
                rows={4}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading} className="bg-primary px-8 h-11">
                {loading ? (
                  <><Loader2 size={16} className="mr-2 animate-spin" /> ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...</>
                ) : (
                  "ಸಲ್ಲಿಸಿ (Submit Listing)"
                )}
              </Button>
              <Link href={`/category/${categoryId}`}>
                <Button type="button" variant="outline" className="h-11">
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
