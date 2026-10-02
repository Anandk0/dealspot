"use client";
import { useEffect, useState, useMemo } from "react";
import { MapPin, Loader2, X, LocateFixed, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, type DistrictOption } from "@/lib/api";
import { useLocation } from "@/lib/location-context";
import { useLang } from "@/lib/lang-context";
import { toast } from "sonner";

export default function LocationPrompt() {
  const { needsPrompt, setDistrict, setCoords, dismissPrompt } = useLocation();
  const { t } = useLang();
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [query, setQuery] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [loadingList, setLoadingList] = useState(false);

  // Load the district list once the prompt needs to show.
  useEffect(() => {
    if (!needsPrompt || districts.length > 0) return;
    setLoadingList(true);
    api.getDistricts()
      .then(setDistricts)
      .catch(() => setDistricts([]))
      .finally(() => setLoadingList(false));
  }, [needsPrompt, districts.length]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return districts;
    return districts.filter(
      (d) => d.nameEn.toLowerCase().includes(q) || d.name.includes(query.trim())
    );
  }, [districts, query]);

  // Try to auto-detect the district from the browser's GPS, reverse-geocoding
  // via OpenStreetMap, then matching the result to a Karnataka district.
  const detectLocation = () => {
    if (!("geolocation" in navigator)) {
      toast.error(t("ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಲೊಕೇಶನ್ ಲಭ್ಯವಿಲ್ಲ", "Location is not available in this browser"));
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          // Save the buyer's own coordinates for km-distance calculations.
          setCoords({ lat: latitude, lng: longitude });
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const addr = data?.address || {};
          // Nominatim may report the district under several keys.
          const candidate: string = (
            addr.state_district || addr.county || addr.city_district || addr.city || ""
          ).toString();

          const list = districts.length > 0 ? districts : await api.getDistricts();
          if (districts.length === 0) setDistricts(list);

          const match = matchDistrict(candidate, list);
          if (match) {
            setDistrict(match.nameEn, match.name);
            toast.success(t(`ಲೊಕೇಶನ್: ${match.name}`, `Location set to ${match.nameEn}`));
          } else {
            toast.info(t("ಜಿಲ್ಲೆ ಪತ್ತೆಯಾಗಲಿಲ್ಲ, ದಯವಿಟ್ಟು ಆಯ್ಕೆಮಾಡಿ", "Couldn't match your district — please pick it below"));
          }
        } catch {
          toast.error(t("ಲೊಕೇಶನ್ ಪತ್ತೆ ವಿಫಲವಾಗಿದೆ", "Location detection failed"));
        } finally {
          setDetecting(false);
        }
      },
      () => {
        setDetecting(false);
        toast.error(t("ಲೊಕೇಶನ್ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ", "Location permission denied"));
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
  };

  if (!needsPrompt) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-card rounded-t-2xl sm:rounded-2xl shadow-xl border border-border max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="text-primary" size={22} />
            </div>
            <div>
              <h2 className="font-bold text-foreground leading-tight">
                {t("ನಿಮ್ಮ ಜಿಲ್ಲೆ ಆಯ್ಕೆಮಾಡಿ", "Choose your district")}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("ನಿಮ್ಮ ಹತ್ತಿರದ ಜಾಹೀರಾತುಗಳನ್ನು ತೋರಿಸಲು", "So we can show listings near you")}
              </p>
            </div>
          </div>
          <button
            onClick={dismissPrompt}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Detect button */}
        <div className="px-5 pb-3">
          <Button
            onClick={detectLocation}
            disabled={detecting}
            variant="outline"
            className="w-full border-primary/40 text-primary hover:bg-primary/5"
          >
            {detecting ? (
              <><Loader2 size={16} className="mr-2 animate-spin" /> {t("ಪತ್ತೆ ಮಾಡಲಾಗುತ್ತಿದೆ...", "Detecting...")}</>
            ) : (
              <><LocateFixed size={16} className="mr-2" /> {t("ನನ್ನ ಲೊಕೇಶನ್ ಬಳಸಿ", "Use my location")}</>
            )}
          </Button>
        </div>

        {/* Search */}
        <div className="px-5 pb-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("ಜಿಲ್ಲೆ ಹುಡುಕಿ...", "Search district...")}
              className="pl-9 bg-background"
            />
          </div>
        </div>

        {/* District list */}
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          {loadingList ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="animate-spin text-muted-foreground" size={24} />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              {t("ಯಾವುದೇ ಜಿಲ್ಲೆ ಸಿಗಲಿಲ್ಲ", "No district found")}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2 px-2">
              {filtered.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDistrict(d.nameEn, d.name)}
                  className="flex items-center gap-2 p-3 rounded-xl border border-border bg-background hover:border-primary/50 hover:bg-primary/5 transition text-left"
                >
                  <span className="text-base shrink-0">{d.icon}</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-foreground truncate">{d.name}</span>
                    <span className="block text-[11px] text-muted-foreground truncate">{d.nameEn}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Fuzzy-match a reverse-geocoded place name against the district list. */
function matchDistrict(candidate: string, list: DistrictOption[]): DistrictOption | null {
  if (!candidate) return null;
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, "").replace(/district/g, "");
  const c = norm(candidate);
  // Exact-ish match first, then substring either direction.
  return (
    list.find((d) => norm(d.nameEn) === c) ||
    list.find((d) => c.includes(norm(d.nameEn)) || norm(d.nameEn).includes(c)) ||
    null
  );
}
