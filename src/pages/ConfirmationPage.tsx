import { Link, Navigate, useLocation } from "react-router-dom";
import { Layout } from "../components/Layout";
import { SITE } from "../constants/config";
import { loadLastOrder } from "../constants/orderStorage";
import type { OrderPayload } from "../types/order";
import { formatCartItemDetail } from "../types/order";
import "./ConfirmationPage.css";

type LocationState = {
  order?: OrderPayload;
};

export function ConfirmationPage() {
  const location = useLocation();
  const order =
    (location.state as LocationState | null)?.order ?? loadLastOrder();

  if (!order) {
    return <Navigate to="/order" replace />;
  }

  return (
    <Layout embedded compact>
      <div className="confirmation">
        <div className="confirmation__icon" aria-hidden="true">
          ♥
        </div>
        <h1 className="confirmation__title">Thank you, {order.firstName}!</h1>
        <p className="confirmation__message">
          Your order has been received. I&apos;ll be in touch soon to confirm payment
          and next steps.
        </p>

        <div className="confirmation__card">
          <h2 className="confirmation__card-title">Order details</h2>
          <dl className="confirmation__details">
            <div>
              <dt>Name</dt>
              <dd>
                {order.firstName} {order.lastName}
              </dd>
            </div>
            <div>
              <dt>Fulfillment</dt>
              <dd>{order.fulfillment === "pickup" ? "Pickup" : "Shipped"}</dd>
            </div>
            {order.fulfillment === "shipped" && order.address && (
              <div>
                <dt>Ship to</dt>
                <dd>
                  {order.address.street}
                  {order.address.street2 && `, ${order.address.street2}`}
                  <br />
                  {order.address.city}, {order.address.state} {order.address.zip}
                </dd>
              </div>
            )}
            <div>
              <dt>Items ({order.items.length})</dt>
              <dd>
                <ul className="confirmation__items">
                  {order.items.map((item) => (
                    <li key={item.id}>
                      {item.productName} · {formatCartItemDetail(item)}
                      <span className="confirmation__item-price">
                        ${item.price.toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
            {order.specialRequests && (
              <div>
                <dt>Special requests</dt>
                <dd>{order.specialRequests}</dd>
              </div>
            )}
            <div className="confirmation__total">
              <dt>Total</dt>
              <dd>${order.total.toFixed(2)}</dd>
            </div>
          </dl>
        </div>

        <p className="confirmation__payment">{SITE.paymentNote}</p>

        <Link to="/shop/necklaces" className="confirmation__link">
          Keep shopping
        </Link>
      </div>
    </Layout>
  );
}
