"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileCheck, Users, IndianRupee, Image, Settings, ScrollText, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useAdminGuard, hasMinimumRole, type AdminRole } from "@/lib/useAdminGuard";

interface NavItem {
  href: string;
  icon: typeof LayoutDashboard;
  label: string;
  minimumRole: AdminRole;
}

const adminNav: NavItem[] = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard", minimumRole: "ADMIN" },
  { href: "/admin/moderation", icon: FileCheck, label: "Moderation", minimumRole: "CHECKER" },
  { href: "/admin/users", icon: Users, label: "Users", minimumRole: "ADMIN" },
  { href: "/admin/revenue", icon: IndianRupee, label: "Revenue", minimumRole: "ADMIN" },
  { href: "/admin/banners", icon: Image, label: "Banners", minimumRole: "ADMIN" },
  { href: "/admin/settings", icon: Settings, label: "Settings", minimumRole: "SUPER_ADMIN" },
  { href: "/admin/audit", icon: ScrollText, label: "Audit Logs", minimumRole: "SUPER_ADMIN" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const { isAuthorized, isLoading } = useAdminGuard("CHECKER");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  const visibleNav = adminNav.filter((item) =>
    hasMinimumRole(user?.role, item.minimumRole)
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col fixed inset-y-0 left-0">
        <div className="p-5 border-b border-gray-700">
          <h1 className="text-lg font-bold">🌾 Deal Spot</h1>
          <p className="text-xs text-gray-400">Admin Panel</p>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {visibleNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive ? "bg-primary text-white" : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-gray-700">
          <button
            onClick={async () => { await logout(); router.push("/login"); }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-800 w-full"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64 p-6">
        {children}
      </main>
    </div>
  );
}
