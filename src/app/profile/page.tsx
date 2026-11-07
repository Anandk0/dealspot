"use client";
import { useState, useEffect } from "react";
import { ChevronRight, ListOrdered, Heart, Settings, HelpCircle, Info, LogOut, Edit, MapPin, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

const menuItems = [
  { href: "/profile/listings", icon: ListOrdered, label: "ನನ್ನ ಜಾಹೀರಾತುಗಳು", labelEn: "My Listings" },
  { href: "/favorites", icon: Heart, label: "ಉಳಿಸಿದ ಜಾಹೀರಾತುಗಳು", labelEn: "Saved Listings" },
  { href: "/settings", icon: Settings, label: "ಸೆಟ್ಟಿಂಗ್ಸ್", labelEn: "Settings" },
  { href: "/help", icon: HelpCircle, label: "ಸಹಾಯ", labelEn: "Help & Support" },
  { href: "/about", icon: Info, label: "ನಮ್ಮ ಬಗ್ಗೆ", labelEn: "About Us" },
];

export default function ProfilePage() {
  const { user, isLoggedIn, logout } = useAuth();
  const router = useRouter();
  const [listingCount, setListingCount] = useState<number | null>(null);
  const [favoritesCount, setFavoritesCount] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoggedIn) return;
    api.getMyListings(0, 1)
      .then((res) => setListingCount(res.totalElements))
      .catch(() => setListingCount(null));
    api.getFavorites(0, 1)
      .then((res) => setFavoritesCount(res.totalElements))
      .catch(() => setFavoritesCount(null));
  }, [isLoggedIn]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-5 sm:p-6 pb-28 lg:pb-8">
        {/* Profile Card */}
        <div className="bg-card rounded-2xl p-4 sm:p-6 md:p-8 border border-border mb-4 sm:mb-6">
          <div className="flex items-center gap-3.5 sm:gap-6 min-w-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-muted rounded-full flex items-center justify-center text-muted-foreground shrink-0">
              <User size={28} strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground truncate">
                {user?.name || "—"}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                {user?.phone || "—"}
              </p>
              {(user?.location || user?.district) && (
                <p className="text-xs text-muted-foreground/80 mt-1 truncate flex items-center gap-1">
                  <MapPin size={12} className="shrink-0" />
                  <span>{[user?.location, user?.district].filter(Boolean).join(", ")}</span>
                </p>
              )}
            </div>
            <Link
              href="/profile/edit"
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-primary font-medium px-2.5 py-1.5 sm:px-4 sm:py-2 border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors shrink-0 self-center"
            >
              <Edit size={14} className="shrink-0" />
              <span>ಬದಲಾಯಿಸಿ</span>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mb-4 sm:mb-6">
          <Link
            href="/profile/listings"
            className="bg-card rounded-2xl p-3 sm:p-4 text-center border border-border hover:border-primary/30 transition-colors block min-w-0"
          >
            <p className="text-xl sm:text-2xl font-semibold text-primary truncate">{listingCount ?? "—"}</p>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 truncate">ಜಾಹೀರಾತುಗಳು</p>
          </Link>
          <div className="bg-card rounded-2xl p-3 sm:p-4 text-center border border-border min-w-0">
            <p className="text-xl sm:text-2xl font-semibold text-primary truncate">—</p>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 truncate">ವೀಕ್ಷಣೆಗಳು</p>
          </div>
          <Link
            href="/favorites"
            className="bg-card rounded-2xl p-3 sm:p-4 text-center border border-border hover:border-primary/30 transition-colors block min-w-0"
          >
            <p className="text-xl sm:text-2xl font-semibold text-primary truncate">{favoritesCount ?? "—"}</p>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 truncate">ಇಷ್ಟಪಟ್ಟಿ</p>
          </Link>
        </div>

        {/* Menu */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden mb-4">
          {menuItems.map((item, i) => (
            <div key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-3.5 sm:gap-4 px-4 py-3.5 sm:px-6 sm:py-4 hover:bg-muted/50 active:bg-muted transition-colors"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                  <item.icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground font-medium truncate">{item.label}</p>
                  <p className="text-[11px] sm:text-xs text-muted-foreground truncate">{item.labelEn}</p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground shrink-0" />
              </Link>
              {i < menuItems.length - 1 && <Separator />}
            </div>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3.5 sm:gap-4 px-4 py-3.5 sm:px-6 sm:py-4 w-full text-left bg-card rounded-2xl border border-border hover:bg-destructive/10 transition-colors"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-muted flex items-center justify-center text-destructive shrink-0">
            <LogOut size={18} strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm text-destructive font-medium block truncate">ಲಾಗ್ ಔಟ್</span>
            <span className="text-xs text-muted-foreground block truncate">Log out</span>
          </div>
        </button>
      </div>
    </AppLayout>
  );
}
