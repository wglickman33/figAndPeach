export type FulfillmentMethod = "pickup" | "shipped";

export type ShippingAddress = {
  street: string;
  street2: string;
  city: string;
  state: string;
  zip: string;
};

export type CartItem = {
  id: string;
  categoryId: string;
  categoryName: string;
  productId: string;
  productName: string;
  price: number;
  /** Human-readable customization for cart, summary, and email */
  customizationDetail: string;
};

export type OrderPayload = {
  firstName: string;
  lastName: string;
  fulfillment: FulfillmentMethod;
  address: ShippingAddress | null;
  items: CartItem[];
  specialRequests: string;
  subtotal: number;
  shipping: number;
  total: number;
};

export function formatCartItemDetail(item: CartItem): string {
  const parts = [item.categoryName, item.customizationDetail].filter(Boolean);
  return parts.join(" · ");
}
