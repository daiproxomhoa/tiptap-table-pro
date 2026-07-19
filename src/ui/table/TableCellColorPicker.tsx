import { useState } from "react";
import type { Editor } from "@tiptap/react";
import { FormattedMessage } from "../../lib/intl";
import { cn } from "../../lib/utils";
import { isValidHex } from "./utils";

const PRESET_COLORS = [
  // neutrals
  "#ffffff", "#f8fafc", "#f1f5f9", "#e2e8f0", "#cbd5e1", "#94a3b8", "#64748b", "#475569",
  // red → orange → yellow
  "#fee2e2", "#fecaca", "#fed7aa", "#fdba74", "#fef9c3", "#fef08a", "#fde68a", "#fcd34d",
  // green → teal → cyan
  "#dcfce7", "#bbf7d0", "#d1fae5", "#a7f3d0", "#ccfbf1", "#99f6e4", "#cffafe", "#a5f3fc",
  // blue → purple → pink
  "#dbeafe", "#bfdbfe", "#e0e7ff", "#c7d2fe", "#ede9fe", "#ddd6fe", "#fae8ff", "#fbcfe8",
];

interface TableCellColorPickerProps {
  editor: Editor;
  onClose: () => void;
}

export function TableCellColorPicker({ editor, onClose }: TableCellColorPickerProps) {
  const [hex, setHex] = useState("");

  const applyColor = (color: string) => {
    editor.chain().focus().setCellAttribute("backgroundColor", color).run();
    onClose();
  };

  const clearColor = () => {
    editor.chain().focus().setCellAttribute("backgroundColor", null).run();
    onClose();
  };

  return (
    <div className="space-y-2 p-2">
      {/* Preset grid */}
      <div className="grid grid-cols-8 gap-1">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            title={color}
            className={cn(
              "h-6 w-6 rounded border border-border transition-transform hover:scale-110",
            )}
            style={{ backgroundColor: color }}
            onClick={() => applyColor(color)}
          />
        ))}
      </div>

      {/* Hex input */}
      <div className="flex items-center gap-1.5">
        <label
          className="relative h-7 w-7 shrink-0 cursor-pointer rounded border border-border"
          style={{ backgroundColor: isValidHex(hex) ? hex : "transparent" }}
        >
          <input
            type="color"
            value={isValidHex(hex) ? hex : "#ffffff"}
            onChange={(e) => setHex(e.target.value)}
            onBlur={() => isValidHex(hex) && applyColor(hex)}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </label>
        <input
          type="text"
          placeholder="#rrggbb"
          value={hex}
          maxLength={7}
          onChange={(e) => setHex(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && isValidHex(hex)) applyColor(hex);
          }}
          className="h-7 w-full rounded border border-input bg-background px-2 text-xs outline-hidden focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* Clear */}
      <button
        type="button"
        onClick={clearColor}
        className="w-full rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
      >
        <FormattedMessage defaultMessage="Xoá màu nền" id="EWuXKX" />
      </button>
    </div>
  );
}
