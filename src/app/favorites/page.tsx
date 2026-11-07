"use client";
import { Heart, Trash2, MapPin } from "lucide-react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { api, ListingData } from "@/lib/api";
import { getCategoryLucideIcon } from "@/lib/category-icons";
import { useLang } from "@/lib/lang-context";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function FavoritesPage() {
  const { lang } = useLang();
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
      toast.success(lang === "en" ? "Removed from favorites" : "ಇಷ್ಟಪಟ್ಟಿಯಿಂದ ತೆಗೆಯಲಾಗಿದೆ");
    } catch {
      toast.error(lang === "en" ? "Could not remove" : "ತೆಗೆಯಲಾಗಲಿಲ್ಲ");
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Heart size={20} strokeWidth={1.5} className="text-muted-foreground" aria-hidden="true" />
          <h1 className="text-xl font-semibold text-foreground">{lang === "en" ? "Favorites" : "ಇಷ್ಟಪಟ್ಟಿ"}</h1>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2].map(i => (
              <div key={i} className="bg-card rounded-xl p-4 border border-border">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-muted rounded-lg" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                    <div className="h-5 bg-muted rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {favorites.map((item) => {
              const ItemIcon = getCategoryLucideIcon(item.category);
              return (
                <div key={item.id} className="bg-card rounded-xl p-4 border border-border hover:shadow-md transition-shadow duration-200 ease-out">
                  <div className="flex gap-4">
                    <Link href={`/category/${item.category}/${item.id}`} className="flex gap-4 flex-1 min-w-0 rounded-md focus-visible:ring-2 focus-visible:ring-ring">
                      <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                        {item.images?.length > 0 ? (
                          <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ItemIcon size={28} strokeWidth={1.5} className="text-muted-foreground" aria-hidden="true" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-card-foreground">{item.title}</p>
                        <p className="text-lg font-semibold text-primary mt-1">
                          {item.price ? `₹${item.price.toLocaleString()}` : item.rateInfo || ""}
                        </p>
                        {(item.taluk || item.district) && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <MapPin size={12} strokeWidth={1.5} aria-hidden="true" /> {[item.taluk, item.district].filter(Boolean).join(", ")}
                          </div>
                        )}
                      </div>
                    </Link>
                    <button
                      onClick={() => removeFavorite(item.id)}
                      className="self-start p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={lang === "en" ? "Remove from favorites" : "ಇಷ್ಟಪಟ್ಟಿಯಿಂದ ತೆಗೆಯಿರಿ"}
                    >
                      <Trash2 size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-xl border border-border">
            <Heart size={32} strokeWidth={1.5} className="mx-auto text-muted-foreground mb-4" aria-hidden="true" />
            <p className="text-foreground font-medium">{lang === "en" ? "No favorites yet" : "ಇನ್ನೂ ಯಾವುದೇ ಇಷ್ಟಪಟ್ಟಿ ಇಲ್ಲ"}</p>
            <p className="text-sm text-muted-foreground mt-1">{lang === "en" ? "Tap the heart on a listing to save it" : "ಜಾಹೀರಾತಿನ ಹೃದಯ ಚಿಹ್ನೆ ಒತ್ತಿ ಉಳಿಸಿ"}</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
