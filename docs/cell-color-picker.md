# TableCellColorPicker

A palette of preset color swatches plus an optional custom hex input for setting
(or clearing) the background of the selected cell(s).

It is used automatically inside the [TableContextMenu](./context-menu.md)
"Cell background" submenu, but you can also render it standalone (for example in
your own toolbar popover).

```tsx
import { TableCellColorPicker } from "tiptap-ui-pro";

<TableCellColorPicker editor={editor} onClose={() => setOpen(false)} />
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `editor` | `Editor` | — | The TipTap editor instance. Required. |
| `onClose` | `() => void` | — | Called after a color is applied or cleared. Required. |
| `presetColors` | `string[]` | 32-color palette | The swatch colors. |
| `presetColumns` | `number` | `8` | Swatches per row in the grid. |
| `showCustomInput` | `boolean` | `true` | Show the custom hex input row. |
| `showClearButton` | `boolean` | `true` | Show the "clear background" button. |
| `className` | `string` | — | Extra classes merged onto the container. |

## Example — brand palette, presets only

```tsx
<TableCellColorPicker
  editor={editor}
  onClose={close}
  presetColors={["#ffffff", "#f1f5f9", "#fee2e2", "#dcfce7", "#dbeafe", "#fef9c3"]}
  presetColumns={6}
  showCustomInput={false}
  showClearButton={false}
/>
```

When used through `TableContextMenu`, pass the palette via that component's
`cellColors` prop instead:

```tsx
<TableContextMenu editor={editor} cellColors={["#fff", "#fee2e2", "#dcfce7"]}>
  <EditorContent editor={editor} />
</TableContextMenu>
```

## CSS classes

| Class | Element |
|---|---|
| `ttp-cell-color-picker` | Container (also receives `className`). |
| `ttp-cell-color-picker__presets` | The swatch grid. |
| `ttp-cell-color-picker__swatch` | A preset swatch button. |
| `ttp-cell-color-picker__custom` | The custom hex input row. |
| `ttp-cell-color-picker__clear` | The "clear background" button. |
