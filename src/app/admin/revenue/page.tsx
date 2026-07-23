"use client";
import { useState, useEffect, useCallback } from "react";
import { IndianRupee, TrendingUp, CreditCard, AlertCircle, Download, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api, type RevenueStats, type TransactionData, type PagedResponse } from "@/lib/api";
import { useAdminGuard } from "@/lib/useAdminGuard";

// Category colors for charts
const CATEGORY_COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1",
];

function formatCurrency(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

function getDefaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
}

export default function RevenuePage() {
  const { isAuthorized, isLoading: guardLoading } = useAdminGuard("ADMIN");

  const [activeTab, setActiveTab] = useState<"overview" | "transactions">("overview");
  const [dateRange, setDateRange] = useState(getDefaultDateRange);
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [transactions, setTransactions] = useState<PagedResponse<TransactionData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [txPage, setTxPage] = useState(0);
  const [exporting, setExporting] = useState(false);

  const fetchRevenue = useCallback(async () => {
    try {
      const data = await api.adminRevenue(dateRange.from, dateRange.to);
      setRevenueStats(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load revenue data");
    }
  }, [dateRange.from, dateRange.to]);

  const fetchTransactions = useCallback(async () => {
    try {
      const data = await api.adminTransactions(txPage, 10, dateRange.from, dateRange.to);
      setTransactions(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load transactions");
    }
  }, [txPage, dateRange.from, dateRange.to]);

  const loadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchRevenue(), fetchTransactions()]);
    setLoading(false);
  }, [fetchRevenue, fetchTransactions]);

  useEffect(() => {
    if (isAuthorized) {
      loadData();
    }
  }, [isAuthorized, loadData]);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const csvContent = await api.adminExportRevenue(dateRange.from, dateRange.to);
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `revenue_${dateRange.from}_to_${dateRange.to}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("CSV exported successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to export CSV");
    } finally {
      setExporting(false);
    }
  };

  if (guardLoading || !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const maxDailyAmount = revenueStats?.dailyRevenue?.length
    ? Math.max(...revenueStats.dailyRevenue.map((d) => d.amount))
    : 0;

  const totalCategoryAmount = revenueStats?.categoryBreakdown?.reduce((sum, c) => sum + c.amount, 0) || 0;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Revenue & Analytics</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange((d) => ({ ...d, from: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          />
          <span className="text-gray-400 text-sm">to</span>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange((d) => ({ ...d, to: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          />
          <Button size="sm" variant="outline" onClick={loadData} disabled={loading}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </Button>
          <Button size="sm" variant="outline" onClick={handleExportCSV} disabled={exporting}>
            <Download size={14} className="mr-1" />
            {exporting ? "Exporting..." : "CSV"}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <IndianRupee size={16} className="text-green-600" />
            <span className="text-xs text-gray-500">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {loading ? "—" : formatCurrency(revenueStats?.totalRevenue || 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-blue-600" />
            <span className="text-xs text-gray-500">Daily Average</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {loading || !revenueStats?.dailyRevenue?.length
              ? "—"
              : formatCurrency(
                  Math.round(
                    revenueStats.dailyRevenue.reduce((s, d) => s + d.amount, 0) /
                      revenueStats.dailyRevenue.length
                  )
                )}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard size={16} className="text-purple-600" />
            <span className="text-xs text-gray-500">Refunded</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {loading ? "—" : revenueStats?.refundedPayments ?? 0}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={16} className="text-red-500" />
            <span className="text-xs text-gray-500">Failed</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {loading ? "—" : revenueStats?.failedPayments ?? 0}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "overview" ? "bg-white shadow-sm text-gray-800" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("transactions")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "transactions" ? "bg-white shadow-sm text-gray-800" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Transactions
        </button>
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Revenue Bar Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-700 mb-4">Daily Revenue</h3>
            {loading ? (
              <div className="h-48 flex items-center justify-center text-gray-400">Loading...</div>
            ) : !revenueStats?.dailyRevenue?.length ? (
              <div className="h-48 flex items-center justify-center text-gray-400">No data for selected range</div>
            ) : (
              <div className="flex items-end gap-1 h-48 overflow-x-auto pb-2">
                {revenueStats.dailyRevenue.map((day) => {
                  const heightPct = maxDailyAmount > 0 ? (day.amount / maxDailyAmount) * 100 : 0;
                  return (
                    <div key={day.date} className="flex flex-col items-center flex-shrink-0 group" style={{ minWidth: "28px" }}>
                      <div className="relative w-full flex justify-center">
                        <div
                          className="w-5 bg-green-500 rounded-t hover:bg-green-600 transition-colors cursor-default"
                          style={{ height: `${Math.max(heightPct, 2)}%`, minHeight: "2px" }}
                          title={`${day.date}: ${formatCurrency(day.amount)}`}
                        />
                        <div className="absolute -top-6 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          {formatCurrency(day.amount)}
                        </div>
                      </div>
                      <span className="text-[9px] text-gray-400 mt-1 rotate-[-45deg] origin-top-left whitespace-nowrap">
                        {day.date.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Category Breakdown Donut */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-700 mb-4">Category Breakdown</h3>
            {loading ? (
              <div className="h-48 flex items-center justify-center text-gray-400">Loading...</div>
            ) : !revenueStats?.categoryBreakdown?.length ? (
              <div className="h-48 flex items-center justify-center text-gray-400">No data</div>
            ) : (
              <div>
                {/* Donut chart using conic-gradient */}
                <div className="flex justify-center mb-4">
                  <div
                    className="w-36 h-36 rounded-full relative"
                    style={{
                      background: (() => {
                        let cumPct = 0;
                        const stops = revenueStats.categoryBreakdown.map((cat, i) => {
                          const pct = totalCategoryAmount > 0 ? (cat.amount / totalCategoryAmount) * 100 : 0;
                          const start = cumPct;
                          cumPct += pct;
                          return `${CATEGORY_COLORS[i % CATEGORY_COLORS.length]} ${start}% ${cumPct}%`;
                        });
                        return `conic-gradient(${stops.join(", ")})`;
                      })(),
                    }}
                  >
                    <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-700">{formatCurrency(totalCategoryAmount)}</span>
                    </div>
                  </div>
                </div>
                {/* Legend */}
                <div className="space-y-2">
                  {revenueStats.categoryBreakdown.map((cat, i) => (
                    <div key={cat.category} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                        />
                        <span className="text-gray-600 truncate max-w-[120px]">{cat.category}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium text-gray-800">{formatCurrency(cat.amount)}</span>
                        <span className="text-gray-400 text-xs ml-1">({cat.count})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "transactions" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">Transaction History</h3>
            {transactions && (
              <span className="text-xs text-gray-400">
                {transactions.totalElements} total transactions
              </span>
            )}
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading transactions...</div>
          ) : !transactions?.content?.length ? (
            <div className="p-8 text-center text-gray-400">No transactions found for the selected date range.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-5 py-3 text-gray-600 font-medium">ID</th>
                      <th className="text-left px-5 py-3 text-gray-600 font-medium">User</th>
                      <th className="text-left px-5 py-3 text-gray-600 font-medium">Listing</th>
                      <th className="text-left px-5 py-3 text-gray-600 font-medium">Amount</th>
                      <th className="text-left px-5 py-3 text-gray-600 font-medium">Status</th>
                      <th className="text-left px-5 py-3 text-gray-600 font-medium">Purpose</th>
                      <th className="text-left px-5 py-3 text-gray-600 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.content.map((tx) => (
                      <tr key={tx.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-5 py-3 font-mono text-xs text-gray-500">#{tx.id}</td>
                        <td className="px-5 py-3">
                          <div>
                            <span className="text-gray-800">{tx.userName}</span>
                            <span className="text-xs text-gray-400 ml-1">#{tx.userId}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-gray-600 max-w-[200px] truncate">{tx.listingTitle}</td>
                        <td className="px-5 py-3 font-semibold">{formatCurrency(tx.amount)}</td>
                        <td className="px-5 py-3">
                          <span
                            className={`text-xs px-2 py-1 rounded font-medium ${
                              tx.status === "PAID"
                                ? "bg-green-50 text-green-600"
                                : tx.status === "FAILED"
                                ? "bg-red-50 text-red-600"
                                : tx.status === "REFUNDED"
                                ? "bg-yellow-50 text-yellow-600"
                                : "bg-gray-50 text-gray-600"
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-500 text-xs">{tx.purpose}</td>
                        <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">
                          {tx.paidAt
                            ? new Date(tx.paidAt).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : new Date(tx.createdAt).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {transactions.totalPages > 1 && (
                <div className="px-5 py-3 border-t flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Page {transactions.number + 1} of {transactions.totalPages}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={transactions.number === 0}
                      onClick={() => setTxPage((p) => Math.max(0, p - 1))}
                    >
                      <ChevronLeft size={14} />
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={transactions.number >= transactions.totalPages - 1}
                      onClick={() => setTxPage((p) => p + 1)}
                    >
                      Next
                      <ChevronRight size={14} />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
