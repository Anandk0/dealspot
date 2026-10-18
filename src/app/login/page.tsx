"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { Loader2, MailCheck, LocateFixed, MapPin, Check, AlertCircle } from "lucide-react";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { lookupPincode } from "@/lib/pincode";

// Registration steps: form → otp → done
type RegStep = "form" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { lang, setLang, t } = useLang();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  // Password/phone auth is the secondary option, collapsed by default so
  // Google remains the primary call to action.
  const [showPasswordAuth, setShowPasswordAuth] = useState(false);
  const [form, setForm] = useState({
    phone: "",
    password: "",
    name: "",
    email: "",
    location: "",
  });

  // GPS-detected location for registration (replaces the manual location field).
  // Registration is blocked until `geo` is successfully populated.
  const [geo, setGeo] = useState<{ district: string; taluk: string; area: string } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Email OTP state
  const [regStep, setRegStep] = useState<RegStep>("form");
  const [otp, setOtp] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === "email" && emailVerified) {
      setEmailVerified(false);
      setRegStep("form");
    }
  };

  const cleanPhone = () => {
    const digitsOnly = form.phone.replace(/\D/g, "");
    return digitsOnly.length > 10 ? digitsOnly.slice(-10) : digitsOnly;
  };

  const validateBaseFields = () => {
    const phone = cleanPhone();
    if (phone.length !== 10) {
      toast.error(t("ದಯವಿಟ್ಟು 10 ಅಂಕಿಗಳ ಸರಿಯಾದ ಮೊಬೈಲ್ ನಂಬರ್ ನಮೂದಿಸಿ", "Please enter a valid 10-digit mobile number"));
      return false;
    }
    if (form.password.length < 6) {
      toast.error(t("ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳು ಇರಬೇಕು", "Password must be at least 6 characters"));
      return false;
    }
    return true;
  };

  // ── GPS location detection (mandatory for registration) ──
  // Gets device GPS, reverse-geocodes via OpenStreetMap, then resolves the
  // district + taluk. When OSM returns a postcode we feed it to the India Post
  // lookup for a taluk that matches our backend vocabulary; otherwise we fall
  // back to the OSM district name. Registration cannot proceed without this.
  const detectLocation = () => {
    if (!("geolocation" in navigator)) {
      setGeoError(t("ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಲೊಕೇಶನ್ ಲಭ್ಯವಿಲ್ಲ", "Location is not available in this browser"));
      return;
    }
    setGeoLoading(true);
    setGeoError(null);
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

          const osmDistrict: string = (addr.state_district || addr.county || addr.city_district || addr.city || "")
            .toString()
            .replace(/\s*district$/i, "")
            .trim();
          const area: string = (addr.suburb || addr.village || addr.town || addr.city || addr.hamlet || "")
            .toString()
            .trim();
          const postcode: string = (addr.postcode || "").toString().replace(/\D/g, "");

          let district = osmDistrict;
          let taluk = "";

          // Prefer the India Post lookup (gives a taluk from our vocabulary).
          if (/^\d{6}$/.test(postcode)) {
            const pin = await lookupPincode(postcode, (d) => api.getTaluks(d));
            if (pin) {
              district = pin.district || district;
              taluk = pin.taluk || "";
            }
          }

          if (!district) {
            setGeoError(t("ಜಿಲ್ಲೆ ಪತ್ತೆಯಾಗಲಿಲ್ಲ, ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ", "Couldn't determine your district — please try again"));
            setGeo(null);
            return;
          }

          setGeo({ district, taluk, area });
        } catch {
          setGeoError(t("ಲೊಕೇಶನ್ ಪತ್ತೆ ವಿಫಲವಾಗಿದೆ, ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ", "Location detection failed — please try again"));
          setGeo(null);
        } finally {
          setGeoLoading(false);
        }
      },
      () => {
        setGeoLoading(false);
        setGeo(null);
        setGeoError(t("ಲೊಕೇಶನ್ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ನೋಂದಣಿಗೆ ಲೊಕೇಶನ್ ಅಗತ್ಯ.", "Location permission denied. Location is required to register."));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // ── Registration: Step 1 — send OTP to email ──
  const handleSendOtp = async () => {
    if (!form.name.trim()) {
      toast.error(t("ಹೆಸರು ಅಗತ್ಯ", "Name is required"));
      return;
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      toast.error(t("ಸರಿಯಾದ ಇಮೇಲ್ ನಮೂದಿಸಿ", "Enter a valid email"));
      return;
    }
    if (!validateBaseFields()) return;
    // Location is mandatory for registration — must be detected via GPS.
    if (!geo) {
      setGeoError(t("ಮುಂದುವರಿಯಲು ನಿಮ್ಮ ಲೊಕೇಶನ್ ಪತ್ತೆ ಮಾಡಿ", "Please detect your location to continue"));
      toast.error(t("ನೋಂದಣಿಗೆ ಲೊಕೇಶನ್ ಅಗತ್ಯ", "Location is required to register"));
      return;
    }

    setOtpSending(true);
    try {
      const res = await api.sendEmailOtp(form.email.trim());
      setRegStep("otp");
      if (res.otp) {
        toast.success(`OTP: ${res.otp} (dev mode)`, { duration: 8000 });
      } else {
        toast.success(t("ನಿಮ್ಮ ಇಮೇಲ್‌ಗೆ OTP ಕಳುಹಿಸಲಾಗಿದೆ", "OTP sent to your email"));
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("OTP ಕಳುಹಿಸಲು ವಿಫಲವಾಗಿದೆ", "Failed to send OTP"));
    } finally {
      setOtpSending(false);
    }
  };

  // ── Registration: Step 2 — verify OTP ──
  const handleVerifyOtp = async () => {
    if (otp.trim().length !== 6) {
      toast.error(t("6 ಅಂಕಿಗಳ OTP ನಮೂದಿಸಿ", "Enter the 6-digit OTP"));
      return;
    }
    setOtpVerifying(true);
    try {
      const res = await api.verifyEmailOtp(form.email.trim(), otp.trim());
      if (res.verified) {
        setEmailVerified(true);
        toast.success(t("ಇಮೇಲ್ ಪರಿಶೀಲಿಸಲಾಗಿದೆ!", "Email verified!"));
        await completeRegistration();
      } else {
        toast.error(t("ತಪ್ಪಾದ ಅಥವಾ ಅವಧಿ ಮೀರಿದ OTP", "Invalid or expired OTP"));
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("ಪರಿಶೀಲನೆ ವಿಫಲವಾಗಿದೆ", "Verification failed"));
    } finally {
      setOtpVerifying(false);
    }
  };

  // ── Registration: Step 3 — create account ──
  const completeRegistration = async () => {
    setLoading(true);
    const fullPhone = `+91${cleanPhone()}`;
    try {
      const res = await api.register({
        phone: fullPhone,
        password: form.password,
        name: form.name.trim(),
        email: form.email.trim(),
        // GPS-detected location (mandatory). `location` carries the area label.
        location: geo?.area || undefined,
        district: geo?.district || undefined,
        taluk: geo?.taluk || undefined,
      });
      login(res);
      toast.success(t("ಯಶಸ್ವಿಯಾಗಿ ನೋಂದಣಿ ಆಗಿದೆ!", "Registered successfully!"));
      router.push("/home");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("ಏನೋ ತಪ್ಪಾಗಿದೆ", "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  // ── Google sign-in / sign-up ──
  const handleGoogle = async (idToken: string) => {
    setLoading(true);
    try {
      const res = await api.loginWithGoogle(idToken);
      login(res);
      toast.success(t("ಯಶಸ್ವಿ!", "Signed in!"));
      // New Google users with no phone yet → onboarding; otherwise home.
      router.push(res.needsOnboarding ? "/onboarding" : "/home");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("Google ಸೈನ್ ಇನ್ ವಿಫಲ", "Google sign-in failed"));
    } finally {
      setLoading(false);
    }
  };

  // ── Login ──
  const handleLogin = async () => {
    if (!form.phone || !form.password) {
      toast.error(t("ಫೋನ್ ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್ ಅಗತ್ಯ", "Phone and password required"));
      return;
    }
    if (!validateBaseFields()) return;

    setLoading(true);
    const fullPhone = `+91${cleanPhone()}`;
    try {
      const res = await api.login(fullPhone, form.password);
      login(res);
      toast.success(t("ಯಶಸ್ವಿಯಾಗಿ ಲಾಗಿನ್ ಆಗಿದೆ!", "Logged in successfully!"));
      router.push("/home");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("ಏನೋ ತಪ್ಪಾಗಿದೆ", "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsRegister(!isRegister);
    setRegStep("form");
    setOtp("");
    setEmailVerified(false);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8 sm:py-12 overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-50 dark:from-background dark:via-background dark:to-background" suppressHydrationWarning>
      {/* Soft decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-emerald-400/10 blur-3xl" />

      {/* Language toggle — fixed to top-right corner */}
      <div className="absolute top-4 right-4 z-10">
        <div className="flex items-center gap-1 bg-card border border-border rounded-full p-0.5 shadow-sm">
          <button
            onClick={() => setLang("kn")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${lang === "kn" ? "bg-primary text-white" : "text-muted-foreground"}`}
          >
            ಕನ್ನಡ
          </button>
          <button
            onClick={() => setLang("en")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${lang === "en" ? "bg-primary text-white" : "text-muted-foreground"}`}
          >
            English
          </button>
        </div>
      </div>

      {/* Brand */}
      <div className="relative mb-5 flex flex-col items-center">
        <div className="p-1.5 rounded-full bg-gradient-to-br from-primary/30 to-emerald-400/20 shadow-lg mb-3">
          <img src="/logo.png" alt="Dealspot Connect" className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-background" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Dealspot <span className="text-primary">connect</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t("ಗ್ರಾಮೀಣ ಮಾರುಕಟ್ಟೆ", "Rural Marketplace")}</p>
      </div>

      <div className="relative w-full max-w-sm space-y-4 bg-card/95 backdrop-blur p-6 sm:p-7 rounded-3xl shadow-xl border border-border" suppressHydrationWarning>

        {/* ─── GOOGLE — the hero sign-in (always the main attraction) ─── */}
        <div className="text-center space-y-1.5">
          <h2 className="font-bold text-foreground text-xl">
            {t("ಸ್ವಾಗತ 👋", "Welcome 👋")}
          </h2>
          <p className="text-sm text-muted-foreground px-2">
            {t("Google ಖಾತೆಯೊಂದಿಗೆ ಕ್ಷಣದಲ್ಲಿ ಪ್ರಾರಂಭಿಸಿ", "Sign in instantly with your Google account")}
          </p>
        </div>

        {!(isRegister && regStep === "otp") && !showPasswordAuth && (
          <div className="space-y-4 py-1">

            <div className="flex justify-center">
              <GoogleSignInButton onCredential={handleGoogle} text="continue_with" />
            </div>
            {loading && (
              <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                <Loader2 size={13} className="animate-spin" /> {t("ಸೈನ್ ಇನ್ ಆಗುತ್ತಿದೆ...", "Signing in...")}
              </p>
            )}
            <p className="text-center text-[11px] text-muted-foreground px-4 leading-relaxed">
              {t("ಮುಂದುವರಿಯುವ ಮೂಲಕ ನೀವು ನಮ್ಮ ನಿಯಮಗಳನ್ನು ಒಪ್ಪುತ್ತೀರಿ", "By continuing you agree to our Terms & Privacy Policy")}
            </p>

            {/* Secondary: reveal phone/password login */}
            <div className="pt-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[11px] text-muted-foreground uppercase tracking-wide">{t("ಅಥವಾ", "or")}</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <button
                onClick={() => setShowPasswordAuth(true)}
                className="w-full h-11 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted/50 hover:border-primary/40 transition flex items-center justify-center gap-2"
              >
                📱 {t("ಫೋನ್ ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್‌ನೊಂದಿಗೆ ಲಾಗಿನ್", "Use phone & password instead")}
              </button>
            </div>
          </div>
        )}

        {/* ─── Phone/password auth (collapsed by default) ─── */}
        {(showPasswordAuth || (isRegister && regStep === "otp")) && (
        <>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground text-base">
            {isRegister ? t("ನೋಂದಣಿ", "Register") : t("ಲಾಗಿನ್", "Login")}
          </h2>
          {!(isRegister && regStep === "otp") && (
            <button onClick={() => { setShowPasswordAuth(false); setIsRegister(false); }} className="text-xs text-muted-foreground hover:text-primary">
              ← {t("Google ಬಳಸಿ", "Use Google")}
            </button>
          )}
        </div>

        {/* ─── OTP verification step ─── */}
        {isRegister && regStep === "otp" ? (
          <div className="space-y-4">
            <div className="text-center">
              <MailCheck className="mx-auto text-primary mb-2" size={36} />
              <p className="text-sm font-medium text-foreground">{t("OTP ನಮೂದಿಸಿ", "Enter OTP")}</p>
              <p className="text-xs text-muted-foreground mt-1 break-all px-2">{form.email}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("ಗೆ ಕಳುಹಿಸಿದ 6-ಅಂಕಿಯ ಕೋಡ್", "6-digit code sent to this email")}
              </p>
            </div>

            <input
              name="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="w-full h-14 rounded-xl border border-input bg-background text-center text-3xl font-bold tracking-[0.4em] text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/40 placeholder:tracking-[0.4em]"
            />

            <Button
              onClick={handleVerifyOtp}
              disabled={otpVerifying || loading}
              className="w-full h-11 bg-primary text-sm sm:text-base"
            >
              {(otpVerifying || loading) ? (
                <><Loader2 size={16} className="mr-2 animate-spin shrink-0" /> {t("ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...", "Verifying...")}</>
              ) : (
                <span className="truncate">{t("ಪರಿಶೀಲಿಸಿ & ನೋಂದಾಯಿಸಿ", "Verify & Register")}</span>
              )}
            </Button>

            <button
              onClick={handleSendOtp}
              disabled={otpSending}
              className="w-full text-center text-sm text-primary hover:underline"
            >
              {otpSending ? t("ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ...", "Sending...") : t("OTP ಮತ್ತೆ ಕಳುಹಿಸಿ", "Resend OTP")}
            </button>
            <button
              onClick={() => setRegStep("form")}
              className="w-full text-center text-xs text-muted-foreground hover:underline"
            >
              ← {t("ವಿವರ ಬದಲಾಯಿಸಿ", "Edit details")}
            </button>
          </div>
        ) : (
          <>
            {/* ─── Register-only fields ─── */}
            {isRegister && (
              <>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">{t("ಹೆಸರು", "Name")} *</label>
                  <Input name="name" value={form.name} onChange={handleChange} placeholder={t("ನಿಮ್ಮ ಹೆಸರು", "Your name")} className="h-11" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">{t("ಇಮೇಲ್", "Email")} *</label>
                  <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@example.com" className="h-11" />
                </div>
              </>
            )}

            {/* Phone */}
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">{t("ಫೋನ್ ನಂಬರ್", "Phone Number")} *</label>
              <div className="flex gap-2">
                <div className="w-14 h-11 border rounded-md flex items-center justify-center text-sm bg-muted">+91</div>
                <Input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="98765 43210" className="h-11 flex-1" maxLength={10} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">{t("ಪಾಸ್‌ವರ್ಡ್", "Password")} *</label>
              <Input name="password" type="password" value={form.password} onChange={handleChange} placeholder={t("ಕನಿಷ್ಠ 6 ಅಕ್ಷರ", "At least 6 characters")} className="h-11" />
            </div>

            {/* Location (register only) — GPS detected, mandatory */}
            {isRegister && (
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  {t("ಸ್ಥಳ", "Location")} <span className="text-red-500">*</span>
                </label>
                {geo ? (
                  <div className="rounded-xl border border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-950/30 p-3">
                    <div className="flex items-start gap-2">
                      <Check size={16} className="text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {geo.district}
                          {geo.taluk ? ` • ${geo.taluk}` : ""}
                        </p>
                        {geo.area && <p className="text-xs text-muted-foreground truncate">{geo.area}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={detectLocation}
                        disabled={geoLoading}
                        className="text-xs text-primary hover:underline shrink-0"
                      >
                        {t("ಬದಲಾಯಿಸಿ", "Change")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={geoLoading}
                    className="w-full h-11 rounded-xl border border-primary/40 text-primary hover:bg-primary/5 transition flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-60"
                  >
                    {geoLoading ? (
                      <><Loader2 size={16} className="animate-spin" /> {t("ಪತ್ತೆ ಮಾಡಲಾಗುತ್ತಿದೆ...", "Detecting...")}</>
                    ) : (
                      <><LocateFixed size={16} /> {t("ನನ್ನ ಲೊಕೇಶನ್ ಪತ್ತೆ ಮಾಡಿ", "Detect my location")}</>
                    )}
                  </button>
                )}
                {geoError && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                    <AlertCircle size={12} className="shrink-0" /> {geoError}
                  </p>
                )}
                {!geo && !geoError && (
                  <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                    <MapPin size={11} className="shrink-0" />
                    {t("ನಿಮ್ಮ ಜಿಲ್ಲೆ/ತಾಲೂಕು ಸ್ವಯಂ ತುಂಬಲು GPS ಬಳಸಲಾಗುತ್ತದೆ", "We use GPS to auto-fill your district & taluk")}
                  </p>
                )}
              </div>
            )}

            {/* Submit */}
            <Button
              onClick={isRegister ? handleSendOtp : handleLogin}
              disabled={loading || otpSending}
              className="w-full h-11 bg-primary text-base"
            >
              {(loading || otpSending) ? (
                <><Loader2 size={16} className="mr-2 animate-spin" /> {t("ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ...", "Please wait...")}</>
              ) : (
                isRegister ? t("OTP ಕಳುಹಿಸಿ", "Send OTP") : t("ಲಾಗಿನ್", "Login")
              )}
            </Button>
          </>
        )}

        <button
          onClick={switchMode}
          className="w-full text-center text-sm text-primary hover:underline"
        >
          {isRegister
            ? t("ಈಗಾಗಲೇ ಖಾತೆ ಇದೆ? ಲಾಗಿನ್ ಮಾಡಿ", "Already have an account? Login")
            : t("ಹೊಸ ಖಾತೆ? ನೋಂದಣಿ ಮಾಡಿ", "New here? Create an account")}
        </button>
        </>
        )}
      </div>
    </div>
  );
}
