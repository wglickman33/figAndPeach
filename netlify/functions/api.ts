import type { Handler } from "@netlify/functions";
import { z } from "zod";
import {
  clearSessionCookie,
  requireAdmin,
  sessionCookie,
  signSession,
  verifyPassword,
} from "./lib/auth";
import { createUploadSignature } from "./lib/cloudinary";
import { getSql } from "./lib/db";
import { getApiPath, isSecureRequest, json, noContent, readJsonBody } from "./lib/http";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const productSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  imageUrl: z.string().url(),
  cloudinaryPublicId: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  purchaseMode: z.enum(["premade", "customizable"]).optional(),
});

const optionSchema = z.object({
  groupId: z.string().min(1),
  name: z.string().min(1),
  imageUrl: z.string().url(),
  cloudinaryPublicId: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

const categorySchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  sortOrder: z.number().int(),
  customizationTemplate: z.enum(["detailed", "simple"]),
});

const categoryPatchSchema = categorySchema.omit({ id: true }).partial();

const groupKindSchema = z.enum([
  "bead_inventory",
  "clasps",
  "clasp_colors",
  "pony_beads",
  "socks",
  "specialty_shaped_beads",
]);

const groupSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  kind: groupKindSchema,
  sortOrder: z.number().int(),
});

const groupPatchSchema = groupSchema.omit({ id: true }).partial();

const productPatchSchema = productSchema.partial().extend({
  categoryId: z.string().min(1).optional(),
});

const optionPatchSchema = optionSchema.partial().extend({
  groupId: z.string().min(1).optional(),
});

const fieldTypeSchema = z.enum([
  "length_pills",
  "group_single",
  "group_multi",
  "bead_size_then_colors",
  "clasp_type",
  "clasp_color",
]);

const fieldConfigSchema = z
  .object({
    groupId: z.string().optional(),
    groupIds: z.array(z.string()).optional(),
    lengths: z.array(z.number()).optional(),
    maxSelections: z.number().int().positive().optional(),
    required: z.boolean().optional(),
  })
  .passthrough();

const customizationFieldSchema = z.object({
  fieldKey: z.string().min(1),
  fieldType: fieldTypeSchema,
  label: z.string().min(1),
  config: fieldConfigSchema.optional(),
  sortOrder: z.number().int(),
});

const customizationFieldPatchSchema = customizationFieldSchema.partial();

