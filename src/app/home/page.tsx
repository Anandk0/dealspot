"use client";
import { useState, useEffect, useRef } from "react";
import { Search, Mic, ArrowRight, MapPin, Plus, ChevronLeft, ChevronRight, ChevronDown, Wheat } from "lucide-react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { topLevelCategories } from "@/lib/categories";
import { getCategoryLucideIcon } from "@/lib/category-icons";
import { useCategories } from "@/lib/useCategories";
import { useLang } from "@/lib/lang-context";
import { useLocation } from "@/lib/location-context";
import { haversineKm, formatDistance } from "@/lib/distance";
import { districtCentroid } from "@/lib/districtCentroids";
import { api, ListingData, BannerResponse } from "@/lib/api";
import WhatsAppButton from "@/components/WhatsAppButton";

// Approximate distance from the buyer to a listing's DISTRICT centroid.
function approxDistance(coords: { lat: number; lng: number } | null, district?: string): string | null {
  if (!coords) return null;
  const c = districtCentroid(district);
  if (!c) return null;
  return formatDistance(haversineKm(coords.lat, coords.lng, c.lat, c.lng));
}

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
  const [nearbyListings, setNearbyListings] = useState<ListingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [bannerPaused, setBannerPaused] = useState(false);
  const [banners, setBanners] = useState<BannerSlide[]>(defaultBanners);
  const recentSliderRef = useRef<HTMLDivElement>(null);
  const nearbySliderRef = useRef<HTMLDivElement>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef<number | null>(null);
  const { topLevel: apiTopLevel } = useCategories();
  const { lang } = useLang();
  const { district, districtKn, taluk, coords, openPrompt } = useLocation();

  // Use API categories if loaded, otherwise fall back to hardcoded
  const displayCategories = apiTopLevel.length > 0 ? apiTopLevel : topLevelCategories;
  const primaryName = (c: { name: string; nameEn: string }) => (lang === "en" ? c.nameEn : c.name);
  const secondaryName = (c: { name: string; nameEn: string }) => (lang === "en" ? c.name : c.nameEn);

  const scrollRecent = (direction: "left" | "right") => {
    if (recentSliderRef.current) {
      const scrollAmount = 260;
      recentSliderRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollNearby = (direction: "left" | "right") => {
    if (nearbySliderRef.current) {
      const scrollAmount = 260;
      nearbySliderRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Main feed: location-prioritized (selected taluk → district → rest). Refetches
  // when the chosen location changes. Falls back to plain recent order when no
  // district is selected.
  useEffect(() => {
    setLoading(true);
    api.getFeed(district, taluk, 0, 24)
      .then((res) => setRecentListings(res.content))
      .catch(() => setRecentListings([]))
      .finally(() => setLoading(false));
  }, [district, taluk]);

  // Location-based recommendations: refetch whenever the chosen district changes.
  useEffect(() => {
    if (!district) {
      setNearbyListings([]);
      return;
    }
    api.getNearbyListings(district, 0, 12)
      .then((res) => setNearbyListings(res.content))
      .catch(() => setNearbyListings([]));
  }, [district]);

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

  // Auto-slide, but pause when the user is interacting (hover / touch / after a
  // manual nav) so they can hold on a slide.
  useEffect(() => {
    if (bannerPaused || banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length, bannerPaused]);

  const goToSlide = (i: number) => {
    const n = banners.length;
    if (n === 0) return;
    setCurrentSlide(((i % n) + n) % n);
  };

  // Pause auto-advance briefly after a manual interaction, then resume.
  const pauseThenResume = () => {
    setBannerPaused(true);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => setBannerPaused(false), 6000);
  };

  const onBannerTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setBannerPaused(true);
  };
  const onBannerTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start != null) {
      const dx = e.changedTouches[0].clientX - start;
      if (Math.abs(dx) > 40) goToSlide(currentSlide + (dx < 0 ? 1 : -1));
    }
    pauseThenResume();
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 pt-4 pb-24 space-y-6 w-full min-w-0 overflow-x-hidden">

        {/* Hero banner */}
        <section className="relative w-full min-w-0">
          <div
            className="rounded-xl overflow-hidden border border-border"
            onMouseEnter={() => setBannerPaused(true)}
            onMouseLeave={() => setBannerPaused(false)}
            onTouchStart={onBannerTouchStart}
            onTouchEnd={onBannerTouchEnd}
          >
            <div className="relative h-[160px] sm:h-[220px] md:h-[250px]">
              {banners.map((banner, i) => (
                <div
                  key={i}
                  className={`absolute inset-0 transition-opacity duration-200 ease-out ${
                    i === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                >
                  {banner.image ? (
                    <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <Wheat size={48} strokeWidth={1.5} className="text-primary" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-4 sm:p-6">
                    <h2 className="text-white text-lg sm:text-xl font-semibold leading-tight">{banner.title}</h2>
                    <p className="text-white/90 text-sm mt-1 line-clamp-1">{banner.subtitle}</p>
                  </div>
                </div>
              ))}

              {/* Prev / next arrows */}
              {banners.length > 1 && (
                <>
                  <button
                    onClick={() => { goToSlide(currentSlide - 1); pauseThenResume(); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors duration-200 ease-out z-10 focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={lang === "en" ? "Previous banner" : "ಹಿಂದಿನ ಬ್ಯಾನರ್"}
                  >
                    <ChevronLeft size={18} strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => { goToSlide(currentSlide + 1); pauseThenResume(); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors duration-200 ease-out z-10 focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={lang === "en" ? "Next banner" : "ಮುಂದಿನ ಬ್ಯಾನರ್"}
                  >
                    <ChevronRight size={18} strokeWidth={1.5} />
                  </button>
                </>
              )}
            </div>
          </div>
          {/* Dots */}
          <div className="flex justify-center gap-1.5 mt-3">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => { goToSlide(i); pauseThenResume(); }}
                className={`h-1.5 rounded-full transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring ${
                  i === currentSlide ? "bg-primary w-5" : "bg-muted-foreground/30 w-1.5"
                }`}
                aria-label={lang === "en" ? `Slide ${i + 1}` : `ಸ್ಲೈಡ್ ${i + 1}`}
              />
            ))}
          </div>
        </section>

        {/* Search bar */}
        <Link href="/search" className="block rounded-xl focus-visible:ring-2 focus-visible:ring-ring">
          <div className="flex items-center gap-3 bg-card rounded-xl px-4 py-3 border border-border hover:border-primary/50 transition-colors duration-200 ease-out">
            <Search size={18} strokeWidth={1.5} className="text-muted-foreground shrink-0" />
            <span className="flex-1 text-sm text-muted-foreground truncate">{lang === "en" ? "Search cattle, sheep, feed ..." : "ದನಕರು, ಕುರಿ, ಮೇವು ಹುಡುಕಿ ..."}</span>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              <Mic size={16} strokeWidth={1.5} className="text-muted-foreground" />
            </div>
          </div>
        </Link>

        {/* Section heading */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{lang === "en" ? "Categories" : "ವಿಭಾಗಗಳು"} <span className="text-sm font-normal text-muted-foreground">{lang === "en" ? "ವಿಭಾಗಗಳು" : "Categories"}</span></h2>
        </div>

        {/* Categories grid */}
        <section className="w-full min-w-0">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {displayCategories.map((cat) => {
              const CatIcon = getCategoryLucideIcon(cat.id);
              return (
              <Link
                key={cat.id}
                href={`/category/${cat.id}`}
                className="relative bg-card rounded-xl overflow-hidden border border-border hover:shadow-md transition-shadow duration-200 ease-out group focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="relative w-full h-24 sm:h-36 md:h-40 overflow-hidden">
                  <img
                    src={cat.image || categoryImages[cat.id] || ""}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  {/* Icon badge */}
                  <div className="absolute top-2 left-2 w-8 h-8 rounded-lg bg-card/95 text-foreground flex items-center justify-center">
                    <CatIcon size={16} strokeWidth={1.5} />
                  </div>
                </div>
                <div className="p-3">
                  <span className="text-sm font-medium text-foreground block leading-tight truncate">{primaryName(cat)}</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground truncate mr-2">{secondaryName(cat)}</span>
                    <ArrowRight size={16} strokeWidth={1.5} className="text-muted-foreground shrink-0 group-hover:text-primary transition-colors duration-200 ease-out" />
                  </div>
                </div>
              </Link>
              );
            })}
          </div>
        </section>

        {/* Near you */}
        {district && nearbyListings.length > 0 && (
          <section className="relative w-full min-w-0 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <MapPin size={18} strokeWidth={1.5} className="text-muted-foreground" />
                  {lang === "en" ? "Near You" : "ನಿಮ್ಮ ಹತ್ತಿರ"}
                  <button
                    onClick={openPrompt}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full hover:bg-primary/15 transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {(lang === "en" ? district : districtKn || district)} <ChevronDown size={12} strokeWidth={1.5} />
                  </button>
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {nearbyListings.length > 2 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => scrollNearby("left")}
                      className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={lang === "en" ? "Previous" : "ಹಿಂದಿನ"}
                    >
                      <ChevronLeft size={16} strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => scrollNearby("right")}
                      className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={lang === "en" ? "Next" : "ಮುಂದಿನ"}
                    >
                      <ChevronRight size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div
              ref={nearbySliderRef}
              className="flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-3 px-0.5 w-full min-w-0 touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {nearbyListings.map((item) => (
                <Link
                  key={item.id}
                  href={`/category/${item.category}/${item.id}`}
                  className="w-[176px] sm:w-[232px] md:w-[248px] shrink-0 snap-start bg-card rounded-xl overflow-hidden border border-border hover:shadow-md transition-shadow duration-200 ease-out group flex flex-col focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="relative w-full h-28 sm:h-36 bg-muted overflow-hidden">
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                        {(() => { const FallbackIcon = getCategoryLucideIcon(item.category); return <FallbackIcon size={28} strokeWidth={1.5} />; })()}
                      </div>
                    )}
                    <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-md capitalize max-w-[85%] truncate">
                      {item.category.replace(/-/g, " ")}
                    </span>
                    {/* Approximate distance badge (district-level, top-right) */}
                    {approxDistance(coords, item.district) && (
                      <span className="absolute top-2 right-2 inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                        <MapPin size={12} strokeWidth={1.5} className="shrink-0" />
                        {approxDistance(coords, item.district)}
                      </span>
                    )}
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors duration-200 ease-out">
                        {item.title}
                      </p>
                      <p className="text-base font-semibold text-primary mt-1">
                        {item.price ? `₹${item.price.toLocaleString()}${item.priceUnit ? '/' + item.priceUnit : ''}` : item.rateInfo || ""}
                      </p>
                    </div>
                    {(item.taluk || item.district) && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 truncate mt-2">
                        <MapPin size={12} strokeWidth={1.5} className="shrink-0" /> {[item.taluk, item.district].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recent Listings - Sliding Carousel */}
        <section className="relative w-full min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                {lang === "en" ? "Recent ads" : "ಇತ್ತೀಚಿನ ಜಾಹೀರಾತು"} <span className="text-sm font-normal text-muted-foreground">{lang === "en" ? "ಇತ್ತೀಚಿನ ಜಾಹೀರಾತು" : "Recent ads"}</span>
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {/* Navigation arrows for sliding */}
              {recentListings.length > 2 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => scrollRecent("left")}
                    className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={lang === "en" ? "Previous ads" : "ಹಿಂದಿನ ಜಾಹೀರಾತುಗಳು"}
                  >
                    <ChevronLeft size={16} strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => scrollRecent("right")}
                    className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={lang === "en" ? "Next ads" : "ಮುಂದಿನ ಜಾಹೀರಾತುಗಳು"}
                  >
                    <ChevronRight size={16} strokeWidth={1.5} />
                  </button>
                </div>
              )}
              <Link href="/search" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline ml-1 rounded focus-visible:ring-2 focus-visible:ring-ring">
                {lang === "en" ? "See all" : "ಎಲ್ಲಾ ನೋಡಿ"} <ArrowRight size={16} strokeWidth={1.5} />
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="flex gap-3 sm:gap-4 overflow-hidden">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-[176px] sm:w-[232px] shrink-0 bg-card rounded-xl p-3 border border-border">
                  <div className="w-full h-28 sm:h-36 bg-muted rounded-lg mb-3" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
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
                  className="w-[176px] sm:w-[232px] md:w-[248px] shrink-0 snap-start bg-card rounded-xl overflow-hidden border border-border hover:shadow-md transition-shadow duration-200 ease-out group flex flex-col focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="relative w-full h-28 sm:h-36 bg-muted overflow-hidden">
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                        {(() => { const FallbackIcon = getCategoryLucideIcon(item.category); return <FallbackIcon size={28} strokeWidth={1.5} />; })()}
                      </div>
                    )}
                    <span className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                      {lang === "en" ? "New" : "ಹೊಸದು"}
                    </span>
                    <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-md capitalize max-w-[55%] truncate">
                      {item.category.replace(/-/g, " ")}
                    </span>
                    {/* Approximate distance badge (district-level, bottom-right) */}
                    {approxDistance(coords, item.district) && (
                      <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                        <MapPin size={12} strokeWidth={1.5} className="shrink-0" />
                        {approxDistance(coords, item.district)}
                      </span>
                    )}
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors duration-200 ease-out">
                        {item.title}
                      </p>
                      <p className="text-base font-semibold text-primary mt-1">
                        {item.price ? `₹${item.price.toLocaleString()}${item.priceUnit ? '/' + item.priceUnit : ''}` : item.rateInfo || ""}
                      </p>
                    </div>
                    {(item.taluk || item.district) && (
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1 truncate">
                        <MapPin size={12} strokeWidth={1.5} className="shrink-0" /> {[item.taluk, item.district].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Wheat size={32} strokeWidth={1.5} className="mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{lang === "en" ? "No listings yet" : "ಇನ್ನೂ ಯಾವುದೇ ಜಾಹೀರಾತುಗಳಿಲ್ಲ"}</p>
              <Link href="/create" className="inline-flex items-center gap-2 mt-4 bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <Plus size={16} strokeWidth={1.5} /> {lang === "en" ? "Post a new ad" : "ಹೊಸ ಜಾಹೀರಾತು ಹಾಕಿ"}
              </Link>
            </div>
          )}
        </section>

        {/* CTA Banner */}
        <section className="rounded-xl bg-primary p-6 text-primary-foreground">
          <h3 className="font-semibold text-lg">{lang === "en" ? "Sell your products" : "ನಿಮ್ಮ ಉತ್ಪನ್ನ ಮಾರಾಟ ಮಾಡಿ"}</h3>
          <p className="opacity-90 text-sm mt-1">{lang === "en" ? "Post your ad for free and reach buyers near you" : "ಉಚಿತವಾಗಿ ಜಾಹೀರಾತು ಹಾಕಿ, ನಿಮ್ಮ ಹತ್ತಿರದ ಖರೀದಿದಾರರನ್ನು ತಲುಪಿ"}</p>
          <Link href="/create" className="inline-flex items-center gap-2 mt-4 bg-background text-foreground text-sm font-medium px-4 py-2 rounded-lg hover:bg-background/90 transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <Plus size={16} strokeWidth={1.5} /> {lang === "en" ? "Post an ad" : "ಜಾಹೀರಾತು ಹಾಕಿ"}
          </Link>
        </section>

        {/* Footer */}
        <footer className="border-t border-border pt-6 space-y-4">
          <div className="flex items-center justify-center gap-6">
            <a href="https://www.instagram.com/dealspotconnect?dlrf=eTdpbGxhczRnb290" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors duration-200 ease-out" aria-label="Instagram">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="https://www.facebook.com/share/1C1bnVM9zn/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors duration-200 ease-out" aria-label="Facebook">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <WhatsAppButton
              trigger={
                <button type="button" className="text-muted-foreground hover:text-foreground transition-colors duration-200 ease-out" aria-label="WhatsApp">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </button>
              }
            />
          </div>

          <div className="flex items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground flex-wrap">
            <Link href="/about" className="hover:text-primary">{lang === "en" ? "About us" : "ನಮ್ಮ ಬಗ್ಗೆ"}</Link>
            <Link href="/terms" className="hover:text-primary">{lang === "en" ? "Terms and conditions" : "ನಿಯಮಗಳು ಮತ್ತು ಷರತ್ತುಗಳು"}</Link>
            <Link href="/privacy" className="hover:text-primary">{lang === "en" ? "Privacy policy" : "ಗೌಪ್ಯತಾ ನೀತಿ"}</Link>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            {lang === "en" ? "© 2026 Dealspot Connect. All rights reserved." : "© 2026 ಡೀಲ್‌ಸ್ಪಾಟ್ ಕನೆಕ್ಟ್. ಎಲ್ಲ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ."}
          </p>
        </footer>
      </div>
    </AppLayout>
  );
}
