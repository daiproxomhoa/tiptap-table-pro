# tiptap-table-pro

Styled, resizable [TipTap 3](https://tiptap.dev) table extensions with a complete editing UI, extracted from a production question-bank editor.

**Core (headless)** — TipTap node extensions with inline styles baked into the emitted HTML (so tables render correctly in PDF export / previews with no external CSS), per-cell border & background color, per-row height, per-column width normalized to percentages, and table alignment.

**UI (React)** — a table size picker, a bubble menu, a right-click context menu with cell/row/column operations and sorting, drag handles to resize columns / rows / the whole table, and full cell & table property dialogs.

## Install

```bash
npm install tiptap-table-pro
```

Peer dependencies (install if you don't already have them):

```bash
npm install react react-dom \
  @tiptap/core @tiptap/react @tiptap/pm \
  @tiptap/extension-table @tiptap/extension-link
```

## Two entry points

```ts
import { TableWithStyle, /* ... */ } from "tiptap-table-pro/core"; // headless only
import { TableBubbleMenu, /* ... */ } from "tiptap-table-pro";      // core + React UI
```

Use `tiptap-table-pro/core` when you only want the extensions and are building your own UI — it pulls in no React components, Radix, or Tailwind.

## Quick start (headless core)

Register the extensions and disable TipTap's built-in table nodes so ours take over:

```tsx
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TableKit } from "@tiptap/extension-table";
import {
  AlignableTableView,
  TableWithStyle,
  TableRowWithHeight,
  TableCellWithAttrs,
  TableHeaderWithAttrs,
} from "tiptap-table-pro/core";

const editor = useEditor({
  extensions: [
    StarterKit,
    // Turn off TableKit's default nodes; we replace them below.
    TableKit.configure({ table: false, tableRow: false, tableCell: false, tableHeader: false }),
    TableWithStyle.configure({ resizable: false, View: AlignableTableView }),
    TableRowWithHeight,
    TableCellWithAttrs,
    TableHeaderWithAttrs,
  ],
  content: "<p>Hello</p>",
});
```

`editor.commands.insertTable(...)` and the standard prosemirror-tables commands work as usual; cells simply carry the extra styling attributes.

## Adding the UI

The UI components each take the `editor` instance. Render them around your `<EditorContent />`:

```tsx
import {
  TablePicker,        // grid picker to insert a table
  TableBubbleMenu,    // floating toolbar over the selected table
  TableContextMenu,   // right-click menu (wraps the editor content)
  TableResizeHandle,  // drag column borders
  RowResizeHandle,    // drag row borders
  ColResizeHandle,    // alias-friendly column handle
} from "tiptap-table-pro";

function Editor({ editor }) {
  if (!editor) return null;
  return (
    <TableContextMenu editor={editor}>
      <TableBubbleMenu editor={editor} />
      <TableResizeHandle editor={editor} />
      <RowResizeHandle editor={editor} />
      <EditorContent editor={editor} />
    </TableContextMenu>
  );
}
```

### Styling requirement for the UI

The React UI is built on Tailwind utility classes and shadcn/ui design tokens
(`bg-background`, `text-destructive`, `border-input`, …). To render it correctly
your app must have **Tailwind CSS** configured with the standard shadcn CSS
variables (`--background`, `--foreground`, `--primary`, `--destructive`,
`--border`, `--ring`, etc.). The headless `core` entry has no such requirement.

### Localization

Labels default to Vietnamese. Override them by wrapping the editor in
`TableIntlProvider` and supplying replacements keyed by message id:

```tsx
import { TableIntlProvider } from "tiptap-table-pro";

<TableIntlProvider messages={{ uaTtrj: "Insert table" /* … */ }}>
  {/* editor + UI */}
</TableIntlProvider>
```

## API

`tiptap-table-pro/core`
: `TableWithStyle`, `TableCellWithAttrs`, `TableHeaderWithAttrs`, `TableRowWithHeight`, `AlignableTableView`, `LinkWithStyle`, `blockLinkNav`, `withStyle`, and the style constants (`TABLE_STYLE`, `CELL_STYLE`, `HEADER_STYLE`, `BORDER_COLOR`, `LINK_STYLE`).

`tiptap-table-pro`
: everything above plus `TablePicker`, `TableBubbleMenu`, `TableContextMenu`, `TableCellColorPicker`, `TableResizeHandle`, `RowResizeHandle`, `ColResizeHandle`, `LinkDialog`, `TableIntlProvider`.

## Publishing

See [PUBLISHING.md](./PUBLISHING.md) for step-by-step npm release instructions.

## License

MIT
