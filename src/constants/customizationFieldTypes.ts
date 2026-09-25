import type { CustomizationFieldType } from "../types/customizationFields";

export const CUSTOMIZATION_FIELD_TYPES: {
  value: CustomizationFieldType;
  label: string;
}[] = [
  { value: "length_pills", label: "Length (pill buttons)" },
  { value: "clasp_type", label: "Clasp type (clasps group)" },
  { value: "clasp_color", label: "Clasp color (clasp colors group)" },
  { value: "bead_size_then_colors", label: "Bead size + colors" },
  { value: "group_single", label: "Single choice from a group" },
  { value: "group_multi", label: "Multiple choice from a group" },
];
