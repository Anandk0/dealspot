"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import PropertyForm from "@/components/PropertyForm";
import LocationFields, { type LocationValue } from "@/components/LocationFields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { api, ListingData } from "@/lib/api";
import { useLang } from "@/lib/lang-context";

/** Fields for the generic (non-property) edit form, keyed by top-level family. */
function genericFields(category: string): { key: string; label: string }[] {
  const c = category;
  if (c.startsWith("agri") || c.includes("equipment") || c.includes("tractor")) {
    return [
      { key: "title", label: "ಉಪಕರಣ ಹೆಸರು (Equipment Name)" },
      { key: "condition", label: "ಸ್ಥಿತಿ (Condition)" },
      { key: "price", label: "ಬೆಲೆ / ದರ ₹ (Price/Rate)" },
      { key: "location", label: "ಸ್ಥಳ (Location)" },
      { key: "district", label: "ಜಿಲ್ಲೆ (District)" },
    ];
  }
  if (c.startsWith("livestock") || c === "danakarugalu") {
    return [
      { key: "title", label: "ವಿವರ (Title)" },
      { key: "breed", label: "ತಳಿ (Breed)" },
      { key: "age", label: "ವಯಸ್ಸು (Age)" },
      { key: "price", label: "ಬೆಲೆ ₹ (Price)" },
      { key: "location", label: "ಸ್ಥಳ (Location)" },
      { key: "district", label: "ಜಿಲ್ಲೆ (District)" },
    ];
  }
  if (c.startsWith("pets")) {
    return [
      { key: "title", label: "ಪೆಟ್ ಹೆಸರು (Pet Name/Type)" },
      { key: "breed", label: "ತಳಿ (Breed)" },
      { key: "age", label: "ವಯಸ್ಸು (Age)" },
      { key: "price", label: "ಬೆಲೆ ₹ (Price)" },
      { key: "location", label: "ಸ್ಥಳ (Location)" },
      { key: "district", label: "ಜಿಲ್ಲೆ (District)" },
    ];
  }
  if (c.startsWith("vehicle")) {
    return [
      { key: "title", label: "ವಾಹನ ಹೆಸರು (Vehicle Name)" },
      { key: "vehicleType", label: "ವಿಧ (Type)" },
      { key: "rateInfo", label: "ಬಾಡಿಗೆ ದರ (Rate)" },
      { key: "location", label: "ಸ್ಥಳ (Location)" },
      { key: "district", label: "ಜಿಲ್ಲೆ (District)" },
    ];
  }
  if (c.startsWith("service") || c === "agents" || c === "agent") {
    return [
      { key: "title", label: "ಸೇವೆ / ಹೆಸರು (Service/Name)" },
      { key: "experience", label: "ಅನುಭವ (Experience)" },
      { key: "rateInfo", label: "ದರ (Rate)" },
      { key: "location", label: "ಸ್ಥಳ (Location)" },
      { key: "district", label: "ಜಿಲ್ಲೆ (District)" },
    ];
  }
  return [
    { key: "title", label: "ಹೆಸರು (Title)" },
    { key: "price", label: "ಬೆಲೆ ₹ (Price)" },
    { key: "condition", label: "ಸ್ಥಿತಿ (Condition)" },
    { key: "location", label: "ಸ್ಥಳ (Location)" },
    { key: "district", label: "ಜಿಲ್ಲೆ (District)" },
  ];
}

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLang();
  const categoryId = params.id as string;
  const itemId = Number(params.itemId);

  const [item, setItem] = useState<ListingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [loc, setLoc] = useState<LocationValue>({ pincode: "", district: "", taluk: "", area: "" });

  useEffect(() => {
    api.getListingById(itemId)
      .then((data) => {
        setItem(data);
        setForm({
          title: data.title || "",
          price: data.price != null ? String(data.price) : "",
          condition: data.condition || "",
          breed: data.breed || "",
          age: data.age || "",
          vehicleType: data.vehicleType || "",
          experience: data.experience || "",
          rateInfo: data.rateInfo || "",
          description: data.description || "",
        });
        setLoc({
          pincode: data.pincode || "",
          district: data.district || "",
          taluk: data.taluk || "",
          area: data.location || "",
        });
      })
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [itemId]);

  const isProperty = (item?.category || categoryId).startsWith("property");

  const handleChange = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    if (!form.title?.trim()) {
      toast.error(t("ಶೀರ್ಷಿಕೆ ಅಗತ್ಯ", "Title is required"));
      return;
    }
    setSaving(true);
    try {
      const rawPrice = form.price ? form.price.replace(/[^0-9.]/g, "") : "";
      const parsed = rawPrice ? parseFloat(rawPrice) : null;
      const data: Record<string, unknown> = {
        title: form.title.trim(),
        category: item.category,
        description: form.description?.trim() || "",
        location: loc.area?.trim() || "",
        district: loc.district || "",
        taluk: loc.taluk || null,
        pincode: loc.pincode || null,
        price: parsed && !isNaN(parsed) ? parsed : null,
        condition: form.condition?.trim() || null,
        breed: form.breed?.trim() || null,
        age: form.age?.trim() || null,
        vehicleType: form.vehicleType?.trim() || null,
        experience: form.experience?.trim() || null,
        rateInfo: form.rateInfo?.trim() || null,
      };
      await api.updateListing(item.id, data);
      toast.success(t("ಜಾಹೀರಾತು ನವೀಕರಿಸಲಾಗಿದೆ!", "Listing updated!"));
      setTimeout(() => router.push("/profile/listings"), 1000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("ನವೀಕರಣ ವಿಫಲ", "Update failed"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      </AppLayout>
    );
  }

  if (!item) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto p-6 text-center py-20">
          <p className="text-5xl mb-4">😔</p>
          <p className="text-muted-foreground">{t("ಜಾಹೀರಾತು ಸಿಗಲಿಲ್ಲ", "Listing not found")}</p>
          <Link href="/profile/listings" className="text-primary mt-4 inline-block hover:underline">← {t("ಹಿಂದೆ", "Back")}</Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-4 sm:p-6 pb-28 lg:pb-8">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-4">
          <Link href="/profile/listings" className="hover:text-primary">{t("ನನ್ನ ಜಾಹೀರಾತುಗಳು", "My Listings")}</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{t("ಸಂಪಾದಿಸಿ", "Edit")}</span>
        </div>
        <h1 className="text-lg sm:text-xl font-bold text-foreground mb-4">
          {t("ಜಾಹೀರಾತು ಸಂಪಾದಿಸಿ (Edit Listing)", "Edit Listing")}
        </h1>

        {isProperty ? (
          <PropertyForm
            categoryId={item.category}
            rent={item.category.includes("rent")}
            existing={item}
          />
        ) : (
          <form onSubmit={handleSave} className="bg-card rounded-2xl p-4 sm:p-6 border border-border space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {genericFields(item.category)
                .filter((field) => !["district", "location", "area"].includes(field.key))
                .map((field) => (
                  <div key={field.key}>
                    <label className="text-xs sm:text-sm font-medium text-foreground mb-1 block">{field.label}</label>
                    <Input
                      value={form[field.key] || ""}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      placeholder={field.label}
                      className="h-10 sm:h-11"
                      type={field.key === "price" ? "number" : "text"}
                    />
                  </div>
                ))}
            </div>

            {/* Connected location: Pincode → District → Taluk → Area */}
            <LocationFields value={loc} onChange={setLoc} />
            <div>
              <label className="text-xs sm:text-sm font-medium text-foreground mb-1 block">{t("ವಿವರಣೆ (Description)", "Description")}</label>
              <Textarea
                value={form.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={4}
                placeholder={t("ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ...", "Enter details...")}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {t("ಗಮನಿಸಿ: ಹೊಸ ಫೋಟೋ ಸೇರಿಸಲು ಜಾಹೀರಾತು ಪುಟದಿಂದ ಮಾಡಿ.", "Note: existing photos are kept. Image management stays on the listing.")}
            </p>
            <div className="flex gap-3 pt-1">
              <Button type="submit" disabled={saving} className="bg-primary px-8 h-11 text-sm font-medium">
                {saving ? <><Loader2 size={16} className="mr-2 animate-spin" /> {t("ಉಳಿಸಲಾಗುತ್ತಿದೆ...", "Saving...")}</> : t("ನವೀಕರಿಸಿ (Update)", "Update")}
              </Button>
              <Link href="/profile/listings">
                <Button type="button" variant="outline" className="h-11 text-sm">{t("ರದ್ದು (Cancel)", "Cancel")}</Button>
              </Link>
            </div>
          </form>
        )}
      </div>
    </AppLayout>
  );
}
