import { useMemo } from "react";
import { ImageOptionGrid } from "../ImageOptionGrid";
import { PillSelector } from "../PillSelector";
import {
  beadInventoryGroupIds,
  defaultLengths,
  resolveGroupId,
} from "../../lib/customizationFieldLogic";
import {
  optionsForGroup,
  toImageGridOptions,
} from "../../lib/customizationCatalog";
import type { CustomizationCatalog } from "../../types/catalog";
import type {
  BeadSizeColorsFieldValue,
  CustomizationFieldDefinition,
  CustomizationFieldValues,
} from "../../types/customizationFields";

type CustomizationFieldsFormProps = {
  fields: CustomizationFieldDefinition[];
  customization: CustomizationCatalog;
  values: CustomizationFieldValues;
  onChange: (next: CustomizationFieldValues) => void;
};

export function CustomizationFieldsForm({
  fields,
  customization,
  values,
  onChange,
}: CustomizationFieldsFormProps) {
  if (fields.length === 0) {
    return (
      <p className="customize-page__empty-fields">
        Customization options are not set up for this item yet. Check back soon or add
        fields in admin.
      </p>
    );
  }

  return (
    <>
      {fields.map((field) => (
        <FieldBlock
          key={field.id}
          field={field}
          customization={customization}
          values={values}
          onChange={onChange}
        />
      ))}
    </>
  );
}

type FieldBlockProps = {
  field: CustomizationFieldDefinition;
  customization: CustomizationCatalog;
  values: CustomizationFieldValues;
  onChange: (next: CustomizationFieldValues) => void;
};

function FieldBlock({ field, customization, values, onChange }: FieldBlockProps) {
  switch (field.fieldType) {
    case "length_pills":
      return (
        <LengthPillsField field={field} values={values} onChange={onChange} />
      );
    case "clasp_type":
    case "clasp_color":
    case "group_single":
      return (
        <SingleGroupField
          field={field}
          customization={customization}
          values={values}
          onChange={onChange}
        />
      );
    case "group_multi":
      return (
        <MultiGroupField
          field={field}
          customization={customization}
          values={values}
          onChange={onChange}
        />
      );
    case "bead_size_then_colors":
      return (
        <BeadSizeColorsField
          field={field}
          customization={customization}
          values={values}
          onChange={onChange}
        />
      );
    default:
      return null;
  }
}

function LengthPillsField({
  field,
  values,
  onChange,
}: {
  field: CustomizationFieldDefinition;
  values: CustomizationFieldValues;
  onChange: (next: CustomizationFieldValues) => void;
}) {
  const lengths = defaultLengths(field.config);
  const selected = values[field.fieldKey] as number | null | undefined;
  const options = lengths.map((inches) => ({
    value: inches,
    label: `${inches}"`,
  }));

  return (
    <PillSelector
      label={field.label}
      options={options}
      selected={selected ?? null}
      onChange={(next) => onChange({ ...values, [field.fieldKey]: next })}
    />
  );
}

function SingleGroupField({
  field,
  customization,
  values,
  onChange,
}: FieldBlockProps) {
  const groupId = resolveGroupId(field);
  const options = useMemo(
    () => (groupId ? toImageGridOptions(optionsForGroup(customization, groupId)) : []),
    [customization, groupId],
  );
  const selected = (values[field.fieldKey] as string[] | undefined) ?? [];

  if (!groupId || options.length === 0) {
    return <EmptyOptions label={field.label} />;
  }

  return (
    <ImageOptionGrid
      label={field.label}
      options={options}
      selected={selected}
      onChange={(next) => onChange({ ...values, [field.fieldKey]: next })}
    />
  );
}

function MultiGroupField({
  field,
  customization,
  values,
  onChange,
}: FieldBlockProps) {
  const groupId = resolveGroupId(field);
  const options = useMemo(
    () => (groupId ? toImageGridOptions(optionsForGroup(customization, groupId)) : []),
    [customization, groupId],
  );
  const selected = (values[field.fieldKey] as string[] | undefined) ?? [];

  if (!groupId || options.length === 0) {
    return <EmptyOptions label={field.label} />;
  }

  return (
    <ImageOptionGrid
      label={field.label}
      hint="Select as many as you want"
      options={options}
      selected={selected}
      onChange={(next) => onChange({ ...values, [field.fieldKey]: next })}
      multiple
    />
  );
}

function BeadSizeColorsField({
  field,
  customization,
  values,
  onChange,
}: FieldBlockProps) {
  const groupIds = beadInventoryGroupIds(customization, field.config);
  const beadGroups = customization.groups.filter((g) => groupIds.includes(g.id));
  const beadValue = values[field.fieldKey] as BeadSizeColorsFieldValue | undefined;
  const beadGroupId = beadValue?.beadGroupId ?? null;
  const colorIds = beadValue?.colorIds ?? [];

  const beadSizeOptions = useMemo(
    () => beadGroups.map((group) => ({ value: group.id, label: group.name })),
    [beadGroups],
  );

  const colorOptions = useMemo(
    () =>
      beadGroupId
        ? toImageGridOptions(optionsForGroup(customization, beadGroupId))
        : [],
    [customization, beadGroupId],
  );

  const colorHint = beadGroupId
    ? "Select as many colors as you want"
    : "Choose a bead size first";

  function setBeadGroup(nextGroupId: string) {
    const nextOptions = optionsForGroup(customization, nextGroupId);
    const filtered = colorIds.filter((id) =>
      nextOptions.some((option) => option.id === id),
    );
    onChange({
      ...values,
      [field.fieldKey]: { beadGroupId: nextGroupId, colorIds: filtered },
    });
  }

  function setColors(next: string[]) {
    if (!beadGroupId) return;
    onChange({
      ...values,
      [field.fieldKey]: { beadGroupId, colorIds: next },
    });
  }

  if (beadGroups.length === 0) {
    return <EmptyOptions label={field.label} />;
  }

  return (
    <>
      <PillSelector
        label={`${field.label}: size`}
        options={beadSizeOptions}
        selected={beadGroupId}
        onChange={setBeadGroup}
        variant="stacked"
      />
      <ImageOptionGrid
        label={`${field.label}: color`}
        hint={colorHint}
        options={colorOptions}
        selected={colorIds}
        onChange={setColors}
        multiple
        disabled={!beadGroupId}
      />
    </>
  );
}

function EmptyOptions({ label }: { label: string }) {
  return (
    <p className="customize-page__empty-options">
      {label}: options not set up yet. Add images in admin under Bead options.
    </p>
  );
}
