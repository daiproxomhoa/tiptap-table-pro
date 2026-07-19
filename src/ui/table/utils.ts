import type { Editor } from "@tiptap/react";
import { TableMap } from "@tiptap/pm/tables";

export const isValidHex = (value: string) => /^#[0-9a-fA-F]{6}$/.test(value);

/** Đặt cursor + userSelect trên body khi kéo resize (helper ngoài component để
 * tránh rule react-hooks/immutability báo nhầm khi mutate trong render path). */
export function setBodyStyle(cursor: string, userSelect: string) {
  document.body.style.cursor = cursor;
  document.body.style.userSelect = userSelect;
}

/** DOM <table> chứa selection hiện tại (không phải table đầu tiên trong editor). */
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

/** Vị trí node table chứa con trỏ (null nếu không trong table). */
function tablePos(editor: Editor): number | null {
  const { $from } = editor.state.selection;
  for (let d = $from.depth; d > 0; d--) {
    if ($from.node(d).type.name === "table") return $from.before(d);
  }
  return null;
}

const isCell = (name: string) => name === "tableCell" || name === "tableHeader";

/**
 * Ghi height cho hàng thứ `rowIndex` (0-based) của bảng chứa con trỏ. Duyệt
 * node table để lấy vị trí row → không phụ thuộc posAtDOM (từng khiến commit
 * không ăn). `rowIndex = -1` nghĩa hàng cuối. Trả true nếu đã set.
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

  // Vị trí tuyệt đối của row: tPos + 1 (vào trong table) + tổng nodeSize các row trước.
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

/** Attr `key` của ô đầu tiên trong table chứa con trỏ (null nếu không có). */
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

/** borderColor của ô đầu tiên trong table chứa con trỏ. */
export const firstCellBorderColor = (editor: Editor) =>
  firstCellAttr(editor, "borderColor");

/** Ghi nhiều attr lên mọi ô của table chứa con trỏ. Viền là attr từng ô nên
 * cả editor lẫn nguồn export (renderHTML) đều dùng đúng. */
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

/** Ghi borderColor lên mọi ô (giữ API cũ cho toggle ẩn viền). */
export const setAllCellsBorderColor = (
  editor: Editor,
  color: string | null,
) => setAllCellsAttrs(editor, { borderColor: color });

/**
 * Ghi colwidth cho các cột của bảng chứa con trỏ theo mảng `widths` (px, index
 * = số thứ tự cột). Dùng TableMap để định vị cell mỗi cột (xử colspan/rowspan
 * đúng — logic theo prosemirror-tables updateColumnWidth). Set cả mảng để cell
 * chưa có colwidth (null) được seed bằng width thật, không co về 0.
 */
export function setColumnWidths(editor: Editor, widths: number[]): boolean {
  const tPos = tablePos(editor);
  if (tPos === null) return false;
  const table = editor.state.doc.nodeAt(tPos);
  if (!table) return false;

  const map = TableMap.get(table);
  const start = tPos + 1; // đầu content table (trước cell đầu)
  const tr = editor.state.tr;
  const seen = new Set<number>();

  for (let col = 0; col < map.width && col < widths.length; col++) {
    for (let row = 0; row < map.height; row++) {
      const mapIndex = row * map.width + col;
      // Cell trải nhiều hàng (rowspan): chỉ xử 1 lần.
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
