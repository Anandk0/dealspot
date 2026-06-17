"use client";
import { Globe, Bell, Moon, Shield, Trash2 } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { toast } from "sonner";

const settingsItems = [
  { icon: Globe, label: "ಭಾಷೆ (Language)", value: "ಕನ್ನಡ", action: () => toast.info("ಭಾಷೆ: ಕನ್ನಡ ✓") },
  { icon: Bell, label: "ಅಧಿಸೂಚನೆಗಳು (Notifications)", value: "ಆನ್", action: () => toast.info("ಅಧಿಸೂಚನೆಗಳು ಆನ್") },
  { icon: Moon, label: "ಡಾರ್ಕ್ ಮೋಡ್ (Dark Mode)", value: "ಆಫ್", action: () => toast.info("ಡಾರ್ಕ್ ಮೋಡ್ ಬರಲಿದೆ!") },
  { icon: Shield, label: "ಗೌಪ್ಯತೆ (Privacy)", value: "", action: () => toast.info("ಗೌಪ್ಯತೆ ನೀತಿ") },
  { icon: Trash2, label: "ಖಾತೆ ಅಳಿಸಿ (Delete Account)", value: "", action: () => toast.error("ಡೆಮೋ ಮೋಡ್‌ನಲ್ಲಿ ಲಭ್ಯವಿಲ್ಲ"), danger: true },
];

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-xl font-bold text-gray-800 mb-6">ಸೆಟ್ಟಿಂಗ್ಸ್ (Settings)</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {settingsItems.map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              className={`flex items-center gap-4 px-6 py-5 w-full text-left hover:bg-gray-50 transition border-b border-gray-50 last:border-0`}
            >
              <item.icon size={20} className={item.danger ? "text-red-500" : "text-gray-500"} />
              <span className={`flex-1 text-sm font-medium ${item.danger ? "text-red-500" : "text-gray-700"}`}>
                {item.label}
              </span>
              {item.value && (
                <span className="text-sm text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{item.value}</span>
              )}
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">Deal Spot ಆವೃತ್ತಿ 1.0.0 (Demo)</p>
      </div>
    </AppLayout>
  );
}
