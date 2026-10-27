"use client";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/lang-context";

/**
 * Segmented toggle (styled like the language switch) to flip between the two
 * property categories: Sale & Purchase vs Rent & Lease. Shown at the top of
 * property category pages. `active` is "sales" or "rent".
 */
export default function PropertyTypeToggle({ active }: { active: "sales" | "rent" }) {
  const router = useRouter();
  const { t } = useLang();

  const Pill = ({
    value,
    label,
    target,
  }: {
    value: "sales" | "rent";
    label: string;
    target: string;
  }) => {
    const isActive = active === value;
    return (
      <button
        onClick={() => !isActive && router.push(`/category/${target}`)}
        className={`flex-1 sm:flex-none px-4 py-2 rounded-full text-sm font-medium transition ${
          isActive
            ? "bg-primary text-white shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="inline-flex items-center gap-1 bg-card border border-border rounded-full p-1 shadow-sm">
      <Pill value="sales" target="property-sales" label={t("ಮಾರಾಟ & ಖರೀದಿ", "Sale & Purchase")} />
      <Pill value="rent" target="property-rent" label={t("ಬಾಡಿಗೆ & ಲೀಸ್", "Rent & Lease")} />
    </div>
  );
}
