"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import TopHeader from "./TopHeader";
import Sidebar from "./BottomNav";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Home, Search, PlusCircle, Heart, User } from "lucide-react";
import { Loader2 } from "lucide-react";

const mobileNavItems = [
  { href: "/home", icon: Home, label: "ಮುಖಪುಟ" },
  { href: "/favorites", icon: Heart, label: "ಇಷ್ಟಪಟ್ಟಿ" },
  { href: "/create", icon: PlusCircle, label: "ಪೋಸ್ಟ್" },
  { href: "/search", icon: Search, label: "ಹುಡುಕು" },
  { href: "/profile", icon: User, label: "ಪ್ರೊಫೈಲ್" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoading, isLoggedIn, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50" suppressHydrationWarning>
      <TopHeader />
      <div className="flex pt-0">
        <Sidebar />
        <main className="flex-1 lg:ml-64 pb-16 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex items-center justify-around px-2 py-1.5">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg ${
                isActive ? "text-primary" : "text-gray-500"
              }`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
