import type {
  CatalogProduct,
  CustomizationCatalog,
  CustomizationGroup,
  CustomizationOption,
  ShopCategory,
} from "../types/catalog";
import type {
  CustomizationFieldDefinition,
  CustomizationFieldType,
} from "../types/customizationFields";
import { mapFieldRow } from "./customizationFieldLogic";

const API_BASE = "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? `Request failed (${response.status})`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

type CategoryRow = {
  id: string;
  name: string;
  sort_order: number;
  customization_template: ShopCategory["customizationTemplate"];
};

type ProductRow = {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: string | number;
  image_url: string;
  sort_order: number;
  purchase_mode?: "premade" | "customizable";
  is_active?: boolean;
};

type GroupRow = {
  id: string;
  name: string;
  kind: CustomizationGroup["kind"];
  sort_order: number;
};

type OptionRow = {
  id: string;
  group_id: string;
  name: string;
  image_url: string;
  sort_order: number;
};

function mapCategory(row: CategoryRow): ShopCategory {
  return {
    id: row.id,
    name: row.name,
    sortOrder: row.sort_order,
    customizationTemplate: row.customization_template,
  };
}

function mapProduct(row: ProductRow): CatalogProduct {
  return {
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    imageUrl: row.image_url,
    sortOrder: row.sort_order,
    purchaseMode: row.purchase_mode ?? "customizable",
    isActive: row.is_active,
  };
}

function mapGroup(row: GroupRow): CustomizationGroup {
  return {
    id: row.id,
    name: row.name,
    kind: row.kind,
    sortOrder: row.sort_order,
  };
}

function mapOption(row: OptionRow): CustomizationOption {
  return {
    id: row.id,
    groupId: row.group_id,
    name: row.name,
    imageUrl: row.image_url,
    sortOrder: row.sort_order,
  };
}

export async function fetchHealth() {
  return request<{ ok: boolean }>("/health");
}

export async function fetchCategories() {
  const data = await request<{ categories: CategoryRow[] }>("/categories");
  return data.categories.map(mapCategory);
}

export async function fetchProducts(categoryId?: string) {
  const query = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : "";
  const data = await request<{ products: ProductRow[] }>(`/products${query}`);
  return data.products.map(mapProduct);
}

export async function fetchAdminProducts() {
  const data = await request<{ products: ProductRow[] }>("/admin/products");
  return data.products.map(mapProduct);
}

type CustomizationFieldRow = {
  id: string;
  field_key: string;
  field_type: CustomizationFieldType;
  label: string;
  config: CustomizationFieldDefinition["config"] | string;
  sort_order: number;
};

export async function fetchCustomizationFields(categoryId: string, productId?: string) {
  const params = new URLSearchParams({ categoryId });
  if (productId) params.set("productId", productId);
  const data = await request<{
    fields: CustomizationFieldRow[];
    useCategoryDefaults: boolean;
  }>(`/customization-fields?${params.toString()}`);
  return {
    ...data,
    fields: data.fields.map(mapFieldRow),
  };
}

export async function fetchCustomizationCatalog(): Promise<CustomizationCatalog> {
  const data = await request<{ groups: GroupRow[]; options: OptionRow[] }>("/customization");
  return {
    groups: data.groups.map(mapGroup),
    options: data.options.map(mapOption),
  };
}

export type AdminSession = { email: string; role: "admin" };

