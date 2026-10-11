/**
 * Pincode → location lookup for Karnataka.
 *
 * Uses the free India Post API (api.postalpincode.in) to resolve a 6-digit
 * pincode into { district, taluk, area }, then normalises the result to the
 * exact district / taluk vocabulary used by our backend LocationService so the
 * values line up with the dropdown options.
 */

export interface PincodeResult {
  /** Canonical English district name (matches DistrictOption.nameEn). */
  district: string;
  /** Best-matching taluk from our list, or "" if none matched. */
  taluk: string;
  /** Area / locality (the primary post office name for the pincode). */
  area: string;
  /** State as returned by the API (used to reject non-Karnataka pins). */
  state: string;
}

interface PostOffice {
  Name: string;
  BranchType: string;
  DeliveryStatus: string;
  District: string;
  Division: string;
  Block: string;
  State: string;
  Pincode: string;
}

interface IndiaPostResponse {
  Message: string;
  Status: string;
  PostOffice: PostOffice[] | null;
}

/**
 * India Post district spellings differ from ours in a handful of cases.
 * Map the API's district name (lower-cased) → our canonical English name.
 */
const DISTRICT_ALIASES: Record<string, string> = {
  shimoga: "Shivamogga",
  shivamogga: "Shivamogga",
  bangalore: "Bengaluru Urban",
  "bangalore urban": "Bengaluru Urban",
  "bengaluru urban": "Bengaluru Urban",
  "bangalore rural": "Bengaluru Rural",
  "bengaluru rural": "Bengaluru Rural",
  bellary: "Ballari",
  ballari: "Ballari",
  belgaum: "Belagavi",
  belagavi: "Belagavi",
  bijapur: "Vijayapura",
  vijayapura: "Vijayapura",
  gulbarga: "Kalaburagi",
  kalaburagi: "Kalaburagi",
  mysore: "Mysuru",
  mysuru: "Mysuru",
  tumkur: "Tumakuru",
  tumakuru: "Tumakuru",
  chikmagalur: "Chikkamagaluru",
  chikkamagaluru: "Chikkamagaluru",
  chikballapur: "Chikkaballapura",
  chikkaballapura: "Chikkaballapura",
  "chamrajnagar": "Chamarajanagar",
  chamarajanagar: "Chamarajanagar",
  "uttara kannada": "Uttara Kannada",
  "north kanara": "Uttara Kannada",
  "dakshina kannada": "Dakshina Kannada",
  "south kanara": "Dakshina Kannada",
  mangalore: "Dakshina Kannada",
  raichur: "Raichur",
  "davangere": "Davanagere",
  davanagere: "Davanagere",
};

function normaliseDistrict(apiDistrict: string): string {
  const key = apiDistrict.trim().toLowerCase();
  if (DISTRICT_ALIASES[key]) return DISTRICT_ALIASES[key];
  // Title-case fallback so e.g. "hassan" → "Hassan".
  return apiDistrict
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/** Strip bracketed suffixes etc. so "Hospet (Hosapete)" compares loosely. */
function simplify(s: string): string {
  return s.toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z]/g, "").trim();
}

/**
 * Pick the best taluk from the district's taluk list given the API's Block /
 * Division / office hints. Returns "" if nothing matches confidently.
 */
function matchTaluk(hints: string[], taluks: string[]): string {
  const simplifiedTaluks = taluks.map((tk) => ({ raw: tk, s: simplify(tk) }));
  for (const hint of hints) {
    const h = simplify(hint);
    if (!h) continue;
    // Exact (simplified) match first.
    const exact = simplifiedTaluks.find((tk) => tk.s === h);
    if (exact) return exact.raw;
  }
  for (const hint of hints) {
    const h = simplify(hint);
    if (!h) continue;
    // Then a containment match (one contains the other).
    const partial = simplifiedTaluks.find((tk) => tk.s.includes(h) || h.includes(tk.s));
    if (partial) return partial.raw;
  }
  return "";
}

/**
 * Resolve a 6-digit pincode to { district, taluk, area, state }.
 *
 * @param pincode    6-digit Indian PIN
 * @param getTaluks  async loader (api.getTaluks) used to resolve the taluk list
 *                   for the matched district.
 * @returns          the resolved location, or null if the pincode is invalid /
 *                   not found / outside Karnataka.
 */
export async function lookupPincode(
  pincode: string,
  getTaluks: (district: string) => Promise<string[]>,
): Promise<PincodeResult | null> {
  if (!/^\d{6}$/.test(pincode)) return null;

  let data: IndiaPostResponse[];
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    if (!res.ok) return null;
    data = (await res.json()) as IndiaPostResponse[];
  } catch {
    return null;
  }

  const entry = data?.[0];
  if (!entry || entry.Status !== "Success" || !entry.PostOffice?.length) return null;

  // Prefer a delivery / head / sub office for a sensible "area" label.
  const offices = entry.PostOffice;
  const primary =
    offices.find((o) => o.BranchType === "Head Post Office") ??
    offices.find((o) => o.DeliveryStatus === "Delivery") ??
    offices[0];

  const district = normaliseDistrict(primary.District);
  const area = primary.Name?.trim() || "";
  const state = primary.State?.trim() || "";

  let taluk = "";
  try {
    const taluks = await getTaluks(district);
    if (taluks.length) {
      taluk = matchTaluk([primary.Block, primary.Division, primary.Name], taluks);
    }
  } catch {
    taluk = "";
  }

  return { district, taluk, area, state };
}
