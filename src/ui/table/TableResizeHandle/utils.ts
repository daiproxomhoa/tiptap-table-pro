import type { Editor } from "@tiptap/react";

export function applyStoredStyles(editor: Editor) {
  editor.view.state.doc.descendants((node, pos) => {
    if (node.type.name !== "table") return;
    const wrapper = editor.view.nodeDOM(pos) as HTMLElement | null;
    if (!wrapper) return;
    const style = (node.attrs.style as string | null) ?? "";
    const widthMatch = style.match(/width:\s*([^;]+)/);
    wrapper.style.width = widthMatch ? widthMatch[1].trim() : "";
  });
}

/**
 * The table's REAL min-content width = the sum of each column's min-content. The current
 * measurement (wrapper=1px then read scrollWidth) is wrong because the colgroup carries
 * `%` + `table.style.width:100%` (normalizeColWidths) → `table-layout:auto` computes
 * min-content skewed by the % ratio rather than by content. Here we temporarily remove
 * the colgroup width + force `table.style.width = min-content` (if we only clear the
 * width, the auto table EXPANDS to fill the wrapper → scrollWidth = full width, not
 * min-content), read `getBoundingClientRect().width`, then restore everything. Pure DOM,
 * no node/state changes.
 */
export function tableMinContentWidth(table: HTMLElement): number {
  const cols = Array.from(
    table.querySelectorAll(":scope > colgroup > col"),
  ) as HTMLElement[];
  const prevCol = cols.map((c) => c.style.width);
  const prevTableW = table.style.width;
  const prevTableMinW = table.style.minWidth;
  const prevLayout = table.style.tableLayout;

  cols.forEach((c) => (c.style.width = ""));
  table.style.minWidth = "0";
  table.style.width = "min-content";
  table.style.tableLayout = "auto";
  // Reading the width forces a synchronous reflow right here.
  const min = Math.ceil(table.getBoundingClientRect().width);

  cols.forEach((c, i) => (c.style.width = prevCol[i]));
  table.style.width = prevTableW;
  table.style.minWidth = prevTableMinW;
  table.style.tableLayout = prevLayout;
  return min;
}
