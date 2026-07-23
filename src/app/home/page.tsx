"use client";
import { useState, useEffect } from "react";
import { Search, Mic, ChevronRight, MapPin, TrendingUp, Globe, Menu } from "lucide-react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { categories } from "@/lib/categories";
import { api, ListingData } from "@/lib/api";

const bannerSlides = [
  {
    title: "ಗ್ರಾಮೀಣ ಕೃಷಿ ಮಾರುಕಟ್ಟೆ",
    subtitle: "ನಿಮ್ಮ ಹತ್ತಿರದ ರೈತರೊಂದಿಗೆ ನೇರವಾಗಿ ವ್ಯಾಪಾರ ಮಾಡಿ",
    color: "from-green-600 to-emerald-700",
  },
  {
    title: "ಜಾನುವಾರು & ಕೃಷಿ ಉಪಕರಣ",
    subtitle: "ಉತ್ತಮ ಬೆಲೆಯಲ್ಲಿ ಖರೀದಿಸಿ ಮಾರಾಟ ಮಾಡಿ",
    color: "from-amber-600 to-orange-700",
  },
  {
    title: "ಟ್ರ್ಯಾಕ್ಟರ್ & ವಾಹನ ಬಾಡಿಗೆ",
    subtitle: "ನಿಮ್ಮ ಕೃಷಿ ಅಗತ್ಯಗಳಿಗೆ ಸುಲಭ ಬಾಡಿಗೆ ಸೇವೆ",
    color: "from-blue-600 to-indigo-700",
  },
];

const categoryImages: Record<string, string> = {
  "agricultural-products": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=200&fit=crop",
  livestock: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=300&h=200&fit=crop",
  "farm-equipment": "https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=300&h=200&fit=crop",
  "tractor-rental": "https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?w=300&h=200&fit=crop",
  "vehicle-rental": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=300&h=200&fit=crop",
  labor: "https://images.unsplash.com/photo-1589923188651-268a9765e432?w=300&h=200&fit=crop",
  land: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=300&h=200&fit=crop",
  services: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop",
};

export default function HomePage() {
  const [recentListings, setRecentListings] = useState<ListingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    api.getRecentListings()
      .then(setRecentListings)
      .catch(() => setRecentListings([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 pb-6 space-y-5">
        {/* Banner Carousel */}
        <section className="relative rounded-2xl overflow-hidden shadow-lg">
          <div className={`bg-gradient-to-r ${bannerSlides[currentSlide].color} p-6 sm:p-8 min-h-[160px] flex flex-col justify-end transition-all duration-500`}>
            <h2 className="text-white text-lg sm:text-xl font-bold">{bannerSlides[currentSlide].title}</h2>
            <p className="text-white/80 text-sm mt-1">{bannerSlides[currentSlide].subtitle}</p>
          </div>
          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {bannerSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? "bg-white w-5" : "bg-white/50"}`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </section>

        {/* Search Bar */}
        <Link href="/search" className="block">
          <div className="flex items-center gap-3 bg-white rounded-full px-5 py-3 shadow-sm border border-gray-200 hover:border-primary/40 transition">
            <Search size={20} className="text-gray-400" />
            <span className="flex-1 text-sm text-gray-400">ದನಕರು, ಕುರಿ, ಮೇವು ಹುಡುಕಿ ...</span>
            <Mic size={20} className="text-gray-400" />
          </div>
        </Link>

        {/* Categories Grid - 2 column with images */}
        <section>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.id}`}
                className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group"
              >
                <div className="w-full h-28 sm:h-36 bg-gray-100 overflow-hidden">
                  <img
                    src={categoryImages[cat.id] || ""}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="px-3 py-2.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800">{cat.name}</span>
                  <ChevronRight size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Listings */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp size={16} className="text-primary" />
              ಇತ್ತೀಚಿನ ಜಾಹೀರಾತು
            </h2>
            <Link href="/search" className="text-xs text-primary font-medium">ಎಲ್ಲಾ ನೋಡಿ →</Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white rounded-xl p-3 shadow-sm border animate-pulse">
                  <div className="w-full h-24 bg-gray-200 rounded-lg mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : recentListings.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {recentListings.slice(0, 6).map((item) => (
                <Link
                  key={item.id}
                  href={`/category/${item.category}/${item.id}`}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all group"
                >
                  <div className="w-full h-24 sm:h-32 bg-gray-100 overflow-hidden">
                    {item.images && item.images.length > 0 ? (
                      <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl bg-gray-50">🌾</div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-medium text-gray-800 truncate">{item.title}</p>
                    <p className="text-sm font-bold text-primary mt-0.5">
                      {item.price ? `₹${item.price.toLocaleString()}` : item.rateInfo || ""}
                    </p>
                    {item.location && (
                      <p className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-0.5">
                        <MapPin size={8} /> {item.location}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-xl border">
              <p className="text-3xl mb-2">🌾</p>
              <p className="text-sm text-gray-500">ಇನ್ನೂ ಯಾವುದೇ ಜಾಹೀರಾತುಗಳಿಲ್ಲ</p>
              <Link href="/create" className="inline-block mt-3 text-xs text-primary font-medium hover:underline">
                + ಹೊಸ ಜಾಹೀರಾತು ಹಾಕಿ
              </Link>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
