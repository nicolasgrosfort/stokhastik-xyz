import { Checkbox as BaseCheckbox } from "@base-ui/react";

type CheckboxProps = {
  name?: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  defaultChecked?: boolean;
};

export const Checkbox = ({
  name,
  label,
  checked,
  onChange,
  defaultChecked,
  className = "",
}: CheckboxProps) => {
  return (
    <label
      className={`flex items-center gap-2 cursor-pointer select-none ${className}`}
    >
      <BaseCheckbox.Root
        name={name}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onChange}
        className="size-4 shrink-0 border border-dark-green bg-background flex items-center justify-center data-checked:bg-foreground data-checked:border-foreground focus-visible:outline focus-visible:-outline-offset-2 focus-visible:outline-foreground"
      >
        <BaseCheckbox.Indicator className="flex items-center justify-center text-background data-unchecked:hidden">
          ✓
        </BaseCheckbox.Indicator>
      </BaseCheckbox.Root>
      <span className="text-xs font-mono">{label}</span>
    </label>
  );
};
