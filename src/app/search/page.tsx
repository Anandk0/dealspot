"use client";
import { useState } from "react";
import { Search as SearchIcon, Mic, X, MapPin } from "lucide-react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { agriculturalProducts, livestock, farmEquipment, tractors } from "@/lib/mock-data";

const allItems = [
  ...agriculturalProducts.map(p => ({ ...p, category: "agricultural-products", icon: "🌾" })),
  ...livestock.map(p => ({ ...p, category: "livestock", icon: "🐄" })),
  ...farmEquipment.map(p => ({ ...p, category: "farm-equipment", icon: "🚜" })),
  ...tractors.map(p => ({ ...p, name: p.name, category: "tractor-rental", icon: "🚜" })),
];

const recentSearches = ["ರಾಗಿ", "ಹಸು", "ಟ್ರ್ಯಾಕ್ಟರ್", "ಭೂಮಿ", "ಎಲೆಕ್ಟ್ರಿಷಿಯನ್", "ಕಬ್ಬು", "ಮೇಕೆ"];

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const results = query.length > 0
    ? allItems.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        ("nameEn" in item && item.nameEn && item.nameEn.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Search Input */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 relative">
            <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="ಉತ್ಪನ್ನ, ಪ್ರಾಣಿ, ಸೇವೆ ಹುಡುಕಿ... (Search products, animals, services...)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-11 pr-10 h-12 rounded-xl bg-white border-gray-200 text-base"
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2">
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          <button className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center hover:bg-primary/20 transition">
            <Mic size={20} className="text-primary" />
          </button>
        </div>

        {query.length === 0 ? (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">ಇತ್ತೀಚಿನ ಹುಡುಕಾಟ (Recent Searches)</h3>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-primary hover:text-primary transition"
                >
                  {s}
                </button>
              ))}
            </div>

            <h3 className="text-sm font-semibold text-gray-700 mb-3 mt-8">ಜನಪ್ರಿಯ (Trending)</h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {["🌾 ರಾಗಿ", "🐄 ಹಸು", "🚜 ಟ್ರ್ಯಾಕ್ಟರ್", "🏞️ ಭೂಮಿ", "🔧 ಪ್ಲಂಬರ್", "👨‍🌾 ಕೂಲಿ"].map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s.split(" ")[1])}
                  className="p-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-primary hover:bg-primary/5 transition text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-500 mb-4">{results.length} ಫಲಿತಾಂಶಗಳು</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {results.map((item) => (
                <Link
                  key={`${item.category}-${item.id}`}
                  href={`/category/${item.category}/${item.id}`}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-primary/20 hover:shadow-sm transition"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                      <MapPin size={11} />
                      <span>{item.location}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <SearchIcon size={56} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500">ಯಾವುದೇ ಫಲಿತಾಂಶ ಸಿಗಲಿಲ್ಲ</p>
            <p className="text-gray-400 text-sm">No results found for &quot;{query}&quot;</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
