"use client";
import { useParams } from "next/navigation";
import { Plus, Heart, MapPin } from "lucide-react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { categories, getCategoryIcon } from "@/lib/categories";
import { api, ListingData } from "@/lib/api";
import { useState, useEffect } from "react";

export default function CategoryPage() {
  const params = useParams();
  const id = params.id as string;
  const category = categories.find((c) => c.id === id);

  const [listings, setListings] = useState<ListingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getListingsByCategory(id)
      .then((res) => setListings(res.content))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [id]);

  const isAgentCategory = id === "agents" || id === "agent";

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-6 pb-28 lg:pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">{category?.name}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isAgentCategory ? "ನೋಂದಾಯಿತ ಅಧಿಕೃತ ಏಜೆಂಟರು (Verified Agents)" : category?.nameEn} • {listings.length} {isAgentCategory ? "ಏಜೆಂಟರು" : "ಜಾಹೀರಾತುಗಳು"}
            </p>
          </div>
          <Link href={`/category/${id}/create`}>
            <Button className="bg-primary hover:bg-primary/90 text-xs sm:text-sm font-medium w-full sm:w-auto">
              {isAgentCategory ? (
                <>🤝 ಏಜೆಂಟ್ ನೋಂದಣಿ / ರೆಫರಲ್ ಐಡಿ</>
              ) : (
                <><Plus size={16} className="mr-1.5" /> ಹೊಸ ಜಾಹೀರಾತು</>
              )}
            </Button>
          </Link>
        </div>

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
                      <button className="text-muted-foreground/50 hover:text-red-500 transition-colors p-1" onClick={(e) => e.preventDefault()}>
                        <Heart size={16} />
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
        ) : (
          <div className="text-center py-14 bg-card rounded-2xl border border-border">
            <p className="text-4xl sm:text-5xl mb-3">{getCategoryIcon(id)}</p>
            <p className="text-foreground font-medium text-sm sm:text-base">
              {isAgentCategory ? "ಇನ್ನೂ ಯಾವುದೇ ನೋಂದಾಯಿತ ಏಜೆಂಟರಿಲ್ಲ" : "ಈ ವಿಭಾಗದಲ್ಲಿ ಯಾವುದೇ ಜಾಹೀರಾತುಗಳಿಲ್ಲ"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isAgentCategory ? "ನೀವೂ ಅಧಿಕೃತ Dealspot ಏಜೆಂಟ್ ಆಗಿ ನೋಂದಾಯಿಸಬಹುದು!" : "No listings in this category yet"}
            </p>
            <Link href={`/category/${id}/create`} className="inline-block mt-4">
              <Button className="bg-primary hover:bg-primary/90 text-xs sm:text-sm">
                {isAgentCategory ? "🤝 ಮೊದಲ ಏಜೆಂಟ್ ಆಗಿ ನೋಂದಾಯಿಸಿ" : <><Plus size={16} className="mr-1.5" /> ಮೊದಲ ಜಾಹೀರಾತು ಹಾಕಿ</>}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
