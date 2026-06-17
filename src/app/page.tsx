"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SplashScreen() {
  const router = useRouter();
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      router.push("/language");
    }, 2500);
    return () => clearTimeout(timer);
  }, [router]);

  if (!show) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-600 to-green-800 text-white">
      <div className="animate-pulse">
        <div className="text-6xl mb-4 text-center">🌾</div>
        <h1 className="text-4xl font-bold text-center">Deal Spot</h1>
        <p className="text-xl text-center mt-2 text-green-200">ಡೀಲ್ ಸ್ಪಾಟ್</p>
        <p className="text-sm text-center mt-4 text-green-300">
          ಗ್ರಾಮೀಣ ಮಾರುಕಟ್ಟೆ
        </p>
      </div>
      <div className="absolute bottom-10">
        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    </div>
  );
}
