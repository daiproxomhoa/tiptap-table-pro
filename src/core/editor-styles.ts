// Inline styles baked into the HTML the editor emits, so tables render
// correctly anywhere they are displayed (PDF export, previews, etc.) without
// requiring the host app's CSS. Uses concrete oklch values, not CSS vars.

export const BORDER_COLOR = "oklch(0.922 0 0)";
export const TABLE_STYLE = "width: 100%; border-collapse: collapse";
export const CELL_STYLE = `border: 1px solid ${BORDER_COLOR}; padding: 0.375rem`;
export const HEADER_STYLE = `${CELL_STYLE}; font-weight: 600`;
export const LINK_STYLE =
  "color: oklch(0.55 0.18 256); text-decoration: underline; cursor: pointer";

// figure: display:table hugs the image; figcaption sits centered below it,
// exactly as wide as the image (TinyMCE-like caption behavior).
export const FIGURE_STYLE = "display: table; margin: 0";
export const FIGCAPTION_STYLE =
  "display: table-caption; caption-side: bottom; text-align: center; font-size: 0.875em; color: oklch(0.556 0 0); padding-top: 0.25rem";
