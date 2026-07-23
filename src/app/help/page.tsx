"use client";
import { Phone, Mail, MessageCircle } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { toast } from "sonner";

const SUPPORT_PHONE = process.env.NEXT_PUBLIC_SUPPORT_PHONE || "—";
const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "—";
const UNLOCK_PRICE_PAISE = Number(process.env.NEXT_PUBLIC_UNLOCK_PRICE_PAISE) || 0;
const UNLOCK_PRICE_DISPLAY = UNLOCK_PRICE_PAISE > 0 ? `₹${UNLOCK_PRICE_PAISE / 100}` : "—";

const faqItems = [
  { q: "ಲಿಸ್ಟಿಂಗ್ ಹೇಗೆ ಹಾಕುವುದು?", a: "ಹೋಮ್ ಪೇಜ್‌ನಲ್ಲಿ '+' ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ, ವಿಭಾಗ ಆಯ್ಕೆಮಾಡಿ, ವಿವರ ನಮೂದಿಸಿ." },
  { q: "ಕಾಂಟ್ಯಾಕ್ಟ್ ಅನ್‌ಲಾಕ್ ಹೇಗೆ?", a: `ಜಾಹೀರಾತಿನಲ್ಲಿ 'ಕಾಂಟ್ಯಾಕ್ಟ್ ನೋಡಿ' ಕ್ಲಿಕ್ ಮಾಡಿ, ${UNLOCK_PRICE_DISPLAY} ಪಾವತಿಸಿ.` },
  { q: "ಜಾಹೀರಾತು ಉಚಿತವೇ?", a: "ಮೊದಲ 3 ಜಾಹೀರಾತು ಉಚಿತ. ನಂತರ ಶುಲ್ಕ ಅನ್ವಯಿಸಬಹುದು." },
  { q: "ಲಿಸ್ಟಿಂಗ್ ಎಷ್ಟು ದಿನ ಇರುತ್ತದೆ?", a: "ಪ್ರತಿ ಲಿಸ್ಟಿಂಗ್ 30 ದಿನ ಸಕ್ರಿಯವಾಗಿರುತ್ತದೆ." },
];

export default function HelpPage() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-xl font-bold text-gray-800 mb-6">ಸಹಾಯ (Help & Support)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* FAQ */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-base mb-4">ಪದೇ ಪದೇ ಕೇಳುವ ಪ್ರಶ್ನೆಗಳು (FAQ)</h3>
              <div className="space-y-4">
                {faqItems.map((item, i) => (
                  <div key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <p className="font-medium text-gray-700">{item.q}</p>
                    <p className="text-sm text-gray-500 mt-1">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-base mb-4">ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ</h3>
              <div className="space-y-4">
                <a href={`tel:${SUPPORT_PHONE}`} className="flex items-center gap-3 w-full text-left p-3 rounded-lg hover:bg-gray-50 transition">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Phone size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{SUPPORT_PHONE}</p>
                    <p className="text-xs text-gray-400">ಕರೆ ಮಾಡಿ</p>
                  </div>
                </a>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-center gap-3 w-full text-left p-3 rounded-lg hover:bg-gray-50 transition">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                    <Mail size={16} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{SUPPORT_EMAIL}</p>
                    <p className="text-xs text-gray-400">ಇಮೇಲ್</p>
                  </div>
                </a>
                <button onClick={() => toast.info("WhatsApp ಚಾಟ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ...")} className="flex items-center gap-3 w-full text-left p-3 rounded-lg hover:bg-gray-50 transition">
                  <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                    <MessageCircle size={16} className="text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">WhatsApp ಸಹಾಯ</p>
                    <p className="text-xs text-gray-400">ಚಾಟ್</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
