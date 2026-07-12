"use client";
import { Heart, Trash2, MapPin } from "lucide-react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { api, ListingData } from "@/lib/api";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<ListingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getFavorites()
      .then((res) => setFavorites(res.content))
      .catch(() => setFavorites([]))
      .finally(() => setLoading(false));
  }, []);

  const removeFavorite = async (listingId: number) => {
    try {
      await api.removeFavorite(listingId);
      setFavorites(favorites.filter(f => f.id !== listingId));
      toast.success("ಇಷ್ಟಪಟ್ಟಿಯಿಂದ ತೆಗೆಯಲಾಗಿದೆ");
    } catch {
      toast.error("Failed to remove");
    }
  };

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
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Heart size={20} className="text-red-400" />
          <h1 className="text-xl font-bold text-gray-800">ಇಷ್ಟಪಟ್ಟಿ (Favorites)</h1>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2].map(i => (
              <div key={i} className="bg-white rounded-xl p-4 border animate-pulse">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-xl" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                    <div className="h-5 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {favorites.map((item) => (
              <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition">
                <div className="flex gap-4">
                  <Link href={`/category/${item.category}/${item.id}`} className="flex gap-4 flex-1">
                    <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                      {item.images?.length > 0 ? (
                        <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">{getCategoryIcon(item.category)}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{item.title}</p>
                      <p className="text-lg font-bold text-primary mt-1">
                        {item.price ? `₹${item.price.toLocaleString()}` : item.rateInfo || ""}
                      </p>
                      {item.location && (
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                          <MapPin size={11} /> {item.location}
                        </div>
                      )}
                    </div>
                  </Link>
                  <button onClick={() => removeFavorite(item.id)} className="self-start p-2 text-red-400 hover:bg-red-50 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border">
            <Heart size={48} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-500">ಇನ್ನೂ ಯಾವುದೇ ಇಷ್ಟಪಟ್ಟಿ ಇಲ್ಲ</p>
            <p className="text-sm text-gray-400">No favorites yet</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
