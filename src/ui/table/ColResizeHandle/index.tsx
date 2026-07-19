import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useEditorState, type Editor } from "@tiptap/react";
import { focusedTableEl, setBodyStyle, setColumnWidths } from "../utils";
import { clampColBoundary, splitAdjacentWidths } from "../resize-math";
import { cn } from "../../../lib/utils";

interface ColResizeHandleProps {
  editor: Editor;
  /** Extra class names merged onto each column handle. */
  className?: string;
}

const MIN_COL = 24; // px — a column is never narrower than this

/** Get the reference row (full set of single columns, colspan=1); fallback to the row with the most cells. */
function refRowCells(table: HTMLElement): HTMLElement[] {
  const rows = Array.from(
    table.querySelectorAll(":scope > tbody > tr, :scope > tr"),
  ) as HTMLElement[];
  let best: HTMLElement[] = [];
  for (const row of rows) {
    const cells = Array.from(row.children) as HTMLElement[];
    const allSingle = cells.every(
      (c) => (Number(c.getAttribute("colspan")) || 1) === 1,
    );
    if (allSingle && cells.length > best.length) best = cells;
  }
  if (best.length) return best;
  for (const row of rows) {
    const cells = Array.from(row.children) as HTMLElement[];
    if (cells.length > best.length) best = cells;
  }
  return best;
}

/**
 * Drag the boundary between 2 columns to adjust their widths (colwidth per-cell). The
 * handle is portaled into .tableWrapper; each column boundary (except the far right = the
 * table edge) has a vertical bar that shows on hover. Dragging → a vertical ghost line
 * follows the mouse (clamped within the 2 adjacent columns, ≥ MIN_COL); release → left
 * column += delta, right column −= delta (preserving the total), commit colwidth.
 */
export function ColResizeHandle({ editor, className }: ColResizeHandleProps) {
  const [wrapperEl, setWrapperEl] = useState<HTMLElement | null>(null);
  const wrapperRef = useRef<HTMLElement | null>(null);
  const tableRef = useRef<HTMLElement | null>(null);
  // The reference row's cells (full set of single columns) found in update() — startDrag
  // reuses them instead of re-scanning via refRowCells. The elements persist across
  // renders; their rects are read fresh at drag time.
  const refCellsRef = useRef<HTMLElement[]>([]);
  const isDragging = useRef(false);
  const [boundaries, setBoundaries] = useState<number[]>([]);
  const [guideLeft, setGuideLeft] = useState<number | null>(null);

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
      const wrapLeft = w.getBoundingClientRect().left;
      const cells = refRowCells(table);
      refCellsRef.current = cells;
      const bs = cells
        .slice(0, -1)
        .map((c) => c.getBoundingClientRect().right - wrapLeft);
      setBoundaries(bs);
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
      refCellsRef.current = [];
      setWrapperEl(null);
      setBoundaries([]);
    };
  }, [inTable, editor]);

  const startDrag = (e: React.MouseEvent, colIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    const table = tableRef.current;
    const wrapper = wrapperRef.current;
    if (!table || !wrapper) return;
    const savedFrom = editor.state.selection.from;

    const cells = refCellsRef.current.length
      ? refCellsRef.current
      : refRowCells(table);
    const rects = cells.map((c) => c.getBoundingClientRect());
    const widths = rects.map((r) => Math.round(r.width));
    const leftEdge = rects[colIndex].left;
    const rightEdge = rects[colIndex + 1].right;
    const total = widths[colIndex] + widths[colIndex + 1];

    isDragging.current = true;
    setBodyStyle("col-resize", "none");
    const wrapLeft = () => wrapper.getBoundingClientRect().left;
    const clampX = (clientX: number) =>
      clampColBoundary(clientX, leftEdge, rightEdge, MIN_COL);

    setGuideLeft(clampX(rects[colIndex].right) - wrapLeft());

    const onMove = (ev: MouseEvent) => {
      setGuideLeft(clampX(ev.clientX) - wrapLeft());
    };
    const onUp = (ev: MouseEvent) => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      setBodyStyle("", "");
      isDragging.current = false;
      setGuideLeft(null);

      const [leftW, rightW] = splitAdjacentWidths(
        clampX(ev.clientX),
        leftEdge,
        total,
      );
      const next = [...widths];
      next[colIndex] = leftW;
      next[colIndex + 1] = rightW;
      setColumnWidths(editor, next);

      const pos = Math.min(savedFrom, editor.state.doc.content.size);
      editor.chain().focus().setTextSelection(pos).run();
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  if (!inTable || !wrapperEl || boundaries.length === 0) return null;

  return createPortal(
    <>
      {boundaries.map((x, i) => (
        <div
          key={i}
          onMouseDown={(e) => startDrag(e, i)}
          className={cn(
            "ttp-col-resize-handle group absolute top-0 bottom-0 flex w-2.5 -translate-x-1/2 justify-center cursor-col-resize",
            className,
          )}
          style={{ left: x }}
        >
          <div className="ttp-col-resize-handle__bar h-full w-0.5 rounded-full bg-blue-500 opacity-0 shadow-[0_0_8px_2px] shadow-blue-500/40 transition-all duration-200 group-hover:w-1 group-hover:opacity-100" />
        </div>
      ))}
      {guideLeft !== null && (
        <div
          className="ttp-col-resize-handle__guide pointer-events-none absolute top-0 bottom-0 z-20 w-1 -translate-x-1/2 rounded bg-blue-500"
          style={{ left: guideLeft }}
        />
      )}
    </>,
    wrapperEl,
  );
}
