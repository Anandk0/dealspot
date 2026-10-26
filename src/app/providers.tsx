"use client";
import { AuthProvider } from "@/lib/auth-context";
import { LangProvider } from "@/lib/lang-context";
import { LocationProvider } from "@/lib/location-context";
import { ThemeProvider } from "next-themes";
import PointerLockGuard from "@/components/PointerLockGuard";
import SplashReveal from "@/components/SplashReveal";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <LangProvider>
        <AuthProvider>
          <LocationProvider>
            <PointerLockGuard />
            <SplashReveal />
            {children}
          </LocationProvider>
        </AuthProvider>
      </LangProvider>
    </ThemeProvider>
  );
}
