"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api, UserData } from "./api";

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
    if (token) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout
      
      api.getProfile()
        .then(setUser)
        .catch(() => {
          setUser(null);
        })
        .finally(() => {
          clearTimeout(timeout);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (userData: { userId: number; name: string; phone: string }) => {
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
    setUser(null);
  };

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
