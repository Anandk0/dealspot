"use client";
import AppLayout from "@/components/AppLayout";

export default function AboutPage() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-5 sm:p-6 pb-28 lg:pb-8">
        <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-sm border border-border">
          <div className="text-center mb-8">
            <div className="text-6xl mb-3">🌾</div>
            <h2 className="text-3xl font-bold text-primary">Deal Spot</h2>
            <p className="text-xl text-muted-foreground">ಡೀಲ್ ಸ್ಪಾಟ್</p>
            <p className="text-xs sm:text-sm text-muted-foreground/80 mt-2">ಆವೃತ್ತಿ 1.0.0 | ಗ್ರಾಮೀಣ ಮಾರುಕಟ್ಟೆ ವೇದಿಕೆ</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-base text-foreground">ನಮ್ಮ ಬಗ್ಗೆ</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Deal Spot ಕರ್ನಾಟಕದ ಗ್ರಾಮೀಣ ಪ್ರದೇಶಗಳಿಗಾಗಿ ವಿಶೇಷವಾಗಿ ರಚಿಸಲಾದ ಮಾರುಕಟ್ಟೆ ವೇದಿಕೆ. ರೈತರು, ಕಾರ್ಮಿಕರು, ಮತ್ತು ಸ್ಥಳೀಯ ಸೇವಾ ಪೂರೈಕೆದಾರರನ್ನು ಒಂದೇ ವೇದಿಕೆಯಲ್ಲಿ ಸಂಪರ್ಕಿಸುವುದು ನಮ್ಮ ಗುರಿ.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Deal Spot is a rural marketplace platform designed specifically for Karnataka villages. Our mission is to connect farmers, laborers, and local service providers on a single platform.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-base text-foreground">ನಮ್ಮ ಸೇವೆಗಳು</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">🌾 ಕೃಷಿ ಉತ್ಪನ್ನ ಮಾರಾಟ</li>
                <li className="flex items-center gap-2">🐄 ಜಾನುವಾರು ವ್ಯಾಪಾರ</li>
                <li className="flex items-center gap-2">🚜 ಕೃಷಿ ಉಪಕರಣ & ಟ್ರ್ಯಾಕ್ಟರ್ ಬಾಡಿಗೆ</li>
                <li className="flex items-center gap-2">🚗 ವಾಹನ ಬಾಡಿಗೆ</li>
                <li className="flex items-center gap-2">👨‍🌾 ಕೂಲಿ ಕಾರ್ಮಿಕ ಮಾರುಕಟ್ಟೆ</li>
                <li className="flex items-center gap-2">🏞️ ಕೃಷಿ ಭೂಮಿ ಮಾರಾಟ</li>
                <li className="flex items-center gap-2">🔧 ಸ್ಥಳೀಯ ಸೇವೆಗಳು</li>
              </ul>
            </div>
          </div>

          {/* Founders */}
          <div className="mt-8 pt-8 border-t border-border">
            <h3 className="font-semibold text-base text-foreground text-center mb-1">
              ನಮ್ಮ ಸಂಸ್ಥಾಪಕರು
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-6">Our Founders</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl mx-auto">
              {FOUNDERS.map((f) => (
                <div key={f.name} className="flex flex-col items-center text-center">
                  <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden ring-4 ring-primary/15 shadow-md bg-muted">
                    <img
                      src={f.image}
                      alt={f.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="mt-3 font-semibold text-foreground">{f.name}</p>
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
  { name: "Dayanand Marathe", role: "Co-Founder / ಸಹ-ಸಂಸ್ಥಾಪಕ", image: "/founder-dayanand.png" },
  { name: "Sachin Kuri", role: "Co-Founder / ಸಹ-ಸಂಸ್ಥಾಪಕ", image: "/founder-sachin.png" },
];
