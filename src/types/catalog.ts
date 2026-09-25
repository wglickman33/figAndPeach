export type CustomizationTemplate = "detailed" | "simple";

export type ShopCategory = {
  id: string;
  name: string;
  sortOrder: number;
  customizationTemplate: CustomizationTemplate;
};

export type PurchaseMode = "premade" | "customizable";

export type CatalogProduct = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  sortOrder: number;
  purchaseMode: PurchaseMode;
  isActive?: boolean;
};

export type CustomizationGroupKind =
  | "bead_inventory"
  | "clasps"
  | "clasp_colors"
  | "pony_beads"
  | "socks"
  | "specialty_shaped_beads";

export type CustomizationGroup = {
  id: string;
  name: string;
  kind: CustomizationGroupKind;
  sortOrder: number;
};

export type CustomizationOption = {
  id: string;
  groupId: string;
  name: string;
  imageUrl: string;
  sortOrder: number;
};

/** UI shape for image pickers (shop + customize). */
export type ImagePickerOption = {
  id: string;
  name: string;
  image: string;
};

export type CustomizationCatalog = {
  groups: CustomizationGroup[];
  options: CustomizationOption[];
};
