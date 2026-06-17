"use client";
import AppLayout from "@/components/AppLayout";

export default function AboutPage() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="text-center mb-8">
            <div className="text-6xl mb-3">🌾</div>
            <h2 className="text-3xl font-bold text-primary">Deal Spot</h2>
            <p className="text-xl text-gray-600">ಡೀಲ್ ಸ್ಪಾಟ್</p>
            <p className="text-sm text-gray-400 mt-2">ಆವೃತ್ತಿ 1.0.0 | ಗ್ರಾಮೀಣ ಮಾರುಕಟ್ಟೆ ವೇದಿಕೆ</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-base">ನಮ್ಮ ಬಗ್ಗೆ</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Deal Spot ಕರ್ನಾಟಕದ ಗ್ರಾಮೀಣ ಪ್ರದೇಶಗಳಿಗಾಗಿ ವಿಶೇಷವಾಗಿ ರಚಿಸಲಾದ ಮಾರುಕಟ್ಟೆ ವೇದಿಕೆ. ರೈತರು, ಕಾರ್ಮಿಕರು, ಮತ್ತು ಸ್ಥಳೀಯ ಸೇವಾ ಪೂರೈಕೆದಾರರನ್ನು ಒಂದೇ ವೇದಿಕೆಯಲ್ಲಿ ಸಂಪರ್ಕಿಸುವುದು ನಮ್ಮ ಗುರಿ.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Deal Spot is a rural marketplace platform designed specifically for Karnataka villages. Our mission is to connect farmers, laborers, and local service providers on a single platform.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-base">ನಮ್ಮ ಸೇವೆಗಳು</h3>
              <ul className="text-sm text-gray-600 space-y-2">
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

          <p className="text-center text-xs text-gray-400 mt-8 pt-6 border-t">
            © 2026 Deal Spot. All rights reserved.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
