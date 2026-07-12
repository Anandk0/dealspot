"use client";
import { useState } from "react";
import { Search as SearchIcon, Mic, X, MapPin } from "lucide-react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { api, ListingData } from "@/lib/api";

export default function SearchPage() {
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
      <div className="max-w-4xl mx-auto p-6">
        {/* Search Input */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 relative">
            <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="ಉತ್ಪನ್ನ, ಪ್ರಾಣಿ, ಸೇವೆ ಹುಡುಕಿ..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-11 pr-10 h-12 rounded-xl bg-white border-gray-200 text-base"
              autoFocus
            />
            {query && (
              <button onClick={() => { setQuery(""); setResults([]); setSearched(false); }} className="absolute right-4 top-1/2 -translate-y-1/2">
                <X size={18} className="text-gray-400" />
              </button>
            )}
          </div>
          <button className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Mic size={20} className="text-primary" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl border animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : searched && results.length > 0 ? (
          <div>
            <p className="text-sm text-gray-500 mb-4">{results.length} ಫಲಿತಾಂಶಗಳು</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {results.map((item) => (
                <Link
                  key={item.id}
                  href={`/category/${item.category}/${item.id}`}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-primary/20 hover:shadow-sm transition"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                    {item.images && item.images.length > 0 ? (
                      <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">{getCategoryIcon(item.category)}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.title}</p>
                    <p className="text-sm text-primary font-semibold">
                      {item.price ? `₹${item.price.toLocaleString()}` : item.rateInfo || ""}
                    </p>
                    {item.location && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                        <MapPin size={11} />
                        <span>{item.location}</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : searched ? (
          <div className="text-center py-16">
            <SearchIcon size={56} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500">ಯಾವುದೇ ಫಲಿತಾಂಶ ಸಿಗಲಿಲ್ಲ</p>
            <p className="text-gray-400 text-sm">No results found for &quot;{query}&quot;</p>
          </div>
        ) : (
          <div className="text-center py-16">
            <SearchIcon size={56} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400">ಹುಡುಕಲು ಟೈಪ್ ಮಾಡಿ (Type to search)</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
