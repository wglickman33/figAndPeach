import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Cart } from "../components/Cart";
import { Layout } from "../components/Layout";
import { getOrderTotals, OrderSummary } from "../components/OrderSummary";
import { SITE } from "../constants/config";
import { saveLastOrder, shouldSkipOrderEmail } from "../constants/orderStorage";
import { DEFAULT_CATEGORY_ID } from "../data/categories";
import { useOrder } from "../context/OrderContext";
import type { OrderPayload } from "../types/order";
import "./OrderFormPage.css";

export function OrderFormPage() {
  const navigate = useNavigate();
  const {
    cartItems,
    removeCartItem,
    clearCart,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    fulfillment,
    setFulfillment,
    address,
    updateAddress,
    specialRequests,
    setSpecialRequests,
  } = useOrder();

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (cartItems.length === 0) {
      setError("Please add at least one item to your order.");
      return;
    }

    const totals = getOrderTotals(cartItems, fulfillment);

    const payload: OrderPayload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fulfillment,
      address: fulfillment === "shipped" ? address : null,
      items: cartItems,
      specialRequests: specialRequests.trim(),
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      total: totals.total,
    };

    setSubmitting(true);

    try {
      if (shouldSkipOrderEmail()) {
        console.info("[dev] Order submitted (email bypassed):", payload);
      } else {
        const response = await fetch("/.netlify/functions/submit-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(data?.error ?? "Something went wrong. Please try again.");
        }
      }

      saveLastOrder(payload);
      clearCart();
      navigate("/confirmation", { state: { order: payload } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout embedded>
      <form className="order-form" onSubmit={handleSubmit} noValidate>
        <header className="order-form__header">
          <h1 className="order-form__title">{SITE.formTitle}</h1>
          <p className="order-form__intro">
            Review your cart and submit when you are ready. Add items from any category in the
            menu.
          </p>
        </header>

        {cartItems.length === 0 && (
          <p className="order-form__empty">
            Your cart is empty.{" "}
            <Link to={`/shop/${DEFAULT_CATEGORY_ID}`}>Browse the shop</Link> to customize
            something first.
          </p>
        )}

        <section className="form-section">
          <h2 className="section-label">Your information</h2>
          <div className="field-row field-row--name">
            <label className="field">
              <span className="field__label">First name</span>
              <input
                id="order-first-name"
                name="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                required
              />
            </label>
            <label className="field">
              <span className="field__label">Last name</span>
              <input
                id="order-last-name"
                name="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
                required
              />
            </label>
          </div>
        </section>

        <section className="form-section">
          <h2 className="section-label">Fulfillment</h2>
          <div className="fulfillment-toggle" role="radiogroup" aria-label="Fulfillment method">
            <label className={`fulfillment-option${fulfillment === "pickup" ? " fulfillment-option--active" : ""}`}>
              <input
                id="fulfillment-pickup"
                type="radio"
                name="fulfillment"
                value="pickup"
                checked={fulfillment === "pickup"}
                onChange={() => setFulfillment("pickup")}
              />
              Pickup
            </label>
            <label className={`fulfillment-option${fulfillment === "shipped" ? " fulfillment-option--active" : ""}`}>
              <input
                id="fulfillment-shipped"
                type="radio"
                name="fulfillment"
                value="shipped"
                checked={fulfillment === "shipped"}
                onChange={() => setFulfillment("shipped")}
              />
              Shipped
            </label>
          </div>

          {fulfillment === "pickup" && (
            <p className="form-note">{SITE.pickupNote}</p>
          )}

          {fulfillment === "shipped" && (
            <div className="address-fields">
              <label className="field">
                <span className="field__label">Street address</span>
                <input
                  id="order-street"
                  name="street"
                  type="text"
                  value={address.street}
                  onChange={(e) => updateAddress("street", e.target.value)}
                  autoComplete="address-line1"
                  required
                />
              </label>
              <label className="field">
                <span className="field__label">Apt, suite, etc. (optional)</span>
                <input
                  id="order-street2"
                  name="street2"
                  type="text"
                  value={address.street2}
                  onChange={(e) => updateAddress("street2", e.target.value)}
                  autoComplete="address-line2"
                />
              </label>
              <div className="field-row field-row--thirds">
                <label className="field">
                  <span className="field__label">City</span>
                  <input
                    id="order-city"
                    name="city"
                    type="text"
                    value={address.city}
                    onChange={(e) => updateAddress("city", e.target.value)}
                    autoComplete="address-level2"
                    required
                  />
                </label>
                <label className="field">
                  <span className="field__label">State</span>
                  <input
                    id="order-state"
                    name="state"
                    type="text"
                    value={address.state}
                    onChange={(e) => updateAddress("state", e.target.value)}
                    autoComplete="address-level1"
                    required
                  />
                </label>
                <label className="field">
                  <span className="field__label">ZIP</span>
                  <input
                    id="order-zip"
                    name="zip"
                    type="text"
                    value={address.zip}
                    onChange={(e) => updateAddress("zip", e.target.value)}
                    autoComplete="postal-code"
                    required
                  />
                </label>
              </div>
            </div>
          )}
        </section>

        {cartItems.length > 0 && (
          <section className="form-section">
            <Cart items={cartItems} onRemove={removeCartItem} />
          </section>
        )}

        <section className="form-section">
          <OrderSummary items={cartItems} fulfillment={fulfillment} />
        </section>

        <section className="form-section">
          <label className="field">
            <span className="section-label">Special requests</span>
            <textarea
              id="order-special-requests"
              name="specialRequests"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              rows={4}
              placeholder="Any custom notes, gift messages, or preferences..."
            />
          </label>
        </section>

        <p className="payment-note">{SITE.paymentNote}</p>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="submit-button" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit Order"}
        </button>
      </form>
    </Layout>
  );
}
