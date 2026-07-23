"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileCheck, Users, IndianRupee, Image, Settings, ScrollText, LogOut, Menu, X } from "lucide-react";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const handleNavClick = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-lg hover:bg-gray-800"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <h1 className="text-base font-bold">🌾 Dealspot <span className="text-xs font-normal text-gray-400">connect</span></h1>
        </div>
        <span className="text-xs text-gray-400">Admin</span>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col
          transition-transform duration-200 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="p-5 border-b border-gray-700">
          <h1 className="text-lg font-bold">🌾 Dealspot <span className="text-xs font-normal text-gray-400">connect</span></h1>
          <p className="text-xs text-gray-400">Admin Panel</p>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {visibleNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
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
      <main className="flex-1 lg:ml-0 p-4 lg:p-6 pt-16 lg:pt-6">
        {children}
      </main>
    </div>
  );
}
