# Customization

Every public component can be tailored two ways: **config props** (behavior /
content) and **CSS** (appearance). This page is the complete reference; each
component's own page repeats the parts relevant to it.

## `className` prop

Every component accepts an optional `className` that is merged onto its root
(or most relevant) element:

```tsx
<TableBubbleMenu editor={editor} className="my-bubble-menu" />
<TableContextMenu editor={editor} className="my-menu">…</TableContextMenu>
<TableResizeHandle editor={editor} className="my-handle" />
```

## `ttp-*` class reference

Each component also renders stable, namespaced classes on its internal parts, so
you can style any piece with plain CSS (no `!important` needed).

| Component | Root class | Part classes |
|---|---|---|
| [`TablePicker`](./table-picker.md) | `ttp-table-picker` (trigger) | `__content`, `__hint`, `__grid`, `__cell`, `__cell--active` |
| [`TableBubbleMenu`](./bubble-menu.md) | `ttp-bubble-menu` | — |
| [`TableContextMenu`](./context-menu.md) | `ttp-context-menu` (popup) | `__trigger` |
| [`TableCellColorPicker`](./cell-color-picker.md) | `ttp-cell-color-picker` | `__presets`, `__swatch`, `__custom`, `__clear` |
| [`TableResizeHandle`](./resize-handles.md) | `ttp-table-resize-handle` (handles) | `__badge`, `__outline`, `__ghost` |
| [`RowResizeHandle`](./resize-handles.md) | `ttp-row-resize-handle` | `__bar`, `__guide` |
| [`ColResizeHandle`](./resize-handles.md) | `ttp-col-resize-handle` | `__bar`, `__guide` |
| [`LinkDialog`](./link-dialog.md) | `ttp-link-dialog` (content) | — |

Part classes are shown with their `__suffix`; the full class is
`root__suffix`, e.g. `ttp-table-picker__cell`.

```css
.ttp-table-resize-handle { background: #e11d48; }
.ttp-row-resize-handle__bar,
.ttp-col-resize-handle__bar { background: #e11d48; }
.ttp-bubble-menu { border-radius: 12px; box-shadow: 0 8px 24px rgb(0 0 0 / 0.12); }
```

## Config props at a glance

| Component | Props |
|---|---|
| `TablePicker` | `maxCols`, `maxRows`, `withHeaderRow` |
| `TableContextMenu` | `cellColors` |
| `TableCellColorPicker` | `presetColors`, `presetColumns`, `showCustomInput`, `showClearButton` |
| all UI components | `className` |

See each component's page for defaults and examples.

## Styling & design tokens

Import the shipped stylesheet once — no Tailwind or shadcn setup required:

```ts
import "tiptap-table-pro/styles.css";
```

The components read CSS variables for their theme. Override them anywhere to
re-theme the UI:

```css
:root {
  --color-primary: hsl(221 83% 53%);
  --color-primary-foreground: hsl(210 40% 98%);
  --color-destructive: hsl(0 84% 60%);
  --color-border: hsl(214 32% 91%);
  --color-input: hsl(214 32% 91%);
  --color-ring: hsl(221 83% 53%);
  --radius: 0.5rem;
}
```

If your app already uses Tailwind + shadcn tokens, you can skip the CSS import;
the components use the same token names. The headless
[core](./core-extensions.md) needs no CSS at all.
