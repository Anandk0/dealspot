// Input sanitizers for form fields. HTML type="number" still accepts "e", "+",
// "-", multiple dots and unlimited length, and on mobile the keyboard can send
// letters — so we enforce the real constraint on the value itself.

/** Digits + at most one decimal point. Caps the integer part length. */
export function sanitizeAmount(raw: string, maxDigits = 12): string {
  let v = raw.replace(/[^\d.]/g, "");
  // Collapse multiple dots to the first one.
  const firstDot = v.indexOf(".");
  if (firstDot !== -1) {
    v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, "");
  }
  const [intPart, decPart] = v.split(".");
  const cappedInt = (intPart || "").slice(0, maxDigits);
  return decPart !== undefined ? `${cappedInt}.${decPart.slice(0, 2)}` : cappedInt;
}

/** Digits only, capped length (e.g. quantity, year, size without decimals). */
export function sanitizeDigits(raw: string, maxLen = 10): string {
  return raw.replace(/\D/g, "").slice(0, maxLen);
}

/** 10-digit mobile number: digits only, max 10. */
export function sanitizePhone(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 10);
}

/** 4-digit year. */
export function sanitizeYear(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 4);
}

/**
 * Pick a sanitizer by the field's logical type/key. Falls back to a plain
 * length cap for free text so nothing accepts unbounded input.
 */
export function sanitizeByType(
  raw: string,
  opts: { type?: string; key?: string }
): string {
  const { type, key } = opts;
  const k = (key || "").toLowerCase();
  if (type === "tel" || k.includes("mobile") || k.includes("whatsapp") || k.includes("phone")) {
    return sanitizePhone(raw);
  }
  if (k === "year") return sanitizeYear(raw);
  if (type === "number" || k.includes("price") || k.includes("deposit") || k.includes("rent") || k.includes("amount") || k.includes("maintenance")) {
    return sanitizeAmount(raw);
  }
  if (type === "date") return raw; // native date input
  // Plain text: cap at a sane max so titles/descriptions can't be unbounded.
  return raw.slice(0, 120);
}
