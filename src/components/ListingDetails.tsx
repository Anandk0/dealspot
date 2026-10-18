"use client";
import { useLang } from "@/lib/lang-context";
import { Lock, Phone, MessageCircle, User, MapPin } from "lucide-react";

/**
 * Generic renderer for a listing's `details` JSON (non-property categories:
 * services, livestock, vehicles, pets, equipment). Shows all meaningful public
 * attributes, arrays (service types, facilities) as chips, and the locked
 * owner-contact block from details.private exactly like PropertyDetails —
 * contact only appears when the backend returned the private block (unlocked).
 */

// Human labels for known detail keys (kn / en). Unknown keys fall back to a
// prettified version of the key, so nothing is silently dropped.
const LABELS: Record<string, [string, string]> = {
  mode: ["ಪ್ರಕಾರ", "Type"],
  listingType: ["ಪ್ರಕಾರ", "Type"],
  propertyType: ["ಆಸ್ತಿ ವಿಧ", "Property Type"],
  bhk: ["BHK", "BHK"],
  size: ["ವಿಸ್ತೀರ್ಣ", "Size"],
  areaUnit: ["ಘಟಕ", "Area Unit"],
  furnishing: ["ಸಜ್ಜೀಕರಣ", "Furnishing"],
  condition: ["ಸ್ಥಿತಿ", "Condition"],
  deposit: ["ಠೇವಣಿ", "Deposit"],
  maintenance: ["ನಿರ್ವಹಣೆ", "Maintenance"],
  availableFrom: ["ಲಭ್ಯ ದಿನಾಂಕ", "Available From"],
  leaseDuration: ["ಅವಧಿ", "Lease Duration"],
  leaseStart: ["ಆರಂಭ", "Lease Start"],
  leaseEnd: ["ಕೊನೆ", "Lease End"],
  negotiable: ["ಚೌಕಾಸಿ", "Negotiable"],
  // livestock
  teeth: ["ಹಲ್ಲಿನ ವಿವರ", "Teeth"],
  gender: ["ಲಿಂಗ", "Gender"],
  quantity: ["ಸಂಖ್ಯೆ", "Quantity"],
  weight: ["ತೂಕ", "Weight"],
  health: ["ಆರೋಗ್ಯ", "Health"],
  pregnancy: ["ಗರ್ಭಿಣಿ", "Pregnancy"],
  milkYield: ["ಹಾಲು/ದಿನ", "Milk/Day"],
  calvings: ["ಕರು ಹಾಕಿದ ಸಂಖ್ಯೆ", "Calvings"],
  farmWork: ["ಕೃಷಿ ಕೆಲಸ", "Farm Work"],
  sellerType: ["ಮಾರಾಟಗಾರ ವಿಧ", "Seller Type"],
  priceType: ["ಬೆಲೆ ವಿಧ", "Price Type"],
  totalPrice: ["ಒಟ್ಟು ಬೆಲೆ", "Total Price"],
  // pets
  color: ["ಬಣ್ಣ", "Color"],
  vaccination: ["ಲಸಿಕೆ", "Vaccination"],
  // services
  workType: ["ಕೆಲಸದ ರೀತಿ", "Work Type"],
  hasLicence: ["ಡ್ರೈವಿಂಗ್ ಲೈಸೆನ್ಸ್", "Driving Licence"],
  materialBy: ["ಸಾಮಗ್ರಿ", "Material Supplied By"],
  cameraType: ["ಕ್ಯಾಮೆರಾ ವಿಧ", "Camera Type"],
  pricingBasis: ["ದರ ಆಧಾರ", "Pricing Basis"],
  homeVisit: ["ಮನೆ ಭೇಟಿ", "Home Visit"],
  workingHours: ["ಕೆಲಸದ ಸಮಯ", "Working Hours"],
  // vehicle
  brand: ["ಬ್ರ್ಯಾಂಡ್", "Brand"],
  vehicleNumber: ["ವಾಹನ ಸಂಖ್ಯೆ", "Vehicle No."],
  fuel: ["ಇಂಧನ", "Fuel"],
  rentType: ["ದರ ಆಧಾರ", "Rent Type"],
  // equipment
  year: ["ವರ್ಷ", "Year"],
  deliveryAvailable: ["ಡೆಲಿವರಿ", "Delivery"],
  operatorAvailable: ["ಆಪರೇಟರ್", "Operator"],
  fuelIncluded: ["ಇಂಧನ ಸೇರಿದೆ", "Fuel Included"],
};

// Keys handled specially or not worth showing as a plain row.
const SKIP = new Set(["private", "serviceTypes", "facilities", "houseRules", "agriLand", "fullAddress"]);

