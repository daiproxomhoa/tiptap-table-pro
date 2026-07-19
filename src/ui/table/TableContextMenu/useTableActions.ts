import type { Editor } from "@tiptap/react";
import { Fragment, type Node as PMNode } from "@tiptap/pm/model";
import { tableContext, rowNode, columnCells, isHeaderRow } from "./utils";

/**
 * Table manipulation logic for the context menu. TipTap provides insert/delete
 * for rows and columns, merge/split, and setting cell attributes. Cut/Copy/Paste
 * for rows and columns and Sort are NOT built in, so they are implemented here
 * using ProseMirror transactions via TableMap.
 */

// ── Clipboard for row/column (module-level, persists for the whole editor session) ──────────
let rowClipboard: PMNode[] | null = null;
let colClipboard: PMNode[] | null = null;

export function useTableActions(editor: Editor) {
  const chain = () => editor.chain().focus();

  // ── Row ────────────────────────────────────────────────────────────────────
  const copyRow = () => {
    const ctx = tableContext(editor);
    if (!ctx) return;
    rowClipboard = [rowNode(ctx.table, ctx.rect.top).copy(rowNode(ctx.table, ctx.rect.top).content)];
  };

  const cutRow = () => {
    copyRow();
    chain().deleteRow().run();
  };

  const pasteRow = (where: "before" | "after") => {
    if (!rowClipboard) return;
    const ctx = tableContext(editor);
    if (!ctx) return;
    const { tr } = editor.state;
    const { table, tableStart, rect } = ctx;
    // Insert position: before the top row, or after the bottom row
    let insertPos = tableStart;
    const targetRow = where === "before" ? rect.top : rect.bottom;
    for (let r = 0; r < targetRow; r++) insertPos += table.child(r).nodeSize;
    const frag = Fragment.fromArray(rowClipboard.map((n) => n.copy(n.content)));
    tr.insert(insertPos, frag);
    editor.view.dispatch(tr.scrollIntoView());
    editor.view.focus();
  };

  // ── Column ───────────────────────────────────────────────────────────────────
  const copyColumn = () => {
    const ctx = tableContext(editor);
    if (!ctx) return;
    colClipboard = columnCells(ctx.table, ctx.map, ctx.rect.left).map((n) =>
      n.copy(n.content),
    );
  };

  const cutColumn = () => {
    copyColumn();
    chain().deleteColumn().run();
  };

  const pasteColumn = (where: "before" | "after") => {
    if (!colClipboard) return;
    const ctx = tableContext(editor);
    if (!ctx) return;
    const { table, map, tableStart, rect } = ctx;
    const targetCol = where === "before" ? rect.left : rect.right;
    const tr = editor.state.tr;
    // Insert each cell into every row at the correct column; process from the bottom up so positions don't shift
    for (let row = map.height - 1; row >= 0; row--) {
      const cellRel =
        targetCol < map.width
          ? map.map[row * map.width + targetCol]
          : map.map[row * map.width + map.width - 1];
      const cellNode = table.nodeAt(cellRel)!;
      const cellDocPos = tableStart + cellRel;
      const insertAt =
        where === "before" ? cellDocPos : cellDocPos + cellNode.nodeSize;
      const src = colClipboard[row % colClipboard.length];
      tr.insert(tr.mapping.map(insertAt), src.copy(src.content));
    }
    editor.view.dispatch(tr.scrollIntoView());
    editor.view.focus();
  };

  // ── Sort by the specified column (default: the column of the selected cell) ───────────────────
  const sortByColumn = (dir: "asc" | "desc", column?: number) => {
    const ctx = tableContext(editor);
    if (!ctx) return;
    const { table, map, tableStart, rect } = ctx;
    const col = column ?? rect.left;
    // Skip the header row (row 0 if it's a header) when sorting
    const firstRowIsHeader = isHeaderRow(table, 0);
    const startRow = firstRowIsHeader ? 1 : 0;

    const rows: { node: PMNode; key: string }[] = [];
    for (let r = startRow; r < map.height; r++) {
      const rel = map.map[r * map.width + col];
      const cell = table.nodeAt(rel)!;
      rows.push({ node: table.child(r), key: cell.textContent.trim() });
    }
    const collator = new Intl.Collator(undefined, {
      numeric: true,
      sensitivity: "base",
    });
    rows.sort((a, b) =>
      dir === "asc"
        ? collator.compare(a.key, b.key)
        : collator.compare(b.key, a.key),
    );

    // Reassemble: header (if any) + the sorted rows
    const newRows: PMNode[] = [];
    if (firstRowIsHeader) newRows.push(table.child(0));
    newRows.push(...rows.map((r) => r.node));

    const tr = editor.state.tr;
    const from = tableStart;
    const to = tableStart + table.content.size;
    tr.replaceWith(from, to, Fragment.fromArray(newRows));
    editor.view.dispatch(tr);
    editor.view.focus();
  };

  return {
    // Row
    addRowBefore: () => chain().addRowBefore().run(),
    addRowAfter: () => chain().addRowAfter().run(),
    deleteRow: () => chain().deleteRow().run(),
    copyRow,
    cutRow,
    pasteRowBefore: () => pasteRow("before"),
    pasteRowAfter: () => pasteRow("after"),
    canPasteRow: () => !!rowClipboard,
    // Column
    addColumnBefore: () => chain().addColumnBefore().run(),
    addColumnAfter: () => chain().addColumnAfter().run(),
    deleteColumn: () => chain().deleteColumn().run(),
    copyColumn,
    cutColumn,
    pasteColumnBefore: () => pasteColumn("before"),
    pasteColumnAfter: () => pasteColumn("after"),
    canPasteColumn: () => !!colClipboard,
    // Cell
    mergeCells: () => chain().mergeCells().run(),
    splitCell: () => chain().splitCell().run(),
    setCellAlign: (align: "left" | "center" | "right") =>
      chain().setCellAttribute("textAlign", align).run(),
    // Sort
    sortAsc: () => sortByColumn("asc"),
    sortDesc: () => sortByColumn("desc"),
    sortBy: (column: number, dir: "asc" | "desc") => sortByColumn(dir, column),
    // Table
    deleteTable: () => chain().deleteTable().run(),
  };
}
