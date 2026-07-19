import type { Editor } from "@tiptap/react";
import { CellSelection, TableMap } from "@tiptap/pm/tables";
import type { Node as PMNode } from "@tiptap/pm/model";

/** Toạ độ table hiện tại từ selection: node, vị trí bắt đầu, map, ô đang ở. */
export function tableContext(editor: Editor) {
  const { state } = editor.view;
  const sel = state.selection;
  const $cell = sel instanceof CellSelection ? sel.$anchorCell : sel.$anchor;
  // Tìm depth của node table
  for (let d = $cell.depth; d > 0; d--) {
    const node = $cell.node(d);
    if (node.type.spec.tableRole === "table") {
      const tableStart = $cell.before(d) + 1; // vị trí ngay trong table
      const map = TableMap.get(node);
      // cột/hàng của ô hiện tại
      const cellPos = cellStartFor($cell, d);
      const rel = cellPos - tableStart;
      const rect = map.findCell(rel);
      return { table: node, tableStart, map, rect, depth: d };
    }
  }
  return null;
}

/** Vị trí (relative to doc) của ô chứa $pos tại depth bảng d. */
function cellStartFor($pos: ReturnType<Editor["state"]["doc"]["resolve"]>, tableDepth: number) {
  // Ô là con của row (depth tableDepth+2 = cell). before(cellDepth) là vị trí ô.
  const cellDepth = tableDepth + 2;
  return $pos.before(Math.min(cellDepth, $pos.depth));
}

/** Lấy node của 1 hàng (row) theo index. */
export function rowNode(table: PMNode, rowIndex: number): PMNode {
  return table.child(rowIndex);
}

/** Lấy danh sách cell node của 1 cột theo index (mỗi hàng 1 cell). */
export function columnCells(
  table: PMNode,
  map: TableMap,
  colIndex: number,
): PMNode[] {
  const cells: PMNode[] = [];
  const seen = new Set<number>();
  for (let row = 0; row < map.height; row++) {
    const rel = map.map[row * map.width + colIndex];
    if (seen.has(rel)) continue;
    seen.add(rel);
    cells.push(table.nodeAt(rel)!);
  }
  return cells;
}

/** Hàng index có phải header (mọi ô là tableHeader)? */
export function isHeaderRow(table: PMNode, rowIndex: number): boolean {
  const row = table.child(rowIndex);
  let allHeader = row.childCount > 0;
  row.forEach((cell) => {
    if (cell.type.name !== "tableHeader") allHeader = false;
  });
  return allHeader;
}
