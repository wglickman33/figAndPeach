import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useCatalog } from "../../context/useCatalog";
import { CUSTOMIZATION_FIELD_TYPES } from "../../constants/customizationFieldTypes";
import {
  createCategoryCustomizationField,
  createProductCustomizationField,
  deleteCategoryCustomizationField,
  deleteProductCustomizationField,
  fetchAdminCategoryCustomizationFields,
  fetchAdminProductCustomizationFields,
  fetchAdminProducts,
  setProductUseCategoryDefaults,
  updateCategoryCustomizationField,
  updateProductCustomizationField,
} from "../../lib/api";
import type { CatalogProduct } from "../../types/catalog";
import type { CustomizationFieldDefinition, CustomizationFieldType } from "../../types/customizationFields";
import "./AdminPages.css";

export function AdminCustomizationFieldsPage() {
  const { categories, customization } = useCatalog();
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "necklaces");
  const [categoryFields, setCategoryFields] = useState<CustomizationFieldDefinition[]>([]);
  const [adminProducts, setAdminProducts] = useState<CatalogProduct[]>([]);
  const [productId, setProductId] = useState("");
  const [productFields, setProductFields] = useState<CustomizationFieldDefinition[]>([]);
  const [useCategoryDefaults, setUseCategoryDefaults] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadCategoryFields = useCallback(async () => {
    const fields = await fetchAdminCategoryCustomizationFields(categoryId);
    setCategoryFields(fields);
  }, [categoryId]);

  const loadProducts = useCallback(async () => {
    const products = await fetchAdminProducts();
    setAdminProducts(products);
  }, []);

  const loadProductFields = useCallback(async () => {
    if (!productId) {
      setProductFields([]);
      setUseCategoryDefaults(true);
      return;
    }
    const data = await fetchAdminProductCustomizationFields(productId);
    setProductFields(data.fields);
    setUseCategoryDefaults(data.useCategoryDefaults);
  }, [productId]);

  useEffect(() => {
    void loadCategoryFields().catch(() => setCategoryFields([]));
  }, [loadCategoryFields]);

  useEffect(() => {
    void loadProducts().catch(() => setAdminProducts([]));
  }, [loadProducts]);

  useEffect(() => {
    void loadProductFields().catch(() => {
      setProductFields([]);
      setUseCategoryDefaults(true);
    });
  }, [loadProductFields]);

  const productsInCategory = adminProducts.filter((p) => p.categoryId === categoryId);

  async function handleAddCategoryField(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setError(null);
    try {
      await createCategoryCustomizationField(categoryId, {
        fieldKey: String(data.get("fieldKey")),
        fieldType: String(data.get("fieldType")) as CustomizationFieldType,
        label: String(data.get("label")),
        sortOrder: Number(data.get("sortOrder") ?? categoryFields.length + 1),
        config: parseConfig(String(data.get("groupId")), String(data.get("lengths"))),
      });
      form.reset();
      setMessage("Category field added.");
      await loadCategoryFields();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add field.");
    } finally {
      setBusy(false);
    }
  }

  async function handleAddProductField(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!productId) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setError(null);
    try {
      await createProductCustomizationField(productId, {
        fieldKey: String(data.get("fieldKey")),
        fieldType: String(data.get("fieldType")) as CustomizationFieldType,
        label: String(data.get("label")),
        sortOrder: Number(data.get("sortOrder") ?? productFields.length + 1),
        config: parseConfig(String(data.get("groupId")), String(data.get("lengths"))),
      });
      form.reset();
      setMessage("Product override field added.");
      await loadProductFields();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add field.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleProductDefaults(next: boolean) {
    if (!productId) return;
    setBusy(true);
    setError(null);
    try {
      await setProductUseCategoryDefaults(productId, next);
      setUseCategoryDefaults(next);
      if (next) setProductFields([]);
      else await loadProductFields();
      setMessage(next ? "Using category defaults." : "Product-specific fields enabled.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update settings.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-split">
      <section className="admin-panel">
        <h2 className="admin-heading">Category fields</h2>
        <p className="admin-muted">
          Default customize steps for every customizable product in this category.
        </p>

        <label className="admin-field">
          <span>Category</span>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <FieldList
          fields={categoryFields}
          disabled={busy}
          onDelete={async (id) => {
            setBusy(true);
            try {
              await deleteCategoryCustomizationField(id);
              await loadCategoryFields();
            } finally {
              setBusy(false);
            }
          }}
          onSave={async (field, patch) => {
            setBusy(true);
            try {
              await updateCategoryCustomizationField(field.id, patch);
              await loadCategoryFields();
            } finally {
              setBusy(false);
            }
          }}
        />

        <form className="admin-form admin-form--compact" onSubmit={handleAddCategoryField}>
          <h3 className="admin-subheading">Add field</h3>
          <FieldFormFields groups={customization.groups} />
          <button type="submit" className="admin-button" disabled={busy}>
            Add to category
          </button>
        </form>
      </section>

      <section className="admin-panel">
        <h2 className="admin-heading">Product overrides</h2>
        <p className="admin-muted">
          Optional: replace category fields for one product (same category list above).
        </p>

        <label className="admin-field">
          <span>Product</span>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            <option value="">Select a product…</option>
            {productsInCategory.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </label>

        {productId && (
          <label className="admin-field admin-field--checkbox">
            <input
              type="checkbox"
              checked={useCategoryDefaults}
              onChange={(e) => void toggleProductDefaults(e.target.checked)}
              disabled={busy}
            />
            <span>Use category defaults</span>
          </label>
        )}

        {!useCategoryDefaults && productId && (
          <>
            <FieldList
              fields={productFields}
              disabled={busy}
              onDelete={async (id) => {
                setBusy(true);
                try {
                  await deleteProductCustomizationField(id);
                  await loadProductFields();
                } finally {
                  setBusy(false);
                }
              }}
              onSave={async (field, patch) => {
                setBusy(true);
                try {
                  await updateProductCustomizationField(field.id, patch);
                  await loadProductFields();
                } finally {
                  setBusy(false);
                }
              }}
            />

            <form className="admin-form admin-form--compact" onSubmit={handleAddProductField}>
              <h3 className="admin-subheading">Add override field</h3>
              <FieldFormFields groups={customization.groups} />
              <button type="submit" className="admin-button" disabled={busy}>
                Add to product
              </button>
            </form>
          </>
        )}

        {error && <p className="admin-error">{error}</p>}
        {message && <p className="admin-success">{message}</p>}
      </section>
    </div>
  );
}

function parseConfig(groupId: string, lengthsRaw: string) {
  const config: CustomizationFieldDefinition["config"] = { required: true };
  if (groupId.trim()) config.groupId = groupId.trim();
  const lengths = lengthsRaw
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((n) => Number.isFinite(n));
  if (lengths.length > 0) config.lengths = lengths;
  return config;
}

function FieldFormFields({ groups }: { groups: { id: string; name: string }[] }) {
  return (
    <>
      <label className="admin-field">
        <span>Field key (unique id)</span>
        <input name="fieldKey" required placeholder="e.g. colors" />
      </label>
      <label className="admin-field">
        <span>Label</span>
        <input name="label" required placeholder="Customer-facing title" />
      </label>
      <label className="admin-field">
        <span>Field type</span>
        <select name="fieldType" required defaultValue="group_multi">
          {CUSTOMIZATION_FIELD_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </label>
      <label className="admin-field">
        <span>Option group (for group_* types)</span>
        <select name="groupId" defaultValue="">
          <option value="">—</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </label>
      <label className="admin-field">
        <span>Lengths (comma-separated, for length_pills)</span>
        <input name="lengths" placeholder="14, 16, 18, 20" />
      </label>
      <label className="admin-field">
        <span>Sort order</span>
        <input name="sortOrder" type="number" defaultValue={1} />
      </label>
    </>
  );
}

type FieldListProps = {
  fields: CustomizationFieldDefinition[];
  disabled: boolean;
  onDelete: (id: string) => Promise<void>;
  onSave: (
    field: CustomizationFieldDefinition,
    patch: Partial<Omit<CustomizationFieldDefinition, "id">>,
  ) => Promise<void>;
};

function FieldList({ fields, disabled, onDelete, onSave }: FieldListProps) {
  if (fields.length === 0) {
    return <p className="admin-muted">No fields yet.</p>;
  }

  return (
    <ul className="admin-list admin-list--stacked">
      {fields.map((field) => (
        <li key={field.id} className="admin-list__item admin-list__item--stacked">
          <div className="admin-row-form">
            <p>
              <strong>{field.label}</strong> · {field.fieldKey} · {field.fieldType}
              {field.config.groupId ? ` · group ${field.config.groupId}` : ""}
            </p>
            <div className="admin-row-form__actions">
              <button
                type="button"
                className="admin-button admin-button--ghost"
                disabled={disabled}
                onClick={() =>
                  void onSave(field, { sortOrder: Math.max(0, field.sortOrder - 1) })
                }
              >
                ↑
              </button>
              <button
                type="button"
                className="admin-button admin-button--ghost"
                disabled={disabled}
                onClick={() => void onSave(field, { sortOrder: field.sortOrder + 1 })}
              >
                ↓
              </button>
              <button
                type="button"
                className="admin-button admin-button--danger"
                disabled={disabled}
                onClick={() => void onDelete(field.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
