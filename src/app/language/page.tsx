"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/lang-context";
import { Check } from "lucide-react";
export default function LanguageSelection() {
  const router = useRouter();
  const { lang, setLang } = useLang();
  const choose = (l: "kn" | "en") => {
    setLang(l);
    router.push("/home");
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <img src="/logo.png" alt="Deal Spot" className="w-20 h-20 rounded-full object-cover border border-border mb-4" />
      <h1 className="text-2xl font-semibold text-foreground mb-1">Deal Spot</h1>
      <p className="text-lg text-primary mb-8">ಡೀಲ್ ಸ್ಪಾಟ್</p>
      <div className="w-full max-w-xs space-y-4">
        <p className="text-center text-muted-foreground text-sm mb-4">
          ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ / Select Language
        </p>
        <Button
          onClick={() => choose("kn")}
          className="w-full h-14 text-base bg-primary hover:bg-primary/90"
        >
          {lang === "kn" && <Check size={16} strokeWidth={1.5} className="mr-2" />}
          ಕನ್ನಡ
        </Button>
        <Button
          onClick={() => choose("en")}
          variant="outline"
          className={`w-full h-14 text-base border-primary text-primary hover:bg-primary/5 ${lang === "en" ? "bg-primary/10" : ""}`}
        >
          {lang === "en" && <Check size={16} strokeWidth={1.5} className="mr-2" />}
          English
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-8">
        ನಂತರ ಬದಲಾಯಿಸಬಹುದು / Can be changed later
      </p>
    </div>
  );
}
