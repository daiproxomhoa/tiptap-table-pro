import { useState, useEffect } from "react";
import type { Editor } from "@tiptap/react";
import { focusedTableEl } from "../utils";

/** The nearest ancestor element that establishes a containing block
 * (position != static), used as the reference for absolute positioning — this
 * is the outer editor scroll container. */
function positionedAncestor(el: HTMLElement): HTMLElement | null {
  let p = el.parentElement;
  while (p) {
    if (getComputedStyle(p).position !== "static") return p;
    p = p.parentElement;
  }
  return null;
}

// below: not enough room above (the table is near the top edge of the container) → flip the menu down
// below the bottom of the table. y = top of the table, bottom = bottom of the table (coordinates within the container).
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
      // Coordinates are absolute relative to the editor scroll container (the containing block), not the
      // viewport — so the menu scrolls with the content and is naturally clipped by the scroll container.
      const host = positionedAncestor(editor.view.dom);
      const r = table.getBoundingClientRect();
      const base = host?.getBoundingClientRect();
      const ox = host ? r.left - base!.left + host.scrollLeft : r.left;
      const oy = host ? r.top - base!.top + host.scrollTop : r.top;
      // The empty space above the top of the table within the container's visible area; if there
      // isn't enough room for the menu (~44px) → flip the menu below the top edge of the table.
      const spaceAbove = host ? r.top - base!.top : r.top;
      setPos({
        x: ox + r.width / 2,
        y: oy,
        bottom: oy + r.height,
        below: spaceAbove < 44,
      });
    };

    // rAF: wait for the layout to settle on the first focus before reading the rect
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
