"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const handleSendOtp = () => {
    if (phone.length < 10) {
      toast.error("ದಯವಿಟ್ಟು ಸರಿಯಾದ ಫೋನ್ ನಂಬರ್ ನಮೂದಿಸಿ");
      return;
    }
    setOtpSent(true);
    toast.success("OTP ಕಳುಹಿಸಲಾಗಿದೆ!");
  };

  const handleVerifyOtp = () => {
    if (otp.length < 4) {
      toast.error("ದಯವಿಟ್ಟು OTP ನಮೂದಿಸಿ");
      return;
    }
    toast.success("ಯಶಸ್ವಿಯಾಗಿ ಲಾಗಿನ್ ಆಗಿದೆ!");
    router.push("/home");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-green-50 to-white">
      <div className="text-5xl mb-4">🌾</div>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Deal Spot</h1>
      <p className="text-sm text-gray-500 mb-8">ಡೀಲ್ ಸ್ಪಾಟ್</p>

      <div className="w-full max-w-xs space-y-4">
        {!otpSent ? (
          <>
            <p className="text-center text-gray-600 text-sm">
              ಫೋನ್ ನಂಬರ್ ನಮೂದಿಸಿ
            </p>
            <div className="flex gap-2">
              <div className="w-16 h-12 border rounded-md flex items-center justify-center text-sm font-medium bg-gray-50">
                +91
              </div>
              <Input
                type="tel"
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12 text-lg"
                maxLength={10}
              />
            </div>
            <Button onClick={handleSendOtp} className="w-full h-12 text-base bg-primary">
              OTP ಕಳುಹಿಸಿ (Send OTP)
            </Button>
          </>
        ) : (
          <>
            <p className="text-center text-gray-600 text-sm">
              OTP ನಮೂದಿಸಿ
            </p>
            <Input
              type="number"
              placeholder="● ● ● ●"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="h-14 text-2xl text-center tracking-widest"
              maxLength={4}
            />
            <p className="text-xs text-gray-400 text-center">
              (ಡೆಮೋ: ಯಾವುದೇ 4 ಅಂಕಿ ನಮೂದಿಸಿ)
            </p>
            <Button onClick={handleVerifyOtp} className="w-full h-12 text-base bg-primary">
              ದೃಢೀಕರಿಸಿ (Verify)
            </Button>
            <button
              onClick={() => toast.success("OTP ಮರು ಕಳುಹಿಸಲಾಗಿದೆ!")}
              className="w-full text-center text-sm text-primary"
            >
              OTP ಮರು ಕಳುಹಿಸಿ
            </button>
          </>
        )}
      </div>
    </div>
  );
}
