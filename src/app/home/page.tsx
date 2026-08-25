"use client";
import { useState, useEffect, useRef } from "react";
import { Search, Mic, ArrowRight, MapPin, TrendingUp, Sparkles, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { categories } from "@/lib/categories";
import { api, ListingData, BannerResponse } from "@/lib/api";

const categoryImages: Record<string, string> = {
  "property-sales": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop&q=80",
  "property-rent": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&q=80",
  "agriculture-equipment": "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop&q=80",
  "agents": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=300&fit=crop&q=80",
  "danakarugalu": "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=400&h=300&fit=crop&q=80",
  "pets": "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=300&fit=crop&q=80",
  "vehicle-rent": "https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=400&h=300&fit=crop&q=80",
  "services": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop&q=80",
};

// Gradient accent per category for the icon badge
const categoryGradients: Record<string, string> = {
  "property-sales": "from-blue-500 to-cyan-400",
  "property-rent": "from-sky-500 to-blue-400",
  "agriculture-equipment": "from-green-500 to-emerald-400",
  "agents": "from-purple-500 to-fuchsia-400",
  "danakarugalu": "from-amber-500 to-yellow-400",
  "pets": "from-pink-500 to-rose-400",
  "vehicle-rent": "from-orange-500 to-amber-400",
  "services": "from-rose-500 to-red-400",
};

interface BannerSlide {
  title: string;
  subtitle: string;
  image: string;
}

const defaultBanners: BannerSlide[] = [
  { title: "ಗ್ರಾಮಸ್ಥರಿಗಾಗಿ ಮಾರ್ಕೆಟ್‌ಪ್ಲೇಸ್", subtitle: "Just click ಮಾಡಿ, ನಿಮ್ಮ ಪರಿಚಯ ಹಂಚಿಕೊಳ್ಳಿ", image: "" },
  { title: "ಕೃಷಿ ಉಪಕರಣ ಬಾಡಿಗೆ", subtitle: "ಟ್ರ್ಯಾಕ್ಟರ್, ಕೃಷಿ ಯಂತ್ರ ಬಾಡಿಗೆ ಸೇವೆ", image: "" },
  { title: "ಆಸ್ತಿ ಮಾರಾಟ & ಖರೀದಿ", subtitle: "ಮನೆ, ಜಮೀನು, ಪ್ಲಾಟ್ ಮಾರಾಟ", image: "" },
];

export default function HomePage() {
  const [recentListings, setRecentListings] = useState<ListingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState<BannerSlide[]>(defaultBanners);
  const recentSliderRef = useRef<HTMLDivElement>(null);

  const scrollRecent = (direction: "left" | "right") => {
    if (recentSliderRef.current) {
      const scrollAmount = 260;
      recentSliderRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    api.getRecentListings()
      .then(setRecentListings)
      .catch(() => setRecentListings([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.getActiveBanners()
      .then((apiBanners: BannerResponse[]) => {
        if (apiBanners && apiBanners.length > 0) {
          const activeBanners = apiBanners.filter(b => b.active);
          if (activeBanners.length > 0) {
            setBanners(activeBanners.map(b => ({
              title: b.title,
              subtitle: b.subtitle || "",
              image: b.imageUrl || "",
            })));
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-3 sm:px-4 pt-3 sm:pt-4 pb-24 space-y-5 sm:space-y-6 w-full min-w-0 overflow-x-hidden">

        {/* Hero Banner - Card style with glow */}
        <section className="relative w-full min-w-0">
          <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl ring-1 ring-black/5">
            <div className="relative h-[160px] sm:h-[220px] md:h-[250px]">
              {banners.map((banner, i) => (
                <div
                  key={i}
                  className={`absolute inset-0 transition-all duration-700 ${
                    i === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
                  }`}
                >
                  {banner.image ? (
                    <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-600 via-green-500 to-teal-500 flex items-center justify-center">
                      <span className="text-5xl sm:text-6xl animate-pulse">🌾</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent flex flex-col justify-end p-4 sm:p-5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Sparkles size={13} className="text-yellow-300" />
                      <span className="text-yellow-300 text-[10px] sm:text-[11px] font-medium uppercase tracking-wide">Featured</span>
                    </div>
                    <h2 className="text-white text-lg sm:text-xl font-bold drop-shadow-lg leading-tight">{banner.title}</h2>
                    <p className="text-white/85 text-xs sm:text-sm mt-0.5 sm:mt-1 drop-shadow line-clamp-1">{banner.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Dots */}
          <div className="flex justify-center gap-1.5 mt-2.5 sm:mt-3">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1.5 sm:h-2 rounded-full transition-all ${
                  i === currentSlide ? "bg-primary w-5 sm:w-6" : "bg-muted-foreground/30 w-1.5 sm:w-2"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </section>

        {/* Search Bar - elevated */}
        <Link href="/search" className="block -mt-1">
          <div className="flex items-center gap-2.5 sm:gap-3 bg-card rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 shadow-md border border-border hover:border-primary/50 transition-all">
            <Search size={18} className="text-primary shrink-0" />
            <span className="flex-1 text-xs sm:text-sm text-muted-foreground truncate">ದನಕರು, ಕುರಿ, ಮೇವು ಹುಡುಕಿ ...</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Mic size={15} className="text-primary" />
            </div>
          </div>
        </Link>

        {/* Section heading */}
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-foreground">ವಿಭಾಗಗಳು <span className="text-xs sm:text-sm font-normal text-muted-foreground">Categories</span></h2>
        </div>

        {/* Categories Grid - premium responsive cards */}
        <section className="w-full min-w-0">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {categories.map((cat, idx) => (
              <Link
                key={cat.id}
                href={`/category/${cat.id}`}
                className="relative bg-card rounded-xl sm:rounded-2xl overflow-hidden border border-border shadow-sm sm:shadow-md hover:shadow-xl hover:-translate-y-0.5 sm:hover:-translate-y-1 transition-all duration-300 group"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="relative w-full h-24 sm:h-36 md:h-40 overflow-hidden">
                  <img
                    src={cat.image || categoryImages[cat.id] || ""}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                  {/* Icon badge */}
                  <div className={`absolute top-1.5 left-1.5 sm:top-2 sm:left-2 w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-br ${cat.gradient || categoryGradients[cat.id] || "from-primary to-primary"} flex items-center justify-center shadow text-sm sm:text-lg`}>
                    {cat.icon}
                  </div>
                </div>
                <div className="px-2.5 py-2 sm:px-3 sm:py-3">
                  <span className="text-xs sm:text-sm font-semibold text-foreground block leading-tight truncate">{cat.name}</span>
                  <div className="flex items-center justify-between mt-0.5 sm:mt-1">
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground truncate mr-1">{cat.nameEn}</span>
                    <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                      <ArrowRight size={10} className="text-primary group-hover:text-white sm:w-3 sm:h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Listings - Sliding Carousel */}
        <section className="relative w-full min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-2.5 sm:mb-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-1.5 sm:gap-2">
                <TrendingUp size={16} className="text-primary sm:w-[18px] sm:h-[18px]" />
                ಇತ್ತೀಚಿನ ಜಾಹೀರಾತು <span className="text-[11px] sm:text-xs font-normal text-muted-foreground">Recent Ads</span>
              </h2>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Navigation arrows for sliding */}
              {recentListings.length > 2 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => scrollRecent("left")}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-white hover:border-primary transition shadow-xs"
                    aria-label="Previous Ads"
                  >
                    <ChevronLeft size={14} className="sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => scrollRecent("right")}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-white hover:border-primary transition shadow-xs"
                    aria-label="Next Ads"
                  >
                    <ChevronRight size={14} className="sm:w-4 sm:h-4" />
                  </button>
                </div>
              )}
              <Link href="/search" className="text-xs text-primary font-semibold flex items-center gap-0.5 sm:gap-1 hover:underline ml-0.5 sm:ml-1">
                ಎಲ್ಲಾ ನೋಡಿ <ArrowRight size={11} className="sm:w-3 sm:h-3" />
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="flex gap-3 sm:gap-4 overflow-hidden">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-[170px] sm:w-[240px] shrink-0 bg-card rounded-2xl p-2.5 sm:p-3 shadow-sm border border-border animate-pulse">
                  <div className="w-full h-24 sm:h-36 bg-muted rounded-xl mb-2" />
                  <div className="h-3.5 bg-muted rounded w-3/4 mb-1.5" />
                  <div className="h-3.5 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : recentListings.length > 0 ? (
            <div
              ref={recentSliderRef}
              className="flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-3 px-0.5 w-full min-w-0 touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {recentListings.map((item) => (
                <Link
                  key={item.id}
                  href={`/category/${item.category}/${item.id}`}
                  className="w-[170px] sm:w-[230px] md:w-[250px] shrink-0 snap-start bg-card rounded-2xl overflow-hidden shadow-sm sm:shadow-md border border-border hover:shadow-lg hover:-translate-y-0.5 sm:hover:-translate-y-1 transition-all duration-300 group flex flex-col"
                >
                  <div className="relative w-full h-26 sm:h-34 md:h-36 bg-muted overflow-hidden">
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl sm:text-3xl bg-muted">🌾</div>
                    )}
                    <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-primary text-white text-[8px] sm:text-[9px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full shadow-xs">
                      NEW
                    </span>
                    <span className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 bg-black/60 backdrop-blur-xs text-white text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-md capitalize max-w-[85%] truncate">
                      {item.category.replace(/-/g, " ")}
                    </span>
                  </div>
                  <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {item.title}
                      </p>
                      <p className="text-sm sm:text-base md:text-lg font-bold text-primary mt-0.5 sm:mt-1">
                        {item.price ? `₹${item.price.toLocaleString()}${item.priceUnit ? '/' + item.priceUnit : ''}` : item.rateInfo || ""}
                      </p>
                    </div>
                    {item.location && (
                      <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1 truncate">
                        <MapPin size={10} className="shrink-0 text-primary/70 sm:w-3 sm:h-3" /> {item.location}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl border border-dashed border-primary/20">
              <p className="text-4xl mb-2">🌾</p>
              <p className="text-sm text-muted-foreground">ಇನ್ನೂ ಯಾವುದೇ ಜಾಹೀರಾತುಗಳಿಲ್ಲ</p>
              <Link href="/create" className="inline-flex items-center gap-1 mt-3 bg-primary text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-primary/90">
                <Plus size={14} /> ಹೊಸ ಜಾಹೀರಾತು ಹಾಕಿ
              </Link>
            </div>
          )}
        </section>

        {/* CTA Banner */}
        <section className="rounded-2xl bg-gradient-to-r from-primary to-emerald-600 p-5 text-white shadow-lg">
          <h3 className="font-bold text-lg">ನಿಮ್ಮ ಉತ್ಪನ್ನ ಮಾರಾಟ ಮಾಡಿ</h3>
          <p className="text-white/85 text-sm mt-0.5">Post your ad free and reach thousands of buyers</p>
          <Link href="/create" className="inline-flex items-center gap-1 mt-3 bg-white text-primary text-sm font-semibold px-4 py-2 rounded-full hover:bg-white/90 transition">
            <Plus size={16} /> ಜಾಹೀರಾತು ಹಾಕಿ
          </Link>
        </section>

        {/* Footer */}
        <footer className="border-t border-border pt-6 mt-4 space-y-4">
          <div className="flex items-center justify-center gap-6">
            <a href="#" className="text-muted-foreground hover:text-pink-500 transition" aria-label="Instagram">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="#" className="text-muted-foreground hover:text-blue-600 transition" aria-label="Facebook">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="#" className="text-muted-foreground hover:text-green-500 transition" aria-label="WhatsApp">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground flex-wrap">
            <Link href="/about" className="hover:text-primary">About Us</Link>
            <span>•</span>
            <Link href="/help" className="hover:text-primary">Terms & Conditions</Link>
            <span>•</span>
            <Link href="/help" className="hover:text-primary">Privacy Policy</Link>
          </div>

          <p className="text-center text-[10px] text-muted-foreground">
            © 2026 Dealspot Connect. All rights reserved.
          </p>
        </footer>
      </div>
    </AppLayout>
  );
}
