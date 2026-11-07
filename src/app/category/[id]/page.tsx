"use client";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Heart, MapPin, ArrowRight, Handshake } from "lucide-react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { getCategoryLucideIcon } from "@/lib/category-icons";
import { useCategories } from "@/lib/useCategories";
import { useAgentSystem } from "@/lib/useAgentSystem";
import { useLang } from "@/lib/lang-context";
import { useLocation } from "@/lib/location-context";
import { haversineKm, formatDistance } from "@/lib/distance";
import { districtCentroid } from "@/lib/districtCentroids";
import { api, ListingData } from "@/lib/api";
import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";

// Approximate distance from the buyer to a listing's DISTRICT centroid (the
// exact coords are paywalled, so we show a district-level estimate).
function approxDistance(coords: { lat: number; lng: number } | null, district?: string): string | null {
  if (!coords) return null;
  const c = districtCentroid(district);
  if (!c) return null;
  return formatDistance(haversineKm(coords.lat, coords.lng, c.lat, c.lng));
}

// Which category families show a transaction-type toggle, and the options.
// Transaction-type filter config. "ALL" is the first option (value "" = no
// filter, shows mixed types) and is the default. The buttons render INSIDE
// subcategory/leaf pages to filter that subcategory's listings.
// Labels are "English / Kannada"; the page shows the half matching the language.
function typeToggleFor(id: string, parentId?: string): { options: [string, string][]; default: string } | null {
  const key = `${id} ${parentId || ""}`;
  if (key.includes("property-rent")) {
    return { options: [["", "All / ಎಲ್ಲಾ"], ["RENT", "Rent / ಬಾಡಿಗೆ"], ["LEASE", "Lease / ಲೀಸ್"]], default: "" };
  }
  if (key.includes("agriculture-equipment") || key.includes("agri-")) {
    return { options: [["", "All / ಎಲ್ಲಾ"], ["SALE", "Sale / ಮಾರಾಟ"], ["RENT", "Rent / ಬಾಡಿಗೆ"]], default: "" };
  }
  return null;
}

