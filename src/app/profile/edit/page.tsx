"use client";
import { Camera } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";

export default function EditProfilePage() {
  const router = useRouter();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("ಪ್ರೊಫೈಲ್ ಉಳಿಸಲಾಗಿದೆ! (Profile Saved)");
    router.push("/profile");
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
                <Input defaultValue="ರಾಮಣ್ಣ" className="h-11" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">ಫೋನ್ (Phone)</label>
                <Input defaultValue="+91 98765 43210" className="h-11" disabled />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">ಸ್ಥಳ (Location)</label>
                <Input defaultValue="ಮಂಡ್ಯ" className="h-11" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">ಜಿಲ್ಲೆ (District)</label>
                <Input defaultValue="ಮಂಡ್ಯ" className="h-11" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="bg-primary px-8 h-11">
                ಉಳಿಸಿ (Save)
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
