import { createContext } from "react";
import type {
  CatalogProduct,
  CustomizationCatalog,
  ShopCategory,
} from "../types/catalog";

export type CatalogContextValue = {
  ready: boolean;
  online: boolean;
  error: string | null;
  categories: ShopCategory[];
  products: CatalogProduct[];
  customization: CustomizationCatalog;
  productsForCategory: (categoryId: string) => CatalogProduct[];
  refresh: () => Promise<void>;
};

export const CatalogContext = createContext<CatalogContextValue | null>(null);
