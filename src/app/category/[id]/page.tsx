"use client";
import { useParams } from "next/navigation";
import { Plus, Heart, MapPin } from "lucide-react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { categories } from "@/lib/categories";
import { api, ListingData } from "@/lib/api";
import { useState, useEffect } from "react";

export default function CategoryPage() {
  const params = useParams();
  const id = params.id as string;
  const category = categories.find((c) => c.id === id);

  const [listings, setListings] = useState<ListingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getListingsByCategory(id)
      .then((res) => setListings(res.content))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [id]);

  const getCategoryIcon = (cat: string) => {
    const icons: Record<string, string> = {
      "agricultural-products": "🌾", livestock: "🐄", "farm-equipment": "🚜",
      "tractor-rental": "🚜", "vehicle-rental": "🚗", labor: "👨‍🌾",
      land: "🏞️", services: "🔧",
    };
    return icons[cat] || "📦";
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{category?.name}</h1>
            <p className="text-sm text-gray-500">{category?.nameEn} • {listings.length} ಜಾಹೀರಾತುಗಳು</p>
          </div>
          <Link href={`/category/${id}/create`}>
            <Button className="bg-primary">
              <Plus size={16} className="mr-2" /> ಹೊಸ ಜಾಹೀರಾತು
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm border animate-pulse">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-xl" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
                    <div className="h-5 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((item) => (
              <Link
                key={item.id}
                href={`/category/${id}/${item.id}`}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all group"
              >
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                    {item.images && item.images.length > 0 ? (
                      <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">{getCategoryIcon(item.category)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.titleEn || item.breed || item.hp || ""}</p>
                      </div>
                      <button className="text-gray-300 hover:text-red-400 transition-colors" onClick={(e) => e.preventDefault()}>
                        <Heart size={18} />
                      </button>
                    </div>
                    <p className="text-lg font-bold text-primary mt-2">
                      {item.price ? `₹${item.price.toLocaleString()}${item.priceUnit ? '/' + item.priceUnit : ''}` : item.rateInfo || ""}
                    </p>
                    {item.location && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <MapPin size={12} />
                        <span>{item.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border">
            <p className="text-5xl mb-3">{getCategoryIcon(id)}</p>
            <p className="text-gray-500">ಈ ವಿಭಾಗದಲ್ಲಿ ಯಾವುದೇ ಜಾಹೀರಾತುಗಳಿಲ್ಲ</p>
            <p className="text-sm text-gray-400 mt-1">No listings in this category yet</p>
            <Link href={`/category/${id}/create`} className="inline-block mt-4">
              <Button className="bg-primary">
                <Plus size={16} className="mr-2" /> ಮೊದಲ ಜಾಹೀರಾತು ಹಾಕಿ
              </Button>
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
