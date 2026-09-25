import type { OrderPayload } from "../types/order";

export const LAST_ORDER_STORAGE_KEY = "figAndPeach.lastOrder";

export function saveLastOrder(order: OrderPayload) {
  try {
    sessionStorage.setItem(LAST_ORDER_STORAGE_KEY, JSON.stringify(order));
  } catch {
    /* ignore quota / private mode */
  }
}

export function loadLastOrder(): OrderPayload | null {
  try {
    const raw = sessionStorage.getItem(LAST_ORDER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OrderPayload;
  } catch {
    return null;
  }
}

export function shouldSkipOrderEmail(): boolean {
  return import.meta.env.VITE_SKIP_ORDER_EMAIL === "true";
}
