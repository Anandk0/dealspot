"use client";
import { useState, useEffect } from "react";
import { api, CategoryPublicResponse } from "./api";
import { categories as hardcodedCategories, CategoryItem } from "./categories";

/**
 * Maps an API CategoryPublicResponse to the frontend CategoryItem shape.
 * Preserves the hardcoded gradient/image if the API doesn't have them.
 */
function mapApiCategory(c: CategoryPublicResponse): CategoryItem & { subcategories?: CategoryItem[] } {
  const hardcoded = hardcodedCategories.find((h) => h.id === c.slug);
  return {
    id: c.slug,
    name: c.name,
    nameEn: c.nameEn,
    icon: c.icon || hardcoded?.icon || "📦",
    color: c.color || hardcoded?.color || "bg-gray-100",
    gradient: hardcoded?.gradient,
    image: c.imageUrl || hardcoded?.image,
    parentId: c.parentId ? String(c.parentId) : undefined,
    subcategories: c.subcategories?.map(mapApiCategory),
  };
}

interface UseCategoriesResult {
  topLevel: CategoryItem[];
  getSubcats: (slug: string) => CategoryItem[];
  getCategory: (slug: string) => CategoryItem | undefined;
  getParent: (slug: string) => CategoryItem | undefined;
  loading: boolean;
}

export function useCategories(): UseCategoriesResult {
  const [apiCategories, setApiCategories] = useState<(CategoryItem & { subcategories?: CategoryItem[] })[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCategories()
      .then((data) => setApiCategories(data.map(mapApiCategory)))
      .catch(() => setApiCategories(null)) // fall back to hardcoded on error
      .finally(() => setLoading(false));
  }, []);

  // If API loaded, use it — otherwise fall back to hardcoded
  const source = apiCategories ?? hardcodedCategories;
  const topLevel = source.filter((c) => !c.parentId);

  const getSubcats = (slug: string): CategoryItem[] => {
    if (apiCategories) {
      const parent = apiCategories.find((c) => c.id === slug);
      return parent?.subcategories ?? [];
    }
    // fallback: hardcoded subcategories
    return hardcodedCategories.filter((c) => c.parentId === slug);
  };

  const getCategory = (slug: string): CategoryItem | undefined => {
    if (apiCategories) {
      return (
        apiCategories.find((c) => c.id === slug) ??
        apiCategories.flatMap((c) => c.subcategories ?? []).find((c) => c.id === slug)
      );
    }
    return hardcodedCategories.find((c) => c.id === slug);
  };

  const getParent = (slug: string): CategoryItem | undefined => {
    const cat = getCategory(slug);
    if (!cat?.parentId) return undefined;
    return getCategory(cat.parentId);
  };

  return { topLevel, getSubcats, getCategory, getParent, loading };
}
