"use client";
import { Home, Search, Heart, User, PlusCircle, Bell, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/home", icon: Home, label: "ಹೋಮ್", labelEn: "Home" },
  { href: "/search", icon: Search, label: "ಹುಡುಕು", labelEn: "Search" },
  { href: "/create", icon: PlusCircle, label: "ಪೋಸ್ಟ್ ಮಾಡಿ", labelEn: "Post Ad" },
  { href: "/favorites", icon: Heart, label: "ಇಷ್ಟಪಟ್ಟಿ", labelEn: "Favorites" },
  { href: "/notifications", icon: Bell, label: "ಅಧಿಸೂಚನೆ", labelEn: "Notifications" },
  { href: "/profile", icon: User, label: "ಪ್ರೊಫೈಲ್", labelEn: "Profile" },
  { href: "/settings", icon: Settings, label: "ಸೆಟ್ಟಿಂಗ್ಸ್", labelEn: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen border-r border-gray-200 bg-white fixed left-0 top-[108px] bottom-0 z-30 pt-4">
      <nav className="flex flex-col gap-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <div>
                <span className="text-sm block">{item.label}</span>
                <span className="text-[10px] text-gray-400">{item.labelEn}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
