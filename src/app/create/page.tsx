"use client";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { categories } from "@/lib/categories";

export default function CreatePage() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-xl font-bold text-gray-800 mb-2">ಹೊಸ ಜಾಹೀರಾತು ಹಾಕಿ (Post New Ad)</h1>
        <p className="text-sm text-gray-500 mb-6">ವಿಭಾಗ ಆಯ್ಕೆಮಾಡಿ (Select a category to get started)</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.id}/create`}
              className={`flex items-center gap-4 p-5 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-primary/30 transition-all group`}
            >
              <div className={`w-14 h-14 rounded-xl ${cat.color} flex items-center justify-center text-3xl group-hover:scale-110 transition-transform`}>
                {cat.icon}
              </div>
              <div>
                <p className="font-semibold text-gray-800 group-hover:text-primary transition-colors">{cat.name}</p>
                <p className="text-sm text-gray-500">{cat.nameEn}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