function prettify(key: string): string {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

interface Private {
  ownerName?: string | null;
  ownerAgent?: string | null;
  mobile?: string | null;
  whatsapp?: string | null;
  fullAddress?: string | null;
}

export default function ListingDetails({ detailsJson }: { detailsJson?: string }) {
  const { t, lang } = useLang();

  let d: Record<string, unknown> | null = null;
  try {
    d = detailsJson ? (JSON.parse(detailsJson) as Record<string, unknown>) : null;
  } catch {
    d = null;
  }
  if (!d) return null;

  const label = (k: string) => {
    const l = LABELS[k];
    return l ? (lang === "en" ? l[1] : l[0]) : prettify(k);
  };

  // Plain scalar rows (string/number, non-empty, not skipped).
  const rows: [string, string][] = [];
  for (const [k, v] of Object.entries(d)) {
    if (SKIP.has(k)) continue;
    if (v == null || v === "") continue;
    if (typeof v === "object") continue;
    rows.push([label(k), String(v)]);
  }

  const serviceTypes = Array.isArray(d.serviceTypes) ? (d.serviceTypes as string[]) : [];
  const facilities = Array.isArray(d.facilities) ? (d.facilities as string[]) : [];
  const houseRules = (d.houseRules as Record<string, string> | null) || null;
  const priv = (d.private as Private | undefined) ?? undefined;
  const hasContact = priv && (priv.ownerName || priv.ownerAgent || priv.mobile || priv.whatsapp);

  return (
    <div className="space-y-4">
      {/* Attribute rows */}
      {rows.length > 0 && (
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <h3 className="text-base font-semibold text-foreground mb-4">{t("ವಿವರಗಳು (Details)", "Details")}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rows.map(([lbl, v], i) => (
              <div key={i} className="flex items-center justify-between gap-2 p-3 bg-muted rounded-lg">
                <span className="text-xs text-muted-foreground">{lbl}</span>
                <span className="text-sm font-medium text-card-foreground text-right">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Service types */}
      {serviceTypes.length > 0 && (
        <ChipBlock title={t("ಸೇವೆಯ ವಿಧ (Service Types)", "Service Types")} items={serviceTypes} />
      )}

      {/* Facilities */}
      {facilities.length > 0 && (
        <ChipBlock title={t("ಸೌಲಭ್ಯಗಳು (Facilities)", "Facilities")} items={facilities} highlight />
      )}

      {/* House rules */}
      {houseRules && Object.values(houseRules).some(Boolean) && (
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <h3 className="text-base font-semibold text-foreground mb-4">{t("ಮನೆ ನಿಯಮಗಳು (House Rules)", "House Rules")}</h3>
          <div className="flex flex-wrap gap-2">
            {houseRules.familyAllowed && <Chip label={`${t("ಕುಟುಂಬ", "Family")}: ${houseRules.familyAllowed}`} />}
            {houseRules.bachelorsAllowed && <Chip label={`${t("ಬ್ಯಾಚುಲರ್ಸ್", "Bachelors")}: ${houseRules.bachelorsAllowed}`} />}
            {houseRules.petsAllowed && <Chip label={`${t("ಸಾಕುಪ್ರಾಣಿ", "Pets")}: ${houseRules.petsAllowed}`} />}
          </div>
        </div>
      )}

      {/* Contact — only when unlocked (backend returned private block) */}
      {priv ? (
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border space-y-3">
          <h3 className="text-base font-semibold text-foreground">{t("ಸಂಪರ್ಕ (Contact)", "Contact")}</h3>
          {(priv.ownerName || priv.ownerAgent) && (
            <Row icon={<User size={15} />} label={t("ಹೆಸರು", "Name")} value={(priv.ownerName || priv.ownerAgent)!} />
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
          {priv.fullAddress && (
            <Row icon={<MapPin size={15} />} label={t("ವಿಳಾಸ", "Address")} value={priv.fullAddress} />
          )}
          {!hasContact && <p className="text-sm text-muted-foreground">{t("ಸಂಪರ್ಕ ವಿವರ ಲಭ್ಯವಿಲ್ಲ", "No contact details provided")}</p>}
        </div>
      ) : (
        <div className="bg-muted/50 rounded-2xl p-5 border border-dashed border-border text-center">
          <Lock size={22} className="mx-auto text-muted-foreground mb-2" />
          <p className="text-sm font-medium text-foreground">{t("ಸಂಪರ್ಕ ವಿವರ ಲಾಕ್ ಆಗಿದೆ", "Contact details are locked")}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("ಅನ್‌ಲಾಕ್ ಮಾಡಿದ ನಂತರ ಮಾಲೀಕರ ಸಂಪರ್ಕ ಕಾಣಿಸುತ್ತದೆ", "Unlock to see the owner's contact details.")}
          </p>
        </div>
      )}
    </div>
  );
}

function ChipBlock({ title, items, highlight }: { title: string; items: string[]; highlight?: boolean }) {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
      <h3 className="text-base font-semibold text-foreground mb-4">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((it, i) => <Chip key={i} label={it} highlight={highlight} />)}
      </div>
    </div>
  );
}

function Chip({ label, highlight }: { label: string; highlight?: boolean }) {
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full border ${highlight ? "border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400" : "border-border bg-muted text-card-foreground"}`}>
      {label}
    </span>
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
