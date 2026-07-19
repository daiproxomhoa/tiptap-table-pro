# TableContextMenu

A right-click (context) menu for tables. It **wraps** your editor content: it
renders `children` and shows the menu only when the right-click happens inside a
table.

```tsx
import { TableContextMenu } from "tiptap-table-pro";

<TableContextMenu editor={editor}>
  <EditorContent editor={editor} />
</TableContextMenu>
```

On right-click inside a table it moves the caret to the clicked cell (so the
action targets that cell), unless multiple cells are selected or text is
highlighted.

## Menu items

- **Link…** — opens the [LinkDialog](./link-dialog.md).
- **Cell** submenu — alignment shortcuts, merge / split, and *Cell properties…*.
- **Row** submenu — insert above/below, delete, cut/copy, paste above/below.
- **Column** submenu — insert left/right, delete, cut/copy, paste left/right.
- **Sort** submenu — ascending / descending by the current column, plus *Advanced sort…*.
- **Cell background** submenu — the [TableCellColorPicker](./cell-color-picker.md).
- **Table properties** — width, height, alignment, borders.
- **Delete entire table**.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `editor` | `Editor` | — | The TipTap editor instance. Required. |
| `children` | `ReactNode` | — | Your editor content (usually `<EditorContent />`). Required. |
| `cellColors` | `string[]` | built-in palette | Custom swatches for the "Cell background" submenu (forwarded to the color picker). |
| `className` | `string` | — | Extra classes merged onto the popup menu content. |

## Example — custom cell palette

```tsx
<TableContextMenu
  editor={editor}
  cellColors={["#ffffff", "#fee2e2", "#dcfce7", "#dbeafe", "#fef9c3"]}
>
  <EditorContent editor={editor} />
</TableContextMenu>
```

## CSS classes

| Class | Element |
|---|---|
| `ttp-context-menu` | The popup menu content (also receives `className`). |
| `ttp-context-menu__trigger` | The wrapper around `children` (`display: contents`). |

```css
.ttp-context-menu { min-width: 15rem; }
```
