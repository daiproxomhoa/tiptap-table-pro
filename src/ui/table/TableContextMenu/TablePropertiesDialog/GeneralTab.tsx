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

export type Align = "left" | "center" | "right";

interface GeneralTabProps {
  width: string;
  setWidth: (v: string) => void;
  height: string;
  setHeight: (v: string) => void;
  align: Align;
  setAlign: (v: Align) => void;
}

export function GeneralTab({
  width,
  setWidth,
  height,
  setHeight,
  align,
  setAlign,
}: GeneralTabProps) {
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
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            placeholder="100%"
          />
        </FieldLabel>
        <FieldLabel
          label={intl.formatMessage({
            defaultMessage: "Height", id: "height",
          })}
        >
          <Input
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="auto"
          />
        </FieldLabel>
      </div>
      <FieldLabel
        label={intl.formatMessage({
          defaultMessage: "Alignment", id: "alignment",
        })}
      >
        <Select value={align} onValueChange={(v) => setAlign(v as Align)}>
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
