"use client";
import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, XCircle, Flag, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import LeafLoader from "@/components/LeafLoader";
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
        return <Badge variant="secondary" className="bg-muted text-muted-foreground">Pending</Badge>;
      case "FLAGGED":
        return <Badge variant="destructive">Flagged</Badge>;
      case "ACTIVE":
        return <Badge className="bg-primary/10 text-primary">Active</Badge>;
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
        <LeafLoader className=" text-muted-foreground" size={32} />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h1 className="text-lg sm:text-2xl font-semibold text-foreground">Moderation queue</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {queue ? `${queue.totalElements} listings pending review` : "Loading..."}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
          <div className="bg-card rounded-xl p-3 sm:p-4 border border-border">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Clock strokeWidth={1.5} className="text-foreground w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-semibold text-foreground leading-none">{stats.pendingCount}</p>
                <p className="text-xs text-muted-foreground mt-1">Pending</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-3 sm:p-4 border border-border">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <CheckCircle2 strokeWidth={1.5} className="text-foreground w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-semibold text-foreground leading-none">{stats.approvedToday}</p>
                <p className="text-xs text-muted-foreground mt-1">Approved today</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-3 sm:p-4 border border-border">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <XCircle strokeWidth={1.5} className="text-foreground w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-semibold text-foreground leading-none">{stats.rejectedToday}</p>
                <p className="text-xs text-muted-foreground mt-1">Rejected today</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Queue Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LeafLoader className=" text-muted-foreground" size={32} />
        </div>
      ) : !queue || queue.content.length === 0 ? (
        <div className="bg-card rounded-xl p-8 sm:p-12 text-center border border-border">
          <CheckCircle2 size={32} strokeWidth={1.5} className="mx-auto text-primary mb-3" />
          <p className="text-sm sm:text-base text-muted-foreground">All caught up. No pending listings.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {queue.content.map((item) => (
              <div
                key={item.id}
                className="bg-card rounded-xl p-4 lg:p-5 border border-border flex flex-col sm:flex-row items-start gap-3 sm:gap-4"
              >
                {/* Thumbnail */}
                {item.images && item.images.length > 0 ? (
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full sm:w-16 h-32 sm:h-16 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-full sm:w-16 h-32 sm:h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <span className="text-muted-foreground text-xs">No img</span>
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-foreground truncate">{item.title}</p>
                    {getStatusBadge(item.status)}
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                    {item.sellerName && <span>By {item.sellerName}</span>}
                    {item.location && <span>• {item.location}</span>}
                    {item.price != null && <span>• {formatPrice(item.price)}</span>}
                    <span>• {formatDate(item.createdAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 sm:flex-none text-xs sm:text-sm"
                    onClick={() => handleApprove(item)}
                    disabled={actionLoading === item.id}
                  >
                    {actionLoading === item.id
                      ? <LeafLoader size={14} className=" mr-1" />
                      : <CheckCircle2 size={14} className="mr-1" />}
                    <span>Approve</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1 sm:flex-none text-xs sm:text-sm"
                    onClick={() => openRejectDialog(item)}
                    disabled={actionLoading === item.id}
                  >
                    <XCircle size={14} className="mr-1" />
                    <span>Reject</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    aria-label="Flag listing"
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
              <p className="text-sm text-muted-foreground">
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
            <DialogTitle>Reject listing</DialogTitle>
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
              <p className="text-xs text-destructive mt-1">Reason is required</p>
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
                <LeafLoader size={14} className="mr-1" />
              ) : (
                <XCircle size={14} className="mr-1" />
              )}
              Reject listing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
