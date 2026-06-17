"use client";
import { useParams, useRouter } from "next/navigation";
import { Camera, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { categories } from "@/lib/mock-data";
import AppLayout from "@/components/AppLayout";

export default function CreateListingPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;
  const category = categories.find((c) => c.id === categoryId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("ಲಿಸ್ಟಿಂಗ್ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ! (Listing Submitted Successfully)");
    setTimeout(() => router.push(`/category/${categoryId}`), 1500);
  };

  const getFields = () => {
    switch (categoryId) {
      case "agricultural-products":
        return ["ಬೆಳೆ ಹೆಸರು (Crop Name)", "ಪ್ರಮಾಣ (Quantity)", "ಬೆಲೆ (Price)", "ಸ್ಥಳ (Location)"];
      case "livestock":
        return ["ಪ್ರಾಣಿ ಹೆಸರು (Animal)", "ತಳಿ (Breed)", "ವಯಸ್ಸು (Age)", "ಬೆಲೆ (Price)"];
      case "farm-equipment":
        return ["ಉಪಕರಣ ಹೆಸರು (Equipment)", "ಸ್ಥಿತಿ (Condition)", "ಬೆಲೆ (Price)", "ಸ್ಥಳ (Location)"];
      case "tractor-rental":
        return ["ಟ್ರ್ಯಾಕ್ಟರ್ ಹೆಸರು (Tractor)", "HP", "ಬಾಡಿಗೆ ದರ (Rate)", "ಸ್ಥಳ (Location)"];
      case "vehicle-rental":
        return ["ವಾಹನ ಹೆಸರು (Vehicle)", "ವಿಧ (Type)", "ಬಾಡಿಗೆ ದರ (Rate)", "ಸ್ಥಳ (Location)"];
      case "labor":
        return ["ಹೆಸರು (Name)", "ಕೌಶಲ (Skill)", "ಅನುಭವ (Experience)", "ದೈನಿಕ ವೇತನ (Daily Wage)"];
      case "land":
        return ["ವಿಸ್ತೀರ್ಣ (Area)", "ಬೆಲೆ (Price)", "ಗ್ರಾಮ (Village)", "ಜಿಲ್ಲೆ (District)"];
      case "services":
        return ["ಸೇವೆ ಹೆಸರು (Service)", "ದರ (Rate)", "ಸ್ಥಳ (Location)", "ಅನುಭವ (Experience)"];
      default:
        return ["ಹೆಸರು (Name)", "ಬೆಲೆ (Price)", "ಸ್ಥಳ (Location)"];
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
                ಫೋಟೋಗಳು (Photos)
              </label>
              <div className="flex gap-3">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition"
                    onClick={() => toast.info("ಡೆಮೋ: ಫೋಟೋ ಅಪ್‌ಲೋಡ್")}
                  >
                    {n === 1 ? <Camera size={24} /> : <Plus size={20} />}
                    {n === 1 && <span className="text-[10px] mt-1">ಸೇರಿಸಿ</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {getFields().map((field, i) => (
                <div key={i}>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">{field}</label>
                  <Input placeholder={field} className="h-11" />
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                ವಿವರಣೆ (Description)
              </label>
              <Textarea placeholder="ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ..." rows={4} />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="bg-primary px-8 h-11">
                ಸಲ್ಲಿಸಿ (Submit Listing)
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
