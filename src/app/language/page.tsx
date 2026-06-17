"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LanguageSelection() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-green-50 to-white">
      <div className="text-5xl mb-4">🌾</div>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Deal Spot</h1>
      <p className="text-lg text-primary font-medium mb-8">ಡೀಲ್ ಸ್ಪಾಟ್</p>

      <div className="w-full max-w-xs space-y-4">
        <p className="text-center text-gray-600 text-sm mb-4">
          ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ / Select Language
        </p>
        <Button
          onClick={() => router.push("/login")}
          className="w-full h-14 text-lg bg-primary hover:bg-primary/90"
        >
          ಕನ್ನಡ
        </Button>
        <Button
          onClick={() => router.push("/login")}
          variant="outline"
          className="w-full h-14 text-lg border-primary text-primary hover:bg-primary/5"
        >
          English
        </Button>
      </div>

      <p className="text-xs text-gray-400 mt-8">
        ನಂತರ ಬದಲಾಯಿಸಬಹುದು / Can be changed later
      </p>
    </div>
  );
}
