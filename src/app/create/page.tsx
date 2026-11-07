"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { useCategories } from "@/lib/useCategories";
import { useLang } from "@/lib/lang-context";
import { CategoryItem } from "@/lib/categories";
import { getCategoryLucideIcon } from "@/lib/category-icons";

export default function CreatePage() {
  const router = useRouter();
  const { topLevel, getSubcats } = useCategories();
  const { lang } = useLang();
  const cname = (c: { name: string; nameEn: string }) => (lang === "en" ? c.nameEn : c.name);
  const csub = (c: { name: string; nameEn: string }) => (lang === "en" ? c.name : c.nameEn);
  const [selectedParent, setSelectedParent] = useState<CategoryItem | null>(null);

  const subcategories = selectedParent ? getSubcats(selectedParent.id) : [];

  const handleParentSelect = (cat: CategoryItem) => {
    const subs = getSubcats(cat.id);
    if (subs.length === 0) {
      // No subcategories — go straight to the form
      router.push(`/category/${cat.id}/create`);
    } else {
      // Has subcategories — show subcategory picker
      setSelectedParent(cat);
    }
  };

  const handleSubSelect = (sub: CategoryItem) => {
    router.push(`/category/${sub.id}/create`);
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 py-6 pb-28 lg:pb-8">

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {selectedParent && (
            <button
              onClick={() => setSelectedParent(null)}
              aria-label={lang === "en" ? "Back to categories" : "ವಿಭಾಗಗಳಿಗೆ ಹಿಂದೆ"} className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {selectedParent
                ? cname(selectedParent)
                : (lang === "en" ? "Post a listing" : "ಹೊಸ ಜಾಹೀರಾತು ಹಾಕಿ")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {selectedParent
                ? (lang === "en" ? "Select a subcategory" : "ಉಪ ವಿಭಾಗ ಆಯ್ಕೆಮಾಡಿ")
                : (lang === "en" ? "Select a category" : "ವಿಭಾಗ ಆಯ್ಕೆಮಾಡಿ")}
            </p>
          </div>
        </div>

        {/* Breadcrumb */}
        {selectedParent && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
            <button onClick={() => setSelectedParent(null)} className="hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
              {lang === "en" ? "All categories" : "ಎಲ್ಲಾ ವಿಭಾಗಗಳು"}
            </button>
            <span>/</span>
            <span className="text-foreground font-medium">{cname(selectedParent)}</span>
          </div>
        )}

        {/* Parent categories */}
        {!selectedParent && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {topLevel.map((cat) => {
              const subs = getSubcats(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => handleParentSelect(cat)}
                  className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-accent/50 transition-colors group text-left w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className={`w-12 h-12 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0`}>
                    {(() => { const CatIcon = getCategoryLucideIcon(cat.id); return <CatIcon size={18} strokeWidth={1.5} aria-hidden="true" />; })()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors truncate">{cname(cat)}</p>
                    <p className="text-xs text-muted-foreground truncate">{csub(cat)}</p>
                    {subs.length > 0 && (
                      <p className="text-xs text-primary mt-0.5">{subs.length} {lang === "en" ? "subcategories" : "ಉಪ ವಿಭಾಗಗಳು"}</p>
                    )}
                  </div>
                  <ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" className="text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                </button>
              );
            })}
          </div>
        )}

        {/* Subcategories */}
        {selectedParent && subcategories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => handleSubSelect(sub)}
                className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-accent/50 transition-colors group text-left w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className={`w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center shrink-0 ${sub.image ? "" : "bg-muted text-muted-foreground"}`}>
                  {sub.image ? (
                    <img src={sub.image} alt={sub.nameEn} className="w-full h-full object-cover" loading="lazy" />
                  ) : ((() => { const SubIcon = getCategoryLucideIcon(sub.id); return <SubIcon size={18} strokeWidth={1.5} aria-hidden="true" />; })())}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors truncate">{cname(sub)}</p>
                  <p className="text-xs text-muted-foreground truncate">{csub(sub)}</p>
                </div>
                <ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" className="text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
              </button>
            ))}

            {/* Also allow posting directly to parent */}
            <button
              onClick={() => router.push(`/category/${selectedParent.id}/create`)}
              className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-border bg-card/50 hover:border-primary/40 hover:bg-accent/50 transition-colors group text-left w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className={`w-12 h-12 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0`}>
                {(() => { const ParentIcon = getCategoryLucideIcon(selectedParent.id); return <ParentIcon size={18} strokeWidth={1.5} aria-hidden="true" />; })()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{lang === "en" ? "Other" : "ಇತರ"}</p>
                <p className="text-xs text-muted-foreground">{lang === "en" ? "Post under" : "ಇಲ್ಲಿ ಪೋಸ್ಟ್ ಮಾಡಿ"} {cname(selectedParent)}</p>
              </div>
              <ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" className="text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