export async function loginAdmin(email: string, password: string) {
  return request<AdminSession>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logoutAdmin() {
  return request<void>("/auth/logout", { method: "POST" });
}

export async function fetchAdminSession() {
  return request<AdminSession>("/auth/me");
}

export type CloudinarySignResponse = {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
};

export async function fetchCloudinarySignature(folder: string) {
  return request<CloudinarySignResponse>(
    `/admin/cloudinary-sign?folder=${encodeURIComponent(folder)}`,
  );
}

export async function uploadImageToCloudinary(file: File, folder: string) {
  const sign = await fetchCloudinarySignature(folder);
  const body = new FormData();
  body.append("file", file);
  body.append("api_key", sign.apiKey);
  body.append("timestamp", String(sign.timestamp));
  body.append("signature", sign.signature);
  body.append("folder", sign.folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`, {
    method: "POST",
    body,
  });

  if (!response.ok) {
    throw new Error("Cloudinary upload failed.");
  }

  const data = (await response.json()) as { secure_url: string; public_id: string };
  return { imageUrl: data.secure_url, publicId: data.public_id };
}

export async function createProduct(input: {
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl: string;
  cloudinaryPublicId?: string;
  purchaseMode?: CatalogProduct["purchaseMode"];
}) {
  const data = await request<{ product: ProductRow }>("/admin/products", {
    method: "POST",
    body: JSON.stringify({
      categoryId: input.categoryId,
      name: input.name,
      description: input.description ?? "",
      price: input.price,
      imageUrl: input.imageUrl,
      cloudinaryPublicId: input.cloudinaryPublicId,
      purchaseMode: input.purchaseMode ?? "customizable",
    }),
  });
  return mapProduct(data.product);
}

export async function updateProduct(
  productId: string,
  input: Partial<{
    categoryId: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    cloudinaryPublicId: string;
    sortOrder: number;
    isActive: boolean;
    purchaseMode: CatalogProduct["purchaseMode"];
  }>,
) {
  const data = await request<{ product: ProductRow }>(`/admin/products/${productId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return mapProduct(data.product);
}

export async function deleteProduct(productId: string) {
  return request<void>(`/admin/products/${productId}`, { method: "DELETE" });
}

export async function createCategory(input: {
  id: string;
  name: string;
  sortOrder: number;
  customizationTemplate: ShopCategory["customizationTemplate"];
}) {
  const data = await request<{ category: CategoryRow }>("/admin/categories", {
    method: "POST",
    body: JSON.stringify({
      id: input.id,
      name: input.name,
      sortOrder: input.sortOrder,
      customizationTemplate: input.customizationTemplate,
    }),
  });
  return mapCategory(data.category);
}

export async function updateCategory(
  categoryId: string,
  input: Partial<{
    name: string;
    sortOrder: number;
    customizationTemplate: ShopCategory["customizationTemplate"];
  }>,
) {
  const data = await request<{ category: CategoryRow }>(`/admin/categories/${categoryId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return mapCategory(data.category);
}

export async function deleteCategory(categoryId: string) {
  return request<void>(`/admin/categories/${categoryId}`, { method: "DELETE" });
}

export async function createCustomizationGroup(input: {
  id: string;
  name: string;
  kind: CustomizationGroup["kind"];
  sortOrder: number;
}) {
  const data = await request<{ group: GroupRow }>("/admin/customization-groups", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return mapGroup(data.group);
}

export async function updateCustomizationGroup(
  groupId: string,
  input: Partial<{
    name: string;
    kind: CustomizationGroup["kind"];
    sortOrder: number;
  }>,
) {
  const data = await request<{ group: GroupRow }>(`/admin/customization-groups/${groupId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return mapGroup(data.group);
}

export async function deleteCustomizationGroup(groupId: string) {
  return request<void>(`/admin/customization-groups/${groupId}`, { method: "DELETE" });
}

export async function createCustomizationOption(input: {
  groupId: string;
  name: string;
  imageUrl: string;
  cloudinaryPublicId?: string;
}) {
  const data = await request<{ option: OptionRow }>("/admin/customization-options", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return mapOption(data.option);
}

export async function updateCustomizationOption(
  optionId: string,
  input: Partial<{
    groupId: string;
    name: string;
    imageUrl: string;
    cloudinaryPublicId: string;
    sortOrder: number;
    isActive: boolean;
  }>,
) {
  const data = await request<{ option: OptionRow }>(`/admin/customization-options/${optionId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return mapOption(data.option);
}

export async function deleteCustomizationOption(optionId: string) {
  return request<void>(`/admin/customization-options/${optionId}`, { method: "DELETE" });
}

export async function fetchAdminCustomizationOptions(groupId?: string) {
  const query = groupId ? `?groupId=${encodeURIComponent(groupId)}` : "";
  const data = await request<{ options: (OptionRow & { is_active: boolean })[] }>(
    `/admin/customization-options${query}`,
  );
  return data.options.map(mapOption);
}

export async function fetchAdminCategoryCustomizationFields(categoryId: string) {
  const data = await request<{ fields: CustomizationFieldRow[] }>(
    `/admin/categories/${encodeURIComponent(categoryId)}/customization-fields`,
  );
  return data.fields.map(mapFieldRow);
}

export async function createCategoryCustomizationField(
  categoryId: string,
  input: Omit<CustomizationFieldDefinition, "id">,
) {
  const data = await request<{ field: CustomizationFieldRow }>(
    `/admin/categories/${encodeURIComponent(categoryId)}/customization-fields`,
    {
      method: "POST",
      body: JSON.stringify({
        fieldKey: input.fieldKey,
        fieldType: input.fieldType,
        label: input.label,
        config: input.config,
        sortOrder: input.sortOrder,
      }),
    },
  );
  return mapFieldRow(data.field);
}

export async function updateCategoryCustomizationField(
  fieldId: string,
  input: Partial<Omit<CustomizationFieldDefinition, "id">>,
) {
  const data = await request<{ field: CustomizationFieldRow }>(
    `/admin/category-customization-fields/${fieldId}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        fieldKey: input.fieldKey,
        fieldType: input.fieldType,
        label: input.label,
        config: input.config,
        sortOrder: input.sortOrder,
      }),
    },
  );
  return mapFieldRow(data.field);
}

export async function deleteCategoryCustomizationField(fieldId: string) {
  return request<void>(`/admin/category-customization-fields/${fieldId}`, {
    method: "DELETE",
  });
}

export async function fetchAdminProductCustomizationFields(productId: string) {
  const data = await request<{ fields: CustomizationFieldRow[]; useCategoryDefaults: boolean }>(
    `/admin/products/${encodeURIComponent(productId)}/customization-fields`,
  );
  return {
    fields: data.fields.map(mapFieldRow),
    useCategoryDefaults: data.useCategoryDefaults,
  };
}

export async function setProductUseCategoryDefaults(
  productId: string,
  useCategoryDefaults: boolean,
) {
  return request<{ useCategoryDefaults: boolean }>(
    `/admin/products/${encodeURIComponent(productId)}/customization-settings`,
    {
      method: "PATCH",
      body: JSON.stringify({ useCategoryDefaults }),
    },
  );
}

export async function createProductCustomizationField(
  productId: string,
  input: Omit<CustomizationFieldDefinition, "id">,
) {
  const data = await request<{ field: CustomizationFieldRow & { product_id?: string } }>(
    `/admin/products/${encodeURIComponent(productId)}/customization-fields`,
    {
      method: "POST",
      body: JSON.stringify({
        fieldKey: input.fieldKey,
        fieldType: input.fieldType,
        label: input.label,
        config: input.config,
        sortOrder: input.sortOrder,
      }),
    },
  );
  return mapFieldRow(data.field);
}

export async function updateProductCustomizationField(
  fieldId: string,
  input: Partial<Omit<CustomizationFieldDefinition, "id">>,
) {
  const data = await request<{ field: CustomizationFieldRow }>(
    `/admin/product-customization-fields/${fieldId}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        fieldKey: input.fieldKey,
        fieldType: input.fieldType,
        label: input.label,
        config: input.config,
        sortOrder: input.sortOrder,
      }),
    },
  );
  return mapFieldRow(data.field);
}

export async function deleteProductCustomizationField(fieldId: string) {
  return request<void>(`/admin/product-customization-fields/${fieldId}`, {
    method: "DELETE",
  });
}
