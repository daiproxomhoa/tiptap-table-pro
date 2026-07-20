/**
 * Full working example: a TipTap editor wired up with tiptap-ui-pro's
 * styled table extensions and the complete editing UI.
 *
 * This file is illustrative (not built or published). Copy it into a React +
 * Tailwind (shadcn tokens) app that has the peer dependencies installed:
 *
 *   npm install tiptap-ui-pro react react-dom \
 *     @tiptap/core @tiptap/react @tiptap/pm \
 *     @tiptap/extension-table @tiptap/extension-link @tiptap/starter-kit
 */
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TableKit } from "@tiptap/extension-table";
import {
  // core (headless) extensions
  AlignableTableView,
  TableWithStyle,
  TableRowWithHeight,
  TableCellWithAttrs,
  TableHeaderWithAttrs,
  LinkWithStyle,
  // React UI
  TablePicker,
  TableBubbleMenu,
  TableContextMenu,
  TableResizeHandle,
  RowResizeHandle,
} from "tiptap-ui-pro";

const INITIAL = `
  <table style="width:100%;border-collapse:collapse">
    <tbody>
      <tr><th>Name</th><th>Score</th></tr>
      <tr><td>Alice</td><td>95</td></tr>
      <tr><td>Bob</td><td>88</td></tr>
    </tbody>
  </table>
`;

export function FullEditor() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      LinkWithStyle.configure({ openOnClick: false }),
      // Disable TableKit's built-in nodes; the styled ones replace them.
      TableKit.configure({
        table: false,
        tableRow: false,
        tableCell: false,
        tableHeader: false,
      }),
      TableWithStyle.configure({ resizable: false, View: AlignableTableView }),
      TableRowWithHeight,
      TableCellWithAttrs,
      TableHeaderWithAttrs,
    ],
    content: INITIAL,
  });

  if (!editor) return null;

  return (
    <div className="space-y-2">
      <TablePicker editor={editor} />
      <TableContextMenu editor={editor}>
        <div className="relative rounded border p-3">
          <TableBubbleMenu editor={editor} />
          <TableResizeHandle editor={editor} />
          <RowResizeHandle editor={editor} />
          <EditorContent editor={editor} />
        </div>
      </TableContextMenu>
    </div>
  );
}
