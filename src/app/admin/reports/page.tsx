"use client";
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Loader2, Flag, ExternalLink, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { api, ReportResponse, PagedResponse } from "@/lib/api";
import { useAdminGuard } from "@/lib/useAdminGuard";

function getReasonBadgeClass(reason: string): string {
  const r = reason.toLowerCase();
  if (r.includes("fraud") || r.includes("scam")) return "bg-red-100 text-red-700 hover:bg-red-100";
  if (r.includes("spam")) return "bg-orange-100 text-orange-700 hover:bg-orange-100";
  if (r.includes("inappropriate") || r.includes("abuse")) return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
  if (r.includes("duplicate")) return "bg-blue-100 text-blue-700 hover:bg-blue-100";
  return "bg-gray-100 text-gray-700 hover:bg-gray-100";
}

function formatTimestamp(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ReportsPage() {
  const { isAuthorized, isLoading: guardLoading } = useAdminGuard("CHECKER");

  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(true);

  const [resolving, setResolving] = useState<number | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const data: PagedResponse<ReportResponse> = await api.adminGetReports(page, pageSize);
      setReports(data.content);
      setTotalElements(data.totalElements);
      setTotalPages(data.totalPages);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  const handleResolve = async (reportId: number) => {
    setResolving(reportId);
    try {
      await api.adminResolveReport(reportId);
      toast.success("Report resolved");
      // Drop it from the current view immediately.
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      setTotalElements((n) => Math.max(0, n - 1));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to resolve report");
    } finally {
      setResolving(null);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchReports();
    }
  }, [isAuthorized, fetchReports]);

  if (guardLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Flag size={22} className="text-red-500" /> Reports
          </h1>
          <p className="text-sm text-muted-foreground">{totalElements} pending report{totalElements === 1 ? "" : "s"}</p>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-muted-foreground" size={28} />
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Flag size={40} className="mb-3 text-muted-foreground/40" />
            <p className="text-base font-medium">No pending reports</p>
            <p className="text-sm">Reported listings will appear here for review.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Reported</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Target</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Reason</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Details</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted">
                  <td className="px-5 py-3 text-muted-foreground text-xs whitespace-nowrap">
                    {formatTimestamp(r.createdAt)}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {r.targetType} #{r.targetId}
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant="secondary" className={`text-xs ${getReasonBadgeClass(r.reason)}`}>
                      {r.reason}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground text-xs max-w-[260px]">
                    {r.description ? (
                      <span className="whitespace-pre-wrap break-words">{r.description}</span>
                    ) : (
                      <span className="text-muted-foreground/70">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {r.targetType === "LISTING" && (
                        <Link
                          href={`/admin/reports/${r.targetId}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          Review <ExternalLink size={12} />
                        </Link>
                      )}
                      <button
                        onClick={() => handleResolve(r.id)}
                        disabled={resolving === r.id}
                        className="inline-flex items-center gap-1 text-xs font-medium text-green-600 hover:underline disabled:opacity-50"
                      >
                        {resolving === r.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Check size={12} />
                        )}
                        Resolve
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
              <ChevronLeft size={14} className="mr-1" /> Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
              Next <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
