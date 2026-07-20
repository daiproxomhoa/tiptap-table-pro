# TablePicker

A toolbar toggle button that opens a hover grid; moving the mouse previews the
size and clicking inserts a table of that many rows × columns.

```tsx
import { TablePicker } from "tiptap-ui-pro";

<TablePicker editor={editor} />
```

Place it anywhere in your own toolbar. It renders its own button (a `Toggle`)
and popover, so it does not need to be inside `TableContextMenu`.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `editor` | `Editor` | — | The TipTap editor instance. Required. |
| `maxCols` | `number` | `10` | Number of columns offered in the picker grid. |
| `maxRows` | `number` | `8` | Number of rows offered in the picker grid. |
| `withHeaderRow` | `boolean` | `true` | Whether inserted tables get a header row. |
| `className` | `string` | — | Extra classes merged onto the trigger button. |

## Example — smaller grid, no header row

```tsx
<TablePicker editor={editor} maxRows={6} maxCols={6} withHeaderRow={false} />
```

## CSS classes

| Class | Element |
|---|---|
| `ttp-table-picker` | Trigger button (also receives `className`). |
| `ttp-table-picker__content` | Popover content. |
| `ttp-table-picker__hint` | The "N × M" hint line. |
| `ttp-table-picker__grid` | The cells grid. |
| `ttp-table-picker__cell` | A grid cell. |
| `ttp-table-picker__cell--active` | A highlighted (hovered) grid cell. |

```css
.ttp-table-picker__cell--active { background: #dbeafe; border-color: #3b82f6; }
```

See [Customization](./customization.md) for the full styling model.
