"use client";
import { useParams } from "next/navigation";
import { Heart, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { getCategoryIcon } from "@/lib/categories";
import { useCategories } from "@/lib/useCategories";
import { useLang } from "@/lib/lang-context";
import { api, ListingData } from "@/lib/api";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function CategoryPage() {
  const params = useParams();
  const id = params.id as string;

  const { getCategory, getSubcats, getParent } = useCategories();
  const { lang } = useLang();
  const category = getCategory(id);
  const subcategories = getSubcats(id);
  const parentCategory = getParent(id);

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
    api.getListingsByCategory(id)
      .then((res) => setListings(res.content))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [id, subcategories.length]);

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
      toast.error("ದಯವಿಟ್ಟು ಮೊದಲು ಲಾಗಿನ್ ಮಾಡಿ (Please login first)");
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
      toast.error("Failed to update favorite");
    }
  };

  const isAgentCategory = id === "agents" || id === "agent";

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-6 pb-28 lg:pb-8">

        {/* Breadcrumb for subcategories */}
        {parentCategory && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <Link href="/home" className="hover:text-primary">{lang === "en" ? "Home" : "ಮುಖಪುಟ"}</Link>
            <span>/</span>
            <Link href={`/category/${parentCategory.id}`} className="hover:text-primary">
              {primaryName(parentCategory)}
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">{primaryName(category)}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">{primaryName(category)}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isAgentCategory ? (lang === "en" ? "Verified Agents" : "ನೋಂದಾಯಿತ ಅಧಿಕೃತ ಏಜೆಂಟರು") : secondaryName(category)} • {listings.length} {isAgentCategory ? (lang === "en" ? "Agents" : "ಏಜೆಂಟರು") : (lang === "en" ? "Listings" : "ಜಾಹೀರಾತುಗಳು")}
            </p>
          </div>
          {isAgentCategory && (
            <Link href={`/category/${id}/create`}>
              <Button className="bg-primary hover:bg-primary/90 text-xs sm:text-sm font-medium w-full sm:w-auto">
                🤝 ಏಜೆಂಟ್ ನೋಂದಣಿ / ರೆಫರಲ್ ಐಡಿ
              </Button>
            </Link>
          )}
        </div>

        {/* Subcategories grid */}
        {subcategories.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">ವಿಭಾಗಗಳು / Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {subcategories.map((sub, idx) => (
                <Link
                  key={sub.id}
                  href={`/category/${sub.id}`}
                  className="relative bg-card rounded-xl sm:rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl hover:-translate-y-0.5 sm:hover:-translate-y-1 transition-all duration-300 group"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="relative w-full h-24 sm:h-36 overflow-hidden">
                    {sub.image ? (
                      <img
                        src={sub.image}
                        alt={sub.nameEn}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className={`w-full h-full ${sub.color || "bg-green-100"} flex items-center justify-center`}>
                        <span className="text-4xl sm:text-5xl">{sub.icon}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {/* Category name overlaid on image */}
                    <div className="absolute bottom-0 left-0 right-0 px-2.5 py-2">
                      <span className="text-white text-xs sm:text-sm font-semibold drop-shadow leading-tight line-clamp-1">
                        {primaryName(sub)}
                      </span>
                    </div>
                  </div>
                  <div className="px-2.5 py-2 sm:px-3 sm:py-2.5">
                    <span className="text-[10px] sm:text-xs text-muted-foreground block truncate">{secondaryName(sub)}</span>
                    <div className="flex items-center justify-end mt-0.5">
                      <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                        <ArrowRight size={10} className="text-primary group-hover:text-white" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Dedicated Agent Callout Banner */}
        {isAgentCategory && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-primary text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
            <div>
              <div className="inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full mb-1">
                ⭐ Dealspot Partner Program
              </div>
              <h2 className="font-bold text-sm sm:text-base">ಡೀಲ್‌ಸ್ಪಾಟ್ ಅಧಿಕೃತ ಏಜೆಂಟ್ ಆಗಿ ರೆಫರಲ್ ಕಮಿಷನ್ ಗಳಿಸಿ!</h2>
              <p className="text-white/85 text-xs mt-0.5">
                ಗ್ರಾಹಕರನ್ನು ನೋಂದಾಯಿಸಿ, ಅನನ್ಯ ರೆಫರಲ್ ಐಡಿ ಹಂಚಿಕೊಳ್ಳಿ ಮತ್ತು ಪ್ರತಿ ಡೀಲ್‌ಗೆ ಕಮಿಷನ್ ಪಡೆಯಿರಿ.
              </p>
            </div>
            <Link href="/category/agents/create" className="w-full sm:w-auto shrink-0">
              <Button className="bg-white text-purple-700 hover:bg-white/90 text-xs sm:text-sm font-semibold w-full sm:w-auto">
                ಏಜೆಂಟ್ ನೋಂದಣಿ / ರೆಫರಲ್ ಐಡಿ →
              </Button>
            </Link>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-card rounded-2xl p-4 shadow-sm border border-border animate-pulse">
                <div className="flex gap-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-muted rounded-xl shrink-0" />
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
                className="bg-card rounded-2xl p-4 shadow-sm border border-border hover:shadow-md hover:border-primary/30 transition-all group"
              >
                <div className="flex gap-3.5">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-muted rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                    {item.images && item.images.length > 0 ? (
                      <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl sm:text-4xl">{getCategoryIcon(item.category)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm sm:text-base text-foreground truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.titleEn || item.skill || item.experience || ""}</p>
                      </div>
                      <button
                        className="transition-colors p-1"
                        onClick={(e) => toggleFavorite(e, item.id)}
                        aria-label="Toggle favorite"
                      >
                        <Heart
                          size={16}
                          className={favoriteIds.has(item.id) ? "text-red-500 fill-red-500" : "text-muted-foreground/50 hover:text-red-500"}
                        />
                      </button>
                    </div>
                    <p className="text-base sm:text-lg font-bold text-primary mt-1.5 truncate">
                      {item.price ? `₹${item.price.toLocaleString()}${item.priceUnit ? '/' + item.priceUnit : ''}` : item.rateInfo || (isAgentCategory ? "Verified Agent" : "")}
                    </p>
                    {item.location && (
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1 truncate">
                        <MapPin size={11} className="shrink-0 text-primary/70" />
                        <span className="truncate">{item.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : subcategories.length > 0 ? null : (
          <div className="text-center py-14 bg-card rounded-2xl border border-border">
            <p className="text-4xl sm:text-5xl mb-3">{getCategoryIcon(id)}</p>
            <p className="text-foreground font-medium text-sm sm:text-base">
              {isAgentCategory ? "ಇನ್ನೂ ಯಾವುದೇ ನೋಂದಾಯಿತ ಏಜೆಂಟರಿಲ್ಲ" : "ಈ ವಿಭಾಗದಲ್ಲಿ ಯಾವುದೇ ಜಾಹೀರಾತುಗಳಿಲ್ಲ"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isAgentCategory ? "ನೀವೂ ಅಧಿಕೃತ Dealspot ಏಜೆಂಟ್ ಆಗಿ ನೋಂದಾಯಿಸಬಹುದು!" : "No listings in this category yet"}
            </p>
            {isAgentCategory && (
              <Link href={`/category/${id}/create`} className="inline-block mt-4">
                <Button className="bg-primary hover:bg-primary/90 text-xs sm:text-sm">
                  🤝 ಮೊದಲ ಏಜೆಂಟ್ ಆಗಿ ನೋಂದಾಯಿಸಿ
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
