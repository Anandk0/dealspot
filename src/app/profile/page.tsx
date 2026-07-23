"use client";
import { useState, useEffect } from "react";
import { ChevronRight, ListOrdered, Heart, Settings, HelpCircle, Info, LogOut, Edit } from "lucide-react";
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
  { href: "/help", icon: HelpCircle, label: "ಸಹಾಯ", labelEn: "Help" },
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
      <div className="max-w-3xl mx-auto p-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-5xl">
              👤
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800">{user?.name || "—"}</h2>
              <p className="text-sm text-gray-500 mt-1">{user?.phone || "—"}</p>
              <p className="text-sm text-gray-400">{user?.location || "—"}</p>
            </div>
            <Link
              href="/profile/edit"
              className="flex items-center gap-2 text-sm text-primary font-medium px-4 py-2 border border-primary/30 rounded-lg hover:bg-primary/5 transition"
            >
              <Edit size={14} />
              ಬದಲಾಯಿಸಿ
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <p className="text-2xl font-bold text-primary">{listingCount ?? "—"}</p>
            <p className="text-xs text-gray-500 mt-1">ಜಾಹೀರಾತುಗಳು</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <p className="text-2xl font-bold text-primary">—</p>
            <p className="text-xs text-gray-500 mt-1">ವೀಕ್ಷಣೆಗಳು</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <p className="text-2xl font-bold text-primary">{favoritesCount ?? "—"}</p>
            <p className="text-xs text-gray-500 mt-1">ಇಷ್ಟಪಟ್ಟಿ</p>
          </div>
        </div>

        {/* Menu */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {menuItems.map((item, i) => (
            <div key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition"
              >
                <item.icon size={20} className="text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-700 font-medium">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.labelEn}</p>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </Link>
              {i < menuItems.length - 1 && <Separator />}
            </div>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-6 py-4 mt-4 w-full text-left bg-white rounded-xl border border-gray-100 hover:bg-red-50 transition"
        >
          <LogOut size={20} className="text-red-500" />
          <span className="text-sm text-red-500 font-medium">ಲಾಗ್ ಔಟ್ (Logout)</span>
        </button>
      </div>
    </AppLayout>
  );
}
