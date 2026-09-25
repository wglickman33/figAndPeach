import { useState, type FormEvent } from "react";
import { AdminPageIntro } from "../../components/admin/AdminPageIntro";
import { useCatalog } from "../../context/useCatalog";
import { createCategory, deleteCategory, updateCategory } from "../../lib/api";
import { slugify } from "../../lib/slugify";
import type { CustomizationTemplate, ShopCategory } from "../../types/catalog";
import "./AdminPages.css";

export function AdminCategoriesPage() {
  const { categories, refresh } = useCatalog();
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState("10");
  const [template, setTemplate] = useState<CustomizationTemplate>("simple");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function syncIdFromName(nextName: string) {
    setName(nextName);
    if (!id || id === slugify(name)) {
      setId(slugify(nextName));
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await createCategory({
        id: slugify(id || name),
        name: name.trim(),
        sortOrder: Number(sortOrder),
        customizationTemplate: template,
      });
      setName("");
      setId("");
      setMessage("Category added. It will appear in the shop menu.");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create category.");
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate(category: ShopCategory, patch: Partial<ShopCategory>) {
    setBusy(true);
    setError(null);
    try {
      await updateCategory(category.id, {
        name: patch.name,
        sortOrder: patch.sortOrder,
        customizationTemplate: patch.customizationTemplate,
      });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update category.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(categoryId: string) {
    setBusy(true);
    setError(null);
    try {
      await deleteCategory(categoryId);
      setMessage("Category removed.");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete category.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-stack">
      <AdminPageIntro
        title="Table of Contents Categories"
        lede="These are the sections customers see in the shop menu (Necklaces, Bracelets, Scrunchies, and so on). Lower sort numbers appear higher in the list."
      />

      <section className="admin-panel">
        <h3 className="admin-subheading">Add Category</h3>

        <div className="admin-callout admin-callout--legend" role="note">
          <p className="admin-callout__title">Customize flow (template)</p>
          <ul className="admin-legend-list">
            <li>
              <strong>Detailed</strong>: Best for necklaces and bracelets. Customers choose length,
              clasp, bead size, and colors (use <strong>Customize Fields</strong> to fine-tune steps).
            </li>
            <li>
              <strong>Simple</strong>: Best for smaller items. Customers usually pick colors or one
              option group. You can adjust exact steps under <strong>Customize Fields</strong>.
            </li>
          </ul>
        </div>

        <form className="admin-form admin-form--constrained" onSubmit={handleCreate}>
          <label className="admin-field">
            <span>Display name</span>
            <input
              id="category-create-name"
              name="categoryCreateName"
              value={name}
              onChange={(e) => syncIdFromName(e.target.value)}
              required
            />
          </label>
          <label className="admin-field">
            <span>URL id (slug)</span>
            <input
              id="category-create-id"
              name="categoryCreateId"
              value={id}
              onChange={(e) => setId(slugify(e.target.value))}
              required
            />
          </label>
          <label className="admin-field">
            <span>Sort order</span>
            <input
              id="category-create-sort"
              name="categoryCreateSort"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              required
            />
          </label>
          <label className="admin-field">
            <span>Customize flow</span>
            <select
              id="category-create-template"
              name="categoryCreateTemplate"
              value={template}
              onChange={(e) => setTemplate(e.target.value as CustomizationTemplate)}
            >
              <option value="detailed">Detailed (necklace / bracelet style)</option>
              <option value="simple">Simple (fewer steps)</option>
            </select>
          </label>
          <button type="submit" className="admin-button admin-form__submit" disabled={busy}>
            Add Category
          </button>
        </form>
      </section>

      <section className="admin-panel">
        <h3 className="admin-subheading">Current Categories</h3>
        {error && <p className="admin-error">{error}</p>}
        {message && <p className="admin-success">{message}</p>}

        <ul className="admin-list admin-list--stacked">
          {categories.map((category) => (
            <li key={category.id} className="admin-list__item admin-list__item--stacked">
              <CategoryRow
                category={category}
                disabled={busy}
                onSave={(patch) => void handleUpdate(category, patch)}
                onDelete={() => void handleDelete(category.id)}
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

type CategoryRowProps = {
  category: ShopCategory;
  disabled: boolean;
  onSave: (patch: Partial<ShopCategory>) => void;
  onDelete: () => void;
};

function CategoryRow({ category, disabled, onSave, onDelete }: CategoryRowProps) {
  const [name, setName] = useState(category.name);
  const [sortOrder, setSortOrder] = useState(String(category.sortOrder));
  const [customizationTemplate, setCustomizationTemplate] = useState(
    category.customizationTemplate,
  );

  return (
    <div className="admin-row-form">
      <code className="admin-code">{category.id}</code>
      <label className="admin-field">
        <span>Name</span>
        <input
          id={`category-${category.id}-name`}
          name={`category-${category.id}-name`}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label className="admin-field">
        <span>Sort</span>
        <input
          id={`category-${category.id}-sort`}
          name={`category-${category.id}-sort`}
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        />
      </label>
      <label className="admin-field">
        <span>Template</span>
        <select
          id={`category-${category.id}-template`}
          name={`category-${category.id}-template`}
          value={customizationTemplate}
          onChange={(e) => setCustomizationTemplate(e.target.value as CustomizationTemplate)}
        >
          <option value="detailed">Detailed</option>
          <option value="simple">Simple</option>
        </select>
      </label>
      <div className="admin-row-form__actions">
        <button
          type="button"
          className="admin-button admin-button--ghost"
          disabled={disabled}
          onClick={() =>
            onSave({
              name: name.trim(),
              sortOrder: Number(sortOrder),
              customizationTemplate,
            })
          }
        >
          Save
        </button>
        <button type="button" className="admin-button admin-button--danger" disabled={disabled} onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}
