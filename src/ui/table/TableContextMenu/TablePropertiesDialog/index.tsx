import { useState } from "react";
import type { Editor } from "@tiptap/react";
import { FormattedMessage } from "../../../../lib/intl";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../primitives/dialog";
import { Button } from "../../../primitives/button";
import { DialogSideTabs, type DialogTab } from "../DialogSideTabs";
import {
  firstCellBorderColor,
  firstCellAttr,
  setAllCellsAttrs,
} from "../../utils";
import { NONE } from "./constants";
import { GeneralTab, type Align } from "./GeneralTab";
import { AdvancedTab } from "./AdvancedTab";

interface TablePropertiesDialogProps {
  editor: Editor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Đọc width/height từ style attr "width: ...; height: ..." của table. */
function parseStyle(style: string | null): { width: string; height: string } {
  const w = style?.match(/width:\s*([^;]+)/)?.[1]?.trim() ?? "";
  const h = style?.match(/height:\s*([^;]+)/)?.[1]?.trim() ?? "";
  return { width: w, height: h };
}

export function TablePropertiesDialog({
  editor,
  open,
  onOpenChange,
}: TablePropertiesDialogProps) {
  const attrs = editor.getAttributes("table");
  const initial = parseStyle(attrs.style ?? null);
  // Viền là attr của từng ô; đọc ô đầu tiên làm trạng thái khởi tạo.
  const cellBorder = firstCellBorderColor(editor);

  const [tab, setTab] = useState<DialogTab>("general");
  const [width, setWidth] = useState(initial.width);
  const [height, setHeight] = useState(initial.height);
  const [align, setAlign] = useState<Align>(attrs.align ?? "left");
  const [borderless, setBorderless] = useState<boolean>(
    cellBorder === "transparent",
  );
  const [borderColor, setBorderColor] = useState<string>(
    cellBorder && cellBorder !== "transparent" ? cellBorder : "",
  );
  const [borderWidth, setBorderWidth] = useState<string>(
    firstCellAttr(editor, "borderWidth") ?? "",
  );
  const [borderStyle, setBorderStyle] = useState<string>(
    firstCellAttr(editor, "borderStyle") ?? NONE,
  );

  const save = () => {
    const parts: string[] = [];
    if (width.trim()) parts.push(`width: ${width.trim()}`);
    if (height.trim()) parts.push(`height: ${height.trim()}`);
    const style = parts.join("; ") || null;
    const cellBorderColor = borderless
      ? "transparent"
      : borderColor.trim() || null;
    editor.chain().focus().updateAttributes("table", { style, align }).run();
    setAllCellsAttrs(editor, {
      borderColor: cellBorderColor,
      borderWidth: borderWidth.trim() || null,
      borderStyle: borderStyle === NONE ? null : borderStyle,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            <FormattedMessage defaultMessage="Thuộc tính bảng" id="ifjk7x" />
          </DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 gap-4 overflow-y-auto px-3 pb-3 sm:px-6 sm:pb-6">
          <DialogSideTabs tab={tab} onChange={setTab} />

          <div className="flex-1 space-y-3">
            {tab === "general" ? (
              <GeneralTab
                width={width}
                setWidth={setWidth}
                height={height}
                setHeight={setHeight}
                align={align}
                setAlign={setAlign}
              />
            ) : (
              <AdvancedTab
                borderless={borderless}
                setBorderless={setBorderless}
                borderWidth={borderWidth}
                setBorderWidth={setBorderWidth}
                borderStyle={borderStyle}
                setBorderStyle={setBorderStyle}
                borderColor={borderColor}
                setBorderColor={setBorderColor}
              />
            )}
          </div>
        </div>

        <DialogFooter className="border-t">
          <Button
            variant="outline"
            className="min-w-25"
            onClick={() => onOpenChange(false)}
          >
            <FormattedMessage defaultMessage="Huỷ" id="NfX0sh" />
          </Button>
          <Button className="min-w-25" onClick={save}>
            <FormattedMessage defaultMessage="Lưu" id="oa/wrx" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
