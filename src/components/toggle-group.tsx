import { ToggleGroup as BaseToggleGroup, Toggle } from "@base-ui/react";

type ToggleGroupProps<Value extends string> = {
  label?: string;
  value: Value;
  onChange: (value: Value) => void;
  options: { value: Value; label: string }[];
  className?: string;
};

export const ToggleGroup = <Value extends string>({
  label,
  value,
  onChange,
  options,
  className = "",
}: ToggleGroupProps<Value>) => {
  return (
    <div
      className={`flex items-center gap-1 ${className} flex-wrap justify-center`}
    >
      {label && <span className="hidden sm:block">{label}</span>}
      <BaseToggleGroup
        value={[value]}
        onValueChange={(groupValue) => {
          const next = groupValue.at(-1);
          if (next) onChange(next as Value);
        }}
        className="flex flex-wrap border border-foreground divide-x divide-foreground"
      >
        {options.map((option) => (
          <Toggle
            key={option.value}
            value={option.value}
            className="px-2 py-0.5 bg-background text-foreground uppercase font-mono text-[10px] sm:text-xs cursor-pointer data-pressed:bg-foreground data-pressed:text-background"
          >
            {option.label}
          </Toggle>
        ))}
      </BaseToggleGroup>
    </div>
  );
};
