"use client";
import { useEffect, useState } from "react";
import { api, AdminCategoryResponse, CategoryRequestData } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, Tag, Loader2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ─── Form State ──────────────────────────────────────────

const EMPTY_FORM: CategoryRequestData = {
  name: "",
  nameEn: "",
  slug: "",
  icon: "",
  color: "bg-green-100",
  sortOrder: 0,
  active: true,
  moderationLevel: "CHECKER_ONLY",
  parentId: null,
};

const COLORS = [
  "bg-blue-100", "bg-sky-100", "bg-green-100", "bg-emerald-100",
  "bg-amber-100", "bg-orange-100", "bg-pink-100", "bg-purple-100",
  "bg-red-100", "bg-gray-100",
];

const MODERATION_LEVELS = ["CHECKER_ONLY", "NO_AUTH", "ADMIN_ONLY"];

// ─── Component ───────────────────────────────────────────

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CategoryRequestData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await api.adminGetCategories();
      setCategories(data);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const openCreateParent = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, parentId: null });
    setShowForm(true);
  };

  const openCreateSub = (parentId: number) => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, parentId });
    setShowForm(true);
  };

  const openEdit = (cat: AdminCategoryResponse) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      nameEn: cat.nameEn,
      slug: cat.slug,
      icon: cat.icon || "",
      color: cat.color || "bg-green-100",
      sortOrder: cat.sortOrder,
      active: cat.active,
      moderationLevel: cat.moderationLevel,
      parentId: cat.parentId ?? null,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.nameEn.trim()) {
      toast.error("Name (Kannada) and English name are required");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await api.adminUpdateCategory(editingId, form);
        toast.success("Category updated");
      } else {
        await api.adminCreateCategory(form);
        toast.success("Category created");
      }
      closeForm();
      fetchCategories();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: AdminCategoryResponse) => {
    const hasSubcategories = cat.subcategories?.length > 0;
    if (hasSubcategories) {
      toast.error("Delete subcategories first before deleting this category");
      return;
    }
    if (!confirm(`Delete "${cat.name}"? This cannot be undone.`)) return;
    setDeletingId(cat.id);
    try {
      await api.adminDeleteCategory(cat.id);
      toast.success("Category deleted");
      fetchCategories();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete category");
    } finally {
      setDeletingId(null);
    }
  };

  // All top-level categories for the parent dropdown
  const topLevelCategories = categories.filter(c => !c.parentId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-gray-400" size={28} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
          <p className="text-sm text-gray-500 mt-0.5">{categories.length} top-level categories</p>
        </div>
        <Button onClick={openCreateParent} className="flex items-center gap-2">
          <Plus size={16} /> New Category
        </Button>
      </div>

      {/* Category Tree */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {categories.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Tag size={40} className="mx-auto mb-3 opacity-30" />
            <p>No categories yet. Create your first one!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <div key={cat.id}>
                {/* Parent Row */}
                <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 group">
                  {/* Expand toggle */}
                  <button
                    onClick={() => toggleExpand(cat.id)}
                    className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 shrink-0"
                  >
                    {cat.subcategories?.length > 0
                      ? expanded.has(cat.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                      : <span className="w-4" />}
                  </button>

                  {/* Icon */}
                  <span className="text-xl w-7 text-center shrink-0">{cat.icon || "📁"}</span>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-800 text-sm">{cat.name}</span>
                      <span className="text-xs text-gray-400">{cat.nameEn}</span>
                      {!cat.active && (
                        <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Inactive</span>
                      )}
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-mono">{cat.slug}</span>
                      {cat.subcategories?.length > 0 && (
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">
                          {cat.subcategories.length} sub
                        </span>
                      )}
                      {cat.listingCount > 0 && (
                        <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full">
                          {cat.listingCount} listings
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => openCreateSub(cat.id)}
                      title="Add subcategory"
                      className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition"
                    >
                      <Plus size={15} />
                    </button>
                    <button
                      onClick={() => openEdit(cat)}
                      title="Edit"
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      disabled={deletingId === cat.id}
                      title="Delete"
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition disabled:opacity-40"
                    >
                      {deletingId === cat.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    </button>
                  </div>
                </div>

                {/* Subcategories */}
                {expanded.has(cat.id) && cat.subcategories?.length > 0 && (
                  <div className="bg-gray-50 border-t border-gray-100">
                    {cat.subcategories.map((sub) => (
                      <div key={sub.id} className="flex items-center gap-3 px-4 py-2.5 pl-14 hover:bg-gray-100 group border-b border-gray-100 last:border-0">
                        <span className="text-lg w-6 text-center shrink-0">{sub.icon || "📄"}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-gray-700 text-sm">{sub.name}</span>
                            <span className="text-xs text-gray-400">{sub.nameEn}</span>
                            {!sub.active && (
                              <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Inactive</span>
                            )}
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-mono">{sub.slug}</span>
                            {sub.listingCount > 0 && (
                              <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full">
                                {sub.listingCount} listings
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => openEdit(sub)}
                            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 transition"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(sub)}
                            disabled={deletingId === sub.id}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-100 transition disabled:opacity-40"
                          >
                            {deletingId === sub.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 text-lg">
                {editingId ? "Edit Category" : form.parentId ? "Add Subcategory" : "New Category"}
              </h2>
              <button onClick={closeForm} className="p-2 rounded-lg hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4">
              {/* Parent selector (only when creating) */}
              {!editingId && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Type</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setForm(f => ({ ...f, parentId: null }))}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition ${
                        form.parentId === null
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      Parent Category
                    </button>
                    <button
                      onClick={() => {
                        const firstParent = topLevelCategories[0];
                        setForm(f => ({ ...f, parentId: firstParent?.id ?? null }));
                      }}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition ${
                        form.parentId !== null
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      Subcategory
                    </button>
                  </div>
                </div>
              )}

              {/* Parent dropdown (shown when subcategory selected) */}
              {form.parentId !== null && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Parent Category *</label>
                  <select
                    value={form.parentId ?? ""}
                    onChange={(e) => setForm(f => ({ ...f, parentId: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {topLevelCategories.map(p => (
                      <option key={p.id} value={p.id}>{p.icon} {p.name} ({p.nameEn})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Name (Kannada) */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Name (Kannada) *</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="ಕೃಷಿ ಉಪಕರಣ"
                />
              </div>

              {/* Name (English) */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Name (English) *</label>
                <Input
                  value={form.nameEn}
                  onChange={(e) => setForm(f => ({ ...f, nameEn: e.target.value }))}
                  placeholder="Agriculture Equipment"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Slug <span className="text-gray-400 font-normal">(auto-generated if blank)</span>
                </label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))}
                  placeholder="agriculture-equipment"
                  className="font-mono text-sm"
                />
              </div>

              {/* Icon + Sort Order in row */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Icon (emoji)</label>
                  <Input
                    value={form.icon}
                    onChange={(e) => setForm(f => ({ ...f, icon: e.target.value }))}
                    placeholder="🚜"
                    className="text-lg"
                  />
                </div>
                <div className="w-28">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Sort Order</label>
                  <Input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Color picker */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setForm(f => ({ ...f, color }))}
                      className={`w-8 h-8 rounded-lg ${color} border-2 transition ${
                        form.color === color ? "border-primary scale-110" : "border-transparent"
                      }`}
                      title={color}
                    >
                      {form.color === color && <Check size={14} className="mx-auto text-gray-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Moderation Level */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Moderation Level</label>
                <select
                  value={form.moderationLevel}
                  onChange={(e) => setForm(f => ({ ...f, moderationLevel: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {MODERATION_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                  className={`w-10 h-6 rounded-full transition-colors ${form.active ? "bg-primary" : "bg-gray-300"}`}
                >
                  <span className={`block w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${form.active ? "translate-x-4" : "translate-x-0"}`} />
                </button>
                <span className="text-sm text-gray-700">{form.active ? "Active" : "Inactive"}</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <Button variant="outline" onClick={closeForm} disabled={saving}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="min-w-[90px]">
                {saving ? <Loader2 size={16} className="animate-spin" /> : editingId ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
