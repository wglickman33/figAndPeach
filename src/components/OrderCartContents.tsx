import { IconCart } from "./ui/IconCart";
import "./OrderCartContents.css";

type OrderCartContentsProps = {
  label: string;
  count: number;
  compact?: boolean;
};

export function OrderCartContents({ label, count, compact = false }: OrderCartContentsProps) {
  const countLabel = count === 1 ? "1 item in cart" : `${count} items in cart`;

  return (
    <span className={`order-cart-contents${compact ? " order-cart-contents--compact" : ""}`}>
      <span className="order-cart-contents__icon-wrap">
        <IconCart />
        {count > 0 && (
          <span className="order-cart-contents__count" aria-label={countLabel}>
            {count}
          </span>
        )}
      </span>
      <span className="order-cart-contents__label">{label}</span>
    </span>
  );
}
