"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Link from "next/link";
import {
  ShieldCheck,
  Award,
  Copy,
  Check,
  Share2,
  RefreshCw,
  Sparkles,
  Users,
  TrendingUp,
  Wallet,
  Camera,
  Plus,
  X,
  Loader2,
  ArrowRight,
  UserCheck,
  Phone,
  MapPin,
  Briefcase
} from "lucide-react";

interface AgentProfile {
  name: string;
  phone: string;
  agencyName?: string;
  skill: string;
  experience: string;
  district: string;
  location: string;
  description?: string;
  referralId: string;
  photoUrl?: string;
  registeredAt: string;
}

const specializations = [
  { id: "all", label: "ಎಲ್ಲಾ ಡೀಲ್‌ಗಳು (All-Rounder Deals)" },
  { id: "property", label: "ಆಸ್ತಿ & ಜಮೀನು ಮಾರಾಟ (Real Estate & Land)" },
  { id: "danakarugalu", label: "ದನಕರು & ಜಾನುವಾರು (Cattle & Livestock)" },
  { id: "agriculture-equipment", label: "ಕೃಷಿ ಯಂತ್ರೋಪಕರಣ (Tractor & Farm Equipment)" },
  { id: "vehicle-rent", label: "ಕಾರು & ಆಟೋ ಬಾಡಿಗೆ (Vehicle Rentals)" },
  { id: "services", label: "ಕೃಷಿ & ಇತರ ಸೇವೆಗಳು (Agricultural & General Services)" },
];

const experienceLevels = [
  "1 ವರ್ಷಕ್ಕಿಂತ ಕಡಿಮೆ (< 1 Year)",
  "1 ರಿಂದ 3 ವರ್ಷಗಳು (1-3 Years)",
  "3 ರಿಂದ 5 ವರ್ಷಗಳು (3-5 Years)",
  "5 ವರ್ಷಕ್ಕಿಂತ ಹೆಚ್ಚು (5+ Years)",
];

