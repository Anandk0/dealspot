"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Users, ShoppingBag, IndianRupee, Clock, Eye, Unlock } from "lucide-react";

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

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;

  const kpis = [
    { label: "Total Users", value: stats?.totalUsers?.toLocaleString(), icon: Users, color: "bg-blue-500" },
    { label: "Active Listings", value: stats?.activeListings?.toLocaleString(), icon: ShoppingBag, color: "bg-green-500" },
    { label: "Pending Moderation", value: stats?.pendingModeration?.toLocaleString(), icon: Clock, color: "bg-orange-500" },
    { label: "Total Revenue", value: `₹${((stats?.totalRevenue || 0) / 100).toLocaleString()}`, icon: IndianRupee, color: "bg-purple-500" },
    { label: "Today Revenue", value: `₹${((stats?.todayRevenue || 0) / 100).toLocaleString()}`, icon: IndianRupee, color: "bg-emerald-500" },
    { label: "Month Revenue", value: `₹${((stats?.monthRevenue || 0) / 100).toLocaleString()}`, icon: IndianRupee, color: "bg-teal-500" },
    { label: "Total Unlocks", value: stats?.totalUnlocks?.toLocaleString(), icon: Unlock, color: "bg-pink-500" },
    { label: "Total Listings", value: stats?.totalListings?.toLocaleString(), icon: Eye, color: "bg-indigo-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${kpi.color} rounded-lg flex items-center justify-center`}>
                <kpi.icon size={18} className="text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{kpi.value}</p>
                <p className="text-xs text-gray-500">{kpi.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <a href="/admin/moderation" className="block p-3 bg-orange-50 rounded-lg text-sm text-orange-700 hover:bg-orange-100 transition">
              ⏳ {stats?.pendingModeration} listings awaiting moderation
            </a>
            <a href="/admin/revenue" className="block p-3 bg-green-50 rounded-lg text-sm text-green-700 hover:bg-green-100 transition">
              💰 View revenue reports
            </a>
            <a href="/admin/users" className="block p-3 bg-blue-50 rounded-lg text-sm text-blue-700 hover:bg-blue-100 transition">
              👥 Manage {stats?.totalUsers} users
            </a>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-4">Platform Health</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Approval Rate</span>
              <span className="font-medium text-gray-400" title="Coming soon">—</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Avg Moderation Time</span>
              <span className="font-medium text-gray-400" title="Coming soon">—</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Conversion (view → unlock)</span>
              <span className="font-medium">{stats?.conversionRate != null ? `${stats.conversionRate.toFixed(1)}%` : "—"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Payment Success Rate</span>
              <span className="font-medium text-gray-400" title="Coming soon">—</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
