"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "kn" | "en";

interface LangContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (kn: string, en: string) => string;
}

const LangContext = createContext<LangContextType>({
  lang: "kn",
  setLang: () => {},
  t: (kn) => kn,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("kn");

  useEffect(() => {
    const saved = localStorage.getItem("dealspot_lang") as Language | null;
    if (saved === "en" || saved === "kn") setLangState(saved);
  }, []);

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem("dealspot_lang", l);
  };

  const t = (kn: string, en: string) => (lang === "en" ? en : kn);

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
