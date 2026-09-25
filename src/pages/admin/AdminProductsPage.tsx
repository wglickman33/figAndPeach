import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useCatalog } from "../../context/useCatalog";
import {
  createProduct,
  deleteProduct,
  fetchAdminProducts,
  updateProduct,
  uploadImageToCloudinary,
} from "../../lib/api";
import type { CatalogProduct, PurchaseMode } from "../../types/catalog";
import "./AdminPages.css";

export function AdminProductsPage() {
  const { categories, refresh } = useCatalog();
  const [adminProducts, setAdminProducts] = useState<CatalogProduct[]>([]);
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "necklaces");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [purchaseMode, setPurchaseMode] = useState<PurchaseMode>("customizable");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadProducts = async () => {
    const products = await fetchAdminProducts();
    setAdminProducts(products);
  };

  useEffect(() => {
    void loadProducts().catch(() => setAdminProducts([]));
  }, []);

  const sortedProducts = useMemo(
    () =>
      [...adminProducts].sort(
        (a, b) => a.categoryId.localeCompare(b.categoryId) || a.name.localeCompare(b.name),
      ),
    [adminProducts],
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!file) {
      setError("Choose a product image to upload.");
      return;
    }

    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setError("Enter a valid price.");
      return;
    }

    setBusy(true);
    try {
      const uploaded = await uploadImageToCloudinary(file, `fig-and-peach/products/${categoryId}`);
      await createProduct({
        categoryId,
        name: name.trim(),
        description: description.trim(),
        price: parsedPrice,
        imageUrl: uploaded.imageUrl,
        cloudinaryPublicId: uploaded.publicId,
        purchaseMode,
      });
      setName("");
      setDescription("");
      setPrice("");
      setFile(null);
      setMessage("Product saved.");
      await loadProducts();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save product.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(productId: string) {
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      await deleteProduct(productId);
      setMessage("Product removed.");
      await loadProducts();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete product.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-split">
      <section className="admin-panel">
        <h2 className="admin-heading">Add product</h2>
        <form className="admin-form" onSubmit={handleSubmit}>
          <label className="admin-field">
            <span>Category</span>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-field">
            <span>Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>

          <label className="admin-field">
            <span>Description</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </label>

          <label className="admin-field">
            <span>Price (USD)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </label>

          <label className="admin-field">
            <span>Purchase mode</span>
            <select
              value={purchaseMode}
              onChange={(e) => setPurchaseMode(e.target.value as PurchaseMode)}
            >
              <option value="customizable">Customizable</option>
              <option value="premade">Pre-made (add from grid)</option>
            </select>
          </label>

          <label className="admin-field">
            <span>Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
            />
          </label>

          {error && <p className="admin-error">{error}</p>}
          {message && <p className="admin-success">{message}</p>}

          <button type="submit" className="admin-button" disabled={busy}>
            {busy ? "Saving…" : "Save product"}
          </button>
        </form>
      </section>

      <section className="admin-panel">
        <h2 className="admin-heading">Current products</h2>
        {sortedProducts.length === 0 ? (
          <p className="admin-muted">No products yet. Add your first item on the left.</p>
        ) : (
          <ul className="admin-list admin-list--stacked">
            {sortedProducts.map((product) => (
              <li key={product.id} className="admin-list__item admin-list__item--stacked">
                <ProductRow
                  product={product}
                  categories={categories}
                  disabled={busy}
                  onSave={async (patch, file) => {
                    setBusy(true);
                    setError(null);
                    try {
                      let imageUrl = patch.imageUrl;
                      let cloudinaryPublicId = patch.cloudinaryPublicId;
                      if (file) {
                        const uploaded = await uploadImageToCloudinary(
                          file,
                          `fig-and-peach/products/${product.categoryId}`,
                        );
                        imageUrl = uploaded.imageUrl;
                        cloudinaryPublicId = uploaded.publicId;
                      }
                      await updateProduct(product.id, { ...patch, imageUrl, cloudinaryPublicId });
                      setMessage("Product updated.");
                      await loadProducts();
                      await refresh();
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Could not update product.");
                    } finally {
                      setBusy(false);
                    }
                  }}
                  onDelete={() => void handleDelete(product.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

type ProductRowProps = {
  product: CatalogProduct;
  categories: { id: string; name: string }[];
  disabled: boolean;
  onSave: (
    patch: {
      categoryId: string;
      name: string;
      description: string;
      price: number;
      sortOrder: number;
      isActive: boolean;
      purchaseMode: PurchaseMode;
      imageUrl?: string;
      cloudinaryPublicId?: string;
    },
    file: File | null,
  ) => Promise<void>;
  onDelete: () => void;
};

function ProductRow({ product, categories, disabled, onSave, onDelete }: ProductRowProps) {
  const [categoryId, setCategoryId] = useState(product.categoryId);
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(String(product.price));
  const [sortOrder, setSortOrder] = useState(String(product.sortOrder));
  const [isActive, setIsActive] = useState(product.isActive !== false);
  const [purchaseMode, setPurchaseMode] = useState<PurchaseMode>(
    product.purchaseMode ?? "customizable",
  );
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="admin-row-form admin-row-form--with-thumb">
      <img src={product.imageUrl} alt="" className="admin-list__thumb" />
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
      <label className="admin-field">
        <span>Name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="admin-field">
        <span>Description</span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
      </label>
      <label className="admin-field">
        <span>Price</span>
        <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
      </label>
      <label className="admin-field">
        <span>Sort</span>
        <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
      </label>
      <label className="admin-field">
        <span>Purchase mode</span>
        <select
          value={purchaseMode}
          onChange={(e) => setPurchaseMode(e.target.value as PurchaseMode)}
        >
          <option value="customizable">Customizable</option>
          <option value="premade">Pre-made</option>
        </select>
      </label>
      <label className="admin-field admin-field--checkbox">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        <span>Visible in shop</span>
      </label>
      <label className="admin-field">
        <span>Replace image (optional)</span>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </label>
      <div className="admin-row-form__actions">
        <button
          type="button"
          className="admin-button admin-button--ghost"
          disabled={disabled}
          onClick={() =>
            void onSave(
              {
                categoryId,
                name: name.trim(),
                description: description.trim(),
                price: Number(price),
                sortOrder: Number(sortOrder),
                isActive,
                purchaseMode,
              },
              file,
            )
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
