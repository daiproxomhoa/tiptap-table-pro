# Image editing

Styled image support: an image node with alignment, rotate/flip, filter
adjustments and drag-resize, plus optional figure/figcaption caption grouping —
and the React UI to drive it.

## Register the extensions (core)

```tsx
import {
  ImageWithAlign,
  Figure,
  Figcaption,
} from "tiptap-ui-pro/core";

useEditor({
  extensions: [
    // …other extensions…
    ImageWithAlign.configure({
      resize: {
        enabled: true,
        directions: ["top", "bottom", "left", "right", "top-left", "bottom-right"],
        minWidth: 50,
        minHeight: 50,
      },
    }),
    Figure,
    Figcaption,
  ],
});
```

`ImageWithAlign` extends `@tiptap/extension-image`, so the usual command works:

```ts
editor.chain().focus().setImage({ src }).run();
```

Attributes serialized inline on the image/figure so exported HTML renders the
same anywhere: alignment, width/height, rotation, flip, CSS filters (from the
adjust panel), alt text, and a `<figure><img><figcaption></figure>` group when a
caption is added.

## Editing UI

```tsx
import { EditorContent } from "@tiptap/react";
import { ImageBubbleMenu, ImageResizeHandle } from "tiptap-ui-pro";

<div style={{ position: "relative" }}>
  <ImageBubbleMenu editor={editor} />
  <ImageResizeHandle editor={editor} />
  <EditorContent editor={editor} />
</div>
```

### `ImageBubbleMenu`

A floating toolbar shown when an image is selected. Main actions open panels:

- **Align** — left / center / right.
- **Transform** — rotate left/right, flip horizontal/vertical.
- **Resize** — width/height inputs with an optional aspect-ratio lock.
- **Adjust** — brightness, contrast, exposure, gamma, vibrance, saturation, blur.
- **Alt** — edit the image's alt text.
- **Caption** — add/edit a caption (wraps the image in a figure).
- **Reset** — revert transforms/adjustments.

Prop: `editor` (required).

### `ImageResizeHandle`

Drag handles on the selected image for resizing. Prop: `editor` (required).

## Styling & localization

All image UI is styled by the shipped stylesheet (`import "tiptap-ui-pro/styles.css"`).
Labels default to English and are overridable via `TableIntlProvider` — image ids
include `alignment`, `transform`, `adjust`, `altText`, `caption`, `reset`,
`rotateLeft`, `rotateRight`, `flipHorizontal`, `flipVertical`, `lockAspect`,
`width`, `height`, `size`, `back`. See [Localization](./localization.md).
