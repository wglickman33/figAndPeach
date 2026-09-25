export type CustomizationFieldType =
  | "length_pills"
  | "group_single"
  | "group_multi"
  | "bead_size_then_colors"
  | "clasp_type"
  | "clasp_color";

export type CustomizationFieldConfig = {
  groupId?: string;
  groupIds?: string[];
  lengths?: number[];
  maxSelections?: number;
  required?: boolean;
};

export type CustomizationFieldDefinition = {
  id: string;
  fieldKey: string;
  fieldType: CustomizationFieldType;
  label: string;
  config: CustomizationFieldConfig;
  sortOrder: number;
};

/** Values collected on the customize page, keyed by field_key. */
export type LengthFieldValue = number;
export type OptionIdsFieldValue = string[];
export type BeadSizeColorsFieldValue = {
  beadGroupId: string;
  colorIds: string[];
};

export type CustomizationFieldValue =
  | LengthFieldValue
  | OptionIdsFieldValue
  | BeadSizeColorsFieldValue;

export type CustomizationFieldValues = Record<string, CustomizationFieldValue>;

export type PurchaseMode = "premade" | "customizable";
