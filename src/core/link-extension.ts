import { mergeAttributes } from "@tiptap/core";
import type { EditorView } from "@tiptap/pm/view";
import Link from "@tiptap/extension-link";
import { LINK_STYLE } from "./editor-styles";
import { withStyle } from "./utils";

// Link (mark): màu xanh + gạch chân inline để hiển thị đúng mọi nơi.
export const LinkWithStyle = Link.extend({
  renderHTML({ HTMLAttributes }) {
    return ["a", mergeAttributes(withStyle(HTMLAttributes, LINK_STYLE)), 0];
  },
});

// Trong editor (editable), chặn điều hướng khi click <a> (kể cả target=_blank),
// TRỪ khi giữ Ctrl/Cmd → chủ động mở tab mới (như trình duyệt/VSCode).
export function blockLinkNav(view: EditorView, event: Event): boolean {
  if (!view.editable) return false;
  const a = (event.target as HTMLElement).closest("a");
  if (!a) return false;
  const mod = event as MouseEvent;
  if (mod.metaKey || mod.ctrlKey) {
    // Chỉ mở 1 lần — trên click, bỏ qua mousedown/auxclick để khỏi mở 2 tab
    if (event.type === "click" && a.href)
      window.open(a.href, "_blank", "noopener,noreferrer");
  }
  event.preventDefault();
  return false;
}
