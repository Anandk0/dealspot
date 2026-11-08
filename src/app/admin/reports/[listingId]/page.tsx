"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Ban, ShieldCheck, Flag, MapPin, Phone, Mail, EyeOff, AlertTriangle, Package, User } from "lucide-react";
import LeafLoader from "@/components/LeafLoader";
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
        <LeafLoader className=" text-muted-foreground" size={32} />
      </div>
    );
  }

  if (!isAuthorized) return null;

  if (!data) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>Could not load this report.</p>
        <Link href="/admin/reports" className="text-primary hover:underline mt-2 inline-block">← Back to reports</Link>
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
      ACTIVE: "bg-primary/10 text-primary",
      REJECTED: "bg-destructive/10 text-destructive",
      FLAGGED: "bg-destructive/10 text-destructive",
    };
    return map[status] || "bg-muted text-muted-foreground";
  };

  const renderAdRow = (l: ListingData, reasons?: string[], reportCount?: number) => {
    const isHidden = l.status === "REJECTED" || takenDown.has(l.id);
    return (
      <div key={l.id} className="flex items-start gap-3 p-3 rounded-xl border border-border bg-background">
        <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0 flex items-center justify-center">
          {l.images && l.images.length > 0 ? (
            <img src={l.images[0]} alt="" className="w-full h-full object-cover" />
          ) : (
            <Package size={18} strokeWidth={1.5} className="text-muted-foreground" />
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
            <p className="text-xs text-destructive mt-1 flex items-center gap-1">
              <AlertTriangle size={12} strokeWidth={1.5} /> {reportCount} report{reportCount === 1 ? "" : "s"}: {reasons.join(", ")}
            </p>
          )}
        </div>
        <div className="shrink-0">
          {isHidden ? (
            <span className="inline-flex items-center gap-1 text-xs text-destructive font-medium">
              <EyeOff size={16} strokeWidth={1.5} /> Hidden
            </span>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => handleTakeDown(l.id, l.title)}
            >
              <EyeOff size={16} strokeWidth={1.5} className="mr-1" /> Take down
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <Link href="/admin/reports" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-4">
        <ArrowLeft size={16} strokeWidth={1.5} /> Back to reports
      </Link>

      {/* Owner details header */}
      <div className="bg-card rounded-xl border border-border p-5 mb-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center shrink-0">
              <User size={18} strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-semibold text-foreground">{owner.name}</h1>
                <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">{owner.role}</Badge>
                {owner.banned && (
                  <Badge variant="secondary" className="text-xs bg-destructive/10 text-destructive flex items-center gap-1">
                    <Ban size={12} strokeWidth={1.5} /> Banned
                  </Badge>
                )}
              </div>
              <div className="mt-1.5 space-y-1 text-sm text-muted-foreground">
                <p className="flex items-center gap-1.5"><Phone size={16} strokeWidth={1.5} /> {owner.phone}</p>
                {owner.email && <p className="flex items-center gap-1.5"><Mail size={16} strokeWidth={1.5} /> {owner.email}</p>}
                {(owner.location || owner.district) && (
                  <p className="flex items-center gap-1.5">
                    <MapPin size={16} strokeWidth={1.5} /> {[owner.location, owner.district].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
              {owner.banned && owner.banReason && (
                <p className="text-xs text-destructive mt-1.5">Ban reason: {owner.banReason}</p>
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
              ? "bg-primary hover:bg-primary/90 text-primary-foreground"
              : "bg-destructive hover:bg-destructive/90 text-destructive-foreground"}
          >
            {busy ? <LeafLoader size={16} className="mr-2" /> : owner.banned ? <ShieldCheck size={16} strokeWidth={1.5} className="mr-2" /> : <Ban size={16} strokeWidth={1.5} className="mr-2" />}
            {owner.banned ? "Unban user" : "Ban user"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-border">
        <button
          onClick={() => setTab("reported")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            tab === "reported" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="inline-flex items-center gap-1.5"><Flag size={16} strokeWidth={1.5} /> Reported ads ({reportedListings.length})</span>
        </button>
        <button
          onClick={() => setTab("all")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            tab === "all" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="inline-flex items-center gap-1.5"><Package size={16} strokeWidth={1.5} /> All posted ads ({allListings.length})</span>
        </button>
      </div>

      {/* Reported Ads tab */}
      {tab === "reported" && (
        <div className="space-y-3">
          {reportedListings.length === 0 ? (
            <div className="text-center py-14 bg-card rounded-xl border border-border text-muted-foreground">
              <Flag size={32} strokeWidth={1.5} className="mx-auto mb-3 text-muted-foreground/60" />
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
            <div className="text-center py-14 bg-card rounded-xl border border-border text-muted-foreground">
              <Package size={32} strokeWidth={1.5} className="mx-auto mb-3 text-muted-foreground/60" />
              <p>This user hasn&apos;t posted any ads.</p>
            </div>
          ) : (
            Object.entries(byCategory).map(([category, ads]) => (
              <div key={category}>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 capitalize">
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
