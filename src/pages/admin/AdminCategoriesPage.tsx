import { useState, type FormEvent } from "react";
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
      setMessage("Category added. It will appear in the Table of Contents.");
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
      <section className="admin-panel">
        <h2 className="admin-heading">Table of Contents categories</h2>
        <p className="admin-muted">
          These are the shop sections in the sidebar (Necklaces, Bracelets, etc.). Sort order controls
          nav order.
        </p>

        <form className="admin-form" onSubmit={handleCreate}>
          <label className="admin-field">
            <span>Display name</span>
            <input value={name} onChange={(e) => syncIdFromName(e.target.value)} required />
          </label>
          <label className="admin-field">
            <span>URL id (slug)</span>
            <input value={id} onChange={(e) => setId(slugify(e.target.value))} required />
          </label>
          <label className="admin-field">
            <span>Sort order</span>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              required
            />
          </label>
          <label className="admin-field">
            <span>Customize flow</span>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value as CustomizationTemplate)}
            >
              <option value="detailed">Detailed (necklace/bracelet)</option>
              <option value="simple">Simple (color pickers)</option>
            </select>
          </label>
          <button type="submit" className="admin-button" disabled={busy}>
            Add category
          </button>
        </form>
      </section>

      <section className="admin-panel">
        <h2 className="admin-heading">Current categories</h2>
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
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="admin-field">
        <span>Sort</span>
        <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
      </label>
      <label className="admin-field">
        <span>Template</span>
        <select
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
