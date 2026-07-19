# LinkDialog

A controlled dialog for inserting or editing a link on the current selection.
It edits the URL, the display text, the title, and the target window
(current window or new tab).

`TableContextMenu` opens this automatically from its "Link…" item, but you can
also drive it yourself (e.g. from a toolbar button).

```tsx
import { useState } from "react";
import { LinkDialog } from "tiptap-table-pro";

function Toolbar({ editor }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Link</button>
      <LinkDialog editor={editor} open={open} onOpenChange={setOpen} />
    </>
  );
}
```

## Behavior

- Pre-fills the URL/title from the link under the cursor, and the display text
  from the current selection.
- Saving with an empty URL removes the link.
- If you change the display text, it replaces the selected text and links it.
- New-tab links get `rel="noopener noreferrer nofollow"` automatically.

For links to render with the library's inline styling, register `LinkWithStyle`
(see [Core extensions](./core-extensions.md)).

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `editor` | `Editor` | — | The TipTap editor instance. Required. |
| `open` | `boolean` | — | Whether the dialog is open. Required (controlled). |
| `onOpenChange` | `(open: boolean) => void` | — | Called when the dialog requests open/close. Required. |
| `className` | `string` | — | Extra classes merged onto the dialog content. |

## CSS classes

| Class | Element |
|---|---|
| `ttp-link-dialog` | The dialog content panel (also receives `className`). |
