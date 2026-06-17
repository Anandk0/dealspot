"use client";
import { Bell, CheckCheck } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { notifications } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function NotificationsPage() {
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800">ಅಧಿಸೂಚನೆಗಳು (Notifications)</h1>
          <Button variant="ghost" size="sm" onClick={() => toast.success("ಎಲ್ಲಾ ಓದಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಲಾಗಿದೆ")}>
            <CheckCheck size={16} className="mr-1" /> ಎಲ್ಲಾ ಓದಿದೆ
          </Button>
        </div>

        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 rounded-xl border transition-all hover:shadow-sm ${
                n.read ? "bg-white border-gray-100" : "bg-primary/5 border-primary/20"
              }`}
            >
              <div className="flex gap-4">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                  n.read ? "bg-gray-100" : "bg-primary/10"
                }`}>
                  <Bell size={18} className={n.read ? "text-gray-400" : "text-primary"} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <p className="font-medium text-gray-800">{n.title}</p>
                    {!n.read && <div className="w-2.5 h-2.5 bg-primary rounded-full mt-1.5" />}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{n.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
