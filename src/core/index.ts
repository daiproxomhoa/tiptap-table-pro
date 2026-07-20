// Headless TipTap node extensions and ProseMirror plumbing. No React UI here.
export {
  AlignableTableView,
  TableWithStyle,
  TableRowWithHeight,
  TableCellWithAttrs,
  TableHeaderWithAttrs,
} from "./table-extensions";

export { LinkWithStyle, blockLinkNav } from "./link-extension";

// Image: align/rotate/flip/adjust node + figure/figcaption caption grouping.
export { ImageWithAlign, Figure, Figcaption } from "./image-extension";

export {
  BORDER_COLOR,
  TABLE_STYLE,
  CELL_STYLE,
  HEADER_STYLE,
  LINK_STYLE,
  FIGURE_STYLE,
  FIGCAPTION_STYLE,
} from "./editor-styles";

export { withStyle } from "./utils";
