import { useIntl } from "../../../../lib/intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../primitives/select";
import { FieldLabel } from "../../../primitives/field-label";
import { NONE } from "./constants";

interface GeneralTabProps {
  cellType: string;
  setCellType: (v: string) => void;
  scope: string;
  setScope: (v: string) => void;
  hAlign: string;
  setHAlign: (v: string) => void;
  vAlign: string;
  setVAlign: (v: string) => void;
}

export function GeneralTab({
  cellType,
  setCellType,
  scope,
  setScope,
  hAlign,
  setHAlign,
  vAlign,
  setVAlign,
}: GeneralTabProps) {
  const intl = useIntl();

  const opt = (value: string, label: string) => (
    <SelectItem value={value}>{label}</SelectItem>
  );

  return (
    <>
      <FieldLabel
        label={intl.formatMessage({
          defaultMessage: "Loại ô",
          id: 'TtII9e',
        })}
      >
        <Select value={cellType} onValueChange={setCellType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {opt(
              "cell",
              intl.formatMessage({ defaultMessage: "Ô", id: "wT3UNz" }),
            )}
            {opt(
              "header",
              intl.formatMessage({
                defaultMessage: "Ô tiêu đề",
                id: 'Y7qu09',
              }),
            )}
          </SelectContent>
        </Select>
      </FieldLabel>

      <FieldLabel
        label={intl.formatMessage({
          defaultMessage: "Phạm vi",
          id: 'zaXP54',
        })}
      >
        <Select value={scope} onValueChange={setScope}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {opt(
              NONE,
              intl.formatMessage({
                defaultMessage: "Không",
                id: 'JVtIrS',
              }),
            )}
            {opt("row", intl.formatMessage({ defaultMessage: "Hàng", id: 'YwJzyx' }))}
            {opt("col", intl.formatMessage({ defaultMessage: "Cột", id: '9JDnfL' }))}
          </SelectContent>
        </Select>
      </FieldLabel>

      <FieldLabel
        label={intl.formatMessage({
          defaultMessage: "Căn ngang",
          id: '1kezye',
        })}
      >
        <Select value={hAlign} onValueChange={setHAlign}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {opt(NONE, intl.formatMessage({ defaultMessage: "Không", id: 'JVtIrS' }))}
            {opt("left", intl.formatMessage({ defaultMessage: "Trái", id: "vTehD7" }))}
            {opt("center", intl.formatMessage({ defaultMessage: "Giữa", id: "rRGYkm" }))}
            {opt("right", intl.formatMessage({ defaultMessage: "Phải", id: "r+CuAX" }))}
          </SelectContent>
        </Select>
      </FieldLabel>

      <FieldLabel
        label={intl.formatMessage({
          defaultMessage: "Căn dọc",
          id: 'tLZRuf',
        })}
      >
        <Select value={vAlign} onValueChange={setVAlign}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {opt(NONE, intl.formatMessage({ defaultMessage: "Không", id: 'JVtIrS' }))}
            {opt("top", intl.formatMessage({ defaultMessage: "Trên", id: 'izw8bX' }))}
            {opt("middle", intl.formatMessage({ defaultMessage: "Giữa", id: "rRGYkm" }))}
            {opt("bottom", intl.formatMessage({ defaultMessage: "Dưới", id: 'hHS1qu' }))}
          </SelectContent>
        </Select>
      </FieldLabel>
    </>
  );
}
