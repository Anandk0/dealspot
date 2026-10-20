"use client";
import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from "react";
import { api, UserData } from "./api";

// Auto-logout after this much inactivity (no mouse/key/touch/scroll).
const INACTIVITY_LIMIT_MS = 30 * 60 * 1000; // 30 minutes
const LAST_ACTIVITY_KEY = "dealspot_last_activity";

interface AuthContextType {
  user: UserData | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (userData: { userId: number; name: string; phone: string }) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("dealspot_token");
    // If the last activity is older than the inactivity limit, treat the
    // session as expired: clear tokens and don't restore the user.
    const lastActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY));
    if (lastActivity && Date.now() - lastActivity >= INACTIVITY_LIMIT_MS) {
      try {
        localStorage.removeItem("dealspot_token");
        localStorage.removeItem("dealspot_refresh_token");
        localStorage.removeItem("dealspot_user");
        localStorage.removeItem(LAST_ACTIVITY_KEY);
      } catch { /* ignore */ }
      setIsLoading(false);
      return;
    }

    if (token) {
      // Race between profile fetch and a 5s timeout
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 5000)
      );

      Promise.race([api.getProfile(), timeout])
        .then((profile) => setUser(profile as UserData))
        .catch(() => setUser(null))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (userData: { userId: number; name: string; phone: string }) => {
    // Start the inactivity clock fresh on login.
    try { localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now())); } catch { /* ignore */ }
    // Set basic user data immediately for UI responsiveness
    setUser({
      id: userData.userId,
      name: userData.name,
      phone: userData.phone,
      createdAt: new Date().toISOString(),
    });
    // Fetch full profile (including role) from server
    try {
      const profile = await api.getProfile();
      setUser(profile);
    } catch {
      // Keep the basic data if profile fetch fails
    }
  };

  const logout = async () => {
    await api.logout();
    try { localStorage.removeItem(LAST_ACTIVITY_KEY); } catch { /* ignore */ }
    setUser(null);
  };

  // ── Inactivity auto-logout ──────────────────────────────
  // Logs the user out after INACTIVITY_LIMIT_MS of no interaction. The last
  // activity time is persisted so closing and reopening the tab still enforces
  // the limit. Only active while logged in.
  const activityRef = useRef<number>(Date.now());

  const forceLogout = useCallback(async () => {
    try { localStorage.removeItem(LAST_ACTIVITY_KEY); } catch { /* ignore */ }
    try { await api.logout(); } catch { /* ignore */ }
    setUser(null);
    if (typeof window !== "undefined") window.location.href = "/login";
  }, []);

  useEffect(() => {
    if (!user) return; // only enforce while logged in

    const markActivity = () => {
      activityRef.current = Date.now();
      try { localStorage.setItem(LAST_ACTIVITY_KEY, String(activityRef.current)); } catch { /* ignore */ }
    };

    // Seed from any persisted value; if already past the limit, log out now.
    try {
      const saved = Number(localStorage.getItem(LAST_ACTIVITY_KEY));
      if (saved && Date.now() - saved >= INACTIVITY_LIMIT_MS) {
        forceLogout();
        return;
      }
    } catch { /* ignore */ }
    markActivity();

    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"] as const;
    events.forEach((e) => window.addEventListener(e, markActivity, { passive: true }));

    // Check once a minute whether the inactivity window has elapsed.
    const interval = setInterval(() => {
      if (Date.now() - activityRef.current >= INACTIVITY_LIMIT_MS) {
        forceLogout();
      }
    }, 60 * 1000);

    return () => {
      events.forEach((e) => window.removeEventListener(e, markActivity));
      clearInterval(interval);
    };
  }, [user, forceLogout]);

  const refreshProfile = async () => {
    try {
      const profile = await api.getProfile();
      setUser(profile);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      isLoading,
      login,
      logout,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
