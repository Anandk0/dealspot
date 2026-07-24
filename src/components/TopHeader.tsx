"use client";
import { useState, useEffect } from "react";
import { Bell, Globe, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

const topNavLinks = [
  { href: "/home", label: "ಹೋಮ್" },
  { href: "/category/agricultural-products", label: "ಕೃಷಿ ಉತ್ಪನ್ನ" },
  { href: "/category/livestock", label: "ಜಾನುವಾರು" },
  { href: "/category/farm-equipment", label: "ಉಪಕರಣ" },
  { href: "/category/tractor-rental", label: "ಟ್ರ್ಯಾಕ್ಟರ್" },
  { href: "/category/land", label: "ಭೂಮಿ" },
  { href: "/category/services", label: "ಸೇವೆಗಳು" },
];

export default function TopHeader() {
  const pathname = usePathname();
  const { user, isLoggedIn } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (!isLoggedIn) {
      setUnreadCount(0);
      return;
    }
    api.getUnreadNotificationCount()
      .then((res) => setUnreadCount(res.count))
      .catch(() => setUnreadCount(0));
  }, [isLoggedIn]);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Logo */}
        <Link href="/home" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">🌾</span>
          <div>
            <h1 className="text-lg font-bold text-primary leading-tight">Dealspot <span className="text-[10px] font-normal text-gray-500">connect</span></h1>
          </div>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link href="/language" className="p-2 text-gray-600 hover:text-primary transition">
            <Globe size={18} />
          </Link>

          <Link href="/create" className="hidden sm:inline-flex bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-primary/90 transition">
            + ಜಾಹೀರಾತು ಹಾಕಿ
          </Link>

          <Link href="/notifications" className="relative p-2 text-gray-600 hover:text-primary transition">
            <Bell size={18} />
            {isLoggedIn && unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          <Link href="/profile" className="p-1 text-gray-600 hover:text-primary transition">
            <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center">
              <User size={14} className="text-primary" />
            </div>
          </Link>
        </div>
      </div>

      {/* Category Nav — desktop only */}
      <div className="max-w-7xl mx-auto px-4 hidden lg:block">
        <nav className="flex items-center gap-1 py-1 overflow-x-auto">
          {topNavLinks.map((link) => {
            const isActive = pathname === link.href || pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-sm rounded-lg whitespace-nowrap transition-colors ${
                  isActive ? "bg-primary/10 text-primary font-medium" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
