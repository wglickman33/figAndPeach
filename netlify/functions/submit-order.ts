import type { Handler } from "@netlify/functions";
import { Resend } from "resend";
import { requireEnv } from "./lib/env";

type CartItem = {
  categoryName: string;
  productName: string;
  price: number;
  customizationDetail: string;
};

type OrderPayload = {
  firstName: string;
  lastName: string;
  fulfillment: "pickup" | "shipped";
  address: {
    street: string;
    street2: string;
    city: string;
    state: string;
    zip: string;
  } | null;
  items: CartItem[];
  specialRequests: string;
  subtotal: number;
  shipping: number;
  total: number;
};

function formatAddress(address: NonNullable<OrderPayload["address"]>) {
  const line2 = address.street2 ? `\n${address.street2}` : "";
  return `${address.street}${line2}\n${address.city}, ${address.state} ${address.zip}`;
}

function formatItemDetail(item: CartItem) {
  return `${item.categoryName} · ${item.customizationDetail}`;
}

function buildItemRows(items: CartItem[]) {
  return items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f0d4d7">
            ${item.productName}<br>
            <span style="font-size:14px;color:#6b5560">${formatItemDetail(item)}</span>
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #f0d4d7;text-align:right">$${item.price.toFixed(2)}</td>
        </tr>
      `,
    )
    .join("");
}

function buildEmailHtml(order: OrderPayload) {
  const addressBlock =
    order.fulfillment === "shipped" && order.address
      ? `<p><strong>Ship to:</strong><br>${formatAddress(order.address).replace(/\n/g, "<br>")}</p>`
      : "<p><strong>Fulfillment:</strong> Pickup</p>";

  const specialBlock = order.specialRequests
    ? `<p><strong>Special requests:</strong><br>${order.specialRequests}</p>`
    : "";

  const shippingLine =
    order.shipping > 0
      ? `<tr><td style="padding:8px 0;border-bottom:1px solid #f0d4d7">Estimated shipping</td><td style="padding:8px 0;border-bottom:1px solid #f0d4d7;text-align:right">$${order.shipping.toFixed(2)}</td></tr>`
      : "";

  return `
    <div style="font-family:Georgia,serif;color:#3d2a35;max-width:560px">
      <h2 style="color:#5c3d52;margin-bottom:4px">New Fig &amp; Peach Order</h2>
      <p style="color:#6b5560;margin-top:0">${order.firstName} ${order.lastName}</p>
      ${addressBlock}
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        ${buildItemRows(order.items)}
        ${shippingLine}
        <tr>
          <td style="padding:12px 0;font-weight:bold;color:#d4896f">Total</td>
          <td style="padding:12px 0;font-weight:bold;color:#d4896f;text-align:right">$${order.total.toFixed(2)}</td>
        </tr>
      </table>
      ${specialBlock}
    </div>
  `;
}

function buildEmailText(order: OrderPayload) {
  const lines = [
    "New Fig & Peach Order",
    "",
    `Name: ${order.firstName} ${order.lastName}`,
    `Fulfillment: ${order.fulfillment === "pickup" ? "Pickup" : "Shipped"}`,
  ];

  if (order.fulfillment === "shipped" && order.address) {
    lines.push("", "Ship to:", formatAddress(order.address));
  }

  lines.push("", "Items:");

  order.items.forEach((item, index) => {
    lines.push(
      `${index + 1}. ${item.productName}`,
      `   ${formatItemDetail(item)}`,
      `   $${item.price.toFixed(2)}`,
    );
  });

  lines.push("", `Subtotal: $${order.subtotal.toFixed(2)}`);

  if (order.shipping > 0) {
    lines.push(`Estimated shipping: $${order.shipping.toFixed(2)}`);
  }

  lines.push(`Total: $${order.total.toFixed(2)}`);

  if (order.specialRequests) {
    lines.push("", "Special requests:", order.specialRequests);
  }

  return lines.join("\n");
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(), body: "" };
  }

  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not configured");
    return json(503, { error: "Email service is not configured yet." });
  }

  let order: OrderPayload;
  try {
    order = JSON.parse(event.body ?? "{}") as OrderPayload;
  } catch {
    return json(400, { error: "Invalid order data." });
  }

  if (
    !order.firstName?.trim() ||
    !order.lastName?.trim() ||
    !Array.isArray(order.items) ||
    order.items.length === 0
  ) {
    return json(400, { error: "Missing required order fields." });
  }

  let orderNotificationEmail: string;
  let orderFromEmail: string;
  try {
    orderNotificationEmail = requireEnv("ORDER_NOTIFICATION_EMAIL");
    orderFromEmail = requireEnv("ORDER_FROM_EMAIL");
  } catch {
    return json(503, { error: "Email service is not configured yet." });
  }

  const resend = new Resend(apiKey);
  const itemLabel = order.items.length === 1 ? "1 item" : `${order.items.length} items`;

  try {
    const { error } = await resend.emails.send({
      from: `Fig & Peach Orders <${orderFromEmail}>`,
      to: [orderNotificationEmail],
      subject: `New order: ${order.firstName} ${order.lastName} · ${itemLabel}`,
      html: buildEmailHtml(order),
      text: buildEmailText(order),
    });

    if (error) {
      console.error("Resend error:", error);
      return json(502, { error: "Failed to send order email." });
    }

    return json(200, { ok: true });
  } catch (err) {
    console.error("Submit order error:", err);
    return json(500, { error: "Failed to submit order." });
  }
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function json(statusCode: number, body: Record<string, unknown>) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
    body: JSON.stringify(body),
  };
}
