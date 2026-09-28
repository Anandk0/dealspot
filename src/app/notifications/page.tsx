"use client";
import { Bell, CheckCheck, LogIn } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { api, NotificationData } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    api.getNotifications()
      .then((res) => setNotifications(res.content))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("ಎಲ್ಲಾ ಓದಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಲಾಗಿದೆ");
    } catch {
      toast.error("Failed to mark notifications as read");
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return "ಈಗ ತಾನೇ";
    if (diffHours < 24) return `${diffHours} ಗಂಟೆ ಹಿಂದೆ`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ದಿನ ಹಿಂದೆ`;
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto p-6">
          <div className="text-center py-16 bg-card rounded-xl border border-border">
            <LogIn size={40} className="mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-foreground font-medium">ಅಧಿಸೂಚನೆಗಳನ್ನು ನೋಡಲು ಲಾಗಿನ್ ಮಾಡಿ</p>
            <p className="text-sm text-muted-foreground mt-1">Please login to see notifications.</p>
            <Link href="/login">
              <Button className="mt-4 bg-primary">ಲಾಗಿನ್ (Login)</Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-foreground">ಅಧಿಸೂಚನೆಗಳು (Notifications)</h1>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
              <CheckCheck size={16} className="mr-1" /> ಎಲ್ಲಾ ಓದಿದೆ
            </Button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-5 rounded-xl border border-border bg-card animate-pulse">
                <div className="flex gap-4">
                  <div className="w-11 h-11 rounded-full bg-muted" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-5 rounded-xl border transition-all hover:shadow-sm ${
                  n.read ? "bg-card border-border" : "bg-primary/10 border-primary/30"
                }`}
              >
                <div className="flex gap-4">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                    n.read ? "bg-muted" : "bg-primary/20"
                  }`}>
                    <Bell size={18} className={n.read ? "text-muted-foreground" : "text-primary"} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <p className="font-medium text-card-foreground">{n.title}</p>
                      {!n.read && <div className="w-2.5 h-2.5 bg-primary rounded-full mt-1.5" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-xs text-muted-foreground/70 mt-2">{formatTime(n.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-xl border border-border">
            <Bell size={40} className="mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">ಯಾವುದೇ ಅಧಿಸೂಚನೆಗಳಿಲ್ಲ</p>
            <p className="text-sm text-muted-foreground/70 mt-1">No notifications yet.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
