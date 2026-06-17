"use client";
import { Bell, Search, Globe, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-6">
        {/* Logo */}
        <Link href="/home" className="flex items-center gap-2 shrink-0">
          <span className="text-3xl">🌾</span>
          <div>
            <h1 className="text-xl font-bold text-primary leading-tight">Deal Spot</h1>
            <p className="text-[10px] text-gray-500 leading-tight">ಡೀಲ್ ಸ್ಪಾಟ್ | ಗ್ರಾಮೀಣ ಮಾರುಕಟ್ಟೆ</p>
          </div>
        </Link>

        {/* Search Bar */}
        <Link href="/search" className="flex-1 max-w-xl">
          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-5 py-2.5 hover:bg-gray-150 transition cursor-pointer">
            <Search size={18} className="text-gray-400" />
            <span className="text-sm text-gray-400">ಉತ್ಪನ್ನ, ಸೇವೆ, ಅಥವಾ ಸ್ಥಳ ಹುಡುಕಿ...</span>
          </div>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-4 shrink-0">
          <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary transition">
            <Globe size={18} />
            <span className="hidden xl:inline">ಕನ್ನಡ</span>
          </button>

          <Link href="/create" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition">
            + ಜಾಹೀರಾತು ಹಾಕಿ
          </Link>

          <Link href="/notifications" className="relative p-2 text-gray-600 hover:text-primary transition">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full">
              2
            </span>
          </Link>

          <Link href="/profile" className="flex items-center gap-2 text-gray-600 hover:text-primary transition">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <User size={16} className="text-primary" />
            </div>
            <span className="hidden xl:inline text-sm">ರಾಮಣ್ಣ</span>
          </Link>
        </div>
      </div>

      {/* Category Nav */}
      <div className="max-w-7xl mx-auto px-6 hidden lg:block lg:pl-[272px]">
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
