// Inline styles baked into the HTML the editor emits, so tables render
// correctly anywhere they are displayed (PDF export, previews, etc.) without
// requiring the host app's CSS. Uses concrete oklch values, not CSS vars.

export const BORDER_COLOR = "oklch(0.922 0 0)";
export const TABLE_STYLE = "width: 100%; border-collapse: collapse";
export const CELL_STYLE = `border: 1px solid ${BORDER_COLOR}; padding: 0.375rem`;
export const HEADER_STYLE = `${CELL_STYLE}; font-weight: 600`;
export const LINK_STYLE =
  "color: oklch(0.55 0.18 256); text-decoration: underline; cursor: pointer";
