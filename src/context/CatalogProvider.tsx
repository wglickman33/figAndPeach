import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { CATEGORIES as FALLBACK_CATEGORIES } from "../data/categories";
import {
  fetchCategories,
  fetchCustomizationCatalog,
  fetchHealth,
  fetchProducts,
} from "../lib/api";
import type { CatalogProduct, CustomizationCatalog, ShopCategory } from "../types/catalog";
import { CatalogContext } from "./catalogState";

const emptyCustomization: CustomizationCatalog = { groups: [], options: [] };

function fallbackCategories(): ShopCategory[] {
  return FALLBACK_CATEGORIES.map((category, index) => ({
    id: category.id,
    name: category.name,
    sortOrder: index + 1,
    customizationTemplate: category.customizationTemplate,
  }));
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [online, setOnline] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<ShopCategory[]>(fallbackCategories());
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [customization, setCustomization] = useState<CustomizationCatalog>(emptyCustomization);

  const refresh = useCallback(async () => {
    try {
      await fetchHealth();
      const [nextCategories, nextProducts, nextCustomization] = await Promise.all([
        fetchCategories(),
        fetchProducts(),
        fetchCustomizationCatalog(),
      ]);
      setCategories(nextCategories);
      setProducts(nextProducts);
      setCustomization(nextCustomization);
      setOnline(true);
      setError(null);
    } catch (err) {
      setOnline(false);
      setCategories(fallbackCategories());
      setProducts([]);
      setCustomization(emptyCustomization);
      setError(err instanceof Error ? err.message : "Catalog unavailable.");
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const productsForCategory = useCallback(
    (categoryId: string) => products.filter((product) => product.categoryId === categoryId),
    [products],
  );

  const value = useMemo(
    () => ({
      ready,
      online,
      error,
      categories,
      products,
      customization,
      productsForCategory,
      refresh,
    }),
    [ready, online, error, categories, products, customization, productsForCategory, refresh],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}
