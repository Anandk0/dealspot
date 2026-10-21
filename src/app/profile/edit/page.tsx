"use client";
import { useState, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [location, setLocation] = useState(user?.location || "");
  const [district, setDistrict] = useState(user?.district || "");
  const [saving, setSaving] = useState(false);

  // Profile image upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string | undefined>(user?.profileImage);
  const [uploading, setUploading] = useState(false);

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("ಚಿತ್ರ ಫೈಲ್ ಮಾತ್ರ (Please choose an image)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("ಗರಿಷ್ಠ 5MB (Max 5MB)");
      return;
    }
    setUploading(true);
    try {
      const updated = await api.uploadProfileImage(file);
      setImageUrl(updated.profileImage);
      await refreshProfile();
      toast.success("ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಆಗಿದೆ (Photo uploaded)");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateProfile({ name, location, district });
      await refreshProfile();
      toast.success("ಪ್ರೊಫೈಲ್ ಉಳಿಸಲಾಗಿದೆ! (Profile Saved)");
      router.push("/profile");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save profile";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-5 sm:p-6 pb-28 lg:pb-8">
        <h1 className="text-xl font-bold text-foreground mb-4 sm:mb-6">ಪ್ರೊಫೈಲ್ ಬದಲಾಯಿಸಿ (Edit Profile)</h1>

        <div className="bg-card rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm border border-border">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-primary/10 rounded-full flex items-center justify-center text-4xl sm:text-5xl overflow-hidden">
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    "👤"
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                      <Loader2 size={22} className="text-white animate-spin" />
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImagePick}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-1 right-1 w-8 h-8 sm:w-9 sm:h-9 bg-primary rounded-full flex items-center justify-center shadow-md disabled:opacity-60"
                  aria-label="Change profile photo"
                >
                  <Camera size={16} className="text-white" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">ಹೆಸರು (Name)</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="h-11 bg-background" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">ಫೋನ್ (Phone)</label>
                <Input value={user?.phone || ""} className="h-11 bg-muted" disabled />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">ಸ್ಥಳ (Location)</label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} className="h-11 bg-background" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">ಜಿಲ್ಲೆ (District)</label>
                <Input value={district} onChange={(e) => setDistrict(e.target.value)} className="h-11 bg-background" />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit" disabled={saving} className="bg-primary px-6 sm:px-8 h-11 flex-1 sm:flex-none">
                {saving ? "ಉಳಿಸಲಾಗುತ್ತಿದೆ..." : "ಉಳಿಸಿ (Save)"}
              </Button>
              <Link href="/profile" className="flex-1 sm:flex-none">
                <Button type="button" variant="outline" className="h-11 w-full">
                  ರದ್ದುಮಾಡಿ (Cancel)
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
