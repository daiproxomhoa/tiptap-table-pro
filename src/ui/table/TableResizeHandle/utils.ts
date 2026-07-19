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
 * Bề rộng min-content THẬT của bảng = tổng min-content từng cột. Phép đo hiện
 * tại (wrapper=1px rồi đọc scrollWidth) sai vì colgroup đang mang `%` +
 * `table.style.width:100%` (normalizeColWidths) → `table-layout:auto` tính
 * min-content méo theo tỉ lệ %, không theo nội dung. Ở đây tạm gỡ colgroup
 * width + ép `table.style.width = min-content` (nếu chỉ clear width, bảng auto
 * sẽ GIÃN đầy wrapper → scrollWidth = full width chứ không phải min-content),
 * đọc `getBoundingClientRect().width`, rồi khôi phục nguyên trạng. Thuần DOM,
 * không đụng node/state.
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
  // Đọc width ép reflow đồng bộ ngay tại đây.
  const min = Math.ceil(table.getBoundingClientRect().width);

  cols.forEach((c, i) => (c.style.width = prevCol[i]));
  table.style.width = prevTableW;
  table.style.minWidth = prevTableMinW;
  table.style.tableLayout = prevLayout;
  return min;
}
