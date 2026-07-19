import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useEditorState, type Editor } from "@tiptap/react";
import { focusedTableEl, setBodyStyle, setColumnWidths } from "../utils";
import { clampColBoundary, splitAdjacentWidths } from "../resize-math";

interface ColResizeHandleProps {
  editor: Editor;
}

const MIN_COL = 24; // px — cột không hẹp hơn mức này

/** Lấy hàng tham chiếu (đủ cột đơn colspan=1); fallback hàng nhiều cell nhất. */
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
 * Kéo ranh giữa 2 cột để chỉnh bề rộng (colwidth per-cell). Handle portal vào
 * .tableWrapper; mỗi ranh cột (trừ ranh phải cùng = cạnh bảng) có 1 thanh dọc
 * hiện khi hover. Kéo → line ảo dọc theo chuột (clamp trong 2 cột kề, ≥ MIN_COL);
 * thả → cột trái += delta, cột phải −= delta (giữ tổng), commit colwidth.
 */
export function ColResizeHandle({ editor }: ColResizeHandleProps) {
  const [wrapperEl, setWrapperEl] = useState<HTMLElement | null>(null);
  const wrapperRef = useRef<HTMLElement | null>(null);
  const tableRef = useRef<HTMLElement | null>(null);
  // Cell hàng tham chiếu (đủ cột đơn) đã tìm ở update() — startDrag tái dùng thay
  // vì quét lại refRowCells. Element sống qua render; rect đọc tươi lúc kéo.
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
          className="group absolute top-0 bottom-0 flex w-2.5 -translate-x-1/2 justify-center cursor-col-resize"
          style={{ left: x }}
        >
          <div className="h-full w-0.5 rounded-full bg-blue-500 opacity-0 shadow-[0_0_8px_2px] shadow-blue-500/40 transition-all duration-200 group-hover:w-1 group-hover:opacity-100" />
        </div>
      ))}
      {guideLeft !== null && (
        <div
          className="pointer-events-none absolute top-0 bottom-0 z-20 w-1 -translate-x-1/2 rounded bg-blue-500"
          style={{ left: guideLeft }}
        />
      )}
    </>,
    wrapperEl,
  );
}
