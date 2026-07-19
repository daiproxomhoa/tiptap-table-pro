# Core extensions

The headless layer: TipTap node extensions with no React UI. Import from
`tiptap-table-pro/core` — it pulls in no React components, Radix, or Tailwind.

```ts
import {
  AlignableTableView,
  TableWithStyle,
  TableRowWithHeight,
  TableCellWithAttrs,
  TableHeaderWithAttrs,
  LinkWithStyle,
  blockLinkNav,
  withStyle,
  TABLE_STYLE,
  CELL_STYLE,
  HEADER_STYLE,
  BORDER_COLOR,
  LINK_STYLE,
} from "tiptap-table-pro/core";
```

## What each export is

| Export | Type | Purpose |
|---|---|---|
| `TableWithStyle` | Node | The `table` node. Emits inline `border-collapse` styling, supports an `align` attribute, and seeds/normalizes column widths to percentages. |
| `TableCellWithAttrs` | Node | The `tableCell` node with extra attributes (see below). |
| `TableHeaderWithAttrs` | Node | The `tableHeader` node with the same extra attributes + bold styling. |
| `TableRowWithHeight` | Node | The `tableRow` node with a `height` attribute. |
| `AlignableTableView` | NodeView | Renders the table DOM, applies alignment, and converts column px widths to percentages so the table stays fluid. Pass it as `View`. |
| `LinkWithStyle` | Mark | A `link` mark that bakes color + underline into inline styles. |
| `blockLinkNav` | fn | DOM event handler that suppresses link navigation while editing (Ctrl/Cmd-click still opens). |
| `withStyle` | fn | Helper to prepend fixed inline styles to a node's HTML attributes. |
| `TABLE_STYLE` … `LINK_STYLE` | string | The exact inline-style constants used when serializing, in case you render HTML yourself. |

## Registering

Disable TipTap's built-in table nodes so the styled ones take over, and pass the
custom `View`:

```tsx
import { useEditor } from "@tiptap/react";
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
  content: "<p>Hello</p>",
});
```

> Pass `resizable: false` — resizing is handled by the UI resize-handle
> components (see [Resize handles](./resize-handles.md)), not by
> prosemirror-tables' built-in column resizing.

## Commands

All standard prosemirror-tables commands work unchanged:

```ts
editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
editor.chain().focus().addRowAfter().run();
editor.chain().focus().addColumnBefore().run();
editor.chain().focus().mergeCells().run();
editor.chain().focus().splitCell().run();
editor.chain().focus().deleteTable().run();
```

## Node attributes

These are the extra attributes the styled nodes add on top of the defaults.

`TableWithStyle`
: `align` — `"left"` (default) | `"center"` | `"right"`. Serialized as `data-align`.

`TableRowWithHeight`
: `height` — e.g. `"34px"`. Serialized inline.

`TableCellWithAttrs` / `TableHeaderWithAttrs`
: `backgroundColor`, `borderColor`, `borderWidth`, `borderStyle`, `textAlign`,
`verticalAlign`, `scope` — each serialized as the matching inline CSS/attribute.

Because every attribute is serialized inline, `editor.getHTML()` produces
self-contained markup that renders the same in a browser, a PDF export, or an
email — no external stylesheet required.

## Links (optional)

If you want the styled link behavior, register the link mark and wire the
navigation guard:

```tsx
import { LinkWithStyle, blockLinkNav } from "tiptap-table-pro/core";

useEditor({
  extensions: [/* … */ LinkWithStyle.configure({ openOnClick: false })],
  editorProps: {
    handleDOMEvents: { mousedown: blockLinkNav, click: blockLinkNav, auxclick: blockLinkNav },
  },
});
```
