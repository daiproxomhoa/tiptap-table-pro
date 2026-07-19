import { mergeAttributes } from "@tiptap/core";
import type { EditorView } from "@tiptap/pm/view";
import Link from "@tiptap/extension-link";
import { LINK_STYLE } from "./editor-styles";
import { withStyle } from "./utils";

// Link (mark): inline blue color + underline so it renders correctly everywhere.
export const LinkWithStyle = Link.extend({
  renderHTML({ HTMLAttributes }) {
    return ["a", mergeAttributes(withStyle(HTMLAttributes, LINK_STYLE)), 0];
  },
});

// In the editor (editable), block navigation when an <a> is clicked (including target=_blank),
// EXCEPT when Ctrl/Cmd is held → deliberately open a new tab (like a browser/VSCode).
export function blockLinkNav(view: EditorView, event: Event): boolean {
  if (!view.editable) return false;
  const a = (event.target as HTMLElement).closest("a");
  if (!a) return false;
  const mod = event as MouseEvent;
  if (mod.metaKey || mod.ctrlKey) {
    // Open only once — on click, ignore mousedown/auxclick to avoid opening 2 tabs
    if (event.type === "click" && a.href)
      window.open(a.href, "_blank", "noopener,noreferrer");
  }
  event.preventDefault();
  return false;
}
