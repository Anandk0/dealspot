"use client";
import { Globe, Bell, Moon, Sun, Shield, FileText, Info, LogOut, Trash2, ChevronRight, Check } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { logout, user } = useAuth();
  const { lang, setLang, t } = useLang();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("dealspot_notifications");
    setNotifications(saved !== "off");
  }, []);

  const toggleNotifications = () => {
    const next = !notifications;
    setNotifications(next);
    localStorage.setItem("dealspot_notifications", next ? "on" : "off");
    toast.success(next ? t("ಅಧಿಸೂಚನೆಗಳು ಆನ್ ಆಗಿದೆ", "Notifications turned on") : t("ಅಧಿಸೂಚನೆಗಳು ಆಫ್ ಆಗಿದೆ", "Notifications turned off"));
  };

  const isDark = mounted && theme === "dark";

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleDeleteAccount = () => {
    const subject = encodeURIComponent("Account Deletion Request");
    const body = encodeURIComponent(
      `Hello Dealspot team,\n\nI would like to delete my account.\n\nName: ${user?.name || ""}\nPhone: ${user?.phone || ""}\nEmail: ${user?.email || ""}\n\nPlease remove my account and all my data.\n\nThank you.`
    );
    window.location.href = `mailto:dealspotconnect.official@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-5 sm:p-6 pb-28 lg:pb-8">
        <h1 className="text-xl font-bold text-foreground mb-4 sm:mb-6">{t("ಸೆಟ್ಟಿಂಗ್ಸ್", "Settings")}</h1>

        {/* Preferences */}
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">{t("ಆದ್ಯತೆಗಳು", "Preferences")}</p>
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden mb-6">

          {/* Language */}
          <div className="flex items-center gap-3.5 px-4 py-4 sm:px-5 border-b border-border">
            <Globe size={20} className="text-muted-foreground shrink-0" />
            <span className="flex-1 text-sm font-medium text-foreground">{t("ಭಾಷೆ", "Language")}</span>
            <div className="flex items-center gap-1 bg-muted rounded-full p-0.5">
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

          {/* Dark mode */}
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="flex items-center gap-3.5 px-4 py-4 sm:px-5 w-full text-left border-b border-border hover:bg-muted/50 transition"
          >
            {isDark ? <Moon size={20} className="text-muted-foreground shrink-0" /> : <Sun size={20} className="text-muted-foreground shrink-0" />}
            <span className="flex-1 text-sm font-medium text-foreground">{t("ಡಾರ್ಕ್ ಮೋಡ್", "Dark Mode")}</span>
            <span className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${isDark ? "bg-primary" : "bg-muted-foreground/30"}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isDark ? "translate-x-5" : "translate-x-0.5"}`} />
            </span>
          </button>

          {/* Notifications */}
          <button
            onClick={toggleNotifications}
            className="flex items-center gap-3.5 px-4 py-4 sm:px-5 w-full text-left hover:bg-muted/50 transition"
          >
            <Bell size={20} className="text-muted-foreground shrink-0" />
            <span className="flex-1 text-sm font-medium text-foreground">{t("ಅಧಿಸೂಚನೆಗಳು", "Notifications")}</span>
            <span className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${notifications ? "bg-primary" : "bg-muted-foreground/30"}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifications ? "translate-x-5" : "translate-x-0.5"}`} />
            </span>
          </button>
        </div>

        {/* Legal & Info */}
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">{t("ಕಾನೂನು & ಮಾಹಿತಿ", "Legal & Info")}</p>
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden mb-6">
          <Link href="/privacy" className="flex items-center gap-3.5 px-4 py-4 sm:px-5 hover:bg-muted/50 transition border-b border-border">
            <Shield size={20} className="text-muted-foreground shrink-0" />
            <span className="flex-1 text-sm font-medium text-foreground">{t("ಗೌಪ್ಯತೆ ನೀತಿ", "Privacy Policy")}</span>
            <ChevronRight size={18} className="text-muted-foreground shrink-0" />
          </Link>
          <Link href="/terms" className="flex items-center gap-3.5 px-4 py-4 sm:px-5 hover:bg-muted/50 transition border-b border-border">
            <FileText size={20} className="text-muted-foreground shrink-0" />
            <span className="flex-1 text-sm font-medium text-foreground">{t("ನಿಯಮಗಳು & ಷರತ್ತುಗಳು", "Terms & Conditions")}</span>
            <ChevronRight size={18} className="text-muted-foreground shrink-0" />
          </Link>
          <Link href="/about" className="flex items-center gap-3.5 px-4 py-4 sm:px-5 hover:bg-muted/50 transition border-b border-border">
            <Info size={20} className="text-muted-foreground shrink-0" />
            <span className="flex-1 text-sm font-medium text-foreground">{t("ನಮ್ಮ ಬಗ್ಗೆ", "About Us")}</span>
            <ChevronRight size={18} className="text-muted-foreground shrink-0" />
          </Link>
          <Link href="/help" className="flex items-center gap-3.5 px-4 py-4 sm:px-5 hover:bg-muted/50 transition">
            <Info size={20} className="text-muted-foreground shrink-0" />
            <span className="flex-1 text-sm font-medium text-foreground">{t("ಸಹಾಯ & ಬೆಂಬಲ", "Help & Support")}</span>
            <ChevronRight size={18} className="text-muted-foreground shrink-0" />
          </Link>
        </div>

        {/* Account */}
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">{t("ಖಾತೆ", "Account")}</p>
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3.5 px-4 py-4 sm:px-5 w-full text-left hover:bg-muted/50 transition border-b border-border"
          >
            <LogOut size={20} className="text-muted-foreground shrink-0" />
            <span className="flex-1 text-sm font-medium text-foreground">{t("ಲಾಗ್ ಔಟ್", "Log Out")}</span>
          </button>
          <button
            onClick={handleDeleteAccount}
            className="flex items-center gap-3.5 px-4 py-4 sm:px-5 w-full text-left hover:bg-red-50 dark:hover:bg-red-950/20 transition"
          >
            <Trash2 size={20} className="text-red-500 shrink-0" />
            <span className="flex-1 text-sm font-medium text-red-500">{t("ಖಾತೆ ಅಳಿಸಿ", "Delete Account")}</span>
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">Dealspot Connect v1.0.0</p>
      </div>
    </AppLayout>
  );
}
