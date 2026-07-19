# tiptap-table-pro

[![npm version](https://img.shields.io/npm/v/tiptap-table-pro.svg)](https://www.npmjs.com/package/tiptap-table-pro)
[![license](https://img.shields.io/npm/l/tiptap-table-pro.svg)](./LICENSE)
[![types](https://img.shields.io/npm/types/tiptap-table-pro.svg)](./dist/index.d.ts)

A production-grade table toolkit for [TipTap 3](https://tiptap.dev) / ProseMirror. It ships the styled, resizable table **node extensions** and a complete, drop-in **React editing UI** — so you can add spreadsheet-like tables to any rich-text editor without building the interaction layer yourself.

Tables authored with `tiptap-table-pro` carry their formatting as inline styles, which means the HTML you get from `editor.getHTML()` renders identically everywhere — in the browser, in a PDF export, in an email, or anywhere else, with no accompanying stylesheet required.

---

## Highlights

- **Styled output, portable HTML.** Borders, background colors, alignment, row heights and column widths are serialized as inline styles on the emitted markup. No external CSS needed to render a table faithfully.
- **Full column / row / table resizing.** Drag column boundaries, drag a row's bottom edge, or grab the table's corner and edge handles to resize the whole table. Column widths are normalized to percentages so tables stay fluid.
- **Rich editing UI, batteries included.** A grid size picker, a contextual bubble toolbar, a right-click context menu (insert/delete rows & columns, merge/split cells, sort, cell & table properties), a cell background color picker, and a link dialog.
- **Per-cell styling.** Background color, border color / width / style, text and vertical alignment, and header scope are first-class cell attributes.
- **Two layers, cleanly separated.** A headless `core` entry (extensions only) and a full entry that adds the React UI. Use whichever you need.
- **Customizable.** Every component exposes configuration props (color palettes, grid size, header behavior, …) and stable `ttp-*` CSS classes plus a `className` prop on each root.
- **Localizable.** All UI strings can be overridden through a lightweight provider.
- **Fully typed.** Ships ESM + CJS builds and complete TypeScript declarations.

## Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Package layout](#package-layout)
- [Quick start — the extensions](#quick-start--the-extensions)
- [Adding the editing UI](#adding-the-editing-ui)
- [Feature reference](#feature-reference)
- [Styling requirement for the UI](#styling-requirement-for-the-ui)
- [Customization](#customization)
- [Localization](#localization)
- [API](#api)
- [Publishing](#publishing)
- [License](#license)

## Requirements

`tiptap-table-pro` treats React and the TipTap framework as **peer dependencies** so it always reuses the single copy already in your app (installing a second copy of React or ProseMirror would break the editor). You only need to have these installed:

| Peer | Supported range |
|---|---|
| `react` / `react-dom` | 18 or 19 |
| `@tiptap/core`, `@tiptap/react`, `@tiptap/pm` | 3.x |

Any TipTap 3 app already satisfies these. Everything else the library needs is a regular **dependency**, installed automatically with the package, so a missing dependency cannot break it. To keep that footprint small the UI ships its own inline SVG icons and class helpers (no `lucide-react`, `clsx`, `class-variance-authority` or `tailwind-merge`); the only third-party UI runtime dependency is **Radix UI** (for accessible dialog / dropdown / popover / select / tooltip primitives). The headless `core` entry has **zero** non-TipTap dependencies.

The React UI additionally expects **Tailwind CSS** with shadcn/ui design tokens — see [Styling requirement](#styling-requirement-for-the-ui). The headless `core` entry has no styling dependency.

## Installation

```bash
npm install tiptap-table-pro
```

Install the peers if your project does not already have them (a TipTap 3 app normally does):

```bash
npm install react react-dom @tiptap/core @tiptap/react @tiptap/pm
```

## Package layout

The package exposes two entry points:

```ts
// Headless — node extensions only. No React, Radix, or Tailwind pulled in.
import { TableWithStyle, AlignableTableView } from "tiptap-table-pro/core";

// Full — everything in /core, plus the React editing UI.
import { TableBubbleMenu, TableContextMenu } from "tiptap-table-pro";
```

Reach for `tiptap-table-pro/core` when you are building your own interface and only need the schema and behavior. Reach for the root import when you want the ready-made editing experience.

## Quick start — the extensions

Register the extensions and disable TipTap's built-in table nodes so the styled versions take their place:

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
    // Disable TableKit's default nodes; the styled ones replace them.
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

All standard prosemirror-tables commands continue to work unchanged — for example:

```ts
editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
editor.chain().focus().addColumnAfter().run();
editor.chain().focus().mergeCells().run();
```

Cells simply carry the additional styling attributes described in [API](#api).

## Adding the editing UI

Each UI component receives the `editor` instance. A typical full setup wraps the editor content in the context menu and layers the toolbars and resize handles on top:

```tsx
import { EditorContent } from "@tiptap/react";
import {
  TablePicker,       // toolbar button + grid to insert a table
  TableBubbleMenu,   // floating toolbar shown over the active table
  TableContextMenu,  // right-click menu; wraps the editor content
  TableResizeHandle, // corner/edge handles to resize the whole table
  RowResizeHandle,   // drag a row's bottom edge to set its height
  ColResizeHandle,   // drag a boundary between columns to set widths
} from "tiptap-table-pro";

function TableEditor({ editor }) {
  if (!editor) return null;

  return (
    <div>
      {/* Put TablePicker anywhere in your toolbar */}
      <TablePicker editor={editor} />

      <TableContextMenu editor={editor}>
        <div className="relative">
          <TableBubbleMenu editor={editor} />
          <TableResizeHandle editor={editor} />
          <RowResizeHandle editor={editor} />
          <ColResizeHandle editor={editor} />
          <EditorContent editor={editor} />
        </div>
      </TableContextMenu>
    </div>
  );
}
```

A complete, copy-pasteable component lives in [`examples/FullEditor.tsx`](./examples/FullEditor.tsx).

## Feature reference

| Component | What it does |
|---|---|
| `TablePicker` | A toolbar toggle that opens a hover grid to insert a table of a chosen size. Configurable dimensions and header-row behavior. |
| `TableBubbleMenu` | A floating toolbar that appears over the selected table with quick actions: add/remove rows & columns, merge/split cells, toggle borders, align the table, and delete it. |
| `TableContextMenu` | A right-click menu inside tables: insert/delete rows & columns, merge/split cells, sort by column (with an advanced sort dialog), set the cell background, open cell and table property dialogs, and delete the table. |
| `TableResizeHandle` | Corner and edge handles around the active table for resizing the whole table, with a live size badge and ghost outline while dragging. |
| `RowResizeHandle` | A thin handle at each row's bottom edge; drag to set that row's height, with a live guide line. |
| `ColResizeHandle` | A handle on each interior column boundary; drag to redistribute width between the two adjacent columns while keeping the total constant. |
| `TableCellColorPicker` | A palette of preset swatches plus a custom hex input for setting or clearing a cell's background. |
| `LinkDialog` | A dialog to insert or edit a link (URL, display text, title, and target window). |

## Styling requirement for the UI

The React UI is built with Tailwind utility classes and shadcn/ui design tokens (`bg-background`, `text-destructive`, `border-input`, and so on). To render it correctly, your app must have **Tailwind CSS** configured with the standard shadcn CSS variables (`--background`, `--foreground`, `--primary`, `--destructive`, `--border`, `--ring`, …).

This applies only to the React UI. The headless `core` entry outputs plain, inline-styled HTML and requires no Tailwind or design tokens.

## Customization

Every public component can be tailored in two complementary ways.

### Configuration props

```tsx
<TablePicker
  editor={editor}
  maxRows={6}           // grid rows offered in the picker (default 8)
  maxCols={6}           // grid columns offered (default 10)
  withHeaderRow={false} // inserted tables get no header row (default true)
/>

<TableContextMenu
  editor={editor}
  cellColors={["#ffffff", "#fee2e2", "#dcfce7", "#dbeafe"]} // swatches in the cell-background submenu
>
  {/* editor content */}
</TableContextMenu>

<TableCellColorPicker
  editor={editor}
  onClose={close}
  presetColors={myPalette} // string[] of hex colors
  presetColumns={6}        // swatches per row (default 8)
  showCustomInput={false}  // hide the hex input (default shown)
  showClearButton={false}  // hide the "clear background" button (default shown)
/>
```

### CSS classes

Each component renders stable, namespaced `ttp-*` classes on its parts, and accepts an optional `className` merged onto its root (or most relevant) element. This lets you restyle any piece with ordinary CSS, no `!important` needed.

| Component | Root class | Notable part classes |
|---|---|---|
| `TablePicker` | `ttp-table-picker` (trigger) | `__content`, `__hint`, `__grid`, `__cell`, `__cell--active` |
| `TableBubbleMenu` | `ttp-bubble-menu` | — |
| `TableContextMenu` | `ttp-context-menu` (popup) | `__trigger` |
| `TableCellColorPicker` | `ttp-cell-color-picker` | `__presets`, `__swatch`, `__custom`, `__clear` |
| `TableResizeHandle` | `ttp-table-resize-handle` (handles) | `__badge`, `__outline`, `__ghost` |
| `RowResizeHandle` | `ttp-row-resize-handle` | `__bar`, `__guide` |
| `ColResizeHandle` | `ttp-col-resize-handle` | `__bar`, `__guide` |
| `LinkDialog` | `ttp-link-dialog` (content) | — |

```css
/* Recolor the resize affordances and round the bubble toolbar */
.ttp-table-resize-handle { background: #e11d48; }
.ttp-row-resize-handle__bar,
.ttp-col-resize-handle__bar { background: #e11d48; }
.ttp-bubble-menu { border-radius: 12px; box-shadow: 0 8px 24px rgb(0 0 0 / 0.12); }
```

```tsx
// Or pass className directly
<TableBubbleMenu editor={editor} className="my-bubble-menu" />
```

## Localization

UI labels default to **English**. To translate or reword them, wrap your editor in `TableIntlProvider` and supply overrides keyed by the readable message id:

```tsx
import { TableIntlProvider } from "tiptap-table-pro";

<TableIntlProvider
  messages={{
    insertTable: "Insérer un tableau",
    deleteEntireTable: "Supprimer le tableau",
    // …
  }}
>
  {/* editor + UI */}
</TableIntlProvider>;
```

Message ids are human-readable (`insertTable`, `deleteTable`, `cellProperties`, `cancel`, `save`, …). Any id you omit falls back to the built-in English default.

## API

### `tiptap-table-pro/core`

Node extensions and helpers, no React:

- `TableWithStyle`, `TableCellWithAttrs`, `TableHeaderWithAttrs`, `TableRowWithHeight` — the styled table nodes.
- `AlignableTableView` — a `NodeView` that applies table alignment and normalizes column widths to percentages.
- `LinkWithStyle`, `blockLinkNav` — an inline-styled link mark and a click handler that suppresses navigation while editing.
- `withStyle` — utility to prepend fixed inline styles to node attributes.
- Style constants: `TABLE_STYLE`, `CELL_STYLE`, `HEADER_STYLE`, `BORDER_COLOR`, `LINK_STYLE`.

**Cell attributes** added by `TableCellWithAttrs` / `TableHeaderWithAttrs`: `backgroundColor`, `borderColor`, `borderWidth`, `borderStyle`, `textAlign`, `verticalAlign`, `scope`. `TableWithStyle` adds `align` (`left` | `center` | `right`); `TableRowWithHeight` adds `height`.

### `tiptap-table-pro`

Everything above, plus the React components — `TablePicker`, `TableBubbleMenu`, `TableContextMenu`, `TableCellColorPicker`, `TableResizeHandle`, `RowResizeHandle`, `ColResizeHandle`, `LinkDialog` — and the `TableIntlProvider` for localization.

## Publishing

Maintainers: see [PUBLISHING.md](./PUBLISHING.md) for step-by-step npm release instructions.

## License

[MIT](./LICENSE)
