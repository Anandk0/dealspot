"use client";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const mockBanners = [
  { id: 1, title: "ಉಚಿತ ಲಿಸ್ಟಿಂಗ್!", subtitle: "ಮೊದಲ 3 ಜಾಹೀರಾತು ಉಚಿತ", color: "from-green-500 to-green-700", active: true },
  { id: 2, title: "ಟ್ರ್ಯಾಕ್ಟರ್ 20% ರಿಯಾಯಿತಿ", subtitle: "ಈ ವಾರ ಮಾತ್ರ", color: "from-orange-500 to-orange-700", active: true },
  { id: 3, title: "ಹೊಸ ವರ್ಷದ ಆಫರ್", subtitle: "ಎಲ್ಲಾ ಸೇವೆಗಳಿಗೆ 50% ರಿಯಾಯಿತಿ", color: "from-blue-500 to-blue-700", active: false },
];

export default function BannersPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Banners & Promotions</h1>
          <p className="text-sm text-gray-500">Manage home page banners</p>
        </div>
        <Button className="bg-primary" onClick={() => toast.info("Create banner form — coming soon")}>
          <Plus size={16} className="mr-2" /> New Banner
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {mockBanners.map((banner) => (
          <div key={banner.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <div className={`bg-gradient-to-r ${banner.color} p-6 text-white`}>
              <h3 className="text-lg font-bold">{banner.title}</h3>
              <p className="text-sm text-white/80">{banner.subtitle}</p>
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className={`text-xs px-2 py-1 rounded ${
                banner.active ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
              }`}>
                {banner.active ? "Active" : "Inactive"}
              </span>
              <Button size="sm" variant="outline" className="text-red-500 h-7" onClick={() => toast.success("Banner deleted")}>
                <Trash2 size={12} className="mr-1" /> Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
