"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LeafLoader from "@/components/LeafLoader";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("dealspot_token");
    const timer = setTimeout(() => {
      if (token) {
        router.push("/home");
      } else {
        router.push("/login");
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-primary text-primary-foreground">
      <div className="flex flex-col items-center">
        <img src="/logo.png" alt="Deal Spot Connect" className="w-32 h-32 rounded-full object-cover mb-4" />
        <h1 className="text-4xl font-semibold text-center">Deal Spot</h1>
        <p className="text-xl text-center mt-2 opacity-90">ಡೀಲ್ ಸ್ಪಾಟ್</p>
        <p className="text-sm text-center mt-4 opacity-80">
          ಗ್ರಾಮೀಣ ಮಾರುಕಟ್ಟೆ
        </p>
      </div>
      <div className="absolute bottom-10">
        <div className="rounded-full bg-white p-2 shadow-lg">
          <LeafLoader size={36} />
        </div>
      </div>
    </div>
  );
}
