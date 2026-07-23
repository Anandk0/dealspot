"use client";
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Loader2, Filter, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { api, AuditLogEntry, PagedResponse } from "@/lib/api";
import { useAdminGuard } from "@/lib/useAdminGuard";

const ACTION_TYPES = [
  "ALL",
  "APPROVE_LISTING",
  "REJECT_LISTING",
  "FLAG_LISTING",
  "BAN_USER",
  "UNBAN_USER",
  "CHANGE_ROLE",
  "CREATE_BANNER",
  "UPDATE_BANNER",
  "DELETE_BANNER",
  "UPDATE_SETTING",
  "FEATURE_LISTING",
  "UNFEATURE_LISTING",
] as const;

function getActionBadgeClass(action: string): string {
  if (action.includes("APPROVE") || action.includes("UNBAN") || action.includes("FEATURE")) {
    return "bg-green-100 text-green-700 hover:bg-green-100";
  }
  if (action.includes("REJECT") || action.includes("BAN") || action.includes("DELETE")) {
    return "bg-red-100 text-red-700 hover:bg-red-100";
  }
  if (action.includes("FLAG")) {
    return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
  }
  if (action.includes("ROLE") || action.includes("SETTING")) {
    return "bg-purple-100 text-purple-700 hover:bg-purple-100";
  }
  return "bg-gray-100 text-gray-700 hover:bg-gray-100";
}

function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AuditPage() {
  const { isAuthorized, isLoading: guardLoading } = useAdminGuard("SUPER_ADMIN");

  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [actionFilter, setActionFilter] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Expanded details row
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const action = actionFilter === "ALL" ? undefined : actionFilter;
      const from = fromDate || undefined;
      const to = toDate || undefined;
      const data: PagedResponse<AuditLogEntry> = await api.adminAuditLogs(page, pageSize, action, from, to);
      setLogs(data.content);
      setTotalElements(data.totalElements);
      setTotalPages(data.totalPages);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, actionFilter, fromDate, toDate]);

  useEffect(() => {
    if (isAuthorized) {
      fetchLogs();
    }
  }, [isAuthorized, fetchLogs]);

  const handleFilterApply = () => {
    setPage(0);
    fetchLogs();
  };

  const handleClearFilters = () => {
    setActionFilter("ALL");
    setFromDate("");
    setToDate("");
    setPage(0);
  };

  const toggleDetails = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (guardLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Audit Logs</h1>
          <p className="text-sm text-gray-500">{totalElements} total entries</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={16} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          {/* Action type filter */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Action Type</label>
            <Select value={actionFilter} onValueChange={(val) => setActionFilter(val ?? "ALL")}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                {ACTION_TYPES.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action === "ALL" ? "All Actions" : action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date range filters */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar size={12} /> From
            </label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-[160px] h-9"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar size={12} /> To
            </label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-[160px] h-9"
            />
          </div>

          <Button size="sm" onClick={handleFilterApply} className="h-9">
            Apply
          </Button>
          <Button size="sm" variant="outline" onClick={handleClearFilters} className="h-9">
            Clear
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-gray-400" size={28} />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-gray-500">
            No audit logs found
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-5 py-3 text-gray-600 font-medium">Timestamp</th>
                <th className="text-left px-5 py-3 text-gray-600 font-medium">Actor</th>
                <th className="text-left px-5 py-3 text-gray-600 font-medium">Action</th>
                <th className="text-left px-5 py-3 text-gray-600 font-medium">Target</th>
                <th className="text-left px-5 py-3 text-gray-600 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {formatTimestamp(log.createdAt)}
                  </td>
                  <td className="px-5 py-3 font-medium">
                    {log.actorName || `User #${log.actorId}`}
                  </td>
                  <td className="px-5 py-3">
                    <Badge
                      variant="secondary"
                      className={`text-xs font-mono ${getActionBadgeClass(log.action)}`}
                    >
                      {log.action}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {log.targetType} #{log.targetId}
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs max-w-[200px]">
                    {log.details ? (
                      <span
                        className="cursor-pointer hover:text-gray-700"
                        onClick={() => toggleDetails(log.id)}
                        title={expandedId === log.id ? "Click to collapse" : "Click to expand"}
                      >
                        {expandedId === log.id ? (
                          <span className="whitespace-pre-wrap break-words">{log.details}</span>
                        ) : (
                          <span className="truncate block max-w-[200px]">
                            {log.details.length > 50
                              ? `${log.details.substring(0, 50)}…`
                              : log.details}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft size={14} className="mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
