# tiptap-ui-pro

[![npm version](https://img.shields.io/npm/v/tiptap-ui-pro.svg)](https://www.npmjs.com/package/tiptap-ui-pro)
[![license](https://img.shields.io/npm/l/tiptap-ui-pro.svg)](./LICENSE)
[![types](https://img.shields.io/npm/types/tiptap-ui-pro.svg)](./dist/index.d.ts)

A production-grade UI toolkit for [TipTap 3](https://tiptap.dev) / ProseMirror. It ships styled, resizable **table** and **image** node extensions plus a complete, drop-in **React editing UI** — so you can add spreadsheet-like tables and rich image editing (align, resize, rotate/flip, adjust, caption, alt text) to any rich-text editor without building the interaction layer yourself.

Content authored with `tiptap-ui-pro` carries its formatting as inline styles, which means the HTML you get from `editor.getHTML()` renders identically everywhere — in the browser, in a PDF export, in an email, or anywhere else, with no accompanying stylesheet required.

---

## Highlights

- **Styled output, portable HTML.** Borders, background colors, alignment, row heights, column widths, and image transforms are serialized as inline styles on the emitted markup. No external CSS needed to render content faithfully.
- **Tables.** Full column / row / whole-table drag resizing (widths normalized to percentages so tables stay fluid), a grid size picker, a bubble toolbar, a right-click context menu (insert/delete rows & columns, merge/split cells, sort, cell & table properties), and a cell background color picker. Per-cell background/border/alignment attributes.
- **Images.** Drag-resize handles, plus a bubble menu to align, resize, rotate/flip, adjust (brightness/contrast/exposure/gamma/vibrance/saturation/blur), edit alt text, and add a caption (figure/figcaption).
- **Rich editing UI, batteries included** — every interaction layer is provided as React components.
- **Two layers, cleanly separated.** A headless `core` entry (extensions only) and a full entry that adds the React UI. Use whichever you need.
- **Customizable.** Every component exposes configuration props (color palettes, grid size, header behavior, …) and stable `ttp-*` CSS classes plus a `className` prop on each root.
- **Localizable.** All UI strings can be overridden through a lightweight provider.
- **Self-contained styling.** Ships its own compiled stylesheet — import one CSS file and the UI is fully styled. No Tailwind or shadcn setup required in your app.
- **Fully typed.** Ships ESM + CJS builds and complete TypeScript declarations.

## Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Package layout](#package-layout)
- [Quick start — the extensions](#quick-start--the-extensions)
- [Adding the editing UI](#adding-the-editing-ui)
- [Feature reference](#feature-reference)
- [Per-feature guides](#per-feature-guides)
- [Styling the UI](#styling-the-ui)
- [Customization](#customization)
- [Localization](#localization)
- [API](#api)
- [Publishing](#publishing)
- [License](#license)

## Requirements

`tiptap-ui-pro` treats React and the TipTap framework as **peer dependencies** so it always reuses the single copy already in your app (installing a second copy of React or ProseMirror would break the editor). You only need to have these installed:

| Peer | Supported range |
|---|---|
| `react` / `react-dom` | 18 or 19 |
| `@tiptap/core`, `@tiptap/react`, `@tiptap/pm` | 3.x |

Any TipTap 3 app already satisfies these. Everything else the library needs is a regular **dependency**, installed automatically with the package, so a missing dependency cannot break it. To keep that footprint small the UI ships its own inline SVG icons and class helpers (no `lucide-react`, `clsx`, `class-variance-authority` or `tailwind-merge`); the only third-party UI runtime dependency is **Radix UI** (for accessible dialog / dropdown / popover / select / tooltip primitives). The headless `core` entry has **zero** non-TipTap dependencies.

For the React UI, import the shipped stylesheet once (`import "tiptap-ui-pro/styles.css"`) — no Tailwind or shadcn setup needed. See [Styling the UI](#styling-the-ui). The headless `core` entry has no styling dependency at all.

## Installation

```bash
npm install tiptap-ui-pro
```

Install the peers if your project does not already have them (a TipTap 3 app normally does):

```bash
npm install react react-dom @tiptap/core @tiptap/react @tiptap/pm
```

## Package layout

The package exposes two entry points:

```ts
// Headless — node extensions only. No React, Radix, or Tailwind pulled in.
import { TableWithStyle, AlignableTableView } from "tiptap-ui-pro/core";

// Full — everything in /core, plus the React editing UI.
import { TableBubbleMenu, TableContextMenu } from "tiptap-ui-pro";
```

Reach for `tiptap-ui-pro/core` when you are building your own interface and only need the schema and behavior. Reach for the root import when you want the ready-made editing experience.

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
  ImageWithAlign,
  Figure,
  Figcaption,
} from "tiptap-ui-pro/core";

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
    // Image (align + rotate/flip/adjust + drag-resize) and caption grouping.
    ImageWithAlign.configure({ resize: { enabled: true } }),
    Figure,
    Figcaption,
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
  ImageBubbleMenu,   // floating toolbar over the selected image
  ImageResizeHandle, // drag handles to resize the selected image
} from "tiptap-ui-pro";

function Editor({ editor }) {
  if (!editor) return null;

  return (
    <div>
      {/* Put TablePicker anywhere in your toolbar */}
      <TablePicker editor={editor} />

      <TableContextMenu editor={editor}>
        <div className="relative">
          {/* table UI */}
          <TableBubbleMenu editor={editor} />
          <TableResizeHandle editor={editor} />
          <RowResizeHandle editor={editor} />
          <ColResizeHandle editor={editor} />
          {/* image UI */}
          <ImageBubbleMenu editor={editor} />
          <ImageResizeHandle editor={editor} />
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
| `ImageBubbleMenu` | A floating toolbar over the selected image: align, resize, rotate/flip, adjust (brightness/contrast/…), edit alt text, and add a caption. |
| `ImageResizeHandle` | Drag handles on the selected image to resize it. |
| `LinkDialog` | A dialog to insert or edit a link (URL, display text, title, and target window). |

## Per-feature guides

Detailed usage, props, examples, and CSS classes for each feature live in
[`docs/`](./docs/README.md):

- [Core extensions](./docs/core-extensions.md) — register the styled table nodes (headless).
- [TablePicker](./docs/table-picker.md) — insert a table from a size grid.
- [TableBubbleMenu](./docs/bubble-menu.md) — floating toolbar over the active table.
- [TableContextMenu](./docs/context-menu.md) — right-click menu (rows, columns, cells, sort, properties).
- [Resize handles](./docs/resize-handles.md) — table / row / column drag resizing.
- [TableCellColorPicker](./docs/cell-color-picker.md) — cell background palette.
- [Image editing](./docs/image.md) — `ImageWithAlign` + `ImageBubbleMenu` + `ImageResizeHandle`.
- [LinkDialog](./docs/link-dialog.md) — insert / edit links.
- [Customization](./docs/customization.md) — `className` props and the `ttp-*` class reference.
- [Localization](./docs/localization.md) — translate or reword the labels.

## Styling the UI

The React UI ships a **self-contained, precompiled stylesheet**. Import it once,
anywhere in your app, and the components are fully styled — you do **not** need
Tailwind or shadcn tokens configured:

```ts
import "tiptap-ui-pro/styles.css";
```

The stylesheet bundles Tailwind's base **preflight** (a global reset that
normalizes margins, headings, form controls, etc.) plus the utilities the
components use — this is what makes the UI render pixel-for-pixel as designed.
Because preflight is global, import it at your app root. If your app already runs
Tailwind, **skip this import** and rely on your own build instead (the components
use the same token names). The design tokens (colors, radius) are CSS variables
you can override:

```css
:root {
  --color-primary: hsl(221 83% 53%);
  --color-destructive: hsl(0 84% 60%);
  --color-border: hsl(214 32% 91%);
  /* … */
}
```

Already using Tailwind + shadcn in your app? You can skip the CSS import — the
components use the same token names and will pick up your theme.

The headless `core` entry outputs plain, inline-styled HTML and needs no CSS at all.

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
import { TableIntlProvider } from "tiptap-ui-pro";

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

### `tiptap-ui-pro/core`

Node extensions and helpers, no React:

- `TableWithStyle`, `TableCellWithAttrs`, `TableHeaderWithAttrs`, `TableRowWithHeight` — the styled table nodes.
- `AlignableTableView` — a `NodeView` that applies table alignment and normalizes column widths to percentages.
- `ImageWithAlign`, `Figure`, `Figcaption` — the image node (align + rotate/flip/adjust + drag-resize) and figure/figcaption caption grouping.
- `LinkWithStyle`, `blockLinkNav` — an inline-styled link mark and a click handler that suppresses navigation while editing.
- `withStyle` — utility to prepend fixed inline styles to node attributes.
- Style constants: `TABLE_STYLE`, `CELL_STYLE`, `HEADER_STYLE`, `BORDER_COLOR`, `LINK_STYLE`, `FIGURE_STYLE`, `FIGCAPTION_STYLE`.

**Cell attributes** added by `TableCellWithAttrs` / `TableHeaderWithAttrs`: `backgroundColor`, `borderColor`, `borderWidth`, `borderStyle`, `textAlign`, `verticalAlign`, `scope`. `TableWithStyle` adds `align` (`left` | `center` | `right`); `TableRowWithHeight` adds `height`.

### `tiptap-ui-pro`

Everything above, plus the React components — `TablePicker`, `TableBubbleMenu`, `TableContextMenu`, `TableCellColorPicker`, `TableResizeHandle`, `RowResizeHandle`, `ColResizeHandle`, `ImageBubbleMenu`, `ImageResizeHandle`, `LinkDialog` — and the `TableIntlProvider` for localization.

## Publishing

Maintainers: see [PUBLISHING.md](./PUBLISHING.md) for step-by-step npm release instructions.

## License

[MIT](./LICENSE)
