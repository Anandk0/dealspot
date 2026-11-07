"use client";
import { useState } from "react";
import { Search as SearchIcon, Mic, X, MapPin } from "lucide-react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { api, ListingData } from "@/lib/api";
import { getCategoryLucideIcon } from "@/lib/category-icons";
import { useLang } from "@/lib/lang-context";

export default function SearchPage() {
  const { lang } = useLang();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ListingData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.search(searchQuery);
      setResults(res.content);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Search Input */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 relative">
            <SearchIcon size={16} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder={lang === "en" ? "Search products, animals, services" : "ಉತ್ಪನ್ನ, ಪ್ರಾಣಿ, ಸೇವೆ ಹುಡುಕಿ"}
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-11 pr-10 h-12 rounded-xl bg-card border-border text-base"
              autoFocus
            />
            {query && (
              <button
                onClick={() => { setQuery(""); setResults([]); setSearched(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={lang === "en" ? "Clear search" : "ಹುಡುಕಾಟ ತೆರವುಗೊಳಿಸಿ"}
              >
                <X size={16} strokeWidth={1.5} className="text-muted-foreground" />
              </button>
            )}
          </div>
          <button
            className="h-12 w-12 bg-muted rounded-xl flex items-center justify-center hover:bg-accent transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={lang === "en" ? "Voice search" : "ಧ್ವನಿ ಹುಡುಕಾಟ"}
          >
            <Mic size={18} strokeWidth={1.5} className="text-foreground" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border">
                <div className="w-12 h-12 bg-muted rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : searched && results.length > 0 ? (
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              {lang === "en" ? `${results.length} results` : `${results.length} ಫಲಿತಾಂಶಗಳು`}
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {results.map((item) => {
                const ItemIcon = getCategoryLucideIcon(item.category);
                return (
                  <Link
                    key={item.id}
                    href={`/category/${item.category}/${item.id}`}
                    className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:shadow-md transition-shadow duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                      {item.images && item.images.length > 0 ? (
                        <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ItemIcon size={24} strokeWidth={1.5} className="text-muted-foreground" aria-hidden="true" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-card-foreground">{item.title}</p>
                      <p className="text-sm text-primary font-medium mt-1">
                        {item.price ? `₹${item.price.toLocaleString()}` : item.rateInfo || ""}
                      </p>
                      {(item.taluk || item.district) && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <MapPin size={12} strokeWidth={1.5} aria-hidden="true" />
                          <span>{[item.taluk, item.district].filter(Boolean).join(", ")}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : searched ? (
          <div className="text-center py-16">
            <SearchIcon size={32} strokeWidth={1.5} className="mx-auto text-muted-foreground mb-4" aria-hidden="true" />
            <p className="text-foreground font-medium">
              {lang === "en" ? "No results found" : "ಯಾವುದೇ ಫಲಿತಾಂಶ ಸಿಗಲಿಲ್ಲ"}
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              {lang === "en" ? <>Nothing matched &quot;{query}&quot;</> : <>&quot;{query}&quot; ಗೆ ಹೊಂದುವ ಫಲಿತಾಂಶ ಇಲ್ಲ</>}
            </p>
          </div>
        ) : (
          <div className="text-center py-16">
            <SearchIcon size={32} strokeWidth={1.5} className="mx-auto text-muted-foreground mb-4" aria-hidden="true" />
            <p className="text-muted-foreground">{lang === "en" ? "Type to search" : "ಹುಡುಕಲು ಟೈಪ್ ಮಾಡಿ"}</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
