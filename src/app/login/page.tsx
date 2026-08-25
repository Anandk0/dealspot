"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.phone || !form.password) {
      toast.error("ಫೋನ್ ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್ ಅಗತ್ಯ (Phone and password required)");
      return;
    }
    const digitsOnly = form.phone.replace(/\D/g, "");
    const cleanPhone = digitsOnly.length > 10 ? digitsOnly.slice(-10) : digitsOnly;
    if (cleanPhone.length !== 10) {
      toast.error("ದಯವಿಟ್ಟು 10 ಅಂಕಿಗಳ ಸರಿಯಾದ ಮೊಬೈಲ್ ನಂಬರ್ ನಮೂದಿಸಿ");
      return;
    }
    if (form.password.length < 6) {
      toast.error("ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳು ಇರಬೇಕು (Password must be at least 6 characters)");
      return;
    }

    setLoading(true);
    const fullPhone = `+91${cleanPhone}`;
    try {
      if (isRegister) {
        if (!form.name.trim()) {
          toast.error("ಹೆಸರು ಅಗತ್ಯ (Name is required)");
          setLoading(false);
          return;
        }
        const res = await api.register({
          phone: fullPhone,
          password: form.password,
          name: form.name.trim(),
          email: form.email?.trim() || undefined,
          location: form.location?.trim() || undefined,
        });
        login(res);
        toast.success("ಯಶಸ್ವಿಯಾಗಿ ನೋಂದಣಿ ಆಗಿದೆ! (Registered successfully)");
      } else {
        const res = await api.login(fullPhone, form.password);
        login(res);
        toast.success("ಯಶಸ್ವಿಯಾಗಿ ಲಾಗಿನ್ ಆಗಿದೆ! (Logged in successfully)");
      }
      router.push("/home");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "ಏನೋ ತಪ್ಪಾಗಿದೆ";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 sm:py-12 bg-gradient-to-b from-green-50 to-white dark:from-background dark:to-background">
      <img src="/logo.png" alt="Deal Spot Connect" className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover mb-3 sm:mb-4 shadow-lg" />
      <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 text-center">Dealspot <span className="text-xs sm:text-sm font-normal text-muted-foreground">connect</span></h1>
      <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">ಡೀಲ್ ಸ್ಪಾಟ್</p>

      <div className="w-full max-w-sm space-y-4 bg-card p-5 sm:p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-center font-semibold text-gray-800 text-lg">
          {isRegister ? "ನೋಂದಣಿ (Register)" : "ಲಾಗಿನ್ (Login)"}
        </h2>

        {isRegister && (
          <>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">ಹೆಸರು (Name) *</label>
              <Input name="name" value={form.name} onChange={handleChange} placeholder="ನಿಮ್ಮ ಹೆಸರು" className="h-11" />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">ಇಮೇಲ್ (Email)</label>
              <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@example.com" className="h-11" />
            </div>
          </>
        )}

        <div>
          <label className="text-sm text-gray-600 mb-1 block">ಫೋನ್ ನಂಬರ್ *</label>
          <div className="flex gap-2">
            <div className="w-14 h-11 border rounded-md flex items-center justify-center text-sm bg-gray-50">+91</div>
            <Input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="98765 43210" className="h-11 flex-1" maxLength={10} />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-600 mb-1 block">ಪಾಸ್‌ವರ್ಡ್ *</label>
          <Input name="password" type="password" value={form.password} onChange={handleChange} placeholder="ಕನಿಷ್ಠ 6 ಅಕ್ಷರ" className="h-11" />
        </div>

        {isRegister && (
          <div>
            <label className="text-sm text-gray-600 mb-1 block">ಸ್ಥಳ (Location)</label>
            <Input name="location" value={form.location} onChange={handleChange} placeholder="ಮಂಡ್ಯ" className="h-11" />
          </div>
        )}

        <Button onClick={handleSubmit} disabled={loading} className="w-full h-11 bg-primary text-base">
          {loading ? (
            <><Loader2 size={16} className="mr-2 animate-spin" /> ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ...</>
          ) : (
            isRegister ? "ನೋಂದಣಿ (Register)" : "ಲಾಗಿನ್ (Login)"
          )}
        </Button>

        <button
          onClick={() => setIsRegister(!isRegister)}
          className="w-full text-center text-sm text-primary hover:underline"
        >
          {isRegister ? "ಈಗಾಗಲೇ ಖಾತೆ ಇದೆ? ಲಾಗಿನ್ ಮಾಡಿ" : "ಹೊಸ ಖಾತೆ? ನೋಂದಣಿ ಮಾಡಿ"}
        </button>
      </div>
    </div>
  );
}
