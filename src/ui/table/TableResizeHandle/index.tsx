import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useEditorState } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import {
  focusedTableEl,
  setBodyStyle,
  setColumnWidths,
  setRowHeight,
} from "../utils";
import { HANDLES } from "./constants";
import { applyStoredStyles, tableMinContentWidth } from "./utils";
import { cn } from "../../../lib/utils";
import {
  clampDragWidth,
  clampDragHeight,
  minTableHeight,
  finalRowHeight,
  scaleColWidths,
  widthValue,
} from "../resize-math";

interface TableResizeHandleProps {
  editor: Editor;
  /** Extra class names merged onto each corner/edge drag handle. */
  className?: string;
}

/** The REAL table's box measured in the wrapper's coordinate system (portal target). The
 * table can overflow the wrapper when content forces columns to expand → the outline +
 * handles must be anchored to this box, not to the wrapper's edges (the old
 * right:0/bottom:0 made the frame misaligned). */
interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function TableResizeHandle({
  editor,
  className,
}: TableResizeHandleProps) {
  // The .tableWrapper of the focused table — the handle is portaled here and positioned
  // absolutely relative to the table's BOX (inside the wrapper), so it scrolls with the
  // table. State is for rendering/portal; ref is for reading during a drag (state is a snapshot).
  const [wrapperEl, setWrapperEl] = useState<HTMLElement | null>(null);
  const wrapperRef = useRef<HTMLElement | null>(null);
  // The table's box in the wrapper's coordinate system — recomputed on each focus/update
  // (when content changes the table's size, the resize frame follows it without drifting).
  const [box, setBox] = useState<Box | null>(null);
  // Badge showing the size (%) while dragging
  const [badge, setBadge] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);
  const tableInner = useRef<HTMLElement | null>(null);
  const isDragging = useRef(false);
  // Abort an in-progress drag (remove mousemove/mouseup) — called when unmounting mid-drag.
  const abortDragRef = useRef<(() => void) | null>(null);
  // "Ghost table": an outline frame (w×h px) + a column/row grid overlaid on the real
  // table while dragging, in place of a live preview. Do NOT set real DOM styles while
  // dragging: the <table> is a NodeView (AlignableTableView) that runs normalizeColWidths
  // on every update → it would overwrite immediately; the source of truth is the node
  // attrs (committed on release). `cols`/`rows` = the 0..1 ratio positions of the
  // column/row boundaries (multiplied by w/h when drawing). `left`/`top` = the box origin
  // within the wrapper. null when not dragging.
  const [ghost, setGhost] = useState<{
    left: number;
    top: number;
    w: number;
    h: number;
    cols: number[];
    rows: number[];
  } | null>(null);

  useEffect(() => {
    applyStoredStyles(editor);
    const handler = () => applyStoredStyles(editor);
    editor.on("update", handler);
    return () => {
      editor.off("update", handler);
    };
  }, [editor]);

  const inTable = useEditorState({
    editor,
    selector: ({ editor: e }) => e.isActive("table"),
  });

  useEffect(() => {
    if (!inTable) return;
    let raf = 0;
    // Read the rect inside a rAF → after the browser reflows (typing text that expands a
    // column makes the box pick up the NEW size, without a one-frame lag). Each
    // selectionUpdate/update schedules a re-measure → the resize frame always tracks the
    // real table.
    const update = () => {
      if (isDragging.current) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const table = focusedTableEl(editor);
        if (!table) return;
        const w = (table.closest(".tableWrapper") ?? table) as HTMLElement;
        // Containing block for the absolutely positioned handle/outline.
        w.style.position = "relative";
        tableInner.current = table;
        wrapperRef.current = w;
        setWrapperEl(w);
        // Box = table rect minus wrapper rect → the table's coordinates within the
        // wrapper. Tracks the real table edges even when the table overflows the wrapper.
        const wr = w.getBoundingClientRect();
        const tr = table.getBoundingClientRect();
        setBox({
          left: tr.left - wr.left,
          top: tr.top - wr.top,
          width: tr.width,
          height: tr.height,
        });
      });
    };
    update();
    editor.on("selectionUpdate", update);
    editor.on("update", update);
    return () => {
      cancelAnimationFrame(raf);
      editor.off("selectionUpdate", update);
      editor.off("update", update);
      abortDragRef.current?.(); // abort a pending drag if unmounting mid-drag
      wrapperRef.current = null;
      setWrapperEl(null);
      setBox(null);
    };
  }, [inTable, editor]);

  const startDrag = (
    e: React.MouseEvent,
    mode: "width" | "height" | "both",
    sx: 1 | -1,
    sy: 1 | -1,
    cursor: string,
  ) => {
    e.preventDefault();
    // Save the selection to restore after commit — the drag/commit can make the editor
    // lose focus (selection moves outside the table → the handle disappears).
    const savedFrom = editor.state.selection.from;
    e.stopPropagation();
    const wrapper = wrapperRef.current;
    const table = tableInner.current;
    if (!wrapper || !table) return;

    const doWidth = mode !== "height";
    const doHeight = mode !== "width";

    // The table's LAST ROW — every height operation (dragging an edge/corner) changes this
    // row's height (height per-row; no longer a whole-table height). Take the last element
    // of the <tr> list (not relying on the :last-child selector, to be safe).
    const allRows = Array.from(
      table.querySelectorAll(":scope > tbody > tr, :scope > tr"),
    ) as HTMLElement[];
    const lastRow = doHeight ? (allRows[allRows.length - 1] ?? null) : null;

    isDragging.current = true;
    setBodyStyle(cursor, "none");

    // Starting size = the REAL table's box (not the wrapper's).
    const tr0 = table.getBoundingClientRect();
    const wr0 = wrapper.getBoundingClientRect();
    const startW = tr0.width;
    const startH = tr0.height;
    const boxLeft = tr0.left - wr0.left;
    const boxTop = tr0.top - wr0.top;
    const startMouseX = e.clientX;
    const startMouseY = e.clientY;

    // Min width = the sum of each column's REAL min-content (measured by temporarily
    // removing the width constraints — see tableMinContentWidth).
    const minW = tableMinContentWidth(table);

    // The rendered px width of each <col> (1 <col> = 1 column, matching the index that
    // setColumnWidths uses — no colspan mismatch like measuring by cell). The commit only
    // needs the RATIO between columns: colwidth is written into the node then
    // normalizeColWidths converts px→% on every update, so keeping the ratio right makes
    // the columns scale evenly with the table width. Fall back to header cells when the
    // table has no <colgroup> yet (before seedColwidths).
    const colEls = doWidth
      ? (() => {
          const cols = Array.from(
            table.querySelectorAll(":scope > colgroup > col"),
          ) as HTMLElement[];
          return cols.length
            ? cols
            : ((allRows[0]?.children
                ? Array.from(allRows[0].children)
                : []) as HTMLElement[]);
        })()
      : [];
    const startColPx = colEls.map((c) => c.getBoundingClientRect().width);
    const sumColPx = startColPx.reduce((a, b) => a + b, 0);

    const minRowH = 34; // floor height for a single row
    const startRowH = lastRow ? lastRow.getBoundingClientRect().height : 0;
    // The MINIMUM height of the whole table when the last row shrinks to its min.
    const minTableH = minTableHeight(startH, startRowH, minRowH);

    // Grid inside the ghost table:
    // - COLUMNS: 0..1 ratios (scale with width — dragging wider expands columns evenly).
    // - ROWS: ABSOLUTE px (the bottom boundary of each row, except the last). Only the
    //   last row changes height when dragging → the upper row boundaries KEEP their px,
    //   they don't scale with h.
    const tableLeft = tr0.left;
    const tableTop = tr0.top;
    const headerCells = allRows[0]
      ? (Array.from(allRows[0].children) as HTMLElement[])
      : [];
    const colRatios =
      startW > 0
        ? headerCells
            .map((c) => (c.getBoundingClientRect().right - tableLeft) / startW)
            .filter((rt) => rt > 0 && rt < 0.999)
        : [];
    // The bottom boundaries of the rows ABOVE the last row (px). Exclude the last row (= the frame's bottom).
    const rowLinesPx = allRows
      .slice(0, -1)
      .map((rw) => rw.getBoundingClientRect().bottom - tableTop);

    // The size of the "ghost table" being dragged — only draws the outline frame, does NOT
    // set real DOM styles (they'd be overwritten by TableView's normalizeColWidths).
    // Commit into the node on release.
    let pendingW = startW;
    let pendingH = startH;

    // Width ceiling = the container width (100%). Don't let the table be dragged wider than the container.
    const maxW = wrapper.parentElement?.clientWidth ?? Infinity;

    const onMouseMove = (ev: MouseEvent) => {
      if (doWidth) {
        pendingW = clampDragWidth(
          startW,
          ev.clientX - startMouseX,
          sx,
          minW,
          maxW,
        );
      }
      if (doHeight && lastRow) {
        pendingH = clampDragHeight(
          startH,
          ev.clientY - startMouseY,
          sy,
          minTableH,
        );
      }
      // Box origin: dragging from the left edge (sx=-1) keeps the right edge fixed → left
      // shifts by the width difference; dragging the top edge (sy=-1) is similar for top.
      const left = sx < 0 ? boxLeft - (pendingW - startW) : boxLeft;
      const top = sy < 0 ? boxTop - (pendingH - startH) : boxTop;
      setGhost({
        left,
        top,
        w: pendingW,
        h: pendingH,
        cols: colRatios,
        rows: rowLinesPx,
      });

      // Badge: width as % of the container (matching the committed value), height in px.
      const container = wrapper.parentElement?.clientWidth ?? 0;
      const wText =
        container > 0
          ? `${(Math.round((pendingW / container) * 1000) / 10).toFixed(1)}%`
          : `${pendingW}px`;
      const hText = `${pendingH}px`;
      const text =
        mode === "width"
          ? wText
          : mode === "height"
            ? hText
            : `${wText} × ${hText}`;
      const estW = text.length * 8 + 12;
      const x =
        ev.clientX + 14 + estW > window.innerWidth
          ? ev.clientX - 14 - estW
          : ev.clientX + 14;
      setBadge({ x, y: ev.clientY + 14, text });
    };

    // Remove exactly the listeners that were added (each addEventListener ↔ one
    // removeEventListener), reset cursor + drag flag. Shared by mouse release and
    // unmounting mid-drag.
    const cleanup = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      abortDragRef.current = null;
      setBodyStyle("", "");
      isDragging.current = false;
    };

    const onMouseUp = () => {
      cleanup();
      setBadge(null);
      setGhost(null);

      // Width commit — 2 sources, each with a different role:
      //  1. wrapper.style.width + the table attr `style: width:%` = the table's REAL width
      //     (the attr persists on HTML export; applyStoredStyles re-applies it to the
      //     wrapper on load). AlignableTableView forces table.style.width=100%, so the
      //     wrapper is where the % is held.
      //  2. colwidth (px) = only to keep the column RATIO; normalizeColWidths converts
      //     px→% on every update. Floor ≥1 so no column drops to 0 (0 makes normalize bail
      //     → the whole table stays stuck at the old px).
      if (doWidth) {
        const container = wrapper.parentElement?.clientWidth ?? 0;
        const widthVal = widthValue(pendingW, container);
        wrapper.style.width = widthVal;
        const scaled = scaleColWidths(startColPx, pendingW, sumColPx);
        editor
          .chain()
          .focus()
          .updateAttributes("table", { style: `width: ${widthVal}` })
          .run();
        if (scaled) setColumnWidths(editor, scaled);
      }

      // Height → add the change to the last row, commit into the row node (-1).
      if (doHeight && lastRow) {
        const finalRowH = finalRowHeight(startRowH, pendingH, startH, minRowH);
        setRowHeight(editor, -1, `${finalRowH}px`);
      }

      // Restore focus + selection to its old spot (inside the table) so the handle doesn't
      // disappear after the drag. Clamp in case the doc changed size.
      const pos = Math.min(savedFrom, editor.state.doc.content.size);
      editor.chain().focus().setTextSelection(pos).run();
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    // Unmount mid-drag → cleanup (remove listeners, don't commit since the selection is gone).
    abortDragRef.current = cleanup;
  };

  if (!inTable || !wrapperEl || !box) return null;

  // A solid blue square at each edge/corner (like TinyMCE), no icon.
  const handleClass = cn(
    "ttp-table-resize-handle absolute size-2.5 rounded-[2px] bg-primary border border-background shadow-sm",
    className,
  );
  // Handle positions along the box edges (left/top px within the wrapper).
  const cxPos = {
    l: box.left,
    c: box.left + box.width / 2,
    r: box.left + box.width,
  };
  const cyPos = {
    t: box.top,
    m: box.top + box.height / 2,
    b: box.top + box.height,
  };

  return (
    <>
      {badge && (
        <div
          style={{
            position: "fixed",
            left: badge.x,
            top: badge.y,
            zIndex: 60,
            pointerEvents: "none",
          }}
          className="ttp-table-resize-handle__badge rounded bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground shadow"
        >
          {badge.text}
        </div>
      )}

      {createPortal(
        <>
          {/* Outline around the selected table — anchored to the real table box. */}
          <div
            className="ttp-table-resize-handle__outline pointer-events-none absolute z-20 border-2 border-primary"
            style={{
              left: box.left,
              top: box.top,
              width: box.width,
              height: box.height,
            }}
          />
          {HANDLES.map(({ key, mode, sx, sy, cursor, z, cx, cy }) => (
            <div
              key={key}
              onMouseDown={(e) => startDrag(e, mode, sx, sy, cursor)}
              style={{
                left: cxPos[cx],
                top: cyPos[cy],
                transform: "translate(-50%, -50%)",
                zIndex: z,
                cursor,
              }}
              className={handleClass}
            />
          ))}
          {ghost && (
            // Ghost table: an outline frame w×h + a column/row grid, overlaid on the real table.
            <div
              className="ttp-table-resize-handle__ghost pointer-events-none absolute z-30 border-2 border-blue-500 bg-blue-500/5"
              style={{
                left: ghost.left,
                top: ghost.top,
                width: ghost.w,
                height: ghost.h,
              }}
            >
              {ghost.cols.map((rt, i) => (
                <div
                  key={`c${i}`}
                  className="absolute top-0 bottom-0 w-px bg-blue-500/50"
                  style={{ left: rt * ghost.w }}
                />
              ))}
              {ghost.rows.map((py, i) => (
                <div
                  key={`r${i}`}
                  className="absolute left-0 right-0 h-px bg-blue-500/50"
                  style={{ top: py }}
                />
              ))}
            </div>
          )}
        </>,
        wrapperEl,
      )}
    </>
  );
}
