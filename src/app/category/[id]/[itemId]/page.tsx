"use client";
import { useParams } from "next/navigation";
import { Share2, Heart, MapPin } from "lucide-react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import ContactUnlockModal from "@/components/ContactUnlockModal";
import { api, ListingData } from "@/lib/api";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function ItemDetailPage() {
  const params = useParams();
  const categoryId = params.id as string;
  const itemId = params.itemId as string;

  const [item, setItem] = useState<ListingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = parseInt(itemId);
    if (isNaN(id)) {
      setLoading(false);
      return;
    }
    api.getListingById(id)
      .then(setItem)
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [itemId]);

  const getCategoryIcon = (cat: string) => {
    const icons: Record<string, string> = {
      "agricultural-products": "🌾", livestock: "🐄", "farm-equipment": "🚜",
      "tractor-rental": "🚜", "vehicle-rental": "🚗", labor: "👨‍🌾",
      land: "🏞️", services: "🔧",
    };
    return icons[cat] || "📦";
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto p-6 animate-pulse">
          <div className="h-80 bg-gray-200 rounded-2xl mb-6" />
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-3" />
          <div className="h-6 bg-gray-200 rounded w-1/4" />
        </div>
      </AppLayout>
    );
  }

  if (!item) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto p-6 text-center py-20">
          <p className="text-5xl mb-4">😔</p>
          <p className="text-gray-500 text-lg">ಜಾಹೀರಾತು ಕಂಡುಬಂದಿಲ್ಲ (Listing not found)</p>
          <Link href={`/category/${categoryId}`} className="text-primary mt-4 inline-block hover:underline">
            ← ಹಿಂದೆ ಹೋಗಿ
          </Link>
        </div>
      </AppLayout>
    );
  }

  const details = [
    item.breed && `ತಳಿ: ${item.breed}`,
    item.age && `ವಯಸ್ಸು: ${item.age}`,
    item.condition && `ಸ್ಥಿತಿ: ${item.condition}`,
    item.hp && `ಪವರ್: ${item.hp}`,
    item.area && `ವಿಸ್ತೀರ್ಣ: ${item.area}`,
    item.skill && `ಕೌಶಲ: ${item.skill}`,
    item.experience && `ಅನುಭವ: ${item.experience}`,
    item.vehicleType && `ವಿಧ: ${item.vehicleType}`,
    item.rateInfo && `ದರ: ${item.rateInfo}`,
    item.location && `ಸ್ಥಳ: ${item.location}`,
    item.district && `ಜಿಲ್ಲೆ: ${item.district}`,
  ].filter(Boolean) as string[];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/home" className="hover:text-primary">ಹೋಮ್</Link>
          <span>/</span>
          <Link href={`/category/${categoryId}`} className="hover:text-primary">{categoryId.replace(/-/g, " ")}</Link>
          <span>/</span>
          <span className="text-gray-800">{item.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Images */}
          <div className="lg:col-span-2 space-y-6">
            <div className="w-full h-80 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden">
              {item.images && item.images.length > 0 ? (
                <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-8xl">{getCategoryIcon(item.category)}</span>
              )}
            </div>

            {/* More images */}
            {item.images && item.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {item.images.slice(1).map((img, i) => (
                  <img key={i} src={img} alt="" className="w-24 h-24 rounded-lg object-cover border" />
                ))}
              </div>
            )}

            {/* Details */}
            {details.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-base font-semibold text-gray-700 mb-4">ವಿವರಗಳು (Details)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {details.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {item.description && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-base font-semibold text-gray-700 mb-2">ವಿವರಣೆ (Description)</h3>
                <p className="text-sm text-gray-600 whitespace-pre-line">{item.description}</p>
              </div>
            )}

            {/* Map placeholder for land */}
            {categoryId === "land" && (
              <div className="bg-gray-100 rounded-2xl h-64 flex items-center justify-center border">
                <div className="text-center text-gray-400">
                  <MapPin size={40} className="mx-auto mb-2" />
                  <p className="text-sm">ನಕ್ಷೆ (Map Placeholder)</p>
                </div>
              </div>
            )}
          </div>

          {/* Right - Sidebar */}
          <div className="space-y-4">
            {/* Price Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-xl font-bold text-gray-800">{item.title}</h1>
                  {item.titleEn && <p className="text-sm text-gray-500">{item.titleEn}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toast.success("ಇಷ್ಟಪಟ್ಟಿಗೆ ಸೇರಿಸಲಾಗಿದೆ!")} className="p-2 rounded-full hover:bg-gray-100">
                    <Heart size={20} className="text-gray-400" />
                  </button>
                  <button onClick={() => toast.success("ಲಿಂಕ್ ಕಾಪಿ ಆಗಿದೆ!")} className="p-2 rounded-full hover:bg-gray-100">
                    <Share2 size={20} className="text-gray-400" />
                  </button>
                </div>
              </div>
              <p className="text-3xl font-bold text-primary">
                {item.price ? `₹${item.price.toLocaleString()}${item.priceUnit ? '/' + item.priceUnit : ''}` : item.rateInfo || ""}
              </p>
              {item.location && (
                <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
                  <MapPin size={14} />
                  <span>{item.location}</span>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">👁 {item.viewCount} ವೀಕ್ಷಣೆ</p>
            </div>

            {/* Seller Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">ಮಾರಾಟಗಾರ (Seller)</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-xl">👤</div>
                <div>
                  <p className="font-medium">{item.sellerName || "Seller"}</p>
                  <p className="text-xs text-gray-500">{item.sellerLocation || item.location}</p>
                </div>
              </div>
              <ContactUnlockModal listingId={item.id} />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
