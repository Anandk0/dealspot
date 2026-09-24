"use client";
import { Globe, Bell, Moon, Shield, Trash2 } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { toast } from "sonner";

const settingsItems = [
  { icon: Globe, label: "ಭಾಷೆ (Language)", value: "ಕನ್ನಡ", action: () => toast.info("ಭಾಷೆ: ಕನ್ನಡ ✓") },
  { icon: Bell, label: "ಅಧಿಸೂಚನೆಗಳು (Notifications)", value: "ಆನ್", action: () => toast.info("ಅಧಿಸೂಚನೆಗಳು ಆನ್") },
  { icon: Moon, label: "ಡಾರ್ಕ್ ಮೋಡ್ (Dark Mode)", value: "ಆಫ್", action: () => toast.info("ಡಾರ್ಕ್ ಮೋಡ್ ಬರಲಿದೆ!") },
  { icon: Shield, label: "ಗೌಪ್ಯತೆ (Privacy)", value: "", action: () => toast.info("ಗೌಪ್ಯತೆ ನೀತಿ") },
  { icon: Trash2, label: "ಖಾತೆ ಅಳಿಸಿ (Delete Account)", value: "", action: () => toast.info("ಈ ವೈಶಿಷ್ಟ್ಯ ಶೀಘ್ರದಲ್ಲಿ ಬರಲಿದೆ (Coming soon)"), danger: true },
];

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-5 sm:p-6 pb-28 lg:pb-8">
        <h1 className="text-xl font-bold text-foreground mb-4 sm:mb-6">ಸೆಟ್ಟಿಂಗ್ಸ್ (Settings)</h1>

        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          {settingsItems.map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              className="flex items-center gap-3.5 sm:gap-4 px-4 py-4 sm:px-6 sm:py-5 w-full text-left hover:bg-muted/50 transition border-b border-border last:border-0"
            >
              <item.icon size={20} className={item.danger ? "text-red-500 shrink-0" : "text-muted-foreground shrink-0"} />
              <span className={`flex-1 text-sm font-medium truncate ${item.danger ? "text-red-500" : "text-foreground"}`}>
                {item.label}
              </span>
              {item.value && (
                <span className="text-xs sm:text-sm text-muted-foreground bg-muted px-2.5 py-1 rounded-full shrink-0">{item.value}</span>
              )}
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">Deal Spot ಆವೃತ್ತಿ 1.0.0</p>
      </div>
    </AppLayout>
  );
}