export const handler: Handler = async (event) => {
  const path = getApiPath(event);
  const method = event.httpMethod.toUpperCase();
  const secure = isSecureRequest(event);

  try {
    if (method === "GET" && path === "/health") {
      return json(200, { ok: true });
    }

    if (method === "GET" && path === "/categories") {
      const sql = getSql();
      const rows = await sql`
        SELECT id, name, sort_order, customization_template
        FROM shop_categories
        ORDER BY sort_order ASC
      `;
      return json(200, { categories: rows });
    }

    if (method === "GET" && path === "/products") {
      const categoryId = event.queryStringParameters?.categoryId;
      const sql = getSql();
      const rows = categoryId
        ? await sql`
            SELECT id, category_id, name, description, price, image_url, purchase_mode, sort_order
            FROM products
            WHERE is_active = TRUE AND category_id = ${categoryId}
            ORDER BY sort_order ASC, name ASC
          `
        : await sql`
            SELECT id, category_id, name, description, price, image_url, purchase_mode, sort_order
            FROM products
            WHERE is_active = TRUE
            ORDER BY category_id ASC, sort_order ASC, name ASC
          `;
      return json(200, { products: rows });
    }

    if (method === "GET" && path === "/customization-fields") {
      const categoryId = event.queryStringParameters?.categoryId;
      const productId = event.queryStringParameters?.productId;
      if (!categoryId) return json(400, { error: "categoryId is required." });

      const sql = getSql();
      let useCategoryDefaults = true;

      if (productId) {
        const settings = await sql`
          SELECT use_category_defaults
          FROM product_customization_settings
          WHERE product_id = ${productId}
          LIMIT 1
        `;
        const settingRow = settings[0] as { use_category_defaults?: boolean } | undefined;
        if (settingRow) {
          useCategoryDefaults = settingRow.use_category_defaults;
        }
      }

      const rows =
        productId && !useCategoryDefaults
          ? await sql`
              SELECT id, field_key, field_type, label, config, sort_order, 'product' AS scope
              FROM product_customization_fields
              WHERE product_id = ${productId}
              ORDER BY sort_order ASC, field_key ASC
            `
          : await sql`
              SELECT id, field_key, field_type, label, config, sort_order, 'category' AS scope
              FROM category_customization_fields
              WHERE category_id = ${categoryId}
              ORDER BY sort_order ASC, field_key ASC
            `;

      return json(200, {
        fields: rows,
        useCategoryDefaults: productId ? useCategoryDefaults : true,
      });
    }

    if (method === "GET" && path === "/customization") {
      const sql = getSql();
      const groups = await sql`
        SELECT id, name, kind, sort_order
        FROM customization_groups
        ORDER BY sort_order ASC
      `;
      const options = await sql`
        SELECT id, group_id, name, image_url, sort_order
        FROM customization_options
        WHERE is_active = TRUE
        ORDER BY group_id ASC, sort_order ASC, name ASC
      `;
      return json(200, { groups, options });
    }

    if (method === "POST" && path === "/auth/login") {
      const body = readJsonBody(event);
      const parsed = loginSchema.safeParse(body);
      if (!parsed.success) return json(400, { error: "Invalid login payload." });

      const session = await verifyPassword(parsed.data.email, parsed.data.password);
      if (!session) return json(401, { error: "Invalid email or password." });

      const token = await signSession(session);
      return json(200, { email: session.email, role: session.role }, {
        "Set-Cookie": sessionCookie(token, secure),
      });
    }

    if (method === "POST" && path === "/auth/logout") {
      return noContent({ "Set-Cookie": clearSessionCookie(secure) });
    }

    if (method === "GET" && path === "/auth/me") {
      const session = await requireAdmin(event);
      if (!session) return json(200, { authenticated: false });
      return json(200, { authenticated: true, email: session.email, role: session.role });
    }

    const admin = await requireAdmin(event);

    if (method === "POST" && path === "/admin/cloudinary-sign") {
      if (!admin) return json(401, { error: "Unauthorized." });
      const folder = event.queryStringParameters?.folder ?? "fig-and-peach";
      return json(200, createUploadSignature(folder));
    }

    if (method === "GET" && path === "/admin/products") {
      if (!admin) return json(401, { error: "Unauthorized." });
      const sql = getSql();
      const rows = await sql`
        SELECT id, category_id, name, description, price, image_url, cloudinary_public_id, is_active, purchase_mode, sort_order
        FROM products
        ORDER BY category_id ASC, sort_order ASC, name ASC
      `;
      return json(200, { products: rows });
    }

    if (method === "POST" && path === "/admin/products") {
      if (!admin) return json(401, { error: "Unauthorized." });
      const parsed = productSchema.safeParse(readJsonBody(event));
      if (!parsed.success) return json(400, { error: "Invalid product payload." });

      const sql = getSql();
      const rows = await sql`
        INSERT INTO products (category_id, name, description, price, image_url, cloudinary_public_id, sort_order, is_active, purchase_mode)
        VALUES (
          ${parsed.data.categoryId},
          ${parsed.data.name},
          ${parsed.data.description ?? ""},
          ${parsed.data.price},
          ${parsed.data.imageUrl},
          ${parsed.data.cloudinaryPublicId ?? null},
          ${parsed.data.sortOrder ?? 0},
          ${parsed.data.isActive ?? true},
          ${parsed.data.purchaseMode ?? "customizable"}
        )
        RETURNING id, category_id, name, description, price, image_url, cloudinary_public_id, is_active, purchase_mode, sort_order
      `;
      return json(201, { product: rows[0] });
    }

    const productMatch = path.match(/^\/admin\/products\/([^/]+)$/);
    if (productMatch && method === "PATCH") {
      if (!admin) return json(401, { error: "Unauthorized." });
      const productId = productMatch[1];
      const parsed = productPatchSchema.safeParse(readJsonBody(event));
      if (!parsed.success) return json(400, { error: "Invalid product payload." });

      const sql = getSql();
      const existing = await sql`
        SELECT id, category_id, name, description, price, image_url, cloudinary_public_id, is_active, purchase_mode, sort_order
        FROM products WHERE id = ${productId} LIMIT 1
      `;
      const row = existing[0] as Record<string, unknown> | undefined;
      if (!row) return json(404, { error: "Product not found." });

      const next = {
        categoryId: parsed.data.categoryId ?? row.category_id,
        name: parsed.data.name ?? row.name,
        description: parsed.data.description ?? row.description,
        price: parsed.data.price ?? row.price,
        imageUrl: parsed.data.imageUrl ?? row.image_url,
        cloudinaryPublicId: parsed.data.cloudinaryPublicId ?? row.cloudinary_public_id,
        sortOrder: parsed.data.sortOrder ?? row.sort_order,
        isActive: parsed.data.isActive ?? row.is_active,
        purchaseMode: parsed.data.purchaseMode ?? row.purchase_mode,
      };

      const updated = await sql`
        UPDATE products SET
          category_id = ${next.categoryId},
          name = ${next.name},
          description = ${next.description},
          price = ${next.price},
          image_url = ${next.imageUrl},
          cloudinary_public_id = ${next.cloudinaryPublicId},
          sort_order = ${next.sortOrder},
          is_active = ${next.isActive},
          purchase_mode = ${next.purchaseMode},
          updated_at = NOW()
        WHERE id = ${productId}
        RETURNING id, category_id, name, description, price, image_url, cloudinary_public_id, is_active, purchase_mode, sort_order
      `;
      return json(200, { product: updated[0] });
    }

    if (productMatch && method === "DELETE") {
      if (!admin) return json(401, { error: "Unauthorized." });
      const productId = productMatch[1];
      const sql = getSql();
      await sql`DELETE FROM products WHERE id = ${productId}`;
      return noContent();
    }

    if (method === "GET" && path === "/admin/categories") {
      if (!admin) return json(401, { error: "Unauthorized." });
      const sql = getSql();
      const rows = await sql`
        SELECT id, name, sort_order, customization_template
        FROM shop_categories
        ORDER BY sort_order ASC
      `;
      return json(200, { categories: rows });
    }

    if (method === "POST" && path === "/admin/categories") {
      if (!admin) return json(401, { error: "Unauthorized." });
      const parsed = categorySchema.safeParse(readJsonBody(event));
      if (!parsed.success) return json(400, { error: "Invalid category payload." });

      const sql = getSql();
      const rows = await sql`
        INSERT INTO shop_categories (id, name, sort_order, customization_template)
        VALUES (
          ${parsed.data.id},
          ${parsed.data.name},
          ${parsed.data.sortOrder},
          ${parsed.data.customizationTemplate}
        )
        RETURNING id, name, sort_order, customization_template
      `;
      return json(201, { category: rows[0] });
    }

    const categoryMatch = path.match(/^\/admin\/categories\/([^/]+)$/);
    if (categoryMatch && method === "PATCH") {
      if (!admin) return json(401, { error: "Unauthorized." });
      const categoryId = categoryMatch[1];
      const parsed = categoryPatchSchema.safeParse(readJsonBody(event));
      if (!parsed.success) return json(400, { error: "Invalid category payload." });

      const sql = getSql();
      const existing = await sql`
        SELECT id, name, sort_order, customization_template
        FROM shop_categories WHERE id = ${categoryId} LIMIT 1
      `;
      const row = existing[0] as Record<string, unknown> | undefined;
      if (!row) return json(404, { error: "Category not found." });

      const updated = await sql`
        UPDATE shop_categories SET
          name = ${parsed.data.name ?? row.name},
          sort_order = ${parsed.data.sortOrder ?? row.sort_order},
          customization_template = ${parsed.data.customizationTemplate ?? row.customization_template}
        WHERE id = ${categoryId}
        RETURNING id, name, sort_order, customization_template
      `;
      return json(200, { category: updated[0] });
    }

    if (categoryMatch && method === "DELETE") {
      if (!admin) return json(401, { error: "Unauthorized." });
      const categoryId = categoryMatch[1];
      const sql = getSql();
      try {
        await sql`DELETE FROM shop_categories WHERE id = ${categoryId}`;
        return noContent();
      } catch {
        return json(409, { error: "Remove products in this category before deleting it." });
      }
    }

    if (method === "GET" && path === "/admin/customization-groups") {
      if (!admin) return json(401, { error: "Unauthorized." });
      const sql = getSql();
      const rows = await sql`
        SELECT id, name, kind, sort_order FROM customization_groups ORDER BY sort_order ASC
      `;
      return json(200, { groups: rows });
    }

    if (method === "POST" && path === "/admin/customization-groups") {
      if (!admin) return json(401, { error: "Unauthorized." });
      const parsed = groupSchema.safeParse(readJsonBody(event));
      if (!parsed.success) return json(400, { error: "Invalid group payload." });

      const sql = getSql();
      const rows = await sql`
        INSERT INTO customization_groups (id, name, kind, sort_order)
        VALUES (${parsed.data.id}, ${parsed.data.name}, ${parsed.data.kind}, ${parsed.data.sortOrder})
        RETURNING id, name, kind, sort_order
      `;
      return json(201, { group: rows[0] });
    }

    const groupMatch = path.match(/^\/admin\/customization-groups\/([^/]+)$/);
    if (groupMatch && method === "PATCH") {
      if (!admin) return json(401, { error: "Unauthorized." });
      const groupId = groupMatch[1];
      const parsed = groupPatchSchema.safeParse(readJsonBody(event));
      if (!parsed.success) return json(400, { error: "Invalid group payload." });

      const sql = getSql();
      const existing = await sql`
        SELECT id, name, kind, sort_order FROM customization_groups WHERE id = ${groupId} LIMIT 1
      `;
      const row = existing[0] as Record<string, unknown> | undefined;
      if (!row) return json(404, { error: "Group not found." });

      const updated = await sql`
        UPDATE customization_groups SET
          name = ${parsed.data.name ?? row.name},
          kind = ${parsed.data.kind ?? row.kind},
          sort_order = ${parsed.data.sortOrder ?? row.sort_order}
        WHERE id = ${groupId}
        RETURNING id, name, kind, sort_order
      `;
      return json(200, { group: updated[0] });
    }

    if (groupMatch && method === "DELETE") {
      if (!admin) return json(401, { error: "Unauthorized." });
      const groupId = groupMatch[1];
      const sql = getSql();
      await sql`DELETE FROM customization_groups WHERE id = ${groupId}`;
      return noContent();
    }

    if (method === "GET" && path === "/admin/customization-options") {
      if (!admin) return json(401, { error: "Unauthorized." });
      const groupId = event.queryStringParameters?.groupId;
      const sql = getSql();
      const rows = groupId
        ? await sql`
            SELECT id, group_id, name, image_url, cloudinary_public_id, sort_order, is_active
            FROM customization_options
            WHERE group_id = ${groupId}
            ORDER BY sort_order ASC, name ASC
          `
        : await sql`
            SELECT id, group_id, name, image_url, cloudinary_public_id, sort_order, is_active
            FROM customization_options
            ORDER BY group_id ASC, sort_order ASC, name ASC
          `;
      return json(200, { options: rows });
    }

    if (method === "POST" && path === "/admin/customization-options") {
      if (!admin) return json(401, { error: "Unauthorized." });
      const parsed = optionSchema.safeParse(readJsonBody(event));
      if (!parsed.success) return json(400, { error: "Invalid option payload." });

      const sql = getSql();
      const rows = await sql`
        INSERT INTO customization_options (group_id, name, image_url, cloudinary_public_id, sort_order, is_active)
        VALUES (
          ${parsed.data.groupId},
          ${parsed.data.name},
          ${parsed.data.imageUrl},
          ${parsed.data.cloudinaryPublicId ?? null},
          ${parsed.data.sortOrder ?? 0},
          ${parsed.data.isActive ?? true}
        )
        RETURNING id, group_id, name, image_url, cloudinary_public_id, sort_order, is_active
      `;
      return json(201, { option: rows[0] });
    }

    const optionMatch = path.match(/^\/admin\/customization-options\/([^/]+)$/);
    if (optionMatch && method === "PATCH") {
      if (!admin) return json(401, { error: "Unauthorized." });
      const optionId = optionMatch[1];
      const parsed = optionPatchSchema.safeParse(readJsonBody(event));
      if (!parsed.success) return json(400, { error: "Invalid option payload." });

      const sql = getSql();
      const existing = await sql`
        SELECT id, group_id, name, image_url, cloudinary_public_id, sort_order, is_active
        FROM customization_options WHERE id = ${optionId} LIMIT 1
      `;
      const row = existing[0] as Record<string, unknown> | undefined;
      if (!row) return json(404, { error: "Option not found." });

      const updated = await sql`
        UPDATE customization_options SET
          group_id = ${parsed.data.groupId ?? row.group_id},
          name = ${parsed.data.name ?? row.name},
          image_url = ${parsed.data.imageUrl ?? row.image_url},
          cloudinary_public_id = ${parsed.data.cloudinaryPublicId ?? row.cloudinary_public_id},
          sort_order = ${parsed.data.sortOrder ?? row.sort_order},
          is_active = ${parsed.data.isActive ?? row.is_active}
        WHERE id = ${optionId}
        RETURNING id, group_id, name, image_url, cloudinary_public_id, sort_order, is_active
      `;
      return json(200, { option: updated[0] });
    }

    if (optionMatch && method === "DELETE") {
      if (!admin) return json(401, { error: "Unauthorized." });
      const optionId = optionMatch[1];
      const sql = getSql();
      await sql`DELETE FROM customization_options WHERE id = ${optionId}`;
      return noContent();
    }

    const categoryFieldsMatch = path.match(/^\/admin\/categories\/([^/]+)\/customization-fields$/);
    if (categoryFieldsMatch && method === "GET") {
      if (!admin) return json(401, { error: "Unauthorized." });
      const categoryId = categoryFieldsMatch[1];
      const sql = getSql();
      const rows = await sql`
        SELECT id, category_id, field_key, field_type, label, config, sort_order
        FROM category_customization_fields
        WHERE category_id = ${categoryId}
        ORDER BY sort_order ASC, field_key ASC
      `;
      return json(200, { fields: rows });
    }

    if (categoryFieldsMatch && method === "POST") {
      if (!admin) return json(401, { error: "Unauthorized." });
      const categoryId = categoryFieldsMatch[1];
      const parsed = customizationFieldSchema.safeParse(readJsonBody(event));
      if (!parsed.success) return json(400, { error: "Invalid field payload." });

      const sql = getSql();
      const rows = await sql`
        INSERT INTO category_customization_fields (category_id, field_key, field_type, label, config, sort_order)
        VALUES (
          ${categoryId},
          ${parsed.data.fieldKey},
          ${parsed.data.fieldType},
          ${parsed.data.label},
          ${JSON.stringify(parsed.data.config ?? {})},
          ${parsed.data.sortOrder}
        )
        RETURNING id, category_id, field_key, field_type, label, config, sort_order
      `;
      return json(201, { field: rows[0] });
    }

    const categoryFieldMatch = path.match(/^\/admin\/category-customization-fields\/([^/]+)$/);
    if (categoryFieldMatch && method === "PATCH") {
      if (!admin) return json(401, { error: "Unauthorized." });
      const fieldId = categoryFieldMatch[1];
      const parsed = customizationFieldPatchSchema.safeParse(readJsonBody(event));
      if (!parsed.success) return json(400, { error: "Invalid field payload." });

      const sql = getSql();
      const existing = await sql`
        SELECT id, category_id, field_key, field_type, label, config, sort_order
        FROM category_customization_fields WHERE id = ${fieldId} LIMIT 1
      `;
      const row = existing[0] as Record<string, unknown> | undefined;
      if (!row) return json(404, { error: "Field not found." });

      const updated = await sql`
        UPDATE category_customization_fields SET
          field_key = ${parsed.data.fieldKey ?? row.field_key},
          field_type = ${parsed.data.fieldType ?? row.field_type},
          label = ${parsed.data.label ?? row.label},
          config = ${JSON.stringify(parsed.data.config ?? row.config ?? {})},
          sort_order = ${parsed.data.sortOrder ?? row.sort_order}
        WHERE id = ${fieldId}
        RETURNING id, category_id, field_key, field_type, label, config, sort_order
      `;
      return json(200, { field: updated[0] });
    }

    if (categoryFieldMatch && method === "DELETE") {
      if (!admin) return json(401, { error: "Unauthorized." });
      const fieldId = categoryFieldMatch[1];
      const sql = getSql();
      await sql`DELETE FROM category_customization_fields WHERE id = ${fieldId}`;
      return noContent();
    }

    const productFieldsMatch = path.match(/^\/admin\/products\/([^/]+)\/customization-fields$/);
    if (productFieldsMatch && method === "GET") {
      if (!admin) return json(401, { error: "Unauthorized." });
      const productId = productFieldsMatch[1];
      const sql = getSql();
      const settings = await sql`
        SELECT use_category_defaults FROM product_customization_settings WHERE product_id = ${productId} LIMIT 1
      `;
      const settingRow = settings[0] as { use_category_defaults?: boolean } | undefined;
      const rows = await sql`
        SELECT id, product_id, field_key, field_type, label, config, sort_order
        FROM product_customization_fields
        WHERE product_id = ${productId}
        ORDER BY sort_order ASC, field_key ASC
      `;
      return json(200, {
        fields: rows,
        useCategoryDefaults: settingRow?.use_category_defaults ?? true,
      });
    }

    if (productFieldsMatch && method === "POST") {
      if (!admin) return json(401, { error: "Unauthorized." });
      const productId = productFieldsMatch[1];
      const parsed = customizationFieldSchema.safeParse(readJsonBody(event));
      if (!parsed.success) return json(400, { error: "Invalid field payload." });

      const sql = getSql();
      await sql`
        INSERT INTO product_customization_settings (product_id, use_category_defaults)
        VALUES (${productId}, FALSE)
        ON CONFLICT (product_id) DO UPDATE SET use_category_defaults = FALSE
      `;
      const rows = await sql`
        INSERT INTO product_customization_fields (product_id, field_key, field_type, label, config, sort_order)
        VALUES (
          ${productId},
          ${parsed.data.fieldKey},
          ${parsed.data.fieldType},
          ${parsed.data.label},
          ${JSON.stringify(parsed.data.config ?? {})},
          ${parsed.data.sortOrder}
        )
        RETURNING id, product_id, field_key, field_type, label, config, sort_order
      `;
      return json(201, { field: rows[0] });
    }

    const productFieldMatch = path.match(/^\/admin\/product-customization-fields\/([^/]+)$/);
    if (productFieldMatch && method === "PATCH") {
      if (!admin) return json(401, { error: "Unauthorized." });
      const fieldId = productFieldMatch[1];
      const parsed = customizationFieldPatchSchema.safeParse(readJsonBody(event));
      if (!parsed.success) return json(400, { error: "Invalid field payload." });

      const sql = getSql();
      const existing = await sql`
        SELECT id, product_id, field_key, field_type, label, config, sort_order
        FROM product_customization_fields WHERE id = ${fieldId} LIMIT 1
      `;
      const row = existing[0] as Record<string, unknown> | undefined;
      if (!row) return json(404, { error: "Field not found." });

      const updated = await sql`
        UPDATE product_customization_fields SET
          field_key = ${parsed.data.fieldKey ?? row.field_key},
          field_type = ${parsed.data.fieldType ?? row.field_type},
          label = ${parsed.data.label ?? row.label},
          config = ${JSON.stringify(parsed.data.config ?? row.config ?? {})},
          sort_order = ${parsed.data.sortOrder ?? row.sort_order}
        WHERE id = ${fieldId}
        RETURNING id, product_id, field_key, field_type, label, config, sort_order
      `;
      return json(200, { field: updated[0] });
    }

    if (productFieldMatch && method === "DELETE") {
      if (!admin) return json(401, { error: "Unauthorized." });
      const fieldId = productFieldMatch[1];
      const sql = getSql();
      await sql`DELETE FROM product_customization_fields WHERE id = ${fieldId}`;
      return noContent();
    }

    const productSettingsMatch = path.match(/^\/admin\/products\/([^/]+)\/customization-settings$/);
    if (productSettingsMatch && method === "PATCH") {
      if (!admin) return json(401, { error: "Unauthorized." });
      const productId = productSettingsMatch[1];
      const body = readJsonBody(event) as { useCategoryDefaults?: boolean };
      if (typeof body.useCategoryDefaults !== "boolean") {
        return json(400, { error: "useCategoryDefaults boolean required." });
      }

      const sql = getSql();
      await sql`
        INSERT INTO product_customization_settings (product_id, use_category_defaults)
        VALUES (${productId}, ${body.useCategoryDefaults})
        ON CONFLICT (product_id) DO UPDATE SET use_category_defaults = ${body.useCategoryDefaults}
      `;
      if (body.useCategoryDefaults) {
        await sql`DELETE FROM product_customization_fields WHERE product_id = ${productId}`;
      }
      return json(200, { useCategoryDefaults: body.useCategoryDefaults });
    }

    return json(404, { error: "Not found." });
  } catch (error) {
    console.error("[api]", error);
    const message = error instanceof Error ? error.message : "Server error.";
    return json(500, { error: message });
  }
};
