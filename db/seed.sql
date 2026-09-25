-- Catalog + customization groups (idempotent upserts).

INSERT INTO shop_categories (id, name, sort_order, customization_template) VALUES
  ('necklaces', 'Necklaces', 1, 'detailed'),
  ('bracelets', 'Bracelets', 2, 'detailed'),
  ('charms-and-pendants', 'Charms and Pendants', 3, 'simple'),
  ('mahjong-keychains', 'Mahjong Keychains', 4, 'simple'),
  ('bracelet-socks', 'Bracelet Socks', 5, 'simple'),
  ('scrunchies', 'Scrunchies', 6, 'simple'),
  ('kids-jewelry', 'Kids Jewelry', 7, 'simple'),
  ('backpack-charms', 'Backpack Charms', 8, 'simple'),
  ('scooter-charms', 'Scooter Charms', 9, 'simple'),
  ('baby', 'Baby', 10, 'simple')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  sort_order = EXCLUDED.sort_order,
  customization_template = EXCLUDED.customization_template;

INSERT INTO customization_groups (id, name, kind, sort_order) VALUES
  ('6mm-x-2mm-rondelle-beads', '6mm x 2mm rondelle beads', 'bead_inventory', 1),
  ('8mm-x-5mm-rondelle-beads', '8mm x 5mm rondelle beads', 'bead_inventory', 2),
  ('8mm-round-beads', '8mm round beads', 'bead_inventory', 3),
  ('6-5mm-x-4mm-rondelle-beads', '6.5mm x 4mm rondelle beads', 'bead_inventory', 4),
  ('3mm-x-2-5mm-faceted-rondelle-beads', '3mm x 2.5mm faceted rondelle beads', 'bead_inventory', 5),
  ('10mm-round-beads', '10mm round beads', 'bead_inventory', 6),
  ('12mm-round-beads', '12mm round beads', 'bead_inventory', 7),
  ('6mm-round-beads', '6mm round beads', 'bead_inventory', 8),
  ('6mm-x-3mm-squaredelle-beads', '6mm x 3mm squaredelle beads', 'bead_inventory', 9),
  ('2mm-x-1mm-squaredelle-beads', '2mm x 1mm squaredelle beads', 'bead_inventory', 10),
  ('clasps', 'Clasps', 'clasps', 11),
  ('clasp-colors', 'Clasp Colors', 'clasp_colors', 12),
  ('pony-beads', 'Pony Beads', 'pony_beads', 13),
  ('socks', 'Socks', 'socks', 14),
  ('specialty-shaped-beads', 'Specialty Shaped Beads', 'specialty_shaped_beads', 15)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  kind = EXCLUDED.kind,
  sort_order = EXCLUDED.sort_order;

-- Category customization fields (customer customize page layout).
INSERT INTO category_customization_fields (category_id, field_key, field_type, label, config, sort_order) VALUES
  ('necklaces', 'length', 'length_pills', 'Length', '{"lengths": [14, 16, 18, 20], "required": true}', 1),
  ('necklaces', 'clasp_type', 'clasp_type', 'Clasp Type', '{"required": true}', 2),
  ('necklaces', 'clasp_color', 'clasp_color', 'Clasp Color', '{"required": true}', 3),
  ('necklaces', 'beads', 'bead_size_then_colors', 'Beads', '{"required": true}', 4),
  ('bracelets', 'length', 'length_pills', 'Length', '{"lengths": [14, 16, 18, 20], "required": true}', 1),
  ('bracelets', 'clasp_type', 'clasp_type', 'Clasp Type', '{"required": true}', 2),
  ('bracelets', 'clasp_color', 'clasp_color', 'Clasp Color', '{"required": true}', 3),
  ('bracelets', 'beads', 'bead_size_then_colors', 'Beads', '{"required": true}', 4),
  ('charms-and-pendants', 'colors', 'group_multi', 'Color', '{"groupId": "pony-beads", "required": true}', 1),
  ('mahjong-keychains', 'colors', 'group_multi', 'Color', '{"groupId": "pony-beads", "required": true}', 1),
  ('bracelet-socks', 'colors', 'group_multi', 'Color', '{"groupId": "pony-beads", "required": true}', 1),
  ('scrunchies', 'colors', 'group_multi', 'Color', '{"groupId": "pony-beads", "required": true}', 1),
  ('kids-jewelry', 'colors', 'group_multi', 'Color', '{"groupId": "pony-beads", "required": true}', 1),
  ('backpack-charms', 'colors', 'group_multi', 'Color', '{"groupId": "pony-beads", "required": true}', 1),
  ('scooter-charms', 'colors', 'group_multi', 'Color', '{"groupId": "pony-beads", "required": true}', 1),
  ('baby', 'colors', 'group_multi', 'Color', '{"groupId": "pony-beads", "required": true}', 1)
ON CONFLICT (category_id, field_key) DO UPDATE SET
  field_type = EXCLUDED.field_type,
  label = EXCLUDED.label,
  config = EXCLUDED.config,
  sort_order = EXCLUDED.sort_order;
