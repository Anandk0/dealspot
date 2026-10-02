"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Loader2, Ban, ShieldCheck, Flag, MapPin, Phone, Mail,
  EyeOff, AlertTriangle, Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { api, UserModerationOverview, ListingData } from "@/lib/api";
import { useAdminGuard } from "@/lib/useAdminGuard";

type Tab = "reported" | "all";

export default function ReportedOwnerPage() {
  const params = useParams();
  const listingId = Number(params.listingId);
  const { isAuthorized, isLoading: guardLoading } = useAdminGuard("CHECKER");

  const [data, setData] = useState<UserModerationOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("reported");
  const [busy, setBusy] = useState(false);
  const [takenDown, setTakenDown] = useState<Set<number>>(new Set());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.adminGetOwnerOverview(listingId);
      setData(res);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    if (isAuthorized) fetchData();
  }, [isAuthorized, fetchData]);

  const handleBanToggle = async () => {
    if (!data) return;
    const { owner } = data;
    if (owner.banned) {
      if (!confirm(`Unban ${owner.name}?`)) return;
      setBusy(true);
      try {
        await api.adminUnbanUser(owner.id);
        toast.success("User unbanned");
        fetchData();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to unban");
      } finally {
        setBusy(false);
      }
    } else {
      const reason = window.prompt(`Reason for banning ${owner.name}:`);
      if (reason == null) return;
      if (!reason.trim()) {
        toast.error("A reason is required");
        return;
      }
      setBusy(true);
      try {
        await api.adminBanUser(owner.id, reason.trim());
        toast.success("User banned");
        fetchData();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to ban");
      } finally {
        setBusy(false);
      }
    }
  };

  const handleTakeDown = async (id: number, title: string) => {
    const reason = window.prompt(`Reason for taking down "${title}":`);
    if (reason == null) return;
    if (!reason.trim()) {
      toast.error("A reason is required");
      return;
    }
    try {
      await api.adminTakeDownListing(id, reason.trim());
      toast.success("Ad hidden from public (not deleted)");
      setTakenDown((prev) => new Set(prev).add(id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to take down");
    }
  };

  if (guardLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  if (!isAuthorized) return null;

  if (!data) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>Could not load this report.</p>
        <Link href="/admin/reports" className="text-primary hover:underline mt-2 inline-block">← Back to Reports</Link>
      </div>
    );
  }

  const { owner, reportedListings, allListings } = data;

  // Group all listings by category for the "All Posted Ads" tab.
  const byCategory = allListings.reduce<Record<string, ListingData[]>>((acc, l) => {
    (acc[l.category] = acc[l.category] || []).push(l);
    return acc;
  }, {});

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-700",
      PENDING: "bg-yellow-100 text-yellow-700",
      REJECTED: "bg-red-100 text-red-700",
      FLAGGED: "bg-orange-100 text-orange-700",
      SOLD: "bg-blue-100 text-blue-700",
      EXPIRED: "bg-gray-100 text-gray-700",
    };
    return map[status] || "bg-gray-100 text-gray-700";
  };

  const renderAdRow = (l: ListingData, reasons?: string[], reportCount?: number) => {
    const isHidden = l.status === "REJECTED" || takenDown.has(l.id);
    return (
      <div key={l.id} className="flex items-start gap-3 p-3 rounded-xl border border-border bg-background">
        <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0 flex items-center justify-center">
          {l.images && l.images.length > 0 ? (
            <img src={l.images[0]} alt="" className="w-full h-full object-cover" />
          ) : (
            <Package size={20} className="text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/category/view/${l.id}`} className="font-medium text-foreground hover:text-primary truncate">
              {l.title}
            </Link>
            <Badge variant="secondary" className={`text-[10px] ${statusBadge(l.status)}`}>{l.status}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 capitalize">{l.category.replace(/-/g, " ")}</p>
          {reasons && reasons.length > 0 && (
            <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
              <AlertTriangle size={11} /> {reportCount} report{reportCount === 1 ? "" : "s"}: {reasons.join(", ")}
            </p>
          )}
        </div>
        <div className="shrink-0">
          {isHidden ? (
            <span className="inline-flex items-center gap-1 text-xs text-red-500 font-medium">
              <EyeOff size={13} /> Hidden
            </span>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-red-600 border-red-300 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/30"
              onClick={() => handleTakeDown(l.id, l.title)}
            >
              <EyeOff size={13} className="mr-1" /> Take Down
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <Link href="/admin/reports" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-4">
        <ArrowLeft size={16} /> Back to Reports
      </Link>

      {/* Owner details header */}
      <div className="bg-card rounded-2xl border border-border shadow-sm p-5 mb-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl shrink-0">
              👤
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-foreground">{owner.name}</h1>
                <Badge variant="secondary" className="text-[10px] bg-purple-100 text-purple-700">{owner.role}</Badge>
                {owner.banned && (
                  <Badge variant="secondary" className="text-[10px] bg-red-100 text-red-700 flex items-center gap-1">
                    <Ban size={10} /> Banned
                  </Badge>
                )}
              </div>
              <div className="mt-1.5 space-y-1 text-sm text-muted-foreground">
                <p className="flex items-center gap-1.5"><Phone size={13} /> {owner.phone}</p>
                {owner.email && <p className="flex items-center gap-1.5"><Mail size={13} /> {owner.email}</p>}
                {(owner.location || owner.district) && (
                  <p className="flex items-center gap-1.5">
                    <MapPin size={13} /> {[owner.location, owner.district].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
              {owner.banned && owner.banReason && (
                <p className="text-xs text-red-500 mt-1.5">Ban reason: {owner.banReason}</p>
              )}
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                <span>{owner.totalListings} total ads</span>
                <span>{owner.activeListings} active</span>
                <span>Joined {new Date(owner.createdAt).toLocaleDateString("en-IN")}</span>
              </div>
            </div>
          </div>
          <Button
            onClick={handleBanToggle}
            disabled={busy}
            className={owner.banned
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-red-600 hover:bg-red-700 text-white"}
          >
            {busy ? <Loader2 size={16} className="mr-2 animate-spin" /> : owner.banned ? <ShieldCheck size={16} className="mr-2" /> : <Ban size={16} className="mr-2" />}
            {owner.banned ? "Unban User" : "Ban User"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-border">
        <button
          onClick={() => setTab("reported")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
            tab === "reported" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="inline-flex items-center gap-1.5"><Flag size={14} /> Reported Ads ({reportedListings.length})</span>
        </button>
        <button
          onClick={() => setTab("all")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
            tab === "all" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="inline-flex items-center gap-1.5"><Package size={14} /> All Posted Ads ({allListings.length})</span>
        </button>
      </div>

      {/* Reported Ads tab */}
      {tab === "reported" && (
        <div className="space-y-3">
          {reportedListings.length === 0 ? (
            <div className="text-center py-14 bg-card rounded-2xl border border-border text-muted-foreground">
              <Flag size={36} className="mx-auto mb-3 text-muted-foreground/40" />
              <p>No reported ads for this user.</p>
            </div>
          ) : (
            reportedListings.map((r) => renderAdRow(r.listing, r.reasons, r.reportCount))
          )}
        </div>
      )}

      {/* All Posted Ads tab — grouped by category */}
      {tab === "all" && (
        <div className="space-y-6">
          {allListings.length === 0 ? (
            <div className="text-center py-14 bg-card rounded-2xl border border-border text-muted-foreground">
              <Package size={36} className="mx-auto mb-3 text-muted-foreground/40" />
              <p>This user hasn&apos;t posted any ads.</p>
            </div>
          ) : (
            Object.entries(byCategory).map(([category, ads]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 capitalize">
                  {category.replace(/-/g, " ")} ({ads.length})
                </h3>
                <div className="space-y-2">
                  {ads.map((l) => renderAdRow(l))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
