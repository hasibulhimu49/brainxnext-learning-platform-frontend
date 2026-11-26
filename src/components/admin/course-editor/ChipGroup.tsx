interface ChipGroupProps<V extends string> {
  label: string;
  options: readonly V[];
  value: V;
  onChange: (v: V) => void;
}

/** Single-choice chip row (radiogroup) used for track, level and language. */
function ChipGroup<V extends string>({ label, options, value, onChange }: ChipGroupProps<V>) {
  return (
    <div className="flex flex-col gap-1.75">
      <span className="field-label">{label}</span>
      <span className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={value === o}
            data-active={value === o}
            onClick={() => onChange(o)}
            className="filter-chip bg-surface2! px-3.5 py-2 text-xs data-[active=true]:bg-[linear-gradient(135deg,#1B6FD0,#0E97B0)]!"
          >
            {o}
          </button>
        ))}
      </span>
    </div>
  );
}

export default ChipGroup;
