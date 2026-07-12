"use client";
import { useState } from "react";
import { CheckCircle2, XCircle, Flag, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const mockQueue = [
  { id: 101, title: "ರಾಗಿ 30 ಕ್ವಿಂಟಾಲ್", category: "agricultural-products", seller: "ಮಹೇಶ್", location: "ಮಂಡ್ಯ", createdAt: "2026-07-10" },
  { id: 102, title: "ಮುರ್ರಾ ಎಮ್ಮೆ", category: "livestock", seller: "ಕೃಷ್ಣಪ್ಪ", location: "ಶಿಮೋಗ", createdAt: "2026-07-11" },
  { id: 103, title: "ಸ್ಪ್ರೇಯರ್ ಮಾರಾಟ", category: "farm-equipment", seller: "ರಮೇಶ್", location: "ಧಾರವಾಡ", createdAt: "2026-07-11" },
  { id: 104, title: "3 ಎಕರೆ ಭೂಮಿ", category: "land", seller: "ಶಂಕರಪ್ಪ", location: "ಹಾಸನ", createdAt: "2026-07-12" },
];

export default function ModerationPage() {
  const [queue, setQueue] = useState(mockQueue);

  const handleAction = (id: number, action: string) => {
    setQueue(queue.filter((item) => item.id !== id));
    if (action === "approve") toast.success(`Listing #${id} approved`);
    else if (action === "reject") toast.error(`Listing #${id} rejected`);
    else toast.warning(`Listing #${id} flagged for review`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Moderation Queue</h1>
          <p className="text-sm text-gray-500">{queue.length} listings pending review</p>
        </div>
      </div>

      {queue.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border">
          <CheckCircle2 size={48} className="mx-auto text-green-400 mb-3" />
          <p className="text-gray-500">All caught up! No pending listings.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {queue.map((item) => (
            <div key={item.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-800">{item.title}</p>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{item.category}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  By {item.seller} • {item.location} • {item.createdAt}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-blue-600 border-blue-200">
                  <Eye size={14} className="mr-1" /> View
                </Button>
                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleAction(item.id, "approve")}>
                  <CheckCircle2 size={14} className="mr-1" /> Approve
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleAction(item.id, "reject")}>
                  <XCircle size={14} className="mr-1" /> Reject
                </Button>
                <Button size="sm" variant="outline" className="text-orange-600 border-orange-200" onClick={() => handleAction(item.id, "flag")}>
                  <Flag size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
