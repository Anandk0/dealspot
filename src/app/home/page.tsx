"use client";
import { useState, useEffect } from "react";
import { Search, Mic, ChevronRight, MapPin, TrendingUp } from "lucide-react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { categories } from "@/lib/categories";
import { api, ListingData, BannerResponse } from "@/lib/api";

const categoryImages: Record<string, string> = {
  "property": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop&q=80",
  "agriculture-equipment": "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop&q=80",
  "vehicle-rent": "https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=400&h=300&fit=crop&q=80",
  "animals-pets": "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400&h=300&fit=crop&q=80",
  "agent": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=300&fit=crop&q=80",
  "services": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop&q=80",
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

  useEffect(() => {
    api.getRecentListings()
      .then(setRecentListings)
      .catch(() => setRecentListings([]))
      .finally(() => setLoading(false));
  }, []);

  // Load banners from API
  useEffect(() => {
    api.adminBanners()
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
      <div className="max-w-6xl mx-auto px-4 pt-4 pb-20 space-y-5">

        {/* Banner Carousel - Card style */}
        <section className="relative">
          <div className="rounded-2xl overflow-hidden shadow-md border border-border bg-card">
            <div className="relative h-[180px] sm:h-[220px]">
              {banners.map((banner, i) => (
                <div
                  key={i}
                  className={`absolute inset-0 transition-opacity duration-700 ${
                    i === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                >
                  {banner.image ? (
                    <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-primary/80 to-primary/40 flex items-center justify-center">
                      <span className="text-5xl">🌾</span>
                    </div>
                  )}
                  {/* Overlay text */}
                  <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-4">
                    <h2 className="text-white text-lg font-bold drop-shadow-lg">{banner.title}</h2>
                    <p className="text-white/80 text-sm mt-0.5 drop-shadow">{banner.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Dots */}
            <div className="flex justify-center gap-1.5 py-2 bg-card">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentSlide ? "bg-primary w-5" : "bg-muted-foreground/30 w-1.5"
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Search Bar */}
        <Link href="/search" className="block">
          <div className="flex items-center gap-3 bg-card rounded-full px-5 py-3 shadow-sm border border-border hover:border-primary/40 transition">
            <Search size={20} className="text-muted-foreground" />
            <span className="flex-1 text-sm text-muted-foreground">ದನಕರು, ಕುರಿ, ಮೇವು ಹುಡುಕಿ ...</span>
            <Mic size={20} className="text-muted-foreground" />
          </div>
        </Link>

        {/* Categories Grid - 2 columns */}
        <section>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.id}`}
                className="bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all group"
              >
                <div className="w-full h-28 sm:h-36 bg-muted overflow-hidden">
                  <img
                    src={categoryImages[cat.id] || ""}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="px-3 py-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-foreground block">{cat.name}</span>
                    <span className="text-[10px] text-muted-foreground">{cat.nameEn}</span>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Listings */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <TrendingUp size={16} className="text-primary" />
              ಇತ್ತೀಚಿನ ಜಾಹೀರಾತು
            </h2>
            <Link href="/search" className="text-xs text-primary font-medium">ಎಲ್ಲಾ ನೋಡಿ →</Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-card rounded-xl p-3 shadow-sm border border-border animate-pulse">
                  <div className="w-full h-24 bg-muted rounded-lg mb-2" />
                  <div className="h-3 bg-muted rounded w-3/4 mb-1" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : recentListings.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {recentListings.slice(0, 6).map((item) => (
                <Link
                  key={item.id}
                  href={`/category/${item.category}/${item.id}`}
                  className="bg-card rounded-xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-all group"
                >
                  <div className="w-full h-24 sm:h-32 bg-muted overflow-hidden">
                    {item.images && item.images.length > 0 ? (
                      <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl bg-muted">🌾</div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-medium text-foreground truncate">{item.title}</p>
                    <p className="text-sm font-bold text-primary mt-0.5">
                      {item.price ? `₹${item.price.toLocaleString()}` : item.rateInfo || ""}
                    </p>
                    {item.location && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-0.5">
                        <MapPin size={8} /> {item.location}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-card rounded-xl border border-border">
              <p className="text-3xl mb-2">🌾</p>
              <p className="text-sm text-muted-foreground">ಇನ್ನೂ ಯಾವುದೇ ಜಾಹೀರಾತುಗಳಿಲ್ಲ</p>
              <Link href="/create" className="inline-block mt-3 text-xs text-primary font-medium hover:underline">
                + ಹೊಸ ಜಾಹೀರಾತು ಹಾಕಿ
              </Link>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="border-t border-border pt-6 mt-8 space-y-4">
          {/* Social Links */}
          <div className="flex items-center justify-center gap-6">
            <a href="#" className="text-muted-foreground hover:text-primary transition" aria-label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition" aria-label="Facebook">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition" aria-label="WhatsApp">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
          </div>

          {/* Links */}
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
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
