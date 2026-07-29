import { useIntl } from "../../../../lib/intl";
import { Input } from "../../../primitives/input";
import { FieldLabel } from "../../../primitives/field-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../primitives/select";

import { type Align, type TableForm } from "./constants";

interface GeneralTabProps {
  form: TableForm;
  onPatch: (p: Partial<TableForm>) => void;
}

export function GeneralTab({ form, onPatch }: GeneralTabProps) {
  const intl = useIntl();
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <FieldLabel
          label={intl.formatMessage({
            defaultMessage: "Width", id: "width",
          })}
        >
          <Input
            value={form.width}
            onChange={(e) => onPatch({ width: e.target.value })}
            placeholder="100%"
          />
        </FieldLabel>
        <FieldLabel
          label={intl.formatMessage({
            defaultMessage: "Height", id: "height",
          })}
        >
          <Input
            value={form.height}
            onChange={(e) => onPatch({ height: e.target.value })}
            placeholder="auto"
          />
        </FieldLabel>
      </div>
      <FieldLabel
        label={intl.formatMessage({
          defaultMessage: "Alignment", id: "alignment",
        })}
      >
        <Select
          value={form.align}
          onValueChange={(v) => onPatch({ align: v as Align })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">
              {intl.formatMessage({
                defaultMessage: "Left", id: "left",
              })}
            </SelectItem>
            <SelectItem value="center">
              {intl.formatMessage({
                defaultMessage: "Center", id: "center",
              })}
            </SelectItem>
            <SelectItem value="right">
              {intl.formatMessage({
                defaultMessage: "Right", id: "right",
              })}
            </SelectItem>
          </SelectContent>
        </Select>
      </FieldLabel>
    </>
  );
}
