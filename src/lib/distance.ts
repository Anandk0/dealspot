// Haversine distance between two lat/lng points, in kilometers.
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius in km
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Human-friendly distance label, e.g. "~800 m", "~4.2 km", "~37 km".
export function formatDistance(km: number): string {
  if (km < 1) return `~${Math.round(km * 1000)} m`;
  if (km < 10) return `~${km.toFixed(1)} km`;
  return `~${Math.round(km)} km`;
}