// Neutral line icon used where a listing or category has no image.
function FallbackIcon({ category, size }: { category?: string; size: number }) {
  const Icon = getCategoryLucideIcon(category);
  return <Icon size={size} strokeWidth={1.5} className="text-muted-foreground" aria-hidden="true" />;
}

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;

  const { getCategory, getSubcats, getParent } = useCategories();
  const { enabled: agentSystemEnabled } = useAgentSystem();
  const { lang } = useLang();
  const { coords } = useLocation();
  const category = getCategory(id);
  const subcategories = getSubcats(id);
  const parentCategory = getParent(id);

  // Transaction-type toggle (Rent/Lease, Sale/Rent) for property-rent & agri.
  // Memoised so its identity is stable across renders — otherwise it would
  // retrigger the listings effect every render and flicker the skeletons.
  const toggleCfg = useMemo(
    () => typeToggleFor(id, parentCategory?.id),
    [id, parentCategory?.id]
  );
  // Selected type. The URL param wins; otherwise fall back to the config
  // default ("" = All). Empty string means "show all mixed types".
  const typeParam = searchParams.get("type");
  const activeType = (typeParam ?? toggleCfg?.default ?? "").toUpperCase();
  // The toggle buttons appear INSIDE subcategory/leaf pages (no subcategories
  // of their own), e.g. "Agricultural Land" or "Seeder" — NOT on the parent
  // grid page. They filter that subcategory's listings by the selected type.
  const showToggle = !!toggleCfg && subcategories.length === 0;
  const setType = (type: string) => {
    const sp = new URLSearchParams(Array.from(searchParams.entries()));
    if (type) sp.set("type", type);
    else sp.delete("type"); // "All" clears the filter
    const qs = sp.toString();
    router.replace(qs ? `/category/${id}?${qs}` : `/category/${id}`);
  };

  // Primary/secondary name based on selected language
  const primaryName = (c?: { name: string; nameEn: string }) =>
    !c ? "" : lang === "en" ? c.nameEn : c.name;
  const secondaryName = (c?: { name: string; nameEn: string }) =>
    !c ? "" : lang === "en" ? c.name : c.nameEn;

  const [listings, setListings] = useState<ListingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Only fetch listings if this category has no subcategories
    if (subcategories.length > 0) {
      setLoading(false);
      return;
    }
    setLoading(true);
    // Only send a type filter when a specific type is selected; "All" ("") omits it.
    const typeFilter = toggleCfg && activeType ? activeType : undefined;
    api.getListingsByCategory(id, 0, 20, typeFilter)
      .then((res) => setListings(res.content))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [id, subcategories.length, activeType, toggleCfg]);

  // Load which listings are already favorited
  useEffect(() => {
    if (!api.getToken()) return;
    api.getFavorites(0, 100)
      .then((res) => setFavoriteIds(new Set(res.content.map((f) => f.id))))
      .catch(() => {});
  }, []);

  const toggleFavorite = async (e: React.MouseEvent, listingId: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!api.getToken()) {
      toast.error(lang === "en" ? "Please log in first" : "ದಯವಿಟ್ಟು ಮೊದಲು ಲಾಗಿನ್ ಮಾಡಿ");
      return;
    }
    const isFav = favoriteIds.has(listingId);
    // Optimistic update
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      isFav ? next.delete(listingId) : next.add(listingId);
      return next;
    });
    try {
      if (isFav) {
        await api.removeFavorite(listingId);
      } else {
        await api.addFavorite(listingId);
      }
    } catch {
      // Revert on failure
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        isFav ? next.add(listingId) : next.delete(listingId);
        return next;
      });
      toast.error(lang === "en" ? "Could not update favorites" : "ಇಷ್ಟಪಟ್ಟಿ ನವೀಕರಿಸಲಾಗಲಿಲ್ಲ");
    }
  };

  const isAgentCategory = id === "agents" || id === "agent";

  // If the whole agent/referral system is disabled by admin, block the agents
  // category even via a direct URL.
  if (isAgentCategory && !agentSystemEnabled) {
    return (
      <AppLayout>
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <Handshake size={32} strokeWidth={1.5} className="mx-auto mb-4 text-muted-foreground" aria-hidden="true" />
          <h1 className="text-lg font-medium text-foreground">
            {lang === "en" ? "Agents are currently unavailable" : "ಏಜೆಂಟ್ ಸೇವೆ ಸದ್ಯಕ್ಕೆ ಲಭ್ಯವಿಲ್ಲ"}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {lang === "en"
              ? "This feature has been turned off. Please check back later."
              : "ಈ ವೈಶಿಷ್ಟ್ಯವನ್ನು ಆಫ್ ಮಾಡಲಾಗಿದೆ. ದಯವಿಟ್ಟು ನಂತರ ಪರಿಶೀಲಿಸಿ."}
          </p>
          <Link href="/home" className="inline-block mt-6">
            <Button variant="outline">{lang === "en" ? "Back to home" : "ಮುಖಪುಟಕ್ಕೆ"}</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-6 pb-28 lg:pb-8">

        {/* Breadcrumb for subcategories */}
        {parentCategory && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <Link href="/home" className="hover:text-primary transition-colors duration-200 ease-out">{lang === "en" ? "Home" : "ಮುಖಪುಟ"}</Link>
            <span>/</span>
            <Link href={`/category/${parentCategory.id}`} className="hover:text-primary transition-colors duration-200 ease-out">
              {primaryName(parentCategory)}
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">{primaryName(category)}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">{primaryName(category)}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {isAgentCategory ? (lang === "en" ? "Verified agents" : "ನೋಂದಾಯಿತ ಅಧಿಕೃತ ಏಜೆಂಟರು") : secondaryName(category)} • {listings.length} {isAgentCategory ? (lang === "en" ? "agents" : "ಏಜೆಂಟರು") : (lang === "en" ? "listings" : "ಜಾಹೀರಾತುಗಳು")}
            </p>
          </div>
          {isAgentCategory && (
            <Link href={`/category/${id}/create`}>
              <Button className="bg-primary hover:bg-primary/90 text-xs sm:text-sm font-medium w-full sm:w-auto">
                <Handshake size={16} strokeWidth={1.5} aria-hidden="true" />
                {lang === "en" ? "Agent registration / referral ID" : "ಏಜೆಂಟ್ ನೋಂದಣಿ / ರೆಫರಲ್ ಐಡಿ"}
              </Button>
            </Link>
          )}
        </div>

        {/* Transaction-type filter (All / Rent / Lease, All / Sale / Rent) — inside subcategory pages */}
        {showToggle && toggleCfg && (
          <div className="grid grid-cols-3 gap-2 p-1 bg-muted rounded-xl mb-6 max-w-md">
            {toggleCfg.options.map(([val, label]) => (
              <button
                key={val}
                onClick={() => setType(val)}
                aria-pressed={activeType === val}
                className={`h-11 rounded-lg font-medium text-sm transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring ${
                  activeType === val
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground border border-border hover:border-primary/40"
                }`}
              >
                {label.split(" / ")[lang === "en" ? 0 : 1] ?? label}
              </button>
            ))}
          </div>
        )}

        {/* Subcategories grid */}
        {subcategories.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">{lang === "en" ? "Categories" : "ವಿಭಾಗಗಳು"}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/category/${sub.id}`}
                  className="relative bg-card rounded-xl overflow-hidden border border-border hover:shadow-md transition-shadow duration-200 ease-out group focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="relative w-full h-24 sm:h-36 overflow-hidden">
                    {sub.image ? (
                      <img
                        src={sub.image}
                        alt={sub.nameEn}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200 ease-out"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <FallbackIcon category={sub.id} size={32} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {/* Category name overlaid on image */}
                    <div className="absolute bottom-0 left-0 right-0 px-3 py-2">
                      <span className="text-white text-xs sm:text-sm font-medium leading-tight line-clamp-1">
                        {primaryName(sub)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 p-3">
                    <span className="text-xs text-muted-foreground truncate">{secondaryName(sub)}</span>
                    <ArrowRight size={16} strokeWidth={1.5} className="shrink-0 text-muted-foreground group-hover:text-primary transition-colors duration-200 ease-out" aria-hidden="true" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Dedicated Agent Callout Banner */}
        {isAgentCategory && (
          <div className="mb-6 p-4 sm:p-6 rounded-xl bg-card border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                {lang === "en" ? "Dealspot partner program" : "ಡೀಲ್‌ಸ್ಪಾಟ್ ಪಾರ್ಟ್ನರ್ ಪ್ರೋಗ್ರಾಂ"}
              </p>
              <h2 className="font-medium text-sm sm:text-base text-foreground">
                {lang === "en" ? "Earn referral commission as a Dealspot agent" : "ಡೀಲ್‌ಸ್ಪಾಟ್ ಅಧಿಕೃತ ಏಜೆಂಟ್ ಆಗಿ ರೆಫರಲ್ ಕಮಿಷನ್ ಗಳಿಸಿ"}
              </h2>
              <p className="text-muted-foreground text-xs mt-1">
                {lang === "en"
                  ? "Register customers, share your referral ID and earn a commission on every deal."
                  : "ಗ್ರಾಹಕರನ್ನು ನೋಂದಾಯಿಸಿ, ಅನನ್ಯ ರೆಫರಲ್ ಐಡಿ ಹಂಚಿಕೊಳ್ಳಿ ಮತ್ತು ಪ್ರತಿ ಡೀಲ್‌ಗೆ ಕಮಿಷನ್ ಪಡೆಯಿರಿ."}
              </p>
            </div>
            <Link href="/category/agents/create" className="w-full sm:w-auto shrink-0">
              <Button className="bg-primary hover:bg-primary/90 text-xs sm:text-sm font-medium w-full sm:w-auto">
                {lang === "en" ? "Agent registration / referral ID" : "ಏಜೆಂಟ್ ನೋಂದಣಿ / ರೆಫರಲ್ ಐಡಿ"}
                <ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" />
              </Button>
            </Link>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-card rounded-xl p-4 border border-border">
                <div className="flex gap-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-muted rounded-lg shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2 mb-3" />
                    <div className="h-5 bg-muted rounded w-1/3" />
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
                className="bg-card rounded-xl p-4 border border-border hover:shadow-md transition-shadow duration-200 ease-out group focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex gap-4">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-muted rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                    {item.images && item.images.length > 0 ? (
                      <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <FallbackIcon category={item.category} size={28} />
                    )}
                    {/* Approximate distance badge (district-level) */}
                    {approxDistance(coords, item.district) && (
                      <span className="absolute bottom-1 left-1 inline-flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                        <MapPin size={10} strokeWidth={1.5} className="shrink-0" aria-hidden="true" />
                        {approxDistance(coords, item.district)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="min-w-0">
                        <p className="font-medium text-sm sm:text-base text-foreground truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 truncate">{item.titleEn || item.skill || item.experience || ""}</p>
                      </div>
                      <button
                        className="transition-colors duration-200 ease-out p-1 rounded-md focus-visible:ring-2 focus-visible:ring-ring"
                        onClick={(e) => toggleFavorite(e, item.id)}
                        aria-label={favoriteIds.has(item.id) ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Heart
                          size={16}
                          strokeWidth={1.5}
                          className={favoriteIds.has(item.id) ? "text-destructive fill-destructive" : "text-muted-foreground hover:text-destructive"}
                        />
                      </button>
                    </div>
                    <p className="text-base sm:text-lg font-semibold text-primary mt-2 truncate">
                      {item.price ? `₹${item.price.toLocaleString()}${item.priceUnit ? '/' + item.priceUnit : ''}` : item.rateInfo || (isAgentCategory ? (lang === "en" ? "Verified agent" : "ಅಧಿಕೃತ ಏಜೆಂಟ್") : "")}
                    </p>
                    {(item.taluk || item.district) && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1 truncate">
                        <MapPin size={12} strokeWidth={1.5} className="shrink-0" aria-hidden="true" />
                        <span className="truncate">{[item.taluk, item.district].filter(Boolean).join(", ")}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : subcategories.length > 0 ? null : (
          <div className="text-center py-16 bg-card rounded-xl border border-border">
            <div className="flex justify-center mb-4"><FallbackIcon category={id} size={32} /></div>
            <p className="text-foreground font-medium text-sm sm:text-base">
              {isAgentCategory
                ? (lang === "en" ? "No registered agents yet" : "ಇನ್ನೂ ಯಾವುದೇ ನೋಂದಾಯಿತ ಏಜೆಂಟರಿಲ್ಲ")
                : (lang === "en" ? "No listings in this category" : "ಈ ವಿಭಾಗದಲ್ಲಿ ಯಾವುದೇ ಜಾಹೀರಾತುಗಳಿಲ್ಲ")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isAgentCategory
                ? (lang === "en" ? "You can register as a Dealspot agent" : "ನೀವೂ ಅಧಿಕೃತ Dealspot ಏಜೆಂಟ್ ಆಗಿ ನೋಂದಾಯಿಸಬಹುದು")
                : (lang === "en" ? "Check back soon" : "ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ನೋಡಿ")}
            </p>
            {isAgentCategory && (
              <Link href={`/category/${id}/create`} className="inline-block mt-4">
                <Button className="bg-primary hover:bg-primary/90 text-xs sm:text-sm">
                  <Handshake size={16} strokeWidth={1.5} aria-hidden="true" />
                  {lang === "en" ? "Register as the first agent" : "ಮೊದಲ ಏಜೆಂಟ್ ಆಗಿ ನೋಂದಾಯಿಸಿ"}
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
