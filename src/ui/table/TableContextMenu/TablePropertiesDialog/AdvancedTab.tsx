import { FormattedMessage, useIntl } from "../../../../lib/intl";
import { Button } from "../../../primitives/button";
import { Input } from "../../../primitives/input";
import { FieldLabel } from "../../../primitives/field-label";
import { Checkbox } from "../../../primitives/checkbox";
import { cn } from "../../../../lib/utils";
import { BorderStyleSelect } from "../BorderStyleSelect";
import { isValidHex } from "../../utils";
import { BORDER_PRESETS, type TableForm } from "./constants";

interface AdvancedTabProps {
  form: TableForm;
  onPatch: (p: Partial<TableForm>) => void;
}

export function AdvancedTab({ form, onPatch }: AdvancedTabProps) {
  const { borderless, borderWidth, borderStyle, borderColor } = form;
  const intl = useIntl();
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={borderless}
          onCheckedChange={(v) => onPatch({ borderless: !!v })}
        />
        <FormattedMessage defaultMessage="Hide table borders" id="hideTableBorders" />
      </label>

      <div
        className={cn(
          "space-y-3",
          borderless && "pointer-events-none opacity-50",
        )}
      >
        <FieldLabel
          label={intl.formatMessage({
            defaultMessage: "Border width", id: "borderWidth",
          })}
        >
          <Input
            value={borderWidth}
            onChange={(e) => onPatch({ borderWidth: e.target.value })}
            placeholder="1px"
          />
        </FieldLabel>

        <FieldLabel
          label={intl.formatMessage({
            defaultMessage: "Border style", id: "borderStyle",
          })}
        >
          <BorderStyleSelect
            value={borderStyle}
            onChange={(v) => onPatch({ borderStyle: v })}
          />
        </FieldLabel>
      </div>

      <FieldLabel
        label={intl.formatMessage({
          defaultMessage: "Border color", id: "borderColor",
        })}
      >
        <div
          className={cn(
            "space-y-2",
            borderless && "pointer-events-none opacity-50",
          )}
        >
          <div className="grid grid-cols-8 gap-1">
            {BORDER_PRESETS.map((c) => (
              <button
                key={c}
                type="button"
                title={c}
                onClick={() => onPatch({ borderColor: c })}
                className={cn(
                  "h-6 w-6 rounded border transition-transform hover:scale-110",
                  borderColor.toLowerCase() === c
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
                backgroundColor: isValidHex(borderColor)
                  ? borderColor
                  : "transparent",
              }}
            >
              <input
                type="color"
                value={isValidHex(borderColor) ? borderColor : "#000000"}
                onChange={(e) => onPatch({ borderColor: e.target.value })}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </label>
            <Input
              value={borderColor}
              maxLength={7}
              className="h-7"
              placeholder="#rrggbb"
              onChange={(e) => onPatch({ borderColor: e.target.value })}
            />
            {borderColor && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPatch({ borderColor: "" })}
              >
                <FormattedMessage defaultMessage="Default" id="default" />
              </Button>
            )}
          </div>
        </div>
      </FieldLabel>
    </div>
  );
}
