import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useEditorState, type Editor } from "@tiptap/react";
import { focusedTableEl, setBodyStyle, setRowHeight } from "../utils";
import { clampRowBottom } from "../resize-math";
import { cn } from "../../../lib/utils";

interface RowResizeHandleProps {
  editor: Editor;
  /** Extra class names merged onto each row handle. */
  className?: string;
}

/**
 * Drag the bottom edge of each <tr> to adjust that row's height (height per-row stored on
 * the row node — see TableRowWithHeight). The handle is portaled into the .tableWrapper of
 * the focused table; each row (except the last) has a thin bar at its bottom edge that
 * only shows on hover. Dragging does NOT resize the row immediately: it shows a horizontal
 * "ghost line" that follows the mouse; only on RELEASE does it commit a single transaction
 * writing the height into that row node.
 */
export function RowResizeHandle({ editor, className }: RowResizeHandleProps) {
  const [wrapperEl, setWrapperEl] = useState<HTMLElement | null>(null);
  const wrapperRef = useRef<HTMLElement | null>(null);
  const tableRef = useRef<HTMLElement | null>(null);
  const isDragging = useRef(false);
  const [rows, setRows] = useState<HTMLElement[]>([]);
  // The ghost line while dragging: top coordinate (px) within the wrapper, null when not dragging.
  const [guideTop, setGuideTop] = useState<number | null>(null);

  const inTable = useEditorState({
    editor,
    selector: ({ editor: e }) => e.isActive("table"),
  });

  useEffect(() => {
    if (!inTable) return;
    const update = () => {
      if (isDragging.current) return;
      const table = focusedTableEl(editor);
      if (!table) return;
      const w = (table.closest(".tableWrapper") ?? table) as HTMLElement;
      w.style.position = "relative";
      tableRef.current = table;
      wrapperRef.current = w;
      setWrapperEl(w);
      setRows(
        Array.from(
          table.querySelectorAll(":scope > tbody > tr, :scope > tr"),
        ) as HTMLElement[],
      );
    };
    const raf = requestAnimationFrame(update);
    editor.on("selectionUpdate", update);
    editor.on("update", update);
    return () => {
      cancelAnimationFrame(raf);
      editor.off("selectionUpdate", update);
      editor.off("update", update);
      wrapperRef.current = null;
      tableRef.current = null;
      setWrapperEl(null);
      setRows([]);
    };
  }, [inTable, editor]);

  const startDrag = (e: React.MouseEvent, rowIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    const table = tableRef.current;
    const wrapper = wrapperRef.current;
    if (!table || !wrapper) return;
    const currentRows = Array.from(
      table.querySelectorAll(":scope > tbody > tr, :scope > tr"),
    ) as HTMLElement[];
    const tr = currentRows[rowIndex];
    if (!tr) return;

    isDragging.current = true;
    setBodyStyle("ns-resize", "none");

    const trRect = tr.getBoundingClientRect();
    const rowTop = trRect.top;
    // Min = the row's content height (the tallest cell's content). Measured WITHOUT
    // mutating the ProseMirror-managed <tr> DOM — writing to tr.style directly (the old
    // `tr.style.height = "0"` trick) can trip ProseMirror's DOM observer and trigger a
    // re-render/desync mid-drag. Instead, sum each cell's block children heights plus its
    // vertical padding/border (children keep their natural height even when the row box is
    // stretched), and take the max across cells.
    const cellContentHeight = (cell: HTMLElement) => {
      const cs = getComputedStyle(cell);
      const frame =
        parseFloat(cs.paddingTop) +
        parseFloat(cs.paddingBottom) +
        parseFloat(cs.borderTopWidth) +
        parseFloat(cs.borderBottomWidth);
      let content = 0;
      for (const child of Array.from(cell.children) as HTMLElement[]) {
        const st = getComputedStyle(child);
        content +=
          child.getBoundingClientRect().height +
          parseFloat(st.marginTop) +
          parseFloat(st.marginBottom);
      }
      return Math.ceil(content + frame);
    };
    const cells = Array.from(tr.children) as HTMLElement[];
    const minH = Math.max(1, ...cells.map(cellContentHeight));

    // Convert page coordinates (clientY) → coordinates within the wrapper for the ghost line.
    const wrapTop = () => wrapper.getBoundingClientRect().top;
    const clampY = (clientY: number) => clampRowBottom(clientY, rowTop, minH);

    setGuideTop(clampY(trRect.bottom) - wrapTop());

    const onMove = (ev: MouseEvent) => {
      setGuideTop(clampY(ev.clientY) - wrapTop());
    };
    const onUp = (ev: MouseEvent) => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      setBodyStyle("", "");
      isDragging.current = false;
      setGuideTop(null);

      const finalH = Math.round(clampY(ev.clientY) - rowTop);
      setRowHeight(editor, rowIndex, `${finalH}px`);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  if (!inTable || !wrapperEl || rows.length === 0) return null;

  const wrapTop = wrapperEl.getBoundingClientRect().top;

  return createPortal(
    <>
      {rows.slice(0, -1).map((tr, i) => {
        const top = tr.getBoundingClientRect().bottom - wrapTop;
        return (
          <div
            key={i}
            onMouseDown={(e) => startDrag(e, i)}
            className={cn(
              "ttp-row-resize-handle group absolute left-0 right-0 flex h-2.5 -translate-y-1/2 items-center cursor-ns-resize",
              className,
            )}
            style={{ top }}
          >
            <div className="ttp-row-resize-handle__bar h-0.5 w-full rounded-full bg-blue-500 opacity-0 shadow-[0_0_8px_2px] shadow-blue-500/40 transition-all duration-200 group-hover:h-1 group-hover:opacity-100" />
          </div>
        );
      })}
      {guideTop !== null && (
        <div
          className="ttp-row-resize-handle__guide pointer-events-none absolute left-0 right-0 z-20 h-1 -translate-y-1/2 rounded bg-blue-500"
          style={{ top: guideTop }}
        />
      )}
    </>,
    wrapperEl,
  );
}
