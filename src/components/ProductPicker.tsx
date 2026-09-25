import type { CatalogProduct } from "../types/catalog";
import "./ProductPicker.css";

type ProductPickerProps = {
  title: string;
  products: CatalogProduct[];
  onProductClick: (product: CatalogProduct) => void;
};

export function ProductPicker({ title, products, onProductClick }: ProductPickerProps) {
  return (
    <fieldset className="product-picker">
      <legend className="section-label">Choose your {title.toLowerCase()}</legend>
      {products.length === 0 ? (
        <p className="product-picker__empty">Items coming soon for this category.</p>
      ) : (
        <div className="product-picker__grid">
          {products.map((product) => (
            <article key={product.id} className="product-card">
              <button
                type="button"
                className="product-card__select"
                onClick={() => onProductClick(product)}
              >
                <div className="product-card__image-wrap">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="product-card__image"
                  />
                </div>
                <div className="product-card__body">
                  <h3 className="product-card__name">{product.name}</h3>
                  <p className="product-card__description">{product.description}</p>
                  <p className="product-card__price">${product.price.toFixed(2)}</p>
                  {product.purchaseMode === "premade" && (
                    <p className="product-card__badge">Ready-made · add to order</p>
                  )}
                </div>
              </button>
            </article>
          ))}
        </div>
      )}
    </fieldset>
  );
}
