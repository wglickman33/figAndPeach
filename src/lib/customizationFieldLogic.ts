import type { CustomizationCatalog } from "../types/catalog";
import type {
  BeadSizeColorsFieldValue,
  CustomizationFieldConfig,
  CustomizationFieldDefinition,
  CustomizationFieldValues,
} from "../types/customizationFields";
import {
  groupLabel,
  groupsByKind,
  optionNamesByIds,
} from "./customizationCatalog";

const CLASP_TYPE_GROUP = "clasps";
const CLASP_COLOR_GROUP = "clasp-colors";

export function fieldIsRequired(config: CustomizationFieldConfig): boolean {
  return config.required !== false;
}

export function resolveGroupId(
  field: CustomizationFieldDefinition,
): string | undefined {
  const { fieldType, config } = field;
  if (fieldType === "clasp_type") return CLASP_TYPE_GROUP;
  if (fieldType === "clasp_color") return CLASP_COLOR_GROUP;
  return config.groupId;
}

export function validateFieldValues(
  fields: CustomizationFieldDefinition[],
  values: CustomizationFieldValues,
): string | null {
  for (const field of fields) {
    if (!fieldIsRequired(field.config)) continue;
    const value = values[field.fieldKey];

    switch (field.fieldType) {
      case "length_pills":
        if (typeof value !== "number") {
          return `Please choose ${field.label.toLowerCase()}.`;
        }
        break;
      case "clasp_type":
      case "clasp_color":
      case "group_single": {
        const ids = value as string[] | undefined;
        if (!ids || ids.length !== 1) {
          return `Please choose ${field.label.toLowerCase()}.`;
        }
        break;
      }
      case "group_multi": {
        const ids = value as string[] | undefined;
        if (!ids || ids.length === 0) {
          return `Please choose at least one ${field.label.toLowerCase()}.`;
        }
        break;
      }
      case "bead_size_then_colors": {
        const bead = value as BeadSizeColorsFieldValue | undefined;
        if (!bead?.beadGroupId || bead.colorIds.length === 0) {
          return `Please complete ${field.label.toLowerCase()}.`;
        }
        break;
      }
      default:
        break;
    }
  }
  return null;
}

export function buildCustomizationDetailFromFields(
  fields: CustomizationFieldDefinition[],
  values: CustomizationFieldValues,
  customization: CustomizationCatalog,
): string {
  const parts: string[] = [];

  for (const field of fields) {
    const value = values[field.fieldKey];
    if (value === undefined) continue;

    switch (field.fieldType) {
      case "length_pills":
        parts.push(`${value}"`);
        break;
      case "clasp_type": {
        const ids = value as string[];
        if (ids[0]) {
          parts.push(
            customization.options.find((o) => o.id === ids[0])?.name ?? ids[0],
          );
        }
        break;
      }
      case "clasp_color": {
        const ids = value as string[];
        if (ids[0]) {
          parts.push(
            `${customization.options.find((o) => o.id === ids[0])?.name ?? ids[0]} clasp`,
          );
        }
        break;
      }
      case "group_single": {
        const ids = value as string[];
        if (ids[0]) {
          parts.push(
            customization.options.find((o) => o.id === ids[0])?.name ?? ids[0],
          );
        }
        break;
      }
      case "group_multi": {
        const ids = value as string[];
        const names = optionNamesByIds(customization, ids);
        if (names.length > 0) {
          parts.push(`${field.label}: ${names.join(", ")}`);
        }
        break;
      }
      case "bead_size_then_colors": {
        const bead = value as BeadSizeColorsFieldValue;
        parts.push(groupLabel(customization, bead.beadGroupId));
        const colorNames = optionNamesByIds(customization, bead.colorIds);
        if (colorNames.length > 0) parts.push(colorNames.join(", "));
        break;
      }
      default:
        break;
    }
  }

  return parts.join(" · ");
}

export function beadInventoryGroupIds(
  customization: CustomizationCatalog,
  config: CustomizationFieldConfig,
): string[] {
  if (config.groupIds && config.groupIds.length > 0) return config.groupIds;
  return groupsByKind(customization, "bead_inventory").map((g) => g.id);
}

export function defaultLengths(config: CustomizationFieldConfig): number[] {
  return config.lengths?.length ? config.lengths : [14, 16, 18, 20];
}

export function mapFieldRow(row: {
  id: string;
  field_key: string;
  field_type: CustomizationFieldDefinition["fieldType"];
  label: string;
  config: CustomizationFieldConfig | string;
  sort_order: number;
}): CustomizationFieldDefinition {
  const config =
    typeof row.config === "string"
      ? (JSON.parse(row.config) as CustomizationFieldConfig)
      : row.config ?? {};
  return {
    id: row.id,
    fieldKey: row.field_key,
    fieldType: row.field_type,
    label: row.label,
    config,
    sortOrder: row.sort_order,
  };
}
