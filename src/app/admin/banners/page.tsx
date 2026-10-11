"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Loader2, Image, Link as LinkIcon, Calendar, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { api, type BannerResponse, type CreateBannerRequest } from "@/lib/api";
import { useAdminGuard, hasMinimumRole } from "@/lib/useAdminGuard";
import { useAuth } from "@/lib/auth-context";

export default function BannersPage() {
  const { isAuthorized, isLoading: guardLoading } = useAdminGuard("CHECKER");
  const { user } = useAuth();

  // ADMIN/SUPER_ADMIN can delete any banner; a CHECKER can only delete their own.
  const canDeleteBanner = (banner: BannerResponse) =>
    hasMinimumRole(user?.role, "ADMIN") || banner.createdById === user?.id;

  // ADMIN/SUPER_ADMIN can edit banners.
  const canEditBanner = hasMinimumRole(user?.role, "ADMIN");

  const [banners, setBanners] = useState<BannerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BannerResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // When set, the dialog is in edit mode for this banner; null = create mode.
  const [editTarget, setEditTarget] = useState<BannerResponse | null>(null);

  // Shared form state (create + edit)
  const [formTitle, setFormTitle] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formImage, setFormImage] = useState<File | null>(null);
  const [formLink, setFormLink] = useState("");
  const [formColor, setFormColor] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formActive, setFormActive] = useState(true);

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.adminBanners();
      setBanners(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load banners");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      fetchBanners();
    }
  }, [isAuthorized, fetchBanners]);

  const resetForm = () => {
    setFormTitle("");
    setFormSubtitle("");
    setFormImage(null);
    setFormLink("");
    setFormColor("");
    setFormStartDate("");
    setFormEndDate("");
    setFormActive(true);
  };

  const openCreate = () => {
    setEditTarget(null);
    resetForm();
    setCreateDialogOpen(true);
  };

  const openEdit = (b: BannerResponse) => {
    setEditTarget(b);
    setFormTitle(b.title || "");
    setFormSubtitle(b.subtitle || "");
    setFormImage(null);
    setFormLink(b.link || "");
    setFormColor(b.color || "");
    setFormStartDate(b.startDate ? b.startDate.slice(0, 10) : "");
    setFormEndDate(b.endDate ? b.endDate.slice(0, 10) : "");
    setFormActive(b.active);
    setCreateDialogOpen(true);
  };

  const handleCreate = async () => {
    // Title and subtitle are optional now — a banner can be image-only.
    try {
      setSubmitting(true);
      const formData = new FormData();
      if (formTitle.trim()) formData.append("title", formTitle.trim());
      if (formSubtitle.trim()) formData.append("subtitle", formSubtitle.trim());
      if (formLink.trim()) formData.append("link", formLink.trim());
      if (formColor.trim()) formData.append("color", formColor.trim());
      if (formStartDate) formData.append("startDate", formStartDate);
      if (formEndDate) formData.append("endDate", formEndDate);
      if (formImage) formData.append("image", formImage);

      await api.adminCreateBannerUpload(formData);
      toast.success("Banner created");
      setCreateDialogOpen(false);
      resetForm();
      fetchBanners();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create banner");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editTarget) return;
    try {
      setSubmitting(true);
      // Update text fields via JSON PUT.
      await api.adminUpdateBanner(editTarget.id, {
        title: formTitle.trim(),
        subtitle: formSubtitle.trim(),
        link: formLink.trim(),
        color: formColor.trim(),
        active: formActive,
        startDate: formStartDate ? `${formStartDate}T00:00:00` : undefined,
        endDate: formEndDate ? `${formEndDate}T23:59:59` : undefined,
      } as Record<string, unknown>);

      // If a new image was chosen, upload it separately.
      if (formImage) {
        const fd = new FormData();
        fd.append("image", formImage);
        await api.adminUpdateBannerImage(editTarget.id, fd);
      }

      toast.success("Banner updated");
      setCreateDialogOpen(false);
      setEditTarget(null);
      resetForm();
      fetchBanners();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update banner");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitDialog = () => (editTarget ? handleUpdate() : handleCreate());

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setSubmitting(true);
      await api.adminDeleteBanner(deleteTarget.id);
      toast.success("Banner deleted");
      setDeleteTarget(null);
      fetchBanners();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete banner");
    } finally {
      setSubmitting(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-foreground">Banners & Promotions</h1>
          <p className="text-sm text-muted-foreground">Manage home page banners</p>
        </div>
        <Button className="bg-primary" onClick={openCreate}>
          <Plus size={16} className="mr-2" /> New Banner
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-muted-foreground" size={32} />
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Image size={48} className="mx-auto mb-3 text-muted-foreground/70" />
          <p className="text-lg font-medium">No banners yet</p>
          <p className="text-sm">Create your first banner to display on the home page.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-card rounded-xl overflow-hidden shadow-sm border border-border">
              <div
                className={`p-6 text-white ${
                  banner.color
                    ? `bg-gradient-to-r ${banner.color}`
                    : "bg-gradient-to-r from-primary to-primary/80"
                }`}
              >
                <h3 className="text-lg font-bold">{banner.title}</h3>
                {banner.subtitle && <p className="text-sm text-white/80">{banner.subtitle}</p>}
              </div>
              {banner.imageUrl && (
                <div className="px-4 pt-3">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={banner.active ? "default" : "secondary"}>
                    {banner.active ? "Active" : "Inactive"}
                  </Badge>
                  {banner.startDate && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar size={10} />
                      {new Date(banner.startDate).toLocaleDateString()} – {banner.endDate ? new Date(banner.endDate).toLocaleDateString() : "∞"}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {banner.link && (
                    <a
                      href={banner.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <LinkIcon size={14} />
                    </a>
                  )}
                  {canEditBanner && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7"
                      onClick={() => openEdit(banner)}
                    >
                      <Pencil size={12} className="mr-1" /> Edit
                    </Button>
                  )}
                  {canDeleteBanner(banner) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500 h-7"
                      onClick={() => setDeleteTarget(banner)}
                    >
                      <Trash2 size={12} className="mr-1" /> Delete
                    </Button>
                  )}
                </div>
              </div>
              {banner.createdByName && (
                <div className="px-4 pb-3 -mt-1">
                  <span className="text-[11px] text-muted-foreground">
                    Created by {banner.createdByName}
                    {banner.createdById === user?.id ? " (you)" : ""}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Banner Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Banner" : "Create Banner"}</DialogTitle>
            <DialogDescription>
              {editTarget ? "Update this banner's details." : "Add a new banner to the home page carousel."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 max-h-[65vh] overflow-y-auto">
            <div>
              <label className="text-sm font-medium text-foreground">Title <span className="text-muted-foreground font-normal">(optional)</span></label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Banner title"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Subtitle</label>
              <Input
                value={formSubtitle}
                onChange={(e) => setFormSubtitle(e.target.value)}
                placeholder="Banner subtitle"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Banner Image {editTarget && <span className="text-muted-foreground font-normal">(choose a file to replace)</span>}
              </label>
              {editTarget?.imageUrl && !formImage && (
                <img src={editTarget.imageUrl} alt="" className="w-full h-24 object-cover rounded-lg my-2 border border-border" />
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setFormImage(e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
              {formImage && (
                <p className="text-xs text-muted-foreground mt-1">{formImage.name}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Link URL</label>
              <Input
                value={formLink}
                onChange={(e) => setFormLink(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Color (Tailwind gradient classes)</label>
              <Input
                value={formColor}
                onChange={(e) => setFormColor(e.target.value)}
                placeholder="from-green-500 to-green-700"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">Start Date</label>
                <Input
                  type="date"
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">End Date</label>
                <Input
                  type="date"
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                />
              </div>
            </div>
            {editTarget && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm font-medium text-foreground">Active (shown on home page)</span>
              </label>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmitDialog} disabled={submitting}>
              {submitting && <Loader2 size={14} className="mr-2 animate-spin" />}
              {editTarget ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Banner</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.title}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting && <Loader2 size={14} className="mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
