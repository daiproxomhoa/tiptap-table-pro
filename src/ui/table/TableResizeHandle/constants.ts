export type HandleKey =
  "left" | "right" | "top" | "bottom" | "tl" | "tr" | "bl" | "br";

/** Cấu hình mỗi handle: chế độ resize, dấu áp delta chuột (sx/sy = -1 là mép
 * trái/trên, kéo ngược dấu so với mép phải/dưới), và NEO trong box của table
 * (cx: cạnh trái/giữa/phải, cy: cạnh trên/giữa/dưới — render tính left/top px
 * theo box thật của table, không dùng right:0/bottom:0 của wrapper nữa vì table
 * có thể tràn wrapper khi content ép cột giãn).
 * mode "height"/"both" chỉ đổi chiều cao HÀNG CUỐI của bảng (height per-row);
 * "width" đổi bề rộng cả bảng. */
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
