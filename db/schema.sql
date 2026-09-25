-- Run once in Neon (or Postgres) SQL editor.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS shop_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INT NOT NULL,
  customization_template TEXT NOT NULL DEFAULT 'simple'
    CHECK (customization_template IN ('detailed', 'simple'))
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id TEXT NOT NULL REFERENCES shop_categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  image_url TEXT NOT NULL,
  cloudinary_public_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  purchase_mode TEXT NOT NULL DEFAULT 'customizable'
    CHECK (purchase_mode IN ('premade', 'customizable')),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS category_customization_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id TEXT NOT NULL REFERENCES shop_categories(id) ON DELETE CASCADE,
  field_key TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN (
    'length_pills',
    'group_single',
    'group_multi',
    'bead_size_then_colors',
    'clasp_type',
    'clasp_color'
  )),
  label TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_order INT NOT NULL DEFAULT 0,
  UNIQUE (category_id, field_key)
);

CREATE TABLE IF NOT EXISTS product_customization_settings (
  product_id UUID PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  use_category_defaults BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS product_customization_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  field_key TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN (
    'length_pills',
    'group_single',
    'group_multi',
    'bead_size_then_colors',
    'clasp_type',
    'clasp_color'
  )),
  label TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_order INT NOT NULL DEFAULT 0,
  UNIQUE (product_id, field_key)
);

CREATE TABLE IF NOT EXISTS customization_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  kind TEXT NOT NULL
    CHECK (kind IN ('bead_inventory', 'clasps', 'clasp_colors', 'pony_beads', 'socks', 'specialty_shaped_beads')),
  sort_order INT NOT NULL
);

CREATE TABLE IF NOT EXISTS customization_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id TEXT NOT NULL REFERENCES customization_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  cloudinary_public_id TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_users (
  email TEXT PRIMARY KEY,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS products_category_idx ON products (category_id, sort_order);
CREATE INDEX IF NOT EXISTS category_customization_fields_category_idx
  ON category_customization_fields (category_id, sort_order);
CREATE INDEX IF NOT EXISTS product_customization_fields_product_idx
  ON product_customization_fields (product_id, sort_order);
CREATE INDEX IF NOT EXISTS customization_options_group_idx ON customization_options (group_id, sort_order);
