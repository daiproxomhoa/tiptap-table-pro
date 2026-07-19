import { Separator } from "../../primitives/separator";
import { Toggle } from "../../primitives/toggle";
import { TooltipProvider } from "../../primitives/tooltip";
import type { Editor } from "@tiptap/react";
import { useEditorState } from "@tiptap/react";
import {
  Grid2x2,
  Grid2x2X,
  TableCellsMerge,
  TableCellsSplit,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useIntl } from "../../../lib/intl";
import { firstCellBorderColor, setAllCellsBorderColor } from "../utils";
import { RowColumnControls } from "./RowColumnControls";
import { TableAlignControls } from "./TableAlignControls";
import { Tip } from "./Tip";
import { useTableMenuPosition } from "./useTableMenuPosition";

interface TableBubbleMenuProps {
  editor: Editor;
}

export function TableBubbleMenu({ editor }: TableBubbleMenuProps) {
  const intl = useIntl();

  const inTable = useEditorState({
    editor,
    selector: ({ editor: e }) => e.isActive("table"),
  });

  const pos = useTableMenuPosition(editor, inTable);

  // Ẩn menu khi editor mất focus (click ra chỗ khác)
  const [focused, setFocused] = useState(editor.isFocused);
  useEffect(() => {
    const onFocus = () => setFocused(true);
    const onBlur = () => setFocused(false);
    editor.on("focus", onFocus);
    editor.on("blur", onBlur);
    return () => {
      editor.off("focus", onFocus);
      editor.off("blur", onBlur);
    };
  }, [editor]);

  const multiSelect = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e.view.dom.querySelectorAll(".selectedCell").length > 1,
  });

  // Ô đã merge: cell hiện tại có colspan/rowspan > 1 → cho phép Split
  const mergedCell = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      const cell = e.getAttributes("tableCell");
      const header = e.getAttributes("tableHeader");
      const colspan = cell.colspan ?? header.colspan ?? 1;
      const rowspan = cell.rowspan ?? header.rowspan ?? 1;
      return colspan > 1 || rowspan > 1;
    },
  });

  const isBorderless = useEditorState({
    editor,
    selector: ({ editor: e }) => firstCellBorderColor(e) === "transparent",
  });

  const tableAlign = useEditorState({
    editor,
    selector: ({ editor: e }) => e.getAttributes("table").align ?? "left",
  });

  if (!inTable || !focused || !pos) return null;

  return (
    <TooltipProvider delayDuration={400}>
      <div
        // Giữ focus editor khi bấm nút (tránh blur làm menu biến mất trước click)
        onMouseDown={(e) => e.preventDefault()}
        style={{
          position: "absolute",
          left: pos.x,
          // Đủ chỗ: trên đỉnh bảng (-100%). Thiếu chỗ: lật xuống dưới đáy bảng.
          top: pos.below ? pos.bottom + 8 : pos.y - 8,
          transform: pos.below
            ? "translate(-50%, 0)"
            : "translate(-50%, -100%)",
          zIndex: 50,
        }}
        className="flex items-center gap-0.5 rounded-md border bg-background px-1 py-0.5 shadow-md"
      >
        {multiSelect || mergedCell ? (
          <>
            {multiSelect && (
              <Tip
                label={intl.formatMessage({
                  defaultMessage: "Merge ô đang chọn",
                  id: "9npCtH",
                })}
              >
                <Toggle
                  size="sm"
                  pressed={false}
                  onPressedChange={() =>
                    editor.chain().focus().mergeCells().run()
                  }
                >
                  <TableCellsMerge className="size-4" />
                </Toggle>
              </Tip>
            )}
            <Tip
              label={intl.formatMessage({
                defaultMessage: "Split ô đã merge",
                id: "KEMj8C",
              })}
            >
              <Toggle
                size="sm"
                pressed={false}
                onPressedChange={() => editor.chain().focus().splitCell().run()}
              >
                <TableCellsSplit className="size-4" />
              </Toggle>
            </Tip>
          </>
        ) : (
          <>
            <RowColumnControls editor={editor} />

            <Separator orientation="vertical" className="mx-0.5 h-5" />

            {/* Viền */}
            <Tip
              label={
                isBorderless
                  ? intl.formatMessage({
                      defaultMessage: "Hiện viền",
                      id: "M9RRtp",
                    })
                  : intl.formatMessage({
                      defaultMessage: "Ẩn viền",
                      id: "oU622j",
                    })
              }
            >
              <Toggle
                size="sm"
                pressed={isBorderless}
                onPressedChange={(v) =>
                  setAllCellsBorderColor(editor, v ? "transparent" : null)
                }
              >
                {isBorderless ? (
                  <Grid2x2 className="size-4" />
                ) : (
                  <Grid2x2X className="size-4" />
                )}
              </Toggle>
            </Tip>

            <Separator orientation="vertical" className="mx-0.5 h-5" />

            {/* Căn chỉnh bảng */}
            <TableAlignControls editor={editor} tableAlign={tableAlign} />

            <Separator orientation="vertical" className="mx-0.5 h-5" />

            {/* Xoá bảng */}
            <Tip
              label={intl.formatMessage({
                defaultMessage: "Xoá bảng",
                id: "PkK+uP",
              })}
            >
              <Toggle
                size="sm"
                pressed={false}
                onPressedChange={() =>
                  editor.chain().focus().deleteTable().run()
                }
              >
                <Trash2 className="size-4 text-destructive" />
              </Toggle>
            </Tip>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}
