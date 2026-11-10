"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { Loader2, CheckCircle2 } from "lucide-react";
import { LocateFixed } from "lucide-react";

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
  // District found by "Use my current location"; saved with the profile.
  const [district, setDistrict] = useState("");
  const [detecting, setDetecting] = useState(false);
  const autoTried = useRef(false);
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

  // Reads the device location and reverse-geocodes it (OpenStreetMap) into
  // "area, district". `silent` is the automatic attempt: it never shows errors
  // and never overwrites something the user already typed.
  const detectLocation = (silent = false) => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      if (!silent) toast.error(t("ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಲೊಕೇಶನ್ ಲಭ್ಯವಿಲ್ಲ", "Location is not available in this browser"));
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=12&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const addr = data?.address || {};
          const dist: string = (addr.state_district || addr.county || addr.city_district || addr.city || "")
            .toString()
            .replace(/\s*district$/i, "")
            .trim();
          const area: string = (addr.suburb || addr.village || addr.town || addr.city || addr.hamlet || "")
            .toString()
            .trim();
          const text = [area, dist].filter((v, i, a) => v && a.indexOf(v) === i).join(", ");
          if (!text) {
            if (!silent) toast.error(t("ಸ್ಥಳ ಪತ್ತೆಯಾಗಲಿಲ್ಲ, ಕೈಯಾರೆ ನಮೂದಿಸಿ", "Couldn't find your place — please type it"));
            return;
          }
          setLocation((prev) => (silent && prev.trim() ? prev : text));
          if (dist) setDistrict(dist);
        } catch {
          if (!silent) toast.error(t("ಲೊಕೇಶನ್ ಪತ್ತೆ ವಿಫಲವಾಗಿದೆ", "Location detection failed"));
        } finally {
          setDetecting(false);
        }
      },
      () => {
        setDetecting(false);
        if (!silent) toast.error(t("ಲೊಕೇಶನ್ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ", "Location permission denied"));
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
    );
  };

  // If the browser already has location permission, fill it in automatically
  // (once). Otherwise the user taps the button, which asks for permission.
  useEffect(() => {
    if (isLoading || !user || user.location || autoTried.current) return;
    autoTried.current = true;
    const perms = typeof navigator !== "undefined" ? navigator.permissions : undefined;
    if (!perms?.query) return;
    perms
      .query({ name: "geolocation" as PermissionName })
      .then((s) => {
        if (s.state === "granted") detectLocation(true);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, user]);

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
        ...(district ? { district } : {}),
      });
      await refreshProfile();
      toast.success(t("ಸ್ವಾಗತ", "Welcome"));
      router.replace("/home");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("ಉಳಿಸಲು ವಿಫಲ", "Could not save"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-background">
      <img src="/logo.png" alt="Dealspot" className="w-16 h-16 rounded-full object-cover border border-border mb-4" />
      <div className="w-full max-w-sm bg-card p-6 rounded-2xl shadow-md border border-border space-y-4">
        <div className="text-center">
          <CheckCircle2 className="mx-auto text-primary mb-3" size={24} strokeWidth={1.5} />
          <h1 className="text-lg font-semibold text-foreground">{t("ಬಹುತೇಕ ಮುಗಿದಿದೆ", "Almost done")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("ಮುಂದುವರಿಯಲು ನಿಮ್ಮ ವಿವರ ಪೂರ್ಣಗೊಳಿಸಿ", "Complete your details to continue")}
          </p>
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-1 block">{t("ಹೆಸರು", "Name")} *</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("ನಿಮ್ಮ ಹೆಸರು", "Your name")} className="h-11" />
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-1 block">{t("ಫೋನ್ ನಂಬರ್", "Phone number")} *</label>
          <div className="flex gap-2">
            <div className="w-14 h-11 border border-input rounded-md flex items-center justify-center text-sm bg-muted">+91</div>
            <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98765 43210" className="h-11 flex-1" maxLength={10} />
          </div>
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-1 block">{t("ಸ್ಥಳ", "Location")}</label>
          <Input
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setDistrict(""); // typed by hand: don't keep a stale detected district
            }}
            className="h-11"
          />
          <button
            type="button"
            onClick={() => detectLocation(false)}
            disabled={detecting}
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline disabled:opacity-60"
          >
            {detecting ? <Loader2 size={16} className="animate-spin" /> : <LocateFixed size={16} strokeWidth={1.5} />}
            {detecting ? t("ಪತ್ತೆ ಮಾಡಲಾಗುತ್ತಿದೆ...", "Detecting...") : t("ನನ್ನ ಪ್ರಸ್ತುತ ಸ್ಥಳ ಬಳಸಿ", "Use my current location")}
          </button>
        </div>

        <Button onClick={save} disabled={saving} className="w-full h-11 bg-primary">
          {saving ? <><Loader2 size={16} className="mr-2 animate-spin" /> {t("ಉಳಿಸಲಾಗುತ್ತಿದೆ...", "Saving...")}</> : t("ಮುಂದುವರಿಸಿ", "Continue")}
        </Button>
      </div>
    </div>
  );
}
