export type HandleKey =
  | "left"
  | "right"
  | "top"
  | "bottom"
  | "tl"
  | "tr"
  | "bl"
  | "br";

/** Configuration for each handle: resize mode, the sign applied to the mouse
 * delta (sx/sy = -1 is the left/top edge), and the absolute position within the
 * wrapper. Identical to TableResizeHandle. */
export const HANDLES: {
  key: HandleKey;
  mode: "width" | "height" | "both";
  sx: 1 | -1;
  sy: 1 | -1;
  cursor: string;
  z: number;
  style: React.CSSProperties;
}[] = [
  { key: "right", mode: "width", sx: 1, sy: 1, cursor: "ew-resize", z: 10, style: { top: "50%", right: 0, transform: "translate(50%, -50%)" } },
  { key: "left", mode: "width", sx: -1, sy: 1, cursor: "ew-resize", z: 10, style: { top: "50%", left: 0, transform: "translate(-50%, -50%)" } },
  { key: "bottom", mode: "height", sx: 1, sy: 1, cursor: "ns-resize", z: 10, style: { left: "50%", bottom: 0, transform: "translate(-50%, 50%)" } },
  { key: "top", mode: "height", sx: 1, sy: -1, cursor: "ns-resize", z: 10, style: { left: "50%", top: 0, transform: "translate(-50%, -50%)" } },
  { key: "br", mode: "both", sx: 1, sy: 1, cursor: "nwse-resize", z: 11, style: { bottom: 0, right: 0, transform: "translate(50%, 50%)" } },
  { key: "tl", mode: "both", sx: -1, sy: -1, cursor: "nwse-resize", z: 11, style: { top: 0, left: 0, transform: "translate(-50%, -50%)" } },
  { key: "tr", mode: "both", sx: 1, sy: -1, cursor: "nesw-resize", z: 11, style: { top: 0, right: 0, transform: "translate(50%, -50%)" } },
  { key: "bl", mode: "both", sx: -1, sy: 1, cursor: "nesw-resize", z: 11, style: { bottom: 0, left: 0, transform: "translate(-50%, 50%)" } },
];

export const MIN = 24;
