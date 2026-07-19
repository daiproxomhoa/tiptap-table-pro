import type { Editor } from "@tiptap/react";
import { CellSelection, TableMap } from "@tiptap/pm/tables";
import type { Node as PMNode } from "@tiptap/pm/model";

/** Current table context derived from the selection: node, start position, map, and the current cell. */
export function tableContext(editor: Editor) {
  const { state } = editor.view;
  const sel = state.selection;
  const $cell = sel instanceof CellSelection ? sel.$anchorCell : sel.$anchor;
  // Find the depth of the table node
  for (let d = $cell.depth; d > 0; d--) {
    const node = $cell.node(d);
    if (node.type.spec.tableRole === "table") {
      const tableStart = $cell.before(d) + 1; // position just inside the table
      const map = TableMap.get(node);
      // column/row of the current cell
      const cellPos = cellStartFor($cell, d);
      const rel = cellPos - tableStart;
      const rect = map.findCell(rel);
      return { table: node, tableStart, map, rect, depth: d };
    }
  }
  return null;
}

/** Position (relative to the doc) of the cell containing $pos at table depth d. */
function cellStartFor($pos: ReturnType<Editor["state"]["doc"]["resolve"]>, tableDepth: number) {
  // The cell is a child of the row (depth tableDepth+2 = cell). before(cellDepth) is the cell position.
  const cellDepth = tableDepth + 2;
  return $pos.before(Math.min(cellDepth, $pos.depth));
}

/** Get the node of a single row by index. */
export function rowNode(table: PMNode, rowIndex: number): PMNode {
  return table.child(rowIndex);
}

/** Get the list of cell nodes for a single column by index (one cell per row). */
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

/** Is the row at this index a header (every cell is a tableHeader)? */
export function isHeaderRow(table: PMNode, rowIndex: number): boolean {
  const row = table.child(rowIndex);
  let allHeader = row.childCount > 0;
  row.forEach((cell) => {
    if (cell.type.name !== "tableHeader") allHeader = false;
  });
  return allHeader;
}
