"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Loader2, Image, Link as LinkIcon, Calendar } from "lucide-react";
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
import { useAdminGuard } from "@/lib/useAdminGuard";

export default function BannersPage() {
  const { isAuthorized, isLoading: guardLoading } = useAdminGuard("ADMIN");

  const [banners, setBanners] = useState<BannerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BannerResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Create form state
  const [formTitle, setFormTitle] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formImage, setFormImage] = useState<File | null>(null);
  const [formLink, setFormLink] = useState("");
  const [formColor, setFormColor] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");

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
  };

  const handleCreate = async () => {
    if (!formTitle.trim()) {
      toast.error("Banner title is required");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("title", formTitle.trim());
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
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Banners & Promotions</h1>
          <p className="text-sm text-gray-500">Manage home page banners</p>
        </div>
        <Button className="bg-primary" onClick={() => setCreateDialogOpen(true)}>
          <Plus size={16} className="mr-2" /> New Banner
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Image size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">No banners yet</p>
          <p className="text-sm">Create your first banner to display on the home page.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
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
                    <span className="text-xs text-gray-400 flex items-center gap-1">
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
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <LinkIcon size={14} />
                    </a>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-500 h-7"
                    onClick={() => setDeleteTarget(banner)}
                  >
                    <Trash2 size={12} className="mr-1" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Banner Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Banner</DialogTitle>
            <DialogDescription>Add a new banner to the home page carousel.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Title *</label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Banner title"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Subtitle</label>
              <Input
                value={formSubtitle}
                onChange={(e) => setFormSubtitle(e.target.value)}
                placeholder="Banner subtitle"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Banner Image</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setFormImage(e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
              {formImage && (
                <p className="text-xs text-gray-500 mt-1">{formImage.name}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Link URL</label>
              <Input
                value={formLink}
                onChange={(e) => setFormLink(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Color (Tailwind gradient classes)</label>
              <Input
                value={formColor}
                onChange={(e) => setFormColor(e.target.value)}
                placeholder="from-green-500 to-green-700"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Start Date</label>
                <Input
                  type="date"
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">End Date</label>
                <Input
                  type="date"
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting && <Loader2 size={14} className="mr-2 animate-spin" />}
              Create
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
