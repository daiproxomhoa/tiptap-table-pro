import { useState, useEffect } from "react";
import type { Editor } from "@tiptap/react";
import { focusedTableEl } from "../utils";

/** Phần tử tổ tiên gần nhất tạo containing block (position != static) để định
 * vị absolute theo nó — chính là khung cuộn editor bọc ngoài. */
function positionedAncestor(el: HTMLElement): HTMLElement | null {
  let p = el.parentElement;
  while (p) {
    if (getComputedStyle(p).position !== "static") return p;
    p = p.parentElement;
  }
  return null;
}

// below: không đủ chỗ phía trên (bảng sát mép trên khung) → lật menu xuống
// dưới đáy bảng (bottom). y = top bảng, bottom = đáy bảng (toạ độ trong khung).
export function useTableMenuPosition(editor: Editor, inTable: boolean) {
  const [pos, setPos] = useState<{
    x: number;
    y: number;
    bottom: number;
    below: boolean;
  } | null>(null);

  useEffect(() => {
    if (!inTable) return;

    const updatePos = () => {
      const table = focusedTableEl(editor);
      if (!table) return;
      // Toạ độ absolute so với khung cuộn editor (containing block), không phải
      // viewport — menu cuộn cùng nội dung và bị khung cuộn cắt tự nhiên.
      const host = positionedAncestor(editor.view.dom);
      const r = table.getBoundingClientRect();
      const base = host?.getBoundingClientRect();
      const ox = host ? r.left - base!.left + host.scrollLeft : r.left;
      const oy = host ? r.top - base!.top + host.scrollTop : r.top;
      // Khoảng trống phía trên top bảng trong vùng nhìn thấy của khung; thiếu
      // chỗ cho menu (~44px) → lật menu xuống dưới mép trên bảng.
      const spaceAbove = host ? r.top - base!.top : r.top;
      setPos({
        x: ox + r.width / 2,
        y: oy,
        bottom: oy + r.height,
        below: spaceAbove < 44,
      });
    };

    // rAF: chờ layout settle ở lần focus đầu trước khi đọc rect
    const raf = requestAnimationFrame(updatePos);
    editor.on("selectionUpdate", updatePos);
    editor.on("update", updatePos);
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      cancelAnimationFrame(raf);
      editor.off("selectionUpdate", updatePos);
      editor.off("update", updatePos);
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [inTable, editor]);

  return pos;
}
