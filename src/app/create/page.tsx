"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { useCategories } from "@/lib/useCategories";
import { CategoryItem } from "@/lib/categories";

export default function CreatePage() {
  const router = useRouter();
  const { topLevel, getSubcats } = useCategories();
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
              className="p-2 rounded-xl hover:bg-accent transition-colors text-muted-foreground"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {selectedParent
                ? `${selectedParent.icon} ${selectedParent.name}`
                : "ಹೊಸ ಜಾಹೀರಾತು ಹಾಕಿ (Post New Ad)"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {selectedParent
                ? "ಉಪ ವಿಭಾಗ ಆಯ್ಕೆಮಾಡಿ (Select a subcategory)"
                : "ವಿಭಾಗ ಆಯ್ಕೆಮಾಡಿ (Select a category to get started)"}
            </p>
          </div>
        </div>

        {/* Breadcrumb */}
        {selectedParent && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
            <button onClick={() => setSelectedParent(null)} className="hover:text-primary">
              ಎಲ್ಲಾ ವಿಭಾಗಗಳು
            </button>
            <span>/</span>
            <span className="text-foreground font-medium">{selectedParent.name}</span>
          </div>
        )}

        {/* Parent categories */}
        {!selectedParent && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topLevel.map((cat) => {
              const subs = getSubcats(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => handleParentSelect(cat)}
                  className="flex items-center gap-3.5 p-4 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 transition-all group text-left w-full"
                >
                  <div className={`w-12 h-12 rounded-xl ${cat.color} flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform`}>
                    {cat.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">{cat.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{cat.nameEn}</p>
                    {subs.length > 0 && (
                      <p className="text-[10px] text-primary/70 mt-0.5">{subs.length} subcategories →</p>
                    )}
                  </div>
                  <ArrowRight size={16} className="text-muted-foreground/40 group-hover:text-primary shrink-0 transition-colors" />
                </button>
              );
            })}
          </div>
        )}

        {/* Subcategories */}
        {selectedParent && subcategories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => handleSubSelect(sub)}
                className="flex items-center gap-3.5 p-4 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 transition-all group text-left w-full"
              >
                <div className={`w-12 h-12 rounded-xl ${sub.color || selectedParent.color} flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform`}>
                  {sub.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">{sub.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{sub.nameEn}</p>
                </div>
                <ArrowRight size={16} className="text-muted-foreground/40 group-hover:text-primary shrink-0 transition-colors" />
              </button>
            ))}

            {/* Also allow posting directly to parent */}
            <button
              onClick={() => router.push(`/category/${selectedParent.id}/create`)}
              className="flex items-center gap-3.5 p-4 rounded-2xl border border-dashed border-border bg-card/50 hover:border-primary/40 hover:bg-card transition-all group text-left w-full"
            >
              <div className={`w-12 h-12 rounded-xl ${selectedParent.color} flex items-center justify-center text-2xl shrink-0 opacity-60`}>
                {selectedParent.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">ಇತರ / Other</p>
                <p className="text-xs text-muted-foreground">Post under {selectedParent.nameEn}</p>
              </div>
              <ArrowRight size={16} className="text-muted-foreground/40 group-hover:text-primary shrink-0 transition-colors" />
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
