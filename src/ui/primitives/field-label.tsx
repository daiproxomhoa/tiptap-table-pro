import { Label } from "./label";
import { cn } from "../../lib/utils";

interface FieldLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
}

export function FieldLabel({
  label,
  error,
  required,
  htmlFor,
  children,
  className,
  ...rest
}: FieldLabelProps) {
  return (
    <div className={cn("space-y-1 flex flex-col", className)} {...rest}>
      {label && (
        <Label className="text-xs" required={required} htmlFor={htmlFor}>
          {label}
        </Label>
      )}
      {children}
      {error && <p className="text-[10px] text-destructive">{error}</p>}
    </div>
  );
}
