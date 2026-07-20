import { Field } from "@base-ui/react";
type TextFieldProps = {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  pattern?: string;
  description?: string;
  error?: string;
  autofocus?: boolean;
  value?: string;
  stopPropagation?: boolean;
  onChange?: (value: string) => void;
  onKeyDown?: (
    event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => void;
  type?: "textarea" | "text" | "email" | "tel" | "number";
  className?: string;
};

export const TextField = ({
  name,
  label,
  placeholder,
  required,
  minLength,
  pattern,
  description,
  error,
  autofocus,
  value,
  onChange,
  stopPropagation,
  onKeyDown,
  type = "text",
  className = "",
}: TextFieldProps) => {
  return (
    <Field.Root
      name={name}
      className={`flex w-full flex-col items-start gap-1 ${className}`}
    >
      {label && (
        <Field.Label className="text-xs uppercase font-bold font-mono">
          {label}
        </Field.Label>
      )}
      <Field.Control
        render={type === "textarea" ? <textarea /> : undefined}
        type={type === "textarea" ? undefined : type}
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        pattern={pattern}
        autoFocus={autofocus}
        onKeyDown={(e) => {
          if (stopPropagation) {
            e.stopPropagation();
          }

          onKeyDown?.(e);
        }}
        className="border border-dark-green w-full p-1 text-base font-mono focus:outline focus:-outline-offset-2 focus:outline-foreground [&::-webkit-inner-spin-button]:appearance-none"
      />
      {description && <Field.Description>{description}</Field.Description>}
      {error && (
        <Field.Error className="text-sm text-red-800" match="valueMissing">
          {error}
        </Field.Error>
      )}
    </Field.Root>
  );
};
