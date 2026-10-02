"use client";
import { AuthProvider } from "@/lib/auth-context";
import { LangProvider } from "@/lib/lang-context";
import { LocationProvider } from "@/lib/location-context";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <LangProvider>
        <AuthProvider>
          <LocationProvider>{children}</LocationProvider>
        </AuthProvider>
      </LangProvider>
    </ThemeProvider>
  );
}
