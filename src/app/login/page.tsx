"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Loader2, MailCheck } from "lucide-react";

// Registration steps: form → otp → done
type RegStep = "form" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    phone: "",
    password: "",
    name: "",
    email: "",
    location: "",
  });

  // Email OTP state
  const [regStep, setRegStep] = useState<RegStep>("form");
  const [otp, setOtp] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // If email changes after verification, reset verification
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
      toast.error("ದಯವಿಟ್ಟು 10 ಅಂಕಿಗಳ ಸರಿಯಾದ ಮೊಬೈಲ್ ನಂಬರ್ ನಮೂದಿಸಿ");
      return false;
    }
    if (form.password.length < 6) {
      toast.error("ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳು ಇರಬೇಕು (Password must be at least 6 characters)");
      return false;
    }
    return true;
  };

  // ── Registration: Step 1 — send OTP to email ──
  const handleSendOtp = async () => {
    if (!form.name.trim()) {
      toast.error("ಹೆಸರು ಅಗತ್ಯ (Name is required)");
      return;
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      toast.error("ಸರಿಯಾದ ಇಮೇಲ್ ನಮೂದಿಸಿ (Enter a valid email)");
      return;
    }
    if (!validateBaseFields()) return;

    setOtpSending(true);
    try {
      const res = await api.sendEmailOtp(form.email.trim());
      setRegStep("otp");
      // In dev mode the OTP is returned — show it for convenience
      if (res.otp) {
        toast.success(`OTP: ${res.otp} (dev mode)`, { duration: 8000 });
      } else {
        toast.success("ನಿಮ್ಮ ಇಮೇಲ್‌ಗೆ OTP ಕಳುಹಿಸಲಾಗಿದೆ (OTP sent to your email)");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setOtpSending(false);
    }
  };

  // ── Registration: Step 2 — verify OTP ──
  const handleVerifyOtp = async () => {
    if (otp.trim().length !== 6) {
      toast.error("6 ಅಂಕಿಗಳ OTP ನಮೂದಿಸಿ (Enter the 6-digit OTP)");
      return;
    }
    setOtpVerifying(true);
    try {
      const res = await api.verifyEmailOtp(form.email.trim(), otp.trim());
      if (res.verified) {
        setEmailVerified(true);
        toast.success("ಇಮೇಲ್ ಪರಿಶೀಲಿಸಲಾಗಿದೆ! (Email verified)");
        // Proceed straight to account creation
        await completeRegistration();
      } else {
        toast.error("ತಪ್ಪಾದ OTP (Invalid or expired OTP)");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Verification failed");
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
        location: form.location?.trim() || undefined,
      });
      login(res);
      toast.success("ಯಶಸ್ವಿಯಾಗಿ ನೋಂದಣಿ ಆಗಿದೆ! (Registered successfully)");
      router.push("/home");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "ಏನೋ ತಪ್ಪಾಗಿದೆ");
    } finally {
      setLoading(false);
    }
  };

  // ── Login ──
  const handleLogin = async () => {
    if (!form.phone || !form.password) {
      toast.error("ಫೋನ್ ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್ ಅಗತ್ಯ (Phone and password required)");
      return;
    }
    if (!validateBaseFields()) return;

    setLoading(true);
    const fullPhone = `+91${cleanPhone()}`;
    try {
      const res = await api.login(fullPhone, form.password);
      login(res);
      toast.success("ಯಶಸ್ವಿಯಾಗಿ ಲಾಗಿನ್ ಆಗಿದೆ! (Logged in successfully)");
      router.push("/home");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "ಏನೋ ತಪ್ಪಾಗಿದೆ");
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 sm:py-12 bg-gradient-to-b from-green-50 to-white dark:from-background dark:to-background" suppressHydrationWarning>
      <img src="/logo.png" alt="Deal Spot Connect" className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover mb-3 sm:mb-4 shadow-lg" />
      <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 text-center">Dealspot <span className="text-xs sm:text-sm font-normal text-muted-foreground">connect</span></h1>
      <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">ಡೀಲ್ ಸ್ಪಾಟ್</p>

      <div className="w-full max-w-sm space-y-4 bg-card p-5 sm:p-6 rounded-2xl shadow-sm border border-border" suppressHydrationWarning>
        <h2 className="text-center font-semibold text-foreground text-lg">
          {isRegister ? "ನೋಂದಣಿ (Register)" : "ಲಾಗಿನ್ (Login)"}
        </h2>

        {/* ─── OTP verification step ─── */}
        {isRegister && regStep === "otp" ? (
          <div className="space-y-4">
            <div className="text-center">
              <MailCheck className="mx-auto text-primary mb-2" size={36} />
              <p className="text-sm text-muted-foreground">
                {form.email} ಗೆ ಕಳುಹಿಸಿದ 6-ಅಂಕಿಯ OTP ನಮೂದಿಸಿ
              </p>
            </div>
            <Input
              name="otp"
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="h-12 text-center text-2xl tracking-[0.5em] font-bold"
              maxLength={6}
            />
            <Button
              onClick={handleVerifyOtp}
              disabled={otpVerifying || loading}
              className="w-full h-11 bg-primary text-base"
            >
              {(otpVerifying || loading) ? (
                <><Loader2 size={16} className="mr-2 animate-spin" /> ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...</>
              ) : (
                "ಪರಿಶೀಲಿಸಿ & ನೋಂದಾಯಿಸಿ (Verify & Register)"
              )}
            </Button>
            <button
              onClick={handleSendOtp}
              disabled={otpSending}
              className="w-full text-center text-sm text-primary hover:underline"
            >
              {otpSending ? "ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ..." : "OTP ಮತ್ತೆ ಕಳುಹಿಸಿ (Resend OTP)"}
            </button>
            <button
              onClick={() => setRegStep("form")}
              className="w-full text-center text-xs text-muted-foreground hover:underline"
            >
              ← ವಿವರ ಬದಲಾಯಿಸಿ (Edit details)
            </button>
          </div>
        ) : (
          <>
            {/* ─── Register-only fields ─── */}
            {isRegister && (
              <>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">ಹೆಸರು (Name) *</label>
                  <Input name="name" value={form.name} onChange={handleChange} placeholder="ನಿಮ್ಮ ಹೆಸರು" className="h-11" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">ಇಮೇಲ್ (Email) *</label>
                  <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@example.com" className="h-11" />
                </div>
              </>
            )}

            {/* Phone */}
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">ಫೋನ್ ನಂಬರ್ *</label>
              <div className="flex gap-2">
                <div className="w-14 h-11 border rounded-md flex items-center justify-center text-sm bg-muted">+91</div>
                <Input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="98765 43210" className="h-11 flex-1" maxLength={10} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">ಪಾಸ್‌ವರ್ಡ್ *</label>
              <Input name="password" type="password" value={form.password} onChange={handleChange} placeholder="ಕನಿಷ್ಠ 6 ಅಕ್ಷರ" className="h-11" />
            </div>

            {/* Location (register only) */}
            {isRegister && (
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">ಸ್ಥಳ (Location)</label>
                <Input name="location" value={form.location} onChange={handleChange} placeholder="ಮಂಡ್ಯ" className="h-11" />
              </div>
            )}

            {/* Submit */}
            <Button
              onClick={isRegister ? handleSendOtp : handleLogin}
              disabled={loading || otpSending}
              className="w-full h-11 bg-primary text-base"
            >
              {(loading || otpSending) ? (
                <><Loader2 size={16} className="mr-2 animate-spin" /> ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ...</>
              ) : (
                isRegister ? "OTP ಕಳುಹಿಸಿ (Send OTP)" : "ಲಾಗಿನ್ (Login)"
              )}
            </Button>
          </>
        )}

        <button
          onClick={switchMode}
          className="w-full text-center text-sm text-primary hover:underline"
        >
          {isRegister ? "ಈಗಾಗಲೇ ಖಾತೆ ಇದೆ? ಲಾಗಿನ್ ಮಾಡಿ" : "ಹೊಸ ಖಾತೆ? ನೋಂದಣಿ ಮಾಡಿ"}
        </button>
      </div>
    </div>
  );
}
