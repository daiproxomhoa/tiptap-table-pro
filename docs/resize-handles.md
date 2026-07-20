# Resize handles

Three independent components add drag-to-resize affordances to the active table.
Each portals its handles into the table's `.tableWrapper`, so render them near
your `<EditorContent />` (they position themselves).

```tsx
import {
  TableResizeHandle,
  RowResizeHandle,
  ColResizeHandle,
} from "tiptap-ui-pro";

<div style={{ position: "relative" }}>
  <TableResizeHandle editor={editor} />
  <RowResizeHandle editor={editor} />
  <ColResizeHandle editor={editor} />
  <EditorContent editor={editor} />
</div>
```

You can mix and match — include only the handles you want (e.g. columns only).

## Components

| Component | What you drag | What it changes |
|---|---|---|
| `TableResizeHandle` | Corner and edge handles around the whole table | The entire table's width/height (shows a live size badge + ghost outline). |
| `RowResizeHandle` | The bottom edge of each row | That row's `height` (a horizontal guide line follows the cursor; commits on release). |
| `ColResizeHandle` | The boundary between two columns | Redistributes width between the two adjacent columns, keeping the total constant. |

## Props (all three)

| Prop | Type | Default | Description |
|---|---|---|---|
| `editor` | `Editor` | — | The TipTap editor instance. Required. |
| `className` | `string` | — | Extra classes merged onto each handle element. |

## CSS classes

| Component | Root class | Part classes |
|---|---|---|
| `TableResizeHandle` | `ttp-table-resize-handle` (each handle) | `ttp-table-resize-handle__badge`, `__outline`, `__ghost` |
| `RowResizeHandle` | `ttp-row-resize-handle` | `ttp-row-resize-handle__bar`, `__guide` |
| `ColResizeHandle` | `ttp-col-resize-handle` | `ttp-col-resize-handle__bar`, `__guide` |

```css
/* Recolor the resize affordances */
.ttp-table-resize-handle { background: #e11d48; }
.ttp-row-resize-handle__bar,
.ttp-col-resize-handle__bar { background: #e11d48; }
```

> Keep `TableWithStyle.configure({ resizable: false })` (see
> [Core extensions](./core-extensions.md)). These components own resizing;
> prosemirror-tables' built-in column resizing should stay off.

### Don't put `overflow` on `.tableWrapper`

The handles are portaled into the table's `.tableWrapper` and sit right on the
table edges, sticking out a few pixels. If `.tableWrapper` has `overflow-x: auto`
(or any non-`visible` overflow), those edge handles will trigger **spurious
horizontal *and* vertical scrollbars** even when the table fits — because CSS
forces the other axis to `auto` when one axis is set.

Keep the wrapper's overflow visible:

```css
.tableWrapper { overflow: visible; }
```

If you need horizontal scrolling for very wide tables, apply `overflow-x: auto`
to an **outer** container, not to `.tableWrapper` itself.
