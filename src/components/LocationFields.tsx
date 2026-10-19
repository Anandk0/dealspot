"use client";
import { useEffect, useState } from "react";
import { Loader2, Lock, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { api, type DistrictOption } from "@/lib/api";
import { lookupPincode } from "@/lib/pincode";
import { useLang } from "@/lib/lang-context";

export interface LocationValue {
  pincode: string;
  district: string; // canonical English name (DistrictOption.nameEn)
  taluk: string;
  area: string;
}

/**
 * Connected location fields: Pincode → District → Taluk → Area.
 *
 * - Districts load once; taluks load whenever the district changes.
 * - Entering a valid 6-digit pincode auto-fills district / taluk / area and
 *   LOCKS those three fields (non-editable) until the pincode is cleared.
 * - Clearing the pincode (the ✕ button) unlocks the fields for manual entry.
 */
export default function LocationFields({
  value,
  onChange,
}: {
  value: LocationValue;
  onChange: (v: LocationValue) => void;
}) {
  const { t } = useLang();
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [taluks, setTaluks] = useState<string[]>([]);
  const [looking, setLooking] = useState(false);
  const [pinError, setPinError] = useState("");

  const locked = /^\d{6}$/.test(value.pincode) && !!value.district;

  useEffect(() => {
    api.getDistricts().then(setDistricts).catch(() => setDistricts([]));
  }, []);

  // Load taluks whenever the selected district changes.
  useEffect(() => {
    const district = value.district;
    if (!district) {
      setTaluks((prev) => (prev.length ? [] : prev));
      return;
    }
    let active = true;
    api.getTaluks(district)
      .then((list) => { if (active) setTaluks(list); })
      .catch(() => { if (active) setTaluks([]); });
    return () => { active = false; };
  }, [value.district]);

  const handlePincode = async (raw: string) => {
    const pin = raw.replace(/\D/g, "").slice(0, 6);
    setPinError("");
    onChange({ ...value, pincode: pin });

    if (pin.length !== 6) return;

    setLooking(true);
    try {
      const result = await lookupPincode(pin, (d) => api.getTaluks(d));
      if (!result) {
        setPinError(t("ಪಿನ್‌ಕೋಡ್ ಸಿಗಲಿಲ್ಲ", "Pincode not found"));
        return;
      }
      if (result.state && result.state.toLowerCase() !== "karnataka") {
        setPinError(t("ಕರ್ನಾಟಕದ ಪಿನ್‌ಕೋಡ್ ಮಾತ್ರ", "Karnataka pincodes only"));
      }
      onChange({
        pincode: pin,
        district: result.district,
        taluk: result.taluk,
        area: result.area,
      });
    } catch {
      setPinError(t("ಹುಡುಕಾಟ ವಿಫಲ", "Lookup failed"));
    } finally {
      setLooking(false);
    }
  };

  const clearPincode = () => {
    setPinError("");
    onChange({ ...value, pincode: "" });
  };

  return (
    <div className="space-y-3">
      {/* Pincode */}
      <div>
        <label className="text-xs sm:text-sm font-medium text-foreground mb-1 block">
          {t("ಪಿನ್‌ಕೋಡ್ (Pincode)", "Pincode")}
        </label>
        <div className="relative">
          <Input
            value={value.pincode}
            onChange={(e) => handlePincode(e.target.value)}
            placeholder={t("6-ಅಂಕಿ ಪಿನ್‌ಕೋಡ್", "6-digit pincode")}
            inputMode="numeric"
            maxLength={6}
            className="h-10 sm:h-11 pr-10"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {looking ? (
              <Loader2 size={16} className="animate-spin" />
            ) : value.pincode ? (
              <button type="button" onClick={clearPincode} aria-label="Clear pincode" className="hover:text-foreground">
                <X size={16} />
              </button>
            ) : null}
          </div>
        </div>
        {pinError ? (
          <p className="text-[11px] text-red-500 mt-1">{pinError}</p>
        ) : (
          <p className="text-[11px] text-muted-foreground mt-1">
            {t("ಪಿನ್‌ಕೋಡ್ ಹಾಕಿದರೆ ಜಿಲ್ಲೆ/ತಾಲೂಕು/ಪ್ರದೇಶ ತಾನಾಗಿಯೇ ತುಂಬುತ್ತದೆ",
               "Enter a pincode to auto-fill district / taluk / area")}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* District */}
        <div>
          <label className="text-xs sm:text-sm font-medium text-foreground mb-1 flex items-center gap-1">
            {t("ಜಿಲ್ಲೆ (District)", "District")}
            {locked && <Lock size={11} className="text-muted-foreground" />}
          </label>
          <select
            value={value.district}
            onChange={(e) => onChange({ ...value, district: e.target.value, taluk: "" })}
            disabled={locked}
            className="w-full h-10 sm:h-11 rounded-md border border-border bg-card text-foreground px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <option value="">{t("ಆಯ್ಕೆಮಾಡಿ", "Select")}</option>
            {districts.map((d) => (
              <option key={d.id} value={d.nameEn}>{d.name} ({d.nameEn})</option>
            ))}
            {/* Keep an auto-filled district visible even if not in the loaded list yet. */}
            {value.district && !districts.some((d) => d.nameEn === value.district) && (
              <option value={value.district}>{value.district}</option>
            )}
          </select>
        </div>

        {/* Taluk */}
        <div>
          <label className="text-xs sm:text-sm font-medium text-foreground mb-1 flex items-center gap-1">
            {t("ತಾಲೂಕು (Taluk)", "Taluk")}
            {locked && <Lock size={11} className="text-muted-foreground" />}
          </label>
          <select
            value={value.taluk}
            onChange={(e) => onChange({ ...value, taluk: e.target.value })}
            disabled={locked || !value.district}
            className="w-full h-10 sm:h-11 rounded-md border border-border bg-card text-foreground px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <option value="">
              {value.district ? t("ಆಯ್ಕೆಮಾಡಿ", "Select") : t("ಮೊದಲು ಜಿಲ್ಲೆ", "Select district first")}
            </option>
            {taluks.map((tk) => (
              <option key={tk} value={tk}>{tk}</option>
            ))}
            {value.taluk && !taluks.includes(value.taluk) && (
              <option value={value.taluk}>{value.taluk}</option>
            )}
          </select>
        </div>
      </div>

      {/* Area / full address — always editable. Pincode pre-fills a suggestion,
          but the user types their complete address here (house no, cross,
          landmark, etc.), so it is never locked. */}
      <div>
        <label className="text-xs sm:text-sm font-medium text-foreground mb-1 block">
          {t("ಪ್ರದೇಶ / ಗ್ರಾಮ / ಪೂರ್ಣ ವಿಳಾಸ (Area / Village / Full Address)", "Area / Village / Full Address")}
        </label>
        <Input
          value={value.area}
          onChange={(e) => onChange({ ...value, area: e.target.value })}
          placeholder={t("ಉದಾ: ಮನೆ ನಂ 7, 2ನೇ ಕ್ರಾಸ್, ಗ್ರಾಮ, ಲ್ಯಾಂಡ್‌ಮಾರ್ಕ್", "e.g. House No 7, 2nd Cross, Village, Landmark")}
          className="h-10 sm:h-11"
        />
        <p className="text-[11px] text-muted-foreground mt-1">
          {t("ನಿಮ್ಮ ಪೂರ್ಣ ವಿಳಾಸ ನಮೂದಿಸಿ — ಸಂಪಾದಿಸಬಹುದು", "Enter your full address — you can edit this")}
        </p>
      </div>
    </div>
  );
}
