import { SITE } from "../constants/config";
import type { CartItem, FulfillmentMethod } from "../types/order";
import { formatCartItemDetail } from "../types/order";
import "./OrderSummary.css";

type OrderSummaryProps = {
  items: CartItem[];
  fulfillment: FulfillmentMethod;
};

export function OrderSummary({ items, fulfillment }: OrderSummaryProps) {
  const totals = getOrderTotals(items, fulfillment);

  return (
    <section className="order-summary" aria-live="polite">
      <h2 className="section-label">Order summary</h2>

      <dl className="order-summary__lines">
        {items.length === 0 ? (
          <div className="order-summary__line">
            <dt>
              Items
              <span className="order-summary__detail">Nothing added yet</span>
            </dt>
            <dd>$0.00</dd>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="order-summary__line">
              <dt>
                {item.productName}
                <span className="order-summary__detail">{formatCartItemDetail(item)}</span>
              </dt>
              <dd>${item.price.toFixed(2)}</dd>
            </div>
          ))
        )}

        {fulfillment === "shipped" && (
          <div className="order-summary__line">
            <dt>
              Estimated shipping
              <span className="order-summary__detail">Under 1 lb, domestic</span>
            </dt>
            <dd>${totals.shipping.toFixed(2)}</dd>
          </div>
        )}

        <div className="order-summary__line order-summary__line--total">
          <dt>Total</dt>
          <dd>${totals.total.toFixed(2)}</dd>
        </div>
      </dl>
    </section>
  );
}

export function getOrderTotals(items: CartItem[], fulfillment: FulfillmentMethod) {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const shipping =
    fulfillment === "shipped" && items.length > 0 ? SITE.estimatedShipping : 0;

  return {
    subtotal,
    shipping,
    total: subtotal + shipping,
  };
}
