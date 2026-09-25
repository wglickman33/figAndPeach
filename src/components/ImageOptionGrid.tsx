import type { ImagePickerOption } from "../types/catalog";
import "./ImageOptionGrid.css";

type ImageOptionGridProps = {
  label: string;
  hint?: string;
  options: ImagePickerOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  multiple?: boolean;
  disabled?: boolean;
};

export function ImageOptionGrid({
  label,
  hint,
  options,
  selected,
  onChange,
  multiple = false,
  disabled = false,
}: ImageOptionGridProps) {
  function handleSelect(id: string) {
    if (disabled) return;
    if (multiple) {
      if (selected.includes(id)) {
        onChange(selected.filter((value) => value !== id));
        return;
      }
      onChange([...selected, id]);
      return;
    }

    onChange([id]);
  }

  return (
    <fieldset className={`image-option-grid${disabled ? " image-option-grid--disabled" : ""}`} disabled={disabled}>
      <legend className="section-label">{label}</legend>
      {hint && <p className="section-hint">{hint}</p>}
      <div
        className="image-option-grid__options"
        role={multiple ? "group" : "radiogroup"}
        aria-label={label}
        aria-disabled={disabled}
      >
        {options.length === 0 ? (
          <p className="image-option-grid__empty">No colors available for this bead size yet.</p>
        ) : (
          options.map((option) => {
            const isSelected = selected.includes(option.id);

            return (
              <button
                key={option.id}
                type="button"
                role={multiple ? "checkbox" : "radio"}
                aria-checked={isSelected}
                className={`image-option-card${isSelected ? " image-option-card--selected" : ""}`}
                onClick={() => handleSelect(option.id)}
                disabled={disabled}
              >
                <img
                  src={option.image}
                  alt={option.name}
                  className="image-option-card__image"
                />
                <span className="image-option-card__name">{option.name}</span>
              </button>
            );
          })
        )}
      </div>
    </fieldset>
  );
}
