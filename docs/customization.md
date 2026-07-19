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

## Design tokens

The UI is built on Tailwind + shadcn/ui tokens (`bg-background`,
`text-destructive`, `border-input`, `--primary`, `--ring`, …). Re-theming those
CSS variables in your app restyles the components globally. The headless
[core](./core-extensions.md) needs none of this.
