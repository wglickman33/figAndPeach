import type { CartItem } from "../types/order";
import { formatCartItemDetail } from "../types/order";
import "./Cart.css";

type CartProps = {
  items: CartItem[];
  onRemove: (id: string) => void;
};

export function Cart({ items, onRemove }: CartProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="cart" aria-label="Your order items">
      <h2 className="section-label">
        Your order ({items.length} {items.length === 1 ? "item" : "items"})
      </h2>
      <ul className="cart__list">
        {items.map((item, index) => (
          <li key={item.id} className="cart__item">
            <div className="cart__item-info">
              <span className="cart__item-name">
                {index + 1}. {item.productName}
              </span>
              <span className="cart__item-detail">{formatCartItemDetail(item)}</span>
            </div>
            <div className="cart__item-actions">
              <span className="cart__item-price">${item.price.toFixed(2)}</span>
              <button
                type="button"
                className="cart__remove"
                onClick={() => onRemove(item.id)}
                aria-label={`Remove ${item.productName}`}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
