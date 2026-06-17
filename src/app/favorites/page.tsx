"use client";
import { Heart, Trash2, MapPin } from "lucide-react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { toast } from "sonner";

const savedItems = [
  { id: "1", title: "ರಾಗಿ 50 ಕ್ವಿಂಟಾಲ್", price: "₹2,800/ಕ್ವಿ", location: "ಮಂಡ್ಯ", icon: "🌾", category: "agricultural-products" },
  { id: "1", title: "ಜರ್ಸಿ ಹಸು", price: "₹65,000", location: "ಹಾಸನ", icon: "🐄", category: "livestock" },
  { id: "1", title: "John Deere 5310", price: "₹800/ಗಂಟೆ", location: "ಮಂಡ್ಯ", icon: "🚜", category: "tractor-rental" },
  { id: "1", title: "5 ಎಕರೆ ಭೂಮಿ", price: "₹25,00,000", location: "ಕೆ.ಆರ್.ಪೇಟೆ", icon: "🏞️", category: "land" },
];

export default function FavoritesPage() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Heart size={20} className="text-red-400" />
          <h1 className="text-xl font-bold text-gray-800">ಇಷ್ಟಪಟ್ಟಿ (Favorites)</h1>
          <span className="text-sm text-gray-400 ml-2">({savedItems.length} ಐಟಂಗಳು)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {savedItems.map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="flex gap-4">
                <Link href={`/category/${item.category}/${item.id}`} className="flex gap-4 flex-1">
                  <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center text-3xl shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{item.title}</p>
                    <p className="text-lg font-bold text-primary mt-1">{item.price}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <MapPin size={11} />
                      <span>{item.location}</span>
                    </div>
                  </div>
                </Link>
                <button
                  onClick={() => toast.success("ಇಷ್ಟಪಟ್ಟಿಯಿಂದ ತೆಗೆಯಲಾಗಿದೆ")}
                  className="self-start p-2 text-red-400 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
