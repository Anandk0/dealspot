"use client";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Eye, EyeOff, Lock, Check, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api, AdminCategoryResponse } from "@/lib/api";
import { fieldsForSlug } from "@/lib/fieldCatalog";
import { useAdminGuard } from "@/lib/useAdminGuard";

type FlatCat = { id: number; slug: string; label: string };

export default function FieldVisibilityPage() {
  const { isAuthorized, isLoading: guardLoading } = useAdminGuard("ADMIN");

  const [cats, setCats] = useState<AdminCategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [freeSet, setFreeSet] = useState<Set<string>>(new Set());
  const [unlockSet, setUnlockSet] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthorized) return;
    api.adminGetCategories()
      .then((data) => setCats(data))
      .catch(() => toast.error("Failed to load categories"))
      .finally(() => setLoading(false));
  }, [isAuthorized]);

  // Flatten parents + subcategories into a single selectable list.
  const flat: FlatCat[] = useMemo(() => {
    const out: FlatCat[] = [];
    cats.forEach((c) => {
      out.push({ id: c.id, slug: c.slug, label: `${c.nameEn}` });
      (c.subcategories || []).forEach((s) =>
        out.push({ id: s.id, slug: s.slug, label: `   └ ${s.nameEn}` })
      );
    });
    return out;
  }, [cats]);

  const findCat = (id: number): AdminCategoryResponse | undefined => {
    for (const c of cats) {
      if (c.id === id) return c;
      const sub = (c.subcategories || []).find((s) => s.id === id);
      if (sub) return sub;
    }
    return undefined;
  };

  const selected = selectedId != null ? findCat(selectedId) : undefined;
  const fields = selected ? fieldsForSlug(selected.slug) : [];

  // When a category is selected, seed the two sets from its saved config.
  // Default (nothing saved): all fields are "free" (before unlock), matching
  // the existing behavior until the admin curates.
  const selectCategory = (id: number) => {
    setSelectedId(id);
    const c = findCat(id);
    if (!c) return;
    const f = fieldsForSlug(c.slug).map((x) => x.key);
    const savedFree = c.freeFields && c.freeFields.length ? c.freeFields : null;
    const savedUnlock = c.unlockFields && c.unlockFields.length ? c.unlockFields : null;
    setFreeSet(new Set(savedFree ?? f));           // default: everything free
    setUnlockSet(new Set(savedUnlock ?? f));       // default: everything after unlock too
  };

  const toggle = (which: "free" | "unlock", key: string) => {
    const setter = which === "free" ? setFreeSet : setUnlockSet;
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const save = async () => {
    if (selectedId == null) return;
    setSaving(true);
    try {
      const updated = await api.adminSetFieldVisibility(
        selectedId,
        Array.from(freeSet),
        Array.from(unlockSet),
      );
      // Reflect saved values back into local state.
      setCats((prev) => prev.map((c) => {
        if (c.id === selectedId) return { ...c, freeFields: updated.freeFields, unlockFields: updated.unlockFields };
        return { ...c, subcategories: (c.subcategories || []).map((s) => s.id === selectedId ? { ...s, freeFields: updated.freeFields, unlockFields: updated.unlockFields } : s) };
      }));
      toast.success("Field visibility saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (guardLoading || loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin text-muted-foreground" size={32} /></div>;
  }
  if (!isAuthorized) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Eye size={22} /> Field Visibility</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Choose which seller-entered details buyers see <strong>before</strong> unlocking (free basic specs)
          and <strong>after</strong> unlocking (paid). Owner contact &amp; exact location are always revealed only after unlock.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category list */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted">
            <p className="text-sm font-semibold text-foreground">Categories</p>
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            {flat.map((c) => (
              <button
                key={c.id}
                onClick={() => selectCategory(c.id)}
                className={`w-full text-left px-4 py-2.5 text-sm border-b border-border last:border-0 whitespace-pre transition ${
                  selectedId === c.id ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Field toggles for the selected category */}
        <div className="lg:col-span-2">
          {!selected ? (
            <div className="bg-card rounded-xl border border-border p-10 text-center text-muted-foreground">
              Select a category to configure its fields.
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{selected.nameEn}</p>
                  <p className="text-xs text-muted-foreground font-mono">{selected.slug}</p>
                </div>
                <Button onClick={save} disabled={saving} className="bg-primary">
                  {saving ? <Loader2 size={15} className="mr-2 animate-spin" /> : <Save size={15} className="mr-2" />} Save
                </Button>
              </div>

              <div className="p-5">
                {/* Header row */}
                <div className="grid grid-cols-[1fr_auto_auto] gap-3 items-center pb-2 mb-2 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <span>Field</span>
                  <span className="w-20 text-center">Before unlock</span>
                  <span className="w-20 text-center">After unlock</span>
                </div>

                {fields.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">No configurable fields for this category.</p>
                ) : (
                  fields.map((f) => (
                    <div key={f.key} className="grid grid-cols-[1fr_auto_auto] gap-3 items-center py-2 border-b border-border/60 last:border-0">
                      <span className="text-sm text-foreground">{f.label}</span>
                      <button
                        type="button"
                        onClick={() => toggle("free", f.key)}
                        className={`w-20 h-8 rounded-lg border text-xs font-medium inline-flex items-center justify-center gap-1 transition ${
                          freeSet.has(f.key) ? "border-green-400 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400" : "border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {freeSet.has(f.key) ? <Eye size={13} /> : <EyeOff size={13} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggle("unlock", f.key)}
                        className={`w-20 h-8 rounded-lg border text-xs font-medium inline-flex items-center justify-center gap-1 transition ${
                          unlockSet.has(f.key) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {unlockSet.has(f.key) ? <Check size={13} /> : <EyeOff size={13} />}
                      </button>
                    </div>
                  ))
                )}

                {/* Always-paid note */}
                <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                  <Lock size={13} className="shrink-0 mt-0.5" />
                  <span>Owner contact (name, mobile, WhatsApp) and the exact location/address are always hidden until the buyer unlocks — these are not configurable here.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
