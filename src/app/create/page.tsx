"use client";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { categories } from "@/lib/categories";

export default function CreatePage() {
  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-xl font-bold text-foreground mb-2">ಹೊಸ ಜಾಹೀರಾತು ಹಾಕಿ (Post New Ad)</h1>
        <p className="text-sm text-muted-foreground mb-6">ವಿಭಾಗ ಆಯ್ಕೆಮಾಡಿ (Select a category to get started)</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.id}/create`}
              className="flex items-center gap-3.5 p-4 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl ${cat.color} flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform`}>
                {cat.icon}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">{cat.name}</p>
                <p className="text-xs text-muted-foreground truncate">{cat.nameEn}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
