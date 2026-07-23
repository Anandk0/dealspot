"use client";
import { TrendingUp, MapPin } from "lucide-react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { categories } from "@/lib/categories";
import { api, ListingData } from "@/lib/api";
import { useState, useEffect } from "react";

export default function HomePage() {
  const [recentListings, setRecentListings] = useState<ListingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRecentListings()
      .then(setRecentListings)
      .catch(() => setRecentListings([]))
      .finally(() => setLoading(false));
  }, []);

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
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Categories Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">ವಿಭಾಗಗಳು (Categories)</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.id}`}
                className={`flex items-center gap-4 p-4 rounded-xl ${cat.color} border border-transparent hover:border-primary/30 hover:shadow-md transition-all group`}
              >
                <div className="text-3xl">{cat.icon}</div>
                <div>
                  <p className="text-sm font-medium text-gray-800 group-hover:text-primary transition-colors">{cat.name}</p>
                  <p className="text-xs text-gray-500">{cat.nameEn}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Listings from API */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              <TrendingUp size={18} className="inline mr-2 text-primary" />
              ಇತ್ತೀಚಿನ ಜಾಹೀರಾತುಗಳು (Recent Listings)
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white rounded-xl p-4 shadow-sm border animate-pulse">
                  <div className="w-full h-32 bg-gray-200 rounded-lg mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : recentListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentListings.map((item) => (
                <Link
                  key={item.id}
                  href={`/category/${item.category}/${item.id}`}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all group"
                >
                  <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    {item.images && item.images.length > 0 ? (
                      <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">{getCategoryIcon(item.category)}</span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                  <p className="text-base font-bold text-primary mt-1">
                    {item.price ? `₹${item.price.toLocaleString()}${item.priceUnit ? '/' + item.priceUnit : ''}` : item.rateInfo || ""}
                  </p>
                  {item.location && (
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <MapPin size={10} /> {item.location}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border">
              <p className="text-4xl mb-3">🌾</p>
              <p className="text-gray-500">ಇನ್ನೂ ಯಾವುದೇ ಜಾಹೀರಾತುಗಳಿಲ್ಲ</p>
              <p className="text-sm text-gray-400">No listings yet. Be the first to post!</p>
              <Link href="/create" className="inline-block mt-4 text-sm text-primary font-medium hover:underline">
                + ಹೊಸ ಜಾಹೀರಾತು ಹಾಕಿ
              </Link>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
