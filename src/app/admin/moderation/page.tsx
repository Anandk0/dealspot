"use client";
import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, XCircle, Flag, Clock, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { api, type ListingData, type ModerationStats, type PagedResponse } from "@/lib/api";
import { useAdminGuard } from "@/lib/useAdminGuard";

const PAGE_SIZE = 10;

export default function ModerationPage() {
  const { isAuthorized, isLoading: guardLoading } = useAdminGuard("CHECKER");

  const [queue, setQueue] = useState<PagedResponse<ListingData> | null>(null);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Rejection modal state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<ListingData | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  const fetchQueue = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.adminModerationQueue(page, PAGE_SIZE);
      setQueue(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load moderation queue");
    } finally {
      setLoading(false);
    }
  }, [page]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.adminModerationStats();
      setStats(data);
    } catch {
      // Stats are non-critical, silently fail
    }
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      fetchQueue();
      fetchStats();
    }
  }, [isAuthorized, fetchQueue, fetchStats]);

  const handleApprove = async (listing: ListingData) => {
    setActionLoading(listing.id);
    try {
      await api.adminApproveListing(listing.id);
      toast.success(`"${listing.title}" approved`);
      fetchQueue();
      fetchStats();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to approve listing");
    } finally {
      setActionLoading(null);
    }
  };

  const handleFlag = async (listing: ListingData) => {
    setActionLoading(listing.id);
    try {
      await api.adminFlagListing(listing.id);
      toast.warning(`"${listing.title}" flagged for review`);
      fetchQueue();
      fetchStats();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to flag listing");
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectDialog = (listing: ListingData) => {
    setRejectTarget(listing);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }

    setRejectSubmitting(true);
    try {
      await api.adminRejectListing(rejectTarget.id, rejectReason.trim());
      toast.error(`"${rejectTarget.title}" rejected`);
      setRejectDialogOpen(false);
      setRejectTarget(null);
      setRejectReason("");
      fetchQueue();
      fetchStats();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reject listing");
    } finally {
      setRejectSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "FLAGGED":
        return <Badge variant="destructive">Flagged</Badge>;
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatPrice = (price?: number) => {
    if (!price) return null;
    return `₹${price.toLocaleString("en-IN")}`;
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Moderation Queue</h1>
          <p className="text-sm text-gray-500">
            {queue ? `${queue.totalElements} listings pending review` : "Loading..."}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock size={20} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.pendingCount}</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.approvedToday}</p>
                <p className="text-xs text-gray-500">Approved Today</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.rejectedToday}</p>
                <p className="text-xs text-gray-500">Rejected Today</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Queue Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      ) : !queue || queue.content.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border">
          <CheckCircle2 size={48} className="mx-auto text-green-400 mb-3" />
          <p className="text-gray-500">All caught up! No pending listings.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {queue.content.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start gap-4"
              >
                {/* Thumbnail */}
                {item.images && item.images.length > 0 ? (
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-400 text-xs">No img</span>
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-800 truncate">{item.title}</p>
                    {getStatusBadge(item.status)}
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 flex-wrap">
                    {item.sellerName && <span>By {item.sellerName}</span>}
                    {item.location && <span>• {item.location}</span>}
                    {item.price != null && <span>• {formatPrice(item.price)}</span>}
                    <span>• {formatDate(item.createdAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(item)}
                    disabled={actionLoading === item.id}
                  >
                    <CheckCircle2 size={14} className="mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => openRejectDialog(item)}
                    disabled={actionLoading === item.id}
                  >
                    <XCircle size={14} className="mr-1" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-orange-600 border-orange-200 hover:bg-orange-50"
                    onClick={() => handleFlag(item)}
                    disabled={actionLoading === item.id}
                  >
                    <Flag size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {queue.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500">
                Page {queue.number + 1} of {queue.totalPages} ({queue.totalElements} total)
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft size={14} className="mr-1" />
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= queue.totalPages - 1}
                >
                  Next
                  <ChevronRight size={14} className="ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Rejection Reason Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Listing</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting &ldquo;{rejectTarget?.title}&rdquo;. This reason will be shown to the seller.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-24"
              aria-label="Rejection reason"
            />
            {rejectReason.length === 0 && (
              <p className="text-xs text-red-500 mt-1">Reason is required</p>
            )}
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleRejectSubmit}
              disabled={!rejectReason.trim() || rejectSubmitting}
            >
              {rejectSubmitting ? (
                <Loader2 size={14} className="mr-1 animate-spin" />
              ) : (
                <XCircle size={14} className="mr-1" />
              )}
              Reject Listing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
