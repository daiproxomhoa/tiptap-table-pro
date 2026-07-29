import type { Editor } from "@tiptap/react";
import { TableMap } from "@tiptap/pm/tables";

export const isValidHex = (value: string) => /^#[0-9a-fA-F]{6}$/.test(value);

/** Set cursor + userSelect on the body while dragging to resize (a helper outside the
 * component to avoid the react-hooks/immutability rule falsely flagging a mutation in the
 * render path).
 *
 * `body { cursor }` alone loses to any descendant with its own cursor (ProseMirror text,
 * buttons…) as the pointer sweeps over them, so while dragging we also inject a
 * `* { cursor: … !important }` rule to keep the resize cursor across the whole screen.
 * Pass an empty cursor to remove the rule again. */
let dragCursorStyleEl: HTMLStyleElement | null = null;

export function setBodyStyle(cursor: string, userSelect: string) {
  document.body.style.cursor = cursor;
  document.body.style.userSelect = userSelect;
  if (cursor) {
    if (!dragCursorStyleEl) {
      dragCursorStyleEl = document.createElement("style");
      document.head.appendChild(dragCursorStyleEl);
    }
    dragCursorStyleEl.textContent = `* { cursor: ${cursor} !important; }`;
  } else {
    dragCursorStyleEl?.remove();
    dragCursorStyleEl = null;
  }
}

/** The DOM <table> containing the current selection (not the first table in the editor). */
export function focusedTableEl(editor: Editor): HTMLElement | null {
  const { $anchor } = editor.state.selection;
  for (let d = $anchor.depth; d > 0; d--) {
    if ($anchor.node(d).type.name === "table") {
      const pos = $anchor.before(d);
      const dom = editor.view.nodeDOM(pos) as HTMLElement | null;
      if (!dom) return null;
      return dom.tagName === "TABLE" ? dom : dom.querySelector("table");
    }
  }
  return null;
}

/** Position of the table node containing the cursor (null if not inside a table). */
function tablePos(editor: Editor): number | null {
  const { $from } = editor.state.selection;
  for (let d = $from.depth; d > 0; d--) {
    if ($from.node(d).type.name === "table") return $from.before(d);
  }
  return null;
}

const isCell = (name: string) => name === "tableCell" || name === "tableHeader";

/**
 * Write the height for row `rowIndex` (0-based) of the table containing the cursor. Walk
 * the table node to get the row position → not relying on posAtDOM (which used to make
 * the commit not take effect). `rowIndex = -1` means the last row. Returns true if set.
 */
export function setRowHeight(
  editor: Editor,
  rowIndex: number,
  height: string,
): boolean {
  const tPos = tablePos(editor);
  if (tPos === null) return false;
  const table = editor.state.doc.nodeAt(tPos);
  if (!table) return false;

  const rowCount = table.childCount;
  const target = rowIndex < 0 ? rowCount - 1 : rowIndex;
  if (target < 0 || target >= rowCount) return false;

  // Absolute position of the row: tPos + 1 (entering the table) + total nodeSize of the preceding rows.
  let rowPos = tPos + 1;
  for (let i = 0; i < target; i++) rowPos += table.child(i).nodeSize;

  editor
    .chain()
    .focus()
    .command(({ tr }) => {
      tr.setNodeAttribute(rowPos, "height", height);
      return true;
    })
    .run();
  return true;
}

/** The `key` attr of the first cell in the table containing the cursor (null if absent). */
export function firstCellAttr(editor: Editor, key: string): string | null {
  const pos = tablePos(editor);
  if (pos === null) return null;
  const table = editor.state.doc.nodeAt(pos);
  let found: string | null = null;
  table?.descendants((child) => {
    if (found === null && isCell(child.type.name)) {
      found = (child.attrs[key] as string | null) ?? null;
      return false;
    }
    return true;
  });
  return found;
}

/** The borderColor of the first cell in the table containing the cursor. */
export const firstCellBorderColor = (editor: Editor) =>
  firstCellAttr(editor, "borderColor");

/** Write multiple attrs onto every cell of the table containing the cursor. Borders are a
 * per-cell attr, so both the editor and the export output (renderHTML) use them correctly. */
export function setAllCellsAttrs(
  editor: Editor,
  attrs: Record<string, string | null>,
): boolean {
  return editor
    .chain()
    .focus()
    .command(({ tr, state }) => {
      const pos = tablePos(editor);
      if (pos === null) return false;
      const table = state.doc.nodeAt(pos);
      table?.descendants((child, offset) => {
        if (isCell(child.type.name)) {
          for (const [key, value] of Object.entries(attrs)) {
            tr.setNodeAttribute(pos + 1 + offset, key, value);
          }
        }
        return true;
      });
      return true;
    })
    .run();
}

/** Write borderColor onto every cell (kept as the old API for the hide-border toggle). */
export const setAllCellsBorderColor = (
  editor: Editor,
  color: string | null,
) => setAllCellsAttrs(editor, { borderColor: color });

/**
 * Write colwidth for the columns of the table containing the cursor from the `widths`
 * array (px, index = column number). Uses TableMap to locate each column's cell (handling
 * colspan/rowspan correctly — logic based on prosemirror-tables updateColumnWidth). Sets
 * the whole array so cells without a colwidth (null) get seeded with their real width
 * instead of shrinking to 0.
 */
export function setColumnWidths(editor: Editor, widths: number[]): boolean {
  const tPos = tablePos(editor);
  if (tPos === null) return false;
  const table = editor.state.doc.nodeAt(tPos);
  if (!table) return false;

  const map = TableMap.get(table);
  const start = tPos + 1; // start of the table content (before the first cell)
  const tr = editor.state.tr;
  const seen = new Set<number>();

  for (let col = 0; col < map.width && col < widths.length; col++) {
    for (let row = 0; row < map.height; row++) {
      const mapIndex = row * map.width + col;
      // Cell spanning multiple rows (rowspan): handle only once.
      if (row && map.map[mapIndex] === map.map[mapIndex - map.width]) continue;
      const pos = map.map[mapIndex];
      if (seen.has(pos)) continue;
      seen.add(pos);
      const cell = table.nodeAt(pos);
      if (!cell) continue;
      const colspan = (cell.attrs.colspan as number) ?? 1;
      const index = colspan === 1 ? 0 : col - map.colCount(pos);
      const colwidth = cell.attrs.colwidth
        ? (cell.attrs.colwidth as number[]).slice()
        : Array<number>(colspan).fill(0);
      if (colwidth[index] === widths[col]) continue;
      colwidth[index] = widths[col];
      tr.setNodeMarkup(start + pos, undefined, { ...cell.attrs, colwidth });
    }
  }

  if (!tr.docChanged) return false;
  editor.view.dispatch(tr);
  return true;
}
