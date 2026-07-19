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

/** Đường kẻ mẫu cho 1 kiểu viền (vẽ bằng border-top). */
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

/** Select kiểu viền hiển thị đường kẻ trực quan thay vì chữ. */
export function BorderStyleSelect({ value, onChange }: BorderStyleSelectProps) {
  const intl = useIntl();
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>
          {intl.formatMessage({ defaultMessage: "Chọn…", id: "BG3ISn" })}
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
