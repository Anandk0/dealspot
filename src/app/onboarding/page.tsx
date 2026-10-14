"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { Loader2, CheckCircle2 } from "lucide-react";

/**
 * One-time onboarding after Google sign-in: collect the phone number (required)
 * and let the user confirm/edit the name prefilled from their Google account.
 */
export default function OnboardingPage() {
  const router = useRouter();
  const { user, refreshProfile, isLoading } = useAuth();
  const { t } = useLang();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);

  // Not logged in → send to login. Already has a phone → nothing to do here.
  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    setName(user.name || "");
    setLocation(user.location || "");
    if (user.phone) router.replace("/home");
  }, [user, isLoading, router]);

  const cleanPhone = () => {
    const d = phone.replace(/\D/g, "");
    return d.length > 10 ? d.slice(-10) : d;
  };

  const save = async () => {
    if (!name.trim()) {
      toast.error(t("ಹೆಸರು ಅಗತ್ಯ", "Name is required"));
      return;
    }
    if (cleanPhone().length !== 10) {
      toast.error(t("ಸರಿಯಾದ 10 ಅಂಕಿಗಳ ಮೊಬೈಲ್ ನಂಬರ್ ನಮೂದಿಸಿ", "Enter a valid 10-digit mobile number"));
      return;
    }
    setSaving(true);
    try {
      await api.updateProfile({
        name: name.trim(),
        phone: `+91${cleanPhone()}`,
        location: location.trim(),
      });
      await refreshProfile();
      toast.success(t("ಸ್ವಾಗತ!", "Welcome!"));
      router.replace("/home");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("ಉಳಿಸಲು ವಿಫಲ", "Could not save"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-gradient-to-b from-green-50 to-white dark:from-background dark:to-background">
      <img src="/logo.png" alt="Dealspot" className="w-16 h-16 rounded-full object-cover mb-3 shadow" />
      <div className="w-full max-w-sm bg-card p-6 rounded-2xl shadow-sm border border-border space-y-4">
        <div className="text-center">
          <CheckCircle2 className="mx-auto text-primary mb-2" size={34} />
          <h1 className="text-lg font-bold text-foreground">{t("ಬಹುತೇಕ ಮುಗಿದಿದೆ!", "Almost done!")}</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {t("ಮುಂದುವರಿಯಲು ನಿಮ್ಮ ವಿವರ ಪೂರ್ಣಗೊಳಿಸಿ", "Complete your details to continue")}
          </p>
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-1 block">{t("ಹೆಸರು", "Name")} *</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("ನಿಮ್ಮ ಹೆಸರು", "Your name")} className="h-11" />
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-1 block">{t("ಫೋನ್ ನಂಬರ್", "Phone Number")} *</label>
          <div className="flex gap-2">
            <div className="w-14 h-11 border rounded-md flex items-center justify-center text-sm bg-muted">+91</div>
            <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98765 43210" className="h-11 flex-1" maxLength={10} />
          </div>
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-1 block">{t("ಸ್ಥಳ", "Location")}</label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t("ಮಂಡ್ಯ", "e.g. Mandya")} className="h-11" />
        </div>

        <Button onClick={save} disabled={saving} className="w-full h-11 bg-primary">
          {saving ? <><Loader2 size={16} className="mr-2 animate-spin" /> {t("ಉಳಿಸಲಾಗುತ್ತಿದೆ...", "Saving...")}</> : t("ಮುಂದುವರಿಸಿ", "Continue")}
        </Button>
      </div>
    </div>
  );
}
