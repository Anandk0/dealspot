"use client";
import { useLang } from "@/lib/lang-context";
import { Lock, MapPin, Phone, MessageCircle, Clock, User } from "lucide-react";

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

  const priv = d.private;
  const hasContact = priv && (priv.ownerAgent || priv.mobile || priv.whatsapp || priv.preferredTime);
  const hasMap = priv && priv.mapLat != null && priv.mapLng != null;

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

      {/* Contact + Map — only rendered when the backend returned the private block */}
      {priv ? (
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border space-y-3">
          <h3 className="text-base font-semibold text-foreground">{t("ಸಂಪರ್ಕ & ಲೊಕೇಶನ್ (Contact & Location)", "Contact & Location")}</h3>
          {hasContact && (
            <div className="space-y-2">
              {priv.ownerAgent && (
                <Row icon={<User size={15} />} label={t("ಮಾಲೀಕ/ಏಜೆಂಟ್", "Owner/Agent")} value={priv.ownerAgent} />
              )}
              {priv.mobile && (
                <a href={`tel:${priv.mobile}`} className="block">
                  <Row icon={<Phone size={15} />} label={t("ಮೊಬೈಲ್", "Mobile")} value={priv.mobile} link />
                </a>
              )}
              {priv.whatsapp && (
                <a href={`https://wa.me/${priv.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="block">
                  <Row icon={<MessageCircle size={15} />} label="WhatsApp" value={priv.whatsapp} link />
                </a>
              )}
              {priv.preferredTime && (
                <Row icon={<Clock size={15} />} label={t("ಸಂಪರ್ಕ ಸಮಯ", "Contact Time")} value={priv.preferredTime} />
              )}
            </div>
          )}
          {hasMap && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${priv!.mapLat},${priv!.mapLng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition"
            >
              <MapPin size={16} /> {t("ಗೂಗಲ್ ಮ್ಯಾಪ್‌ನಲ್ಲಿ ತೆರೆಯಿರಿ (Open in Google Maps)", "Open in Google Maps")}
            </a>
          )}
        </div>
      ) : (
        // Locked hint — the unlock action is the ContactUnlockModal in the seller card.
        <div className="bg-muted/50 rounded-2xl p-5 border border-dashed border-border text-center">
          <Lock size={22} className="mx-auto text-muted-foreground mb-2" />
          <p className="text-sm font-medium text-foreground">{t("ಸಂಪರ್ಕ & ನಿಖರ ಲೊಕೇಶನ್ ಲಾಕ್ ಆಗಿದೆ", "Contact & exact location are locked")}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("ಅನ್‌ಲಾಕ್ ಮಾಡಿದ ನಂತರ ಮಾಲೀಕರ ಸಂಪರ್ಕ ಮತ್ತು ಗೂಗಲ್ ಮ್ಯಾಪ್ ಲೊಕೇಶನ್ ಕಾಣಿಸುತ್ತದೆ", "Unlock to see the owner's contact and the exact map location.")}
          </p>
        </div>
      )}
    </div>
  );
}

function Row({ icon, label, value, link }: { icon: React.ReactNode; label: string; value: string; link?: boolean }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
      <span className="text-primary shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className={`text-sm font-medium ${link ? "text-primary" : "text-card-foreground"} truncate`}>{value}</p>
      </div>
    </div>
  );
}
