"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Users, ShoppingBag, IndianRupee, Clock, Eye, Unlock, Wallet, ChevronRight } from "lucide-react";
interface DashboardStats {
  totalUsers: number;
  totalListings: number;
  activeListings: number;
  pendingModeration: number;
  totalRevenue: number;
  todayRevenue: number;
  monthRevenue: number;
  totalUnlocks: number;
  conversionRate?: number;
}
export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchStats();
  }, []);
  const fetchStats = async () => {
    try {
      const data = await api.adminDashboard();
      setStats(data as unknown as DashboardStats);
    } catch {
      // Show zeroes if API fails — no mock data
      setStats({
        totalUsers: 0,
        totalListings: 0,
        activeListings: 0,
        pendingModeration: 0,
        totalRevenue: 0,
        todayRevenue: 0,
        monthRevenue: 0,
        totalUnlocks: 0,
      });
    } finally {
      setLoading(false);
    }
  };
  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  const kpis = [
    { label: "Total users", value: stats?.totalUsers?.toLocaleString(), icon: Users },
    { label: "Active listings", value: stats?.activeListings?.toLocaleString(), icon: ShoppingBag },
    { label: "Pending moderation", value: stats?.pendingModeration?.toLocaleString(), icon: Clock },
    { label: "Total revenue", value: `₹${((stats?.totalRevenue || 0) / 100).toLocaleString()}`, icon: IndianRupee },
    { label: "Today revenue", value: `₹${((stats?.todayRevenue || 0) / 100).toLocaleString()}`, icon: IndianRupee },
    { label: "Month revenue", value: `₹${((stats?.monthRevenue || 0) / 100).toLocaleString()}`, icon: IndianRupee },
    { label: "Total unlocks", value: stats?.totalUnlocks?.toLocaleString(), icon: Unlock },
    { label: "Total listings", value: stats?.totalListings?.toLocaleString(), icon: Eye },
  ];
  const actionClass =
    "flex items-center gap-3 p-3 bg-muted rounded-lg text-sm text-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground mb-6">Admin dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center shrink-0">
                <kpi.icon size={18} strokeWidth={1.5} className="text-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-semibold text-foreground truncate">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="font-medium text-foreground mb-4">Quick actions</h3>
          <div className="space-y-2">
            <a href="/admin/moderation" className={actionClass}>
              <Clock size={16} strokeWidth={1.5} className="shrink-0" />
              <span className="flex-1">{stats?.pendingModeration} listings awaiting moderation</span>
              <ChevronRight size={16} strokeWidth={1.5} className="text-muted-foreground" />
            </a>
            <a href="/admin/revenue" className={actionClass}>
              <Wallet size={16} strokeWidth={1.5} className="shrink-0" />
              <span className="flex-1">View revenue reports</span>
              <ChevronRight size={16} strokeWidth={1.5} className="text-muted-foreground" />
            </a>
            <a href="/admin/users" className={actionClass}>
              <Users size={16} strokeWidth={1.5} className="shrink-0" />
              <span className="flex-1">Manage {stats?.totalUsers} users</span>
              <ChevronRight size={16} strokeWidth={1.5} className="text-muted-foreground" />
            </a>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="font-medium text-foreground mb-4">Platform health</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Approval rate</span>
              <span className="font-medium text-muted-foreground" title="Coming soon">—</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Average moderation time</span>
              <span className="font-medium text-muted-foreground" title="Coming soon">—</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Conversion (view → unlock)</span>
              <span className="font-medium">{stats?.conversionRate != null ? `${stats.conversionRate.toFixed(1)}%` : "—"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment success rate</span>
              <span className="font-medium text-muted-foreground" title="Coming soon">—</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
