"use client";
import { Wheat, Beef, Tractor, Car, Users, Mountain, Wrench } from "lucide-react";
import AppLayout from "@/components/AppLayout";
const SERVICES = [
  { icon: Wheat, label: "ಕೃಷಿ ಉತ್ಪನ್ನ ಮಾರಾಟ" },
  { icon: Beef, label: "ಜಾನುವಾರು ವ್ಯಾಪಾರ" },
  { icon: Tractor, label: "ಕೃಷಿ ಉಪಕರಣ & ಟ್ರ್ಯಾಕ್ಟರ್ ಬಾಡಿಗೆ" },
  { icon: Car, label: "ವಾಹನ ಬಾಡಿಗೆ" },
  { icon: Users, label: "ಕೂಲಿ ಕಾರ್ಮಿಕ ಮಾರುಕಟ್ಟೆ" },
  { icon: Mountain, label: "ಕೃಷಿ ಭೂಮಿ ಮಾರಾಟ" },
  { icon: Wrench, label: "ಸ್ಥಳೀಯ ಸೇವೆಗಳು" },
];
export default function AboutPage() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-5 sm:p-6 pb-28 lg:pb-8">
        <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border">
          <div className="text-center mb-8">
            <img src="/logo.png" alt="Deal Spot" className="w-16 h-16 rounded-full object-cover border border-border mx-auto mb-4" />
            <h2 className="text-3xl font-semibold text-primary">Deal Spot</h2>
            <p className="text-xl text-muted-foreground">ಡೀಲ್ ಸ್ಪಾಟ್</p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">ಆವೃತ್ತಿ 1.0.0 | ಗ್ರಾಮೀಣ ಮಾರುಕಟ್ಟೆ ವೇದಿಕೆ</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-4">
              <h3 className="font-medium text-base text-foreground">ನಮ್ಮ ಬಗ್ಗೆ</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Deal Spot ಕರ್ನಾಟಕದ ಗ್ರಾಮೀಣ ಪ್ರದೇಶಗಳಿಗಾಗಿ ವಿಶೇಷವಾಗಿ ರಚಿಸಲಾದ ಮಾರುಕಟ್ಟೆ ವೇದಿಕೆ. ರೈತರು, ಕಾರ್ಮಿಕರು, ಮತ್ತು ಸ್ಥಳೀಯ ಸೇವಾ ಪೂರೈಕೆದಾರರನ್ನು ಒಂದೇ ವೇದಿಕೆಯಲ್ಲಿ ಸಂಪರ್ಕಿಸುವುದು ನಮ್ಮ ಗುರಿ.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Deal Spot is a rural marketplace platform designed specifically for Karnataka villages. Our mission is to connect farmers, laborers, and local service providers on a single platform.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-medium text-base text-foreground">ನಮ್ಮ ಸೇವೆಗಳು</h3>
              <ul className="text-sm text-muted-foreground space-y-3">
                {SERVICES.map((s) => (
                  <li key={s.label} className="flex items-center gap-3">
                    <s.icon size={16} strokeWidth={1.5} className="shrink-0" /> {s.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* Founders */}
          <div className="mt-8 pt-8 border-t border-border">
            <h3 className="font-medium text-base text-foreground text-center mb-1">
              ನಮ್ಮ ಸಂಸ್ಥಾಪಕರು
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-6">Our Founders</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl mx-auto">
              {FOUNDERS.map((f) => (
                <div key={f.name} className="flex flex-col items-center text-center">
                  <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border border-border bg-muted">
                    <img
                      src={f.image}
                      alt={f.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="mt-3 font-medium text-foreground">{f.name}</p>
                  <p className="text-xs text-muted-foreground">{f.role}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-8 pt-6 border-t border-border">
            © 2026 Deal Spot. All rights reserved.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
// Founder details. Image filenames in /public contain spaces, so the URLs are
// percent-encoded.
const FOUNDERS: { name: string; role: string; image: string }[] = [
  { name: "Sachin Kuri", role: "Co-Founder / ಸಹ-ಸಂಸ್ಥಾಪಕ", image: "/founder-sachin.png" },
  { name: "Dayanand Marathe", role: "Co-Founder / ಸಹ-ಸಂಸ್ಥಾಪಕ", image: "/founder-dayanand.png" },
];
