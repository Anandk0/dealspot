"use client";
import { Home, Search, Heart, User, PlusCircle, Bell, Settings, FileCheck, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/lib/lang-context";
import { useAuth } from "@/lib/auth-context";
import { hasMinimumRole } from "@/lib/useAdminGuard";

const navItems = [
  { href: "/home", icon: Home, label: "ಹೋಮ್", labelEn: "Home" },
  { href: "/search", icon: Search, label: "ಹುಡುಕು", labelEn: "Search" },
  { href: "/create", icon: PlusCircle, label: "ಪೋಸ್ಟ್ ಮಾಡಿ", labelEn: "Post Ad" },
  { href: "/favorites", icon: Heart, label: "ಇಷ್ಟಪಟ್ಟಿ", labelEn: "Favorites" },
  { href: "/notifications", icon: Bell, label: "ಅಧಿಸೂಚನೆ", labelEn: "Notifications" },
  { href: "/profile", icon: User, label: "ಪ್ರೊಫೈಲ್", labelEn: "Profile" },
  { href: "/settings", icon: Settings, label: "ಸೆಟ್ಟಿಂಗ್ಸ್", labelEn: "Settings" },
];

// Extra items shown to staff (CHECKER and above).
const staffNavItems = [
  { href: "/admin/moderation", icon: FileCheck, label: "ಪರಿಶೀಲನೆ", labelEn: "Moderation" },
  { href: "/admin/banners", icon: ImageIcon, label: "ಬ್ಯಾನರ್‌ಗಳು", labelEn: "Banners" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { lang } = useLang();
  const { user } = useAuth();
  const isStaff = hasMinimumRole(user?.role, "CHECKER");

  const renderItem = (item: { href: string; icon: typeof Home; label: string; labelEn: string }) => {
    const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
          isActive
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:bg-accent"
        }`}
      >
        <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
        <div>
          <span className="text-sm block">{lang === "en" ? item.labelEn : item.label}</span>
          <span className="text-[10px] text-muted-foreground/70">{lang === "en" ? item.label : item.labelEn}</span>
        </div>
      </Link>
    );
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen border-r border-border bg-background fixed left-0 top-[57px] bottom-0 z-30 pt-4">
      <nav className="flex flex-col gap-1 px-3">
        {navItems.map(renderItem)}

        {isStaff && (
          <>
            <div className="px-4 pt-4 pb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60">
                {lang === "en" ? "Staff" : "ಸಿಬ್ಬಂದಿ"}
              </span>
            </div>
            {staffNavItems.map(renderItem)}
          </>
        )}
      </nav>
    </aside>
  );
}
