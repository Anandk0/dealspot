"use client";
import { useState, useEffect } from "react";
import { Bell, User, Menu, X, Home, Search, PlusCircle, Heart, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { api } from "@/lib/api";
import ThemeToggle from "./ThemeToggle";

const menuItems = [
  { href: "/home", icon: Home, label: "ಹೋಮ್", labelEn: "Home" },
  { href: "/search", icon: Search, label: "ಹುಡುಕು", labelEn: "Search" },
  { href: "/create", icon: PlusCircle, label: "ಜಾಹೀರಾತು ಹಾಕಿ", labelEn: "Post Ad" },
  { href: "/favorites", icon: Heart, label: "ಇಷ್ಟಪಟ್ಟಿ", labelEn: "Favorites" },
  { href: "/notifications", icon: Bell, label: "ಅಧಿಸೂಚನೆ", labelEn: "Notifications" },
  { href: "/profile", icon: User, label: "ಪ್ರೊಫೈಲ್", labelEn: "Profile" },
  { href: "/settings", icon: Settings, label: "ಸೆಟ್ಟಿಂಗ್ಸ್", labelEn: "Settings" },
];

export default function TopHeader() {
  const { user, isLoggedIn, logout } = useAuth();
  const { lang, setLang } = useLang();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

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
    <>
      <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
        {/* Main Bar */}
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
          {/* Left: Hamburger (mobile only) + Logo */}
          <div className="flex items-center gap-2">
            {/* Hamburger — visible only on mobile (lg hides sidebar triggers this) */}
            <button
              className="lg:hidden p-2 -ml-1 rounded-lg text-foreground/70 hover:text-primary hover:bg-accent transition"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            {/* Logo */}
            <Link href="/home" className="flex items-center gap-2 shrink-0">
              <img src="/logo.png" alt="Deal Spot Connect" className="w-9 h-9 rounded-full object-cover" />
              <div>
                <h1 className="text-lg font-bold text-primary leading-tight">
                  Dealspot <span className="text-[10px] font-normal text-muted-foreground">connect</span>
                </h1>
              </div>
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* <ThemeToggle /> */}

            {/* Language toggle */}
            {/* <button
              onClick={() => setLang(lang === "en" ? "kn" : "en")}
              className="px-2.5 py-1.5 rounded-lg text-foreground/70 hover:text-primary hover:bg-accent transition text-xs font-medium"
              title="Switch language"
            >
              {lang === "en" ? "ಕನ್ನಡ" : "EN"}
            </button> */}
{/* 
            <Link href="/create" className="hidden sm:inline-flex bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-primary/90 transition">
              + ಜಾಹೀರಾತು ಹಾಕಿ
            </Link> */}

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
      </header>

      {/* Mobile Drawer Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 left-0 z-[70] h-full w-72 bg-background shadow-xl flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Deal Spot" className="w-8 h-8 rounded-full object-cover" />
            <div>
              <p className="text-sm font-bold text-primary">Dealspot</p>
              {user && <p className="text-xs text-muted-foreground truncate max-w-[160px]">{user.name}</p>}
            </div>
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <div className="relative">
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                  {item.href === "/notifications" && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[8px] flex items-center justify-center rounded-full">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-sm block">{item.label}</span>
                  <span className="text-[10px] text-gray-400">{item.labelEn}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Drawer Footer */}
        {isLoggedIn && (
          <div className="border-t border-border p-3">
            <button
              onClick={() => { logout(); setMenuOpen(false); }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <LogOut size={20} />
              <div>
                <span className="text-sm block">ಲಾಗ್ ಔಟ್</span>
                <span className="text-[10px] text-gray-400">Logout</span>
              </div>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
