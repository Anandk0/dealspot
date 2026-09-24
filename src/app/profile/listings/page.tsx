"use client";
import { Plus, Eye, Trash2, Loader2, MapPin } from "lucide-react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api, ListingData } from "@/lib/api";
import { getCategoryIcon } from "@/lib/categories";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function MyListingsPage() {
  const [listings, setListings] = useState<ListingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  useEffect(() => {
    api.getMyListings()
      .then((res) => setListings(res.content))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await api.deleteListing(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
      toast.success("ಜಾಹೀರಾತು ಅಳಿಸಲಾಗಿದೆ (Listing deleted)");
    } catch {
      toast.error("ಅಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ (Failed to delete)");
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE":    return { label: "✓ ಸಕ್ರಿಯ", variant: "default" as const, color: "bg-green-100 text-green-700" };
      case "PENDING":   return { label: "⏳ ಬಾಕಿ", variant: "secondary" as const, color: "bg-yellow-100 text-yellow-700" };
      case "REJECTED":  return { label: "✗ ತಿರಸ್ಕರಿಸಲಾಗಿದೆ", variant: "destructive" as const, color: "bg-red-100 text-red-700" };
      case "SOLD":      return { label: "✓ ಮಾರಾಟವಾಗಿದೆ", variant: "secondary" as const, color: "bg-blue-100 text-blue-700" };
      default:          return { label: status, variant: "secondary" as const, color: "bg-gray-100 text-gray-600" };
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 pb-28 lg:pb-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground">ನನ್ನ ಜಾಹೀರಾತುಗಳು</h1>
            <p className="text-sm text-muted-foreground">My Listings</p>
          </div>
          <Link href="/create">
            <Button className="bg-primary text-sm">
              <Plus size={16} className="mr-1.5" /> ಹೊಸ ಜಾಹೀರಾತು
            </Button>
          </Link>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-2xl p-4 border border-border animate-pulse">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-muted rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 bg-muted rounded w-2/3" />
                    <div className="h-5 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>

        ) : listings.length > 0 ? (
          <div className="space-y-3">
            {listings.map((item) => {
              const st = statusLabel(item.status);
              const isDeleting = deletingId === item.id;
              const isConfirming = confirmId === item.id;

              return (
                <div
                  key={item.id}
                  className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex gap-3.5 p-4">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 bg-muted rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                      {item.images?.length > 0 ? (
                        <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">{getCategoryIcon(item.category)}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">{item.title}</p>
                          <p className="text-base font-bold text-primary mt-0.5">
                            {item.price ? `₹${item.price.toLocaleString()}` : item.rateInfo || ""}
                          </p>
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={() => setConfirmId(item.id)}
                          disabled={isDeleting}
                          className="p-2 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
                          aria-label="Delete listing"
                        >
                          {isDeleting
                            ? <Loader2 size={16} className="animate-spin" />
                            : <Trash2 size={16} />
                          }
                        </button>
                      </div>

                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {/* Status badge */}
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${st.color}`}>
                          {st.label}
                        </span>
                        {/* View count */}
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Eye size={11} /> {item.viewCount} ವೀಕ್ಷಣೆ
                        </span>
                        {/* Location */}
                        {item.location && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                            <MapPin size={11} className="shrink-0" /> {item.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Inline delete confirmation bar */}
                  {isConfirming && (
                    <div className="border-t border-border bg-red-50 dark:bg-red-950/20 px-4 py-3 rounded-b-2xl flex items-center justify-between gap-3">
                      <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                        ಈ ಜಾಹೀರಾತು ಅಳಿಸಲಾಗಿದೆ? (Delete this listing?)
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setConfirmId(null)}
                          className="px-3 py-1.5 text-xs rounded-lg border border-border bg-background hover:bg-muted transition"
                        >
                          ರದ್ದು (Cancel)
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={isDeleting}
                          className="px-3 py-1.5 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600 transition flex items-center gap-1.5 disabled:opacity-60"
                        >
                          {isDeleting && <Loader2 size={12} className="animate-spin" />}
                          ಅಳಿಸಿ (Delete)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        ) : (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <p className="text-5xl mb-3">📋</p>
            <p className="text-foreground font-medium">ನೀವು ಇನ್ನೂ ಯಾವುದೇ ಜಾಹೀರಾತು ಹಾಕಿಲ್ಲ</p>
            <p className="text-sm text-muted-foreground mt-1">You haven&apos;t posted any listings yet</p>
            <Link href="/create" className="inline-block mt-4">
              <Button className="bg-primary">
                <Plus size={16} className="mr-1.5" /> ಮೊದಲ ಜಾಹೀರಾತು ಹಾಕಿ
              </Button>
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
