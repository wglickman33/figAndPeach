import type { CustomizationGroupKind } from "../types/catalog";

export const CUSTOMIZATION_GROUP_KINDS: { value: CustomizationGroupKind; label: string }[] = [
  { value: "bead_inventory", label: "Bead inventory (size/type picker)" },
  { value: "clasps", label: "Clasps" },
  { value: "clasp_colors", label: "Clasp colors" },
  { value: "pony_beads", label: "Pony beads" },
  { value: "socks", label: "Socks" },
  { value: "specialty_shaped_beads", label: "Specialty shaped beads" },
];
