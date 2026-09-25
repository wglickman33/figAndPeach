import "./PillSelector.css";

type PillOption<T extends string | number> = {
  value: T;
  label: string;
};

type PillSelectorProps<T extends string | number> = {
  label: string;
  options: PillOption<T>[];
  selected: T | null;
  onChange: (value: T) => void;
  variant?: "default" | "stacked";
};

export function PillSelector<T extends string | number>({
  label,
  options,
  selected,
  onChange,
  variant = "default",
}: PillSelectorProps<T>) {
  return (
    <fieldset className={`pill-selector${variant === "stacked" ? " pill-selector--stacked" : ""}`}>
      <legend className="section-label">{label}</legend>
      <div className="pill-selector__options" role="radiogroup" aria-label={label}>
        {options.map((option) => {
          const isSelected = selected === option.value;

          return (
            <button
              key={String(option.value)}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`pill-selector__pill${isSelected ? " pill-selector__pill--selected" : ""}`}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
