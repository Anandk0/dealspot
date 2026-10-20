// Catalog of detail fields each category family's posting form collects.
// Used by the admin Field Visibility page to let the admin pick which fields
// are shown BEFORE unlock (free) vs AFTER unlock (paid), per category.
//
// Contact + exact location are always revealed only after unlock and are NOT
// listed here (not admin-configurable).

export interface FieldDef {
  key: string;
  label: string;
}

export interface FieldGroup {
  label: string;
  // Slug substrings that map a category to this field group.
  match: string[];
  keys: FieldDef[];
}

export const FIELD_GROUPS: FieldGroup[] = [
  {
    label: "Property (Rent / Lease / Sale)",
    match: ["property"],
    keys: [
      { key: "propertyType", label: "Property Type" },
      { key: "bhk", label: "BHK / Rooms" },
      { key: "size", label: "Size" },
      { key: "areaUnit", label: "Area Unit" },
      { key: "furnishing", label: "Furnishing" },
      { key: "condition", label: "Condition" },
      { key: "deposit", label: "Deposit / Advance" },
      { key: "maintenance", label: "Maintenance" },
      { key: "leaseDuration", label: "Lease Duration" },
      { key: "negotiable", label: "Negotiable" },
      { key: "facilities", label: "Facilities" },
      { key: "houseRules", label: "House Rules" },
    ],
  },
  {
    label: "Agriculture Equipment",
    match: ["agri", "agriculture-equipment", "sprayer"],
    keys: [
      { key: "equipmentType", label: "Equipment Type" },
      { key: "brand", label: "Brand & Model" },
      { key: "year", label: "Manufacturing Year" },
      { key: "condition", label: "Condition" },
      { key: "rentType", label: "Rent Type" },
      { key: "deposit", label: "Deposit" },
      { key: "deliveryAvailable", label: "Delivery Available" },
      { key: "operatorAvailable", label: "Operator Included" },
      { key: "fuelIncluded", label: "Fuel Included" },
      { key: "negotiable", label: "Negotiable" },
    ],
  },
  {
    label: "Livestock / Pets",
    match: ["livestock", "danakarugalu", "pets", "ram"],
    keys: [
      { key: "breed", label: "Breed" },
      { key: "age", label: "Age" },
      { key: "gender", label: "Gender" },
      { key: "weight", label: "Weight" },
      { key: "health", label: "Health" },
      { key: "pregnancy", label: "Pregnancy" },
      { key: "milkYield", label: "Milk / Day" },
      { key: "quantity", label: "Quantity" },
      { key: "vaccination", label: "Vaccination" },
      { key: "color", label: "Color" },
    ],
  },
  {
    label: "Vehicle",
    match: ["vehicle"],
    keys: [
      { key: "brand", label: "Brand" },
      { key: "fuel", label: "Fuel" },
      { key: "rentType", label: "Rate Basis" },
      { key: "condition", label: "Condition" },
      { key: "vehicleType", label: "Vehicle Type" },
    ],
  },
  {
    label: "Services",
    match: ["service", "agents", "agent"],
    keys: [
      { key: "workType", label: "Work Type" },
      { key: "pricingBasis", label: "Pricing Basis" },
      { key: "homeVisit", label: "Home Visit" },
      { key: "workingHours", label: "Working Hours" },
      { key: "serviceTypes", label: "Service Types" },
      { key: "experience", label: "Experience" },
    ],
  },
];

/** The field list relevant to a category slug (by matching its family). */
export function fieldsForSlug(slug: string): FieldDef[] {
  const s = (slug || "").toLowerCase();
  const group = FIELD_GROUPS.find((g) => g.match.some((m) => s.includes(m)));
  if (group) return group.keys;
  // Unknown family: offer the union of common fields so the admin can still pick.
  const seen = new Set<string>();
  const all: FieldDef[] = [];
  FIELD_GROUPS.forEach((g) => g.keys.forEach((k) => {
    if (!seen.has(k.key)) { seen.add(k.key); all.push(k); }
  }));
  return all;
}
