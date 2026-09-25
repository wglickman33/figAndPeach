export type CategoryId =
  | "bracelet-socks"
  | "charms-and-pendants"
  | "kids-jewelry"
  | "backpack-charms"
  | "necklaces"
  | "bracelets"
  | "scooter-charms"
  | "scrunchies"
  | "baby"
  | "mahjong-keychains";

export type CustomizationTemplate = "detailed" | "simple";

export type Category = {
  id: CategoryId;
  name: string;
  customizationTemplate: CustomizationTemplate;
};

/** Edit order or labels here as your catalog grows. */
export const CATEGORIES: Category[] = [
  { id: "necklaces", name: "Necklaces", customizationTemplate: "detailed" },
  { id: "bracelets", name: "Bracelets", customizationTemplate: "detailed" },
  { id: "charms-and-pendants", name: "Charms and Pendants", customizationTemplate: "simple" },
  { id: "mahjong-keychains", name: "Mahjong Keychains", customizationTemplate: "simple" },
  { id: "bracelet-socks", name: "Bracelet Socks", customizationTemplate: "simple" },
  { id: "scrunchies", name: "Scrunchies", customizationTemplate: "simple" },
  { id: "kids-jewelry", name: "Kids Jewelry", customizationTemplate: "simple" },
  { id: "backpack-charms", name: "Backpack Charms", customizationTemplate: "simple" },
  { id: "scooter-charms", name: "Scooter Charms", customizationTemplate: "simple" },
  { id: "baby", name: "Baby", customizationTemplate: "simple" },
];

export const DEFAULT_CATEGORY_ID: CategoryId = "necklaces";

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((category) => category.id === id);
}

export function getCategoryPath(categoryId: string) {
  return `/shop/${categoryId}`;
}

export function getCustomizePath(categoryId: string, productId: string) {
  return `/shop/${categoryId}/customize/${productId}`;
}
