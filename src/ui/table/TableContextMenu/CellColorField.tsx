import { FieldLabel } from "../../primitives/field-label";
import { Input } from "../../primitives/input";
import { Button } from "../../primitives/button";
import { cn } from "../../../lib/utils";
import { FormattedMessage } from "../../../lib/intl";
import { isValidHex } from "../utils";

const PRESETS = [
  // neutrals
  "#000000",
  "#475569",
  "#94a3b8",
  "#cbd5e1",
  "#e2e8f0",
  "#f1f5f9",
  "#ffffff",
  // màu
  "#dc2626",
  "#f97316",
  "#f59e0b",
  "#16a34a",
  "#0ea5e9",
  "#2563eb",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];

interface CellColorFieldProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}

/** Ô chọn màu (preset + swatch + hex) dùng trong dialog thuộc tính ô. */
export function CellColorField({
  label,
  value,
  onChange,
}: CellColorFieldProps) {
  return (
    <FieldLabel label={label}>
      <div className="space-y-2">
        <div className="grid grid-cols-8 gap-1">
          {PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              title={c}
              onClick={() => onChange(c)}
              className={cn(
                "h-6 w-6 rounded border transition-transform hover:scale-110",
                value.toLowerCase() === c
                  ? "ring-2 ring-ring ring-offset-1"
                  : "border-border",
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <label
            className="relative h-7 w-7 shrink-0 cursor-pointer rounded border border-border"
            style={{
              backgroundColor: isValidHex(value) ? value : "transparent",
            }}
          >
            <input
              type="color"
              value={isValidHex(value) ? value : "#000000"}
              onChange={(e) => onChange(e.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </label>
          <Input
            value={value}
            maxLength={7}
            className="h-7"
            placeholder="#rrggbb"
            onChange={(e) => onChange(e.target.value)}
          />
          {value && (
            <Button variant="outline" size="sm" onClick={() => onChange("")}>
              <FormattedMessage defaultMessage="Mặc định" id="kQYjdX" />
            </Button>
          )}
        </div>
      </div>
    </FieldLabel>
  );
}
