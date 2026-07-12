"use client";
import { Plus, MoreVertical, Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api, ListingData } from "@/lib/api";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function MyListingsPage() {
  const [listings, setListings] = useState<ListingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyListings()
      .then((res) => setListings(res.content))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await api.deleteListing(id);
      setListings(listings.filter(l => l.id !== id));
      toast.success("ಜಾಹೀರಾತು ಅಳಿಸಲಾಗಿದೆ");
    } catch {
      toast.error("ಅಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ");
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800">ನನ್ನ ಜಾಹೀರಾತುಗಳು (My Listings)</h1>
          <Link href="/create">
            <Button className="bg-primary"><Plus size={16} className="mr-2" /> ಹೊಸ ಜಾಹೀರಾತು</Button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2].map(i => (
              <div key={i} className="bg-white rounded-xl p-5 border animate-pulse">
                <div className="flex gap-4"><div className="w-16 h-16 bg-gray-200 rounded-xl" /><div className="flex-1"><div className="h-4 bg-gray-200 rounded w-1/2 mb-2" /><div className="h-5 bg-gray-200 rounded w-1/3" /></div></div>
              </div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="space-y-3">
            {listings.map((item) => (
              <div key={item.id} className="bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition">
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                    {item.images?.length > 0 ? (
                      <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">{getCategoryIcon(item.category)}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">{item.title}</p>
                        <p className="text-lg font-bold text-primary">
                          {item.price ? `₹${item.price.toLocaleString()}` : item.rateInfo || ""}
                        </p>
                      </div>
                      <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-400">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant={item.status === "ACTIVE" ? "default" : "secondary"} className="text-xs">
                        {item.status === "ACTIVE" ? "✓ ಸಕ್ರಿಯ" : item.status === "PENDING" ? "⏳ ಬಾಕಿ" : item.status}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Eye size={12} /> {item.viewCount} ವೀಕ್ಷಣೆ
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border">
            <p className="text-5xl mb-3">📋</p>
            <p className="text-gray-500">ನೀವು ಇನ್ನೂ ಯಾವುದೇ ಜಾಹೀರಾತು ಹಾಕಿಲ್ಲ</p>
            <p className="text-sm text-gray-400">You haven&apos;t posted any listings yet</p>
            <Link href="/create" className="inline-block mt-4">
              <Button className="bg-primary"><Plus size={16} className="mr-2" /> ಮೊದಲ ಜಾಹೀರಾತು ಹಾಕಿ</Button>
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
