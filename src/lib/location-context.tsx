"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { api } from "./api";
import { useAuth } from "./auth-context";

const STORAGE_KEY = "dealspot_district";       // English name
const STORAGE_KEY_KN = "dealspot_district_kn"; // Kannada name
const DISMISS_KEY = "dealspot_district_prompt_dismissed";
const COORDS_KEY = "dealspot_coords";          // JSON { lat, lng }

export interface Coords {
  lat: number;
  lng: number;
}

interface LocationContextType {
  /** English district name, e.g. "Mysuru". null until chosen. */
  district: string | null;
  /** Kannada district name, e.g. "ಮೈಸೂರು". */
  districtKn: string | null;
  /** The buyer's own GPS coordinates, if they granted location. Used for km distance. */
  coords: Coords | null;
  /** True when we have no district yet and the user hasn't dismissed the prompt. */
  needsPrompt: boolean;
  /** Save a chosen district (persists locally + to the profile when logged in). */
  setDistrict: (nameEn: string, nameKn?: string) => void;
  /** Save the buyer's GPS coordinates (persisted locally). */
  setCoords: (coords: Coords) => void;
  /** Dismiss the first-run prompt without choosing. */
  dismissPrompt: () => void;
  /** Re-open the prompt (e.g. from a header button). */
  openPrompt: () => void;
}

const LocationContext = createContext<LocationContextType>({
  district: null,
  districtKn: null,
  coords: null,
  needsPrompt: false,
  setDistrict: () => {},
  setCoords: () => {},
  dismissPrompt: () => {},
  openPrompt: () => {},
});

export function LocationProvider({ children }: { children: ReactNode }) {
  const { user, isLoggedIn } = useAuth();
  const [district, setDistrictState] = useState<string | null>(null);
  const [districtKn, setDistrictKn] = useState<string | null>(null);
  const [coords, setCoordsState] = useState<Coords | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load any saved district from localStorage on first mount.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const savedKn = localStorage.getItem(STORAGE_KEY_KN);
      if (saved) {
        setDistrictState(saved);
        setDistrictKn(savedKn);
      }
      const savedCoords = localStorage.getItem(COORDS_KEY);
      if (savedCoords) {
        const parsed = JSON.parse(savedCoords);
        if (typeof parsed?.lat === "number" && typeof parsed?.lng === "number") {
          setCoordsState(parsed);
        }
      }
      if (localStorage.getItem(DISMISS_KEY) === "1") {
        setDismissed(true);
      }
    } catch {
      // localStorage unavailable — ignore
    }
    setHydrated(true);
  }, []);

  // If the signed-in user already has a preferred district and we have none
  // locally, adopt it so returning users don't get prompted again.
  useEffect(() => {
    if (!hydrated) return;
    if (!district && isLoggedIn && user?.district) {
      setDistrictState(user.district);
      try {
        localStorage.setItem(STORAGE_KEY, user.district);
      } catch {
        // ignore
      }
    }
  }, [hydrated, district, isLoggedIn, user?.district]);

  const setDistrict = useCallback(
    (nameEn: string, nameKn?: string) => {
      setDistrictState(nameEn);
      setDistrictKn(nameKn ?? null);
      try {
        localStorage.setItem(STORAGE_KEY, nameEn);
        if (nameKn) localStorage.setItem(STORAGE_KEY_KN, nameKn);
        localStorage.removeItem(DISMISS_KEY);
      } catch {
        // ignore
      }
      setDismissed(false);
      // Best-effort sync to the profile so recommendations follow the user
      // across devices. Silent on failure — the local value still works.
      if (isLoggedIn) {
        api.setMyDistrict(nameEn).catch(() => {});
      }
    },
    [isLoggedIn]
  );

  const setCoords = useCallback((c: Coords) => {
    setCoordsState(c);
    try {
      localStorage.setItem(COORDS_KEY, JSON.stringify(c));
    } catch {
      // ignore
    }
  }, []);

  const dismissPrompt = useCallback(() => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
  }, []);

  const openPrompt = useCallback(() => {
    setDismissed(false);
    try {
      localStorage.removeItem(DISMISS_KEY);
    } catch {
      // ignore
    }
  }, []);

  const needsPrompt = hydrated && !district && !dismissed;

  return (
    <LocationContext.Provider
      value={{ district, districtKn, coords, needsPrompt, setDistrict, setCoords, dismissPrompt, openPrompt }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}
