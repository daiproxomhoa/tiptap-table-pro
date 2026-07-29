import { useIntl } from "../../../../lib/intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../primitives/select";
import { FieldLabel } from "../../../primitives/field-label";
import { NONE, type CellForm } from "./constants";

interface GeneralTabProps {
  form: CellForm;
  onPatch: (p: Partial<CellForm>) => void;
}

export function GeneralTab({ form, onPatch }: GeneralTabProps) {
  const intl = useIntl();

  const opt = (value: string, label: string) => (
    <SelectItem value={value}>{label}</SelectItem>
  );

  return (
    <>
      <FieldLabel
        label={intl.formatMessage({
          defaultMessage: "Cell type", id: "cellType",
        })}
      >
        <Select
          value={form.cellType}
          onValueChange={(v) => onPatch({ cellType: v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {opt(
              "cell",
              intl.formatMessage({ defaultMessage: "Cell", id: "cell" }),
            )}
            {opt(
              "header",
              intl.formatMessage({
                defaultMessage: "Header cell", id: "headerCell",
              }),
            )}
          </SelectContent>
        </Select>
      </FieldLabel>

      <FieldLabel
        label={intl.formatMessage({
          defaultMessage: "Scope", id: "scope",
        })}
      >
        <Select value={form.scope} onValueChange={(v) => onPatch({ scope: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {opt(
              NONE,
              intl.formatMessage({
                defaultMessage: "None", id: "none",
              }),
            )}
            {opt("row", intl.formatMessage({ defaultMessage: "Row", id: "row" }))}
            {opt("col", intl.formatMessage({ defaultMessage: "Column", id: "column" }))}
          </SelectContent>
        </Select>
      </FieldLabel>

      <FieldLabel
        label={intl.formatMessage({
          defaultMessage: "Horizontal align", id: "horizontalAlign",
        })}
      >
        <Select
          value={form.hAlign}
          onValueChange={(v) => onPatch({ hAlign: v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {opt(NONE, intl.formatMessage({ defaultMessage: "None", id: "none" }))}
            {opt("left", intl.formatMessage({ defaultMessage: "Left", id: "left" }))}
            {opt("center", intl.formatMessage({ defaultMessage: "Center", id: "center" }))}
            {opt("right", intl.formatMessage({ defaultMessage: "Right", id: "right" }))}
          </SelectContent>
        </Select>
      </FieldLabel>

      <FieldLabel
        label={intl.formatMessage({
          defaultMessage: "Vertical align", id: "verticalAlign",
        })}
      >
        <Select
          value={form.vAlign}
          onValueChange={(v) => onPatch({ vAlign: v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {opt(NONE, intl.formatMessage({ defaultMessage: "None", id: "none" }))}
            {opt("top", intl.formatMessage({ defaultMessage: "Top", id: "top" }))}
            {opt("middle", intl.formatMessage({ defaultMessage: "Middle", id: "middle" }))}
            {opt("bottom", intl.formatMessage({ defaultMessage: "Bottom", id: "bottom" }))}
          </SelectContent>
        </Select>
      </FieldLabel>
    </>
  );
}
