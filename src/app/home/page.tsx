"use client";
import { useState, useEffect, useRef } from "react";
import { Search, Mic, ChevronRight, MapPin, TrendingUp } from "lucide-react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { categories } from "@/lib/categories";
import { api, ListingData, BannerResponse } from "@/lib/api";

const defaultBanners = [
  {
    title: "ಗ್ರಾಮೀಣ ಕೃಷಿ ಮಾರುಕಟ್ಟೆ",
    subtitle: "ನಿಮ್ಮ ಹತ್ತಿರದ ರೈತರೊಂದಿಗೆ ನೇರವಾಗಿ ವ್ಯಾಪಾರ ಮಾಡಿ",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=600&fit=crop",
  },
  {
    title: "ಜಾನುವಾರು & ಕೃಷಿ ಉಪಕರಣ",
    subtitle: "ಉತ್ತಮ ಬೆಲೆಯಲ್ಲಿ ಖರೀದಿಸಿ ಮಾರಾಟ ಮಾಡಿ",
    image: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&h=600&fit=crop",
  },
  {
    title: "ಟ್ರ್ಯಾಕ್ಟರ್ & ವಾಹನ ಬಾಡಿಗೆ",
    subtitle: "ನಿಮ್ಮ ಕೃಷಿ ಅಗತ್ಯಗಳಿಗೆ ಸುಲಭ ಬಾಡಿಗೆ ಸೇವೆ",
    image: "https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?w=800&h=600&fit=crop",
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
  const [banners, setBanners] = useState(defaultBanners);

  useEffect(() => {
    api.getRecentListings()
      .then(setRecentListings)
      .catch(() => setRecentListings([]))
      .finally(() => setLoading(false));
  }, []);

  // Try to load banners from API
  useEffect(() => {
    api.adminBanners()
      .then((apiBanners: BannerResponse[]) => {
        if (apiBanners && apiBanners.length > 0) {
          const activeBanners = apiBanners.filter(b => b.active && b.imageUrl);
          if (activeBanners.length > 0) {
            setBanners(activeBanners.map(b => ({
              title: b.title,
              subtitle: b.subtitle || "",
              image: b.imageUrl || "",
            })));
          }
        }
      })
      .catch(() => { /* keep defaults */ });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <AppLayout>
      <div className="relative">
        {/* Sticky Banner - 50vh on mobile */}
        <div className="sticky top-0 z-0 h-[50vh] lg:h-[40vh] overflow-hidden">
          {banners.map((banner, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-700 ${
                i === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              {/* Text */}
              <div className="absolute bottom-12 left-4 right-4">
                <h2 className="text-white text-xl sm:text-2xl font-bold drop-shadow-lg">{banner.title}</h2>
                <p className="text-white/80 text-sm mt-1 drop-shadow">{banner.subtitle}</p>
              </div>
            </div>
          ))}
          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentSlide ? "bg-white w-6" : "bg-white/50 w-2"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Content that scrolls over the banner */}
        <div className="relative z-10 -mt-6 rounded-t-3xl bg-gray-50 min-h-screen shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
          <div className="max-w-6xl mx-auto px-4 pt-5 pb-6 space-y-5">
            {/* Pull indicator */}
            <div className="flex justify-center">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Search Bar */}
            <Link href="/search" className="block">
              <div className="flex items-center gap-3 bg-white rounded-full px-5 py-3 shadow-sm border border-gray-200 hover:border-primary/40 transition">
                <Search size={20} className="text-gray-400" />
                <span className="flex-1 text-sm text-gray-400">ದನಕರು, ಕುರಿ, ಮೇವು ಹುಡುಕಿ ...</span>
                <Mic size={20} className="text-gray-400" />
              </div>
            </Link>

            {/* Categories Grid */}
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
        </div>
      </div>
    </AppLayout>
  );
}
