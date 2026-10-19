// Approximate geographic centroids for Karnataka districts, keyed by the
// canonical English name used on listings (ListingData.district).
//
// Used to show an APPROXIMATE distance on listing cards without revealing a
// post's exact coordinates (which are paywalled). Distance is computed from the
// buyer's GPS to the post's district centroid — intentionally district-level,
// not pin-accurate.
export const DISTRICT_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  "Bagalkot": { lat: 16.18, lng: 75.70 },
  "Ballari": { lat: 15.14, lng: 76.92 },
  "Belagavi": { lat: 15.85, lng: 74.50 },
  "Bengaluru Rural": { lat: 13.22, lng: 77.57 },
  "Bengaluru Urban": { lat: 12.97, lng: 77.59 },
  "Bidar": { lat: 17.91, lng: 77.52 },
  "Chamarajanagar": { lat: 11.92, lng: 76.94 },
  "Chikkaballapura": { lat: 13.43, lng: 77.73 },
  "Chikkamagaluru": { lat: 13.32, lng: 75.77 },
  "Chitradurga": { lat: 14.23, lng: 76.40 },
  "Dakshina Kannada": { lat: 12.87, lng: 75.24 },
  "Davanagere": { lat: 14.47, lng: 75.92 },
  "Dharwad": { lat: 15.46, lng: 75.01 },
  "Gadag": { lat: 15.43, lng: 75.63 },
  "Hassan": { lat: 13.00, lng: 76.10 },
  "Haveri": { lat: 14.80, lng: 75.40 },
  "Kalaburagi": { lat: 17.33, lng: 76.83 },
  "Kodagu": { lat: 12.42, lng: 75.74 },
  "Kolar": { lat: 13.14, lng: 78.13 },
  "Koppal": { lat: 15.35, lng: 76.15 },
  "Mandya": { lat: 12.52, lng: 76.90 },
  "Mysuru": { lat: 12.30, lng: 76.64 },
  "Raichur": { lat: 16.21, lng: 77.36 },
  "Ramanagara": { lat: 12.72, lng: 77.28 },
  "Shivamogga": { lat: 13.93, lng: 75.57 },
  "Tumakuru": { lat: 13.34, lng: 77.10 },
  "Udupi": { lat: 13.34, lng: 74.75 },
  "Uttara Kannada": { lat: 14.80, lng: 74.68 },
  "Vijayapura": { lat: 16.83, lng: 75.71 },
  "Yadgir": { lat: 16.77, lng: 77.14 },
  "Vijayanagara": { lat: 15.15, lng: 76.33 },
  "Chamrajnagar": { lat: 11.92, lng: 76.94 }, // alias spelling
};

/** Centroid for a district name (tolerant of minor spelling/case). */
export function districtCentroid(district?: string | null): { lat: number; lng: number } | null {
  if (!district) return null;
  if (DISTRICT_CENTROIDS[district]) return DISTRICT_CENTROIDS[district];
  const norm = district.trim().toLowerCase();
  for (const [k, v] of Object.entries(DISTRICT_CENTROIDS)) {
    if (k.toLowerCase() === norm) return v;
  }
  return null;
}
