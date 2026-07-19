import { useIntl } from "../../../lib/intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../primitives/select";

const NONE = "none";
const STYLES = ["solid", "dashed", "dotted", "double"] as const;

/** Sample line for a border style (drawn using border-top). */
function StyleLine({ style }: { style: string }) {
  return (
    <span
      className="inline-block w-24 border-foreground align-middle"
      style={{
        borderTopWidth: 3,
        borderTopStyle: style as React.CSSProperties["borderTopStyle"],
      }}
    />
  );
}

interface BorderStyleSelectProps {
  value: string;
  onChange: (value: string) => void;
}

/** Border-style select that shows a visual line preview instead of text. */
export function BorderStyleSelect({ value, onChange }: BorderStyleSelectProps) {
  const intl = useIntl();
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>
          {intl.formatMessage({ defaultMessage: "Select…", id: "select" })}
        </SelectItem>
        {STYLES.map((s) => (
          <SelectItem key={s} value={s}>
            <StyleLine style={s} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