export default function AgentRegistration() {
  const { user, isLoggedIn } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [agentProfile, setAgentProfile] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    agencyName: "",
    skill: "ಎಲ್ಲಾ ಡೀಲ್‌ಗಳು (All-Rounder Deals)",
    experience: "1 ರಿಂದ 3 ವರ್ಷಗಳು (1-3 Years)",
    district: "ಮಂಡ್ಯ (Mandya)",
    location: "",
    description: "",
  });

  // Storage key specific to current user
  const storageKey = user?.id ? `dealspot_agent_${user.id}` : `dealspot_agent_${user?.phone || "default"}`;

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Prefill form from user account
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        phone: prev.phone || user.phone?.replace("+91", "") || "",
        district: prev.district || user.district || "ಮಂಡ್ಯ (Mandya)",
        location: prev.location || user.location || "",
      }));
    }

    // Check if user already registered as an agent
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setAgentProfile(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, [user, storageKey]);

  // Generate a cryptographically styled unique referral code: DS-AGT-XXXX-XXXX
  const generateUniqueReferralCode = (phone?: string) => {
    const cleanPhone = (phone || user?.phone || "9999").replace(/\D/g, "").slice(-4);
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `DS-AGT-${cleanPhone}-${randomChars}`;
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotoPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹೆಸರು ನಮೂದಿಸಿ (Name is required)");
      return;
    }
    if (!form.phone.trim()) {
      toast.error("ದಯವಿಟ್ಟು ಮೊಬೈಲ್ ನಂಬರ್ ನಮೂದಿಸಿ (Phone is required)");
      return;
    }

    setLoading(true);
    try {
      const generatedCode = generateUniqueReferralCode(form.phone);

      const newAgent: AgentProfile = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        agencyName: form.agencyName.trim() || undefined,
        skill: form.skill,
        experience: form.experience,
        district: form.district.trim(),
        location: form.location.trim(),
        description: form.description.trim() || undefined,
        referralId: generatedCode,
        photoUrl: photoPreview || undefined,
        registeredAt: new Date().toISOString(),
      };

      // Save agent profile locally
      localStorage.setItem(storageKey, JSON.stringify(newAgent));
      setAgentProfile(newAgent);

      // Also create an Agent listing in the backend if logged in
      if (api.getToken()) {
        try {
          await api.createListing(
            {
              title: `${newAgent.name} - ಅಧಿಕೃತ ಏಜೆಂಟ್ (${newAgent.skill})`,
              category: "agents",
              location: newAgent.location || newAgent.district,
              district: newAgent.district,
              skill: newAgent.skill,
              experience: newAgent.experience,
              description: newAgent.description || `ಅಧಿಕೃತ Dealspot ಏಜೆಂಟ್. ರೆಫರಲ್ ಕೋಡ್: ${newAgent.referralId}`,
              rateInfo: `Referral ID: ${newAgent.referralId}`,
            },
            photoFile ? [photoFile] : undefined
          );
        } catch {
          // backend sync is best-effort for UI
        }
      }

      toast.success("ಅಭಿನಂದನೆಗಳು! ನೀವು ಅಧಿಕೃತ ಏಜೆಂಟ್ ಆಗಿ ನೋಂದಾಯಿಸಿದ್ದೀರಿ!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "ನೋಂದಣಿ ವಿಫಲವಾಗಿದೆ";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Re-generate / refresh referral ID
  const handleRegenerateReferralId = () => {
    if (!agentProfile) return;
    setGenerating(true);
    setTimeout(() => {
      const newCode = generateUniqueReferralCode(agentProfile.phone);
      const updated = { ...agentProfile, referralId: newCode };
      setAgentProfile(updated);
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setGenerating(false);
      toast.success(`ಹೊಸ ರೆಫರಲ್ ಐಡಿ ರಚಿಸಲಾಗಿದೆ: ${newCode}`);
    }, 400);
  };

  // Copy referral code to clipboard
  const handleCopyCode = () => {
    if (!agentProfile?.referralId) return;
    navigator.clipboard.writeText(agentProfile.referralId);
    setCopied(true);
    toast.success("ರೆಫರಲ್ ಕೋಡ್ ನಕಲಿಸಲಾಗಿದೆ! (Referral Code Copied)");
    setTimeout(() => setCopied(false), 2000);
  };

  // Share via WhatsApp
  const handleShareWhatsApp = () => {
    if (!agentProfile?.referralId) return;
    const shareMessage = `*ನಮಸ್ಕಾರ!* 👋\nನಾನು Dealspot ನ ಅಧಿಕೃತ ಏಜೆಂಟ್: *${agentProfile.name}*.\n\nನನ್ನ ಅನನ್ಯ ಏಜೆಂಟ್ ರೆಫರಲ್ ಕೋಡ್: *${agentProfile.referralId}*\n\nDealspot ನಲ್ಲಿ ಆಸ್ತಿ, ಕೃಷಿ ಯಂತ್ರ, ವಾಹನ ಅಥವಾ ಜಾನುವಾರುಗಳ ಡೀಲ್ ಮಾಡಲು ನನ್ನ ರೆಫರಲ್ ಕೋಡ್ ಬಳಸಿ ಸಂಪರ್ಕಿಸಿ! 🌾🏠🚗\n\nhttps://dealspot.in`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 pb-28 lg:pb-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground overflow-x-auto">
        <Link href="/home" className="hover:text-primary shrink-0">ಹೋಮ್</Link>
        <span>/</span>
        <Link href="/category/agents" className="hover:text-primary shrink-0">ಏಜೆಂಟರು (Agents)</Link>
        <span>/</span>
        <span className="text-foreground font-medium shrink-0">
          {agentProfile ? "ಏಜೆಂಟ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್" : "ಏಜೆಂಟ್ ನೋಂದಣಿ"}
        </span>
      </div>

      {/* ─── STATE A: ALREADY REGISTERED AGENT DASHBOARD & REFERRAL ID ─── */}
      {agentProfile ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-primary rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 opacity-15 text-white pointer-events-none">
              <ShieldCheck size={200} />
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-3xl shrink-0 overflow-hidden shadow-md">
                  {agentProfile.photoUrl ? (
                    <img src={agentProfile.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>🤝</span>
                  )}
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-yellow-400/20 text-yellow-200 border border-yellow-400/30 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-1">
                    <Award size={13} /> ಅಧಿಕೃತ ನೋಂದಾಯಿತ ಏಜೆಂಟ್ (Verified Agent)
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold leading-tight">{agentProfile.name}</h1>
                  <p className="text-white/80 text-xs sm:text-sm mt-0.5 flex items-center gap-1">
                    <MapPin size={12} /> {agentProfile.location ? `${agentProfile.location}, ` : ""}{agentProfile.district} • {agentProfile.skill}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setAgentProfile(null)}
                className="text-xs bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded-xl border border-white/20 transition self-end sm:self-auto"
              >
                ಮಾಹಿತಿ ತಿದ್ದುಪಡಿ (Edit)
              </button>
            </div>
          </div>

          {/* ─── UNIQUE REFERRAL ID SPOTLIGHT CARD ─── */}
          <div className="bg-card rounded-2xl sm:rounded-3xl p-5 sm:p-7 border-2 border-primary/20 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-foreground">ನಿಮ್ಮ ಅನನ್ಯ ರೆಫರಲ್ ಐಡಿ (Unique Referral ID)</h2>
                  <p className="text-xs text-muted-foreground">ಗ್ರಾಹಕರೊಂದಿಗೆ ಹಂಚಿಕೊಳ್ಳಿ ಮತ್ತು ಕಮಿಷನ್ ಪಡೆಯಿರಿ</p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleRegenerateReferralId}
                disabled={generating}
                className="text-xs text-muted-foreground hover:text-primary gap-1"
                title="ಹೊಸ ರೆಫರಲ್ ಐಡಿ ರಚಿಸಿ"
              >
                <RefreshCw size={13} className={generating ? "animate-spin text-primary" : ""} />
                <span className="hidden sm:inline">ಹೊಸ ಐಡಿ ರಚಿಸಿ</span>
              </Button>
            </div>

            {/* Big Referral Code Display Box */}
            <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 border-2 border-dashed border-primary/40 rounded-2xl p-4 sm:p-6 text-center my-4">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1">
                Your Agent Referral Code
              </p>
              <div className="text-2xl sm:text-4xl font-extrabold text-primary font-mono tracking-wider select-all py-1">
                {agentProfile.referralId}
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
                ಈ ಕೋಡ್ ಬಳಸುವ ಪ್ರತಿಯೊಂದು ಗ್ರಾಹಕ ಲೀಡ್ ಮತ್ತು ಅನ್‌ಲಾಕ್‌ಗೆ ನಿಮಗೆ ಕಮಿಷನ್ ಸಿಗುತ್ತದೆ.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <Button
                onClick={handleCopyCode}
                className="h-11 sm:h-12 bg-primary hover:bg-primary/90 text-white font-medium text-sm gap-2"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? "ಕೋಡ್ ನಕಲಿಸಲಾಗಿದೆ! (Copied)" : "ರೆಫರಲ್ ಕೋಡ್ ಕಾಪಿ ಮಾಡಿ (Copy Code)"}
              </Button>

              <Button
                onClick={handleShareWhatsApp}
                className="h-11 sm:h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm gap-2"
              >
                <Share2 size={18} />
                ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ (Share WhatsApp)
              </Button>
            </div>
          </div>

          {/* ─── REFERRAL EARNINGS & METRICS ─── */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-card rounded-2xl p-4 border border-border shadow-xs text-center">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto mb-2">
                <Users size={18} />
              </div>
              <p className="text-lg sm:text-2xl font-bold text-foreground">0</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground">ರೆಫರ್ ಮಾಡಿದ ಗ್ರಾಹಕರು</p>
            </div>

            <div className="bg-card rounded-2xl p-4 border border-border shadow-xs text-center">
              <div className="w-9 h-9 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center mx-auto mb-2">
                <TrendingUp size={18} />
              </div>
              <p className="text-lg sm:text-2xl font-bold text-foreground">0</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground">ಯಶಸ್ವಿ ಡೀಲ್‌ಗಳು</p>
            </div>

            <div className="bg-card rounded-2xl p-4 border border-border shadow-xs text-center">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mx-auto mb-2">
                <Wallet size={18} />
              </div>
              <p className="text-lg sm:text-2xl font-bold text-foreground">₹0</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground">ಗಳಿಸಿದ ಕಮಿಷನ್</p>
            </div>
          </div>

          {/* ─── HOW AGENT REFERRALS WORK GUIDE ─── */}
          <div className="bg-muted/40 rounded-2xl p-5 border border-border space-y-3">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <Sparkles size={16} className="text-primary" /> ಏಜೆಂಟ್ ರೆಫರಲ್ ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ? (How It Works)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
              <div className="bg-card p-3 rounded-xl border border-border/60">
                <span className="font-bold text-primary block mb-1">1. ಕೋಡ್ ಹಂಚಿಕೊಳ್ಳಿ</span>
                ನಿಮ್ಮ ಗ್ರಾಮ ಮತ್ತು ಸಂಪರ್ಕದ ಗ್ರಾಹಕರಿಗೆ ನಿಮ್ಮ ಅನನ್ಯ ರೆಫರಲ್ ಐಡಿ ನೀಡಿ.
              </div>
              <div className="bg-card p-3 rounded-xl border border-border/60">
                <span className="font-bold text-primary block mb-1">2. ಡೀಲ್ ನೋಂದಣಿ</span>
                ಗ್ರಾಹಕರು ಡೀಲ್‌ಸ್ಪಾಟ್‌ನಲ್ಲಿ ನಿಮ್ಮ ರೆಫರಲ್ ಐಡಿ ಮೂಲಕ ಖಾತೆ ಅಥವಾ ಜಾಹೀರಾತು ಹಾಕುತ್ತಾರೆ.
              </div>
              <div className="bg-card p-3 rounded-xl border border-border/60">
                <span className="font-bold text-primary block mb-1">3. ಕಮಿಷನ್ ಗಳಿಸಿ</span>
                ಪ್ರತಿ ಜಾಹೀರಾತು ಮತ್ತು ಕಾಂಟ್ಯಾಕ್ಟ್ ಅನ್‌ಲಾಕ್‌ಗೆ ನಿಮ್ಮ ಖಾತೆಗೆ ಕಮಿಷನ್ ಜಮೆಯಾಗುತ್ತದೆ.
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <Link href="/category/agents">
              <Button variant="outline" className="gap-2 text-xs sm:text-sm">
                ಇತರ ಏಜೆಂಟರನ್ನು ನೋಡಿ (View All Agents) <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* ─── STATE B: AGENT REGISTRATION FORM ─── */
        <div className="bg-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-border shadow-sm space-y-6">
          {/* Header */}
          <div className="border-b border-border pb-5">
            <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold mb-2">
              <UserCheck size={14} /> ಅಧಿಕೃತ ಏಜೆಂಟ್ ನೋಂದಣಿ
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              Dealspot ಏಜೆಂಟ್ ಆಗಿ ನೋಂದಾಯಿಸಿ (Register as Agent)
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              ಗ್ರಾಹಕರನ್ನು ಸಂಪರ್ಕಿಸಿ, ಅನನ್ಯ ರೆಫರಲ್ ಐಡಿ ಪಡೆಯಿರಿ ಮತ್ತು ಕಮಿಷನ್ ಗಳಿಸಲು ಪ್ರಾರಂಭಿಸಿ.
            </p>
          </div>

          {/* Key Perks Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="bg-muted/40 p-2.5 sm:p-3 rounded-xl border border-border/60 text-center">
              <span className="text-lg">🆔</span>
              <p className="text-[11px] sm:text-xs font-semibold text-foreground mt-1">ಅನನ್ಯ ರೆಫರಲ್ ಐಡಿ</p>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground">Unique Referral Code</p>
            </div>
            <div className="bg-muted/40 p-2.5 sm:p-3 rounded-xl border border-border/60 text-center">
              <span className="text-lg">💰</span>
              <p className="text-[11px] sm:text-xs font-semibold text-foreground mt-1">ಡೀಲ್ ಕಮಿಷನ್</p>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground">Deal Commissions</p>
            </div>
            <div className="bg-muted/40 p-2.5 sm:p-3 rounded-xl border border-border/60 text-center">
              <span className="text-lg">⭐</span>
              <p className="text-[11px] sm:text-xs font-semibold text-foreground mt-1">ಅಧಿಕೃತ ಬ್ಯಾಡ್ಜ್</p>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground">Verified Agent Badge</p>
            </div>
            <div className="bg-muted/40 p-2.5 sm:p-3 rounded-xl border border-border/60 text-center">
              <span className="text-lg">📲</span>
              <p className="text-[11px] sm:text-xs font-semibold text-foreground mt-1">ಗ್ರಾಹಕ ಲೀಡ್‌ಗಳು</p>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground">Direct Client Leads</p>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4 sm:space-y-5 pt-1">
            {/* Profile Photo */}
            <div>
              <label className="text-xs sm:text-sm font-medium text-foreground mb-2 block">
                ಏಜೆಂಟ್ ಪ್ರೊಫೈಲ್ ಫೋಟೋ (Agent Profile Photo)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
              <div className="flex items-center gap-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-dashed border-border flex items-center justify-center bg-muted/40 hover:border-primary cursor-pointer transition overflow-hidden shrink-0"
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Camera size={22} className="mx-auto mb-1" />
                      <span className="text-[10px] block">ಫೋಟೋ ಹಾಕಿ</span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">ನಿಮ್ಮ ಸ್ಪಷ್ಟ ಪ್ರೊಫೈಲ್ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ</p>
                  <p className="mt-0.5">ಗ್ರಾಹಕರು ನಿಮ್ಮನ್ನು ಸುಲಭವಾಗಿ ಗುರುತಿಸಲು ಸಹಾಯವಾಗುತ್ತದೆ.</p>
                </div>
              </div>
            </div>

            {/* Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-xs sm:text-sm font-medium text-foreground mb-1 block">
                  ಏಜೆಂಟ್ ಪೂರ್ಣ ಹೆಸರು (Full Name) *
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು"
                  className="h-11"
                  required
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-medium text-foreground mb-1 block">
                  ಮೊಬೈಲ್ ನಂಬರ್ (Phone Number) *
                </label>
                <div className="flex gap-2">
                  <div className="w-14 h-11 border rounded-md flex items-center justify-center text-xs bg-muted text-foreground shrink-0 font-mono">
                    +91
                  </div>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="98765 43210"
                    type="tel"
                    className="h-11 flex-1 font-mono"
                    maxLength={10}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Specialization & Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-xs sm:text-sm font-medium text-foreground mb-1 block">
                  ಸೇವೆ ಪ್ರಕಾರ (Specialization Domain) *
                </label>
                <select
                  value={form.skill}
                  onChange={(e) => setForm({ ...form, skill: e.target.value })}
                  className="w-full h-11 px-3 rounded-md border border-input bg-background text-foreground text-xs sm:text-sm focus:ring-2 focus:ring-primary"
                >
                  {specializations.map((spec) => (
                    <option key={spec.id} value={spec.label}>
                      {spec.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-medium text-foreground mb-1 block">
                  ಅನುಭವ (Experience) *
                </label>
                <select
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  className="w-full h-11 px-3 rounded-md border border-input bg-background text-foreground text-xs sm:text-sm focus:ring-2 focus:ring-primary"
                >
                  {experienceLevels.map((exp) => (
                    <option key={exp} value={exp}>
                      {exp}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* District & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-xs sm:text-sm font-medium text-foreground mb-1 block">
                  ಜಿಲ್ಲೆ (District) *
                </label>
                <Input
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                  placeholder="ಮಂಡ್ಯ / ಮೈಸೂರು / ಹಾಸನ"
                  className="h-11"
                  required
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-medium text-foreground mb-1 block">
                  ತಾಲೂಕು / ಗ್ರಾಮ / ವ್ಯಾಪ್ತಿ (Town / Village / Service Area)
                </label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="ಮದ್ದೂರು, ಮಳವಳ್ಳಿ ಇತ್ಯಾದಿ"
                  className="h-11"
                />
              </div>
            </div>

            {/* Agency Name (optional) */}
            <div>
              <label className="text-xs sm:text-sm font-medium text-foreground mb-1 block">
                ಏಜೆನ್ಸಿ / ಸಂಸ್ಥೆ ಹೆಸರು (Agency / Business Name - Optional)
              </label>
              <Input
                value={form.agencyName}
                onChange={(e) => setForm({ ...form, agencyName: e.target.value })}
                placeholder="ಉದಾ: ಮಂಡ್ಯ ರಿಯಲ್ ಎಸ್ಟೇಟ್ ಕನ್ಸಲ್ಟೆಂಟ್ಸ್"
                className="h-11"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs sm:text-sm font-medium text-foreground mb-1 block">
                ನಿಮ್ಮ ಸೇವೆಗಳ ವಿವರಣೆ (About Your Agent Services)
              </label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="ನೀವು ಒದಗಿಸುವ ಡೀಲ್‌ಗಳು ಮತ್ತು ಸೇವೆಗಳ ಬಗ್ಗೆ ಸಂಕ್ಷಿಪ್ತವಾಗಿ ಬರೆಯಿರಿ..."
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold text-sm sm:text-base gap-2 rounded-xl shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> ನೋಂದಾಯಿಸಲಾಗುತ್ತಿದೆ...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} /> ಏಜೆಂಟ್ ಆಗಿ ನೋಂದಾಯಿಸಿ & ರೆಫರಲ್ ಐಡಿ ಪಡೆಯಿರಿ (Register & Get Referral ID)
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
