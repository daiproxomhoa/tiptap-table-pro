# TableBubbleMenu

A floating toolbar that appears above (or below, if there's no room) the table
the cursor is in. It offers the most common quick actions and hides itself when
the editor loses focus.

```tsx
import { TableBubbleMenu } from "tiptap-ui-pro";

<div style={{ position: "relative" }}>
  <TableBubbleMenu editor={editor} />
  <EditorContent editor={editor} />
</div>
```

Render it inside a positioned container (the menu is absolutely positioned
relative to the nearest positioned ancestor).

## Actions

- Add row above / below, delete row.
- Add column left / right, delete column.
- Merge selected cells (shown when multiple cells are selected).
- Split a merged cell (shown when the current cell spans multiple rows/cols).
- Toggle table borders (show / hide).
- Align the table left / center / right.
- Delete the table.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `editor` | `Editor` | — | The TipTap editor instance. Required. |
| `className` | `string` | — | Extra classes merged onto the floating container. |

## Example

```tsx
<TableBubbleMenu editor={editor} className="rounded-xl shadow-lg" />
```

## CSS classes

| Class | Element |
|---|---|
| `ttp-bubble-menu` | The floating toolbar container (also receives `className`). |

```css
.ttp-bubble-menu { border-radius: 12px; box-shadow: 0 8px 24px rgb(0 0 0 / 0.12); }
```

The individual buttons are the vendored `Toggle` primitive; style them via the
container, e.g. `.ttp-bubble-menu button { … }`.
