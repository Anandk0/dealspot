"use client";
import { Plus, MoreVertical, Eye } from "lucide-react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const myListings = [
  { id: "1", title: "ರಾಗಿ 50 ಕ್ವಿಂಟಾಲ್", price: "₹2,800/ಕ್ವಿ", status: "active", views: 45, icon: "🌾", date: "12 ಜೂನ್ 2026" },
  { id: "2", title: "ರೋಟವೇಟರ್", price: "₹1,25,000", status: "active", views: 23, icon: "🚜", date: "10 ಜೂನ್ 2026" },
  { id: "3", title: "2 ಎಕರೆ ಭೂಮಿ", price: "₹32,00,000", status: "pending", views: 0, icon: "🏞️", date: "15 ಜೂನ್ 2026" },
];

export default function MyListingsPage() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800">ನನ್ನ ಜಾಹೀರಾತುಗಳು (My Listings)</h1>
          <Link href="/create">
            <Button className="bg-primary">
              <Plus size={16} className="mr-2" /> ಹೊಸ ಜಾಹೀರಾತು
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          {myListings.map((item) => (
            <div key={item.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-3xl">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{item.title}</p>
                      <p className="text-lg font-bold text-primary">{item.price}</p>
                    </div>
                    <button onClick={() => toast.info("ಆಯ್ಕೆಗಳು: ಸಂಪಾದಿಸಿ / ಅಳಿಸಿ")} className="p-2 hover:bg-gray-100 rounded-lg">
                      <MoreVertical size={16} className="text-gray-400" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge variant={item.status === "active" ? "default" : "secondary"} className="text-xs">
                      {item.status === "active" ? "✓ ಸಕ್ರಿಯ" : "⏳ ಬಾಕಿ"}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Eye size={12} /> {item.views} ವೀಕ್ಷಣೆ
                    </span>
                    <span className="text-xs text-gray-400">{item.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
