import type {
  CustomizationCatalog,
  CustomizationOption,
  ImagePickerOption,
} from "../types/catalog";

export function optionsForGroup(catalog: CustomizationCatalog, groupId: string): CustomizationOption[] {
  return catalog.options
    .filter((option) => option.groupId === groupId)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

export function groupsByKind(catalog: CustomizationCatalog, kind: CustomizationCatalog["groups"][number]["kind"]) {
  return catalog.groups
    .filter((group) => group.kind === kind)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

export function toImageGridOptions(options: CustomizationOption[]): ImagePickerOption[] {
  return options.map((option) => ({
    id: option.id,
    name: option.name,
    image: option.imageUrl,
  }));
}

export function optionNamesByIds(catalog: CustomizationCatalog, ids: string[]) {
  const lookup = new Map(catalog.options.map((option) => [option.id, option.name]));
  return ids.map((id) => lookup.get(id) ?? id);
}

export function groupLabel(catalog: CustomizationCatalog, groupId: string) {
  return catalog.groups.find((group) => group.id === groupId)?.name ?? groupId;
}
