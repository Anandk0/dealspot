"use client";
import { useState } from "react";
import { Camera } from "lucide-react";
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
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-xl font-bold text-gray-800 mb-6">ಪ್ರೊಫೈಲ್ ಬದಲಾಯಿಸಿ (Edit Profile)</h1>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-28 h-28 bg-primary/10 rounded-full flex items-center justify-center text-5xl">
                  👤
                </div>
                <button type="button" className="absolute bottom-1 right-1 w-9 h-9 bg-primary rounded-full flex items-center justify-center shadow-md">
                  <Camera size={16} className="text-white" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">ಹೆಸರು (Name)</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="h-11" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">ಫೋನ್ (Phone)</label>
                <Input value={user?.phone || ""} className="h-11" disabled />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">ಸ್ಥಳ (Location)</label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} className="h-11" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">ಜಿಲ್ಲೆ (District)</label>
                <Input value={district} onChange={(e) => setDistrict(e.target.value)} className="h-11" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving} className="bg-primary px-8 h-11">
                {saving ? "ಉಳಿಸಲಾಗುತ್ತಿದೆ..." : "ಉಳಿಸಿ (Save)"}
              </Button>
              <Link href="/profile">
                <Button type="button" variant="outline" className="h-11">
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
