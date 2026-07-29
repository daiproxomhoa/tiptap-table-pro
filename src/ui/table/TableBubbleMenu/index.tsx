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
} from "../../../lib/icons";
import { useEffect, useState } from "react";
import { cn } from "../../../lib/utils";
import { useIntl } from "../../../lib/intl";
import { firstCellBorderColor, setAllCellsBorderColor } from "../utils";
import { useResizeDrag } from "../../resize-drag-store";
import { RowColumnControls } from "./RowColumnControls";
import { TableAlignControls } from "./TableAlignControls";
import { Tip } from "./Tip";
import { useTableMenuPosition } from "./useTableMenuPosition";

interface TableBubbleMenuProps {
  editor: Editor;
  /** Extra class names merged onto the floating menu container. */
  className?: string;
}

export function TableBubbleMenu({ editor, className }: TableBubbleMenuProps) {
  const intl = useIntl();

  const inTable = useEditorState({
    editor,
    selector: ({ editor: e }) => e.isActive("table"),
  });

  const pos = useTableMenuPosition(editor, inTable);

  // Hide the menu when the editor loses focus (e.g. clicking elsewhere)
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

  // Merged cell: the current cell has colspan/rowspan > 1 → allow Split
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

  // A resize drag is in progress (table / row / column / image) → hide the menu so it
  // stays out of the way.
  const resizing = useResizeDrag((s) => s.dragging);

  if (!inTable || !focused || !pos || resizing) return null;

  return (
    <TooltipProvider delayDuration={400}>
      <div
        // Keep the editor focused when clicking a button (prevents blur from hiding the menu before the click registers)
        onMouseDown={(e) => e.preventDefault()}
        style={{
          position: "absolute",
          left: pos.x,
          // Enough room: above the top of the table (-100%). Not enough room: flip it below the bottom of the table.
          top: pos.below ? pos.bottom + 8 : pos.y - 8,
          transform: pos.below
            ? "translate(-50%, 0)"
            : "translate(-50%, -100%)",
          zIndex: 50,
        }}
        className={cn(
          "ttp-bubble-menu flex items-center gap-0.5 rounded-md border bg-background px-1 py-0.5 shadow-md",
          className,
        )}
      >
        {multiSelect || mergedCell ? (
          <>
            {multiSelect && (
              <Tip
                label={intl.formatMessage({
                  defaultMessage: "Merge selected cells", id: "mergeSelectedCells",
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
                defaultMessage: "Split merged cell", id: "splitCell",
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

            {/* Border */}
            <Tip
              label={
                isBorderless
                  ? intl.formatMessage({
                      defaultMessage: "Show borders", id: "showBorders",
                    })
                  : intl.formatMessage({
                      defaultMessage: "Hide borders", id: "hideBorders",
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

            {/* Table alignment */}
            <TableAlignControls editor={editor} tableAlign={tableAlign} />

            <Separator orientation="vertical" className="mx-0.5 h-5" />

            {/* Delete table */}
            <Tip
              label={intl.formatMessage({
                defaultMessage: "Delete table", id: "deleteTable",
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
