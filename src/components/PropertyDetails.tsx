"use client";
import { useLang } from "@/lib/lang-context";

interface PropertyDetailsJson {
  taluk?: string | null;
  propertyArea?: string | null;
  pricePerUnit?: string | null;
  negotiable?: string | null;
  roadFacing?: string | null;
  roadType?: string | null;
  cornerProperty?: string | null;
  water?: string | null;
  electricity?: string | null;
  borewell?: string | null;
  documents?: {
    rtc?: string | null;
    saleDeed?: string | null;
    khata?: string | null;
    ec?: string | null;
    other?: string | null;
  } | null;
  // Present only when the backend has unlocked the listing for this viewer.
  private?: {
    ownerAgent?: string | null;
    mobile?: string | null;
    whatsapp?: string | null;
    preferredTime?: string | null;
    mapLat?: number | null;
    mapLng?: number | null;
  } | null;
}

/**
 * Renders the structured property attributes from a listing's `details` JSON.
 * Public sections always show. The contact + map block only appears when the
 * backend included `details.private` (i.e. the viewer has unlocked). Otherwise
 * a "locked" hint is shown — the actual unlock button is the ContactUnlockModal
 * already rendered in the seller card.
 */
export default function PropertyDetails({ detailsJson }: { detailsJson?: string }) {
  const { t } = useLang();

  let d: PropertyDetailsJson | null = null;
  try {
    d = detailsJson ? (JSON.parse(detailsJson) as PropertyDetailsJson) : null;
  } catch {
    d = null;
  }
  if (!d) return null;

  const basic: [string, string | null | undefined][] = [
    [t("ತಾಲೂಕು (Taluk)", "Taluk"), d.taluk],
    [t("ವಿಸ್ತೀರ್ಣ (Area)", "Area"), d.propertyArea],
    [t("ಪ್ರತಿ Sq.ft/Acre ಬೆಲೆ", "Price per Sq.ft/Acre"), d.pricePerUnit],
    [t("ಚೌಕಾಸಿ (Negotiable)", "Negotiable"), d.negotiable],
  ];
  const propDetails: [string, string | null | undefined][] = [
    [t("ರಸ್ತೆ ಮುಖ (Road Facing)", "Road Facing"), d.roadFacing],
    [t("ರಸ್ತೆ ಪ್ರಕಾರ (Road Type)", "Road Type"), d.roadType],
    [t("ಮೂಲೆ ಆಸ್ತಿ (Corner)", "Corner Property"), d.cornerProperty],
    [t("ನೀರು (Water)", "Water"), d.water],
    [t("ವಿದ್ಯುತ್ (Electricity)", "Electricity"), d.electricity],
    [t("ಬೋರ್‌ವೆಲ್ (Borewell)", "Borewell"), d.borewell],
  ];
  const docs: [string, string | null | undefined][] = d.documents
    ? [
        ["RTC", d.documents.rtc],
        [t("ಸೇಲ್ ಡೀಡ್ (Sale Deed)", "Sale Deed"), d.documents.saleDeed],
        [t("ಖಾತಾ (Khata)", "Khata"), d.documents.khata],
        ["EC", d.documents.ec],
        [t("ಇತರ (Other)", "Other"), d.documents.other],
      ]
    : [];

  const hasAny = (rows: [string, string | null | undefined][]) => rows.some(([, v]) => v);

  return (
    <div className="space-y-4">
      {/* Basic + property details */}
      {(hasAny(basic) || hasAny(propDetails)) && (
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <h3 className="text-base font-semibold text-foreground mb-4">{t("ಆಸ್ತಿ ವಿವರಗಳು (Property Details)", "Property Details")}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[...basic, ...propDetails].filter(([, v]) => v).map(([label, v], i) => (
              <div key={i} className="flex items-center justify-between gap-2 p-3 bg-muted rounded-lg">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-sm font-medium text-card-foreground">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents */}
      {hasAny(docs) && (
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <h3 className="text-base font-semibold text-foreground mb-4">{t("ದಾಖಲೆಗಳು (Documents)", "Documents")}</h3>
          <div className="flex flex-wrap gap-2">
            {docs.filter(([, v]) => v).map(([label, v], i) => (
              <span
                key={i}
                className={`text-xs px-2.5 py-1 rounded-full border ${
                  v === "Yes"
                    ? "border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400"
                    : v === "No"
                    ? "border-border bg-muted text-muted-foreground"
                    : "border-border bg-muted text-card-foreground"
                }`}
              >
                {label}: {v}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* NOTE: Owner contact + exact map are intentionally NOT rendered here.
          Contact is shown only through the seller card's unlock flow
          (ContactUnlockModal), so it never appears for free. */}
    </div>
  );
}


