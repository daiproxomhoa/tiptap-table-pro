export type HandleKey =
  "left" | "right" | "top" | "bottom" | "tl" | "tr" | "bl" | "br";

/** Config for each handle: the resize mode, the sign applied to the mouse delta (sx/sy =
 * -1 is the left/top edge, dragged in the opposite sign to the right/bottom edge), and the
 * ANCHOR within the table's box (cx: left/center/right edge, cy: top/middle/bottom edge —
 * render computes left/top px from the table's real box, no longer using the wrapper's
 * right:0/bottom:0 because the table can overflow the wrapper when content forces columns
 * to expand).
 * mode "height"/"both" only changes the height of the table's LAST ROW (height per-row);
 * "width" changes the whole table's width. */
export const HANDLES: {
  key: HandleKey;
  mode: "width" | "height" | "both";
  sx: 1 | -1;
  sy: 1 | -1;
  cursor: string;
  z: number;
  cx: "l" | "c" | "r";
  cy: "t" | "m" | "b";
}[] = [
  {
    key: "right",
    mode: "width",
    sx: 1,
    sy: 1,
    cursor: "ew-resize",
    z: 20,
    cx: "r",
    cy: "m",
  },
  {
    key: "left",
    mode: "width",
    sx: -1,
    sy: 1,
    cursor: "ew-resize",
    z: 20,
    cx: "l",
    cy: "m",
  },
  {
    key: "bottom",
    mode: "height",
    sx: 1,
    sy: 1,
    cursor: "ns-resize",
    z: 20,
    cx: "c",
    cy: "b",
  },
  {
    key: "top",
    mode: "height",
    sx: 1,
    sy: -1,
    cursor: "ns-resize",
    z: 20,
    cx: "c",
    cy: "t",
  },
  {
    key: "br",
    mode: "both",
    sx: 1,
    sy: 1,
    cursor: "nwse-resize",
    z: 21,
    cx: "r",
    cy: "b",
  },
  {
    key: "tl",
    mode: "both",
    sx: -1,
    sy: -1,
    cursor: "nwse-resize",
    z: 21,
    cx: "l",
    cy: "t",
  },
  {
    key: "tr",
    mode: "both",
    sx: 1,
    sy: -1,
    cursor: "nesw-resize",
    z: 21,
    cx: "r",
    cy: "t",
  },
  {
    key: "bl",
    mode: "both",
    sx: -1,
    sy: 1,
    cursor: "nesw-resize",
    z: 21,
    cx: "l",
    cy: "b",
  },
];
