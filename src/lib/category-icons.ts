import {
  Home,
  Building2,
  Tractor,
  Handshake,
  Beef,
  PawPrint,
  Car,
  Wrench,
  Zap,
  Hammer,
  Paintbrush,
  Camera,
  Wheat,
  Trees,
  Truck,
  Package,
  type LucideIcon,
} from "lucide-react";

// Line icons for category slugs. Category icons from the API are emoji
// strings, so screens look up a lucide icon by slug and fall back to a
// neutral one.
const ICONS: Record<string, LucideIcon> = {
  property: Home,
  "property-sales": Home,
  "property-rent": Building2,
  "agriculture-equipment": Tractor,
  "farm-equipment": Tractor,
  "tractor-rental": Tractor,
  agents: Handshake,
  agent: Handshake,
  danakarugalu: Beef,
  livestock: Beef,
  pets: PawPrint,
  "animals-pets": PawPrint,
  "vehicle-rent": Car,
  "vehicle-rent-car": Car,
  "vehicle-rental": Car,
  "vehicle-rent-auto": Car,
  "vehicle-rent-tempo": Truck,
  "vehicle-rent-mini-truck": Truck,
  services: Wrench,
  "services-plumber": Wrench,
  "services-electrician": Zap,
  "services-carpenter": Hammer,
  "services-painter": Paintbrush,
  "services-cctv": Camera,
  "agricultural-products": Wheat,
  land: Trees,
};

export function getCategoryLucideIcon(slug?: string | null): LucideIcon {
  if (!slug) return Package;
  return ICONS[slug] ?? Package;
}
