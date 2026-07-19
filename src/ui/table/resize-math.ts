/**
 * Toán thuần cho resize bảng — tách khỏi component để test được và tái dùng
 * chung 3 handle (table / cột / hàng). KHÔNG đụng DOM, editor, React ở đây:
 * mọi input là số/mảng số đo sẵn, output là số/mảng/chuỗi để component áp.
 */

/** Bề rộng bảng đang kéo, kẹp trong [minW, maxW]. `sx` = 1 kéo mép phải, -1 kéo
 * mép trái (đảo dấu delta). minW = min-content cột; maxW = bề rộng container
 * (không cho bảng rộng quá 100%). Làm tròn về px nguyên. */
export function clampDragWidth(
  startW: number,
  mouseDx: number,
  sx: 1 | -1,
  minW: number,
  maxW: number = Infinity,
): number {
  return Math.min(maxW, Math.max(minW, Math.round(startW + mouseDx * sx)));
}

/** Chiều cao bảng đang kéo, kẹp không nhỏ hơn minTableH (bảng khi hàng cuối co
 * về sàn). `sy` = 1 kéo mép dưới, -1 kéo mép trên. */
export function clampDragHeight(
  startH: number,
  mouseDy: number,
  sy: 1 | -1,
  minTableH: number,
): number {
  return Math.max(minTableH, Math.round(startH + mouseDy * sy));
}

/** Chiều cao TỐI THIỂU của cả bảng = chiều cao hiện tại trừ phần hàng cuối có
 * thể co (startRowH → minRowH). Không âm. */
export function minTableHeight(
  startH: number,
  startRowH: number,
  minRowH: number,
): number {
  return startH - Math.max(0, startRowH - minRowH);
}

/** Chiều cao commit cho hàng cuối = chiều cao đầu + phần bảng thay đổi, sàn
 * minRowH. */
export function finalRowHeight(
  startRowH: number,
  pendingH: number,
  startH: number,
  minRowH: number,
): number {
  return Math.max(minRowH, Math.round(startRowH + (pendingH - startH)));
}

/**
 * Scale px từng cột theo tỉ lệ width bảng mới / tổng px cột hiện tại, GIỮ tỉ lệ
 * giữa các cột. Floor ≥1: cột 0px làm normalizeColWidths bail (nó bỏ qua khi có
 * col ≤ 0) → cả bảng kẹt px cũ. Trả null khi chưa đo được cột (sumColPx ≤ 0) để
 * caller bỏ qua bước commit colwidth.
 */
export function scaleColWidths(
  startColPx: number[],
  pendingW: number,
  sumColPx: number,
): number[] | null {
  if (sumColPx <= 0) return null;
  return startColPx.map((px) => Math.max(1, Math.round((px * pendingW) / sumColPx)));
}

/** Giá trị width để commit: `%` theo container nếu đo được, ngược lại px tuyệt
 * đối. Làm tròn 1 chữ số thập phân cho `%` (khớp badge). */
export function widthValue(pendingW: number, container: number): string {
  return container > 0
    ? `${Math.round((pendingW / container) * 1000) / 10}%`
    : `${pendingW}px`;
}

/** Kẹp toạ độ X của ranh cột trong khoảng [leftEdge+min, rightEdge-min] —
 * cột trái/phải đều ≥ minCol. */
export function clampColBoundary(
  clientX: number,
  leftEdge: number,
  rightEdge: number,
  minCol: number,
): number {
  return Math.max(leftEdge + minCol, Math.min(rightEdge - minCol, clientX));
}

/** Chia lại bề rộng 2 cột kề sau khi kéo ranh tới `x`: cột trái = x-leftEdge,
 * cột phải = total - trái (giữ tổng). Trả [trái, phải]. */
export function splitAdjacentWidths(
  x: number,
  leftEdge: number,
  total: number,
): [number, number] {
  const left = Math.round(x - leftEdge);
  return [left, total - left];
}

/** Kẹp toạ độ Y mép dưới hàng: không lên trên (rowTop + minH) — hàng không thấp
 * hơn nội dung. */
export function clampRowBottom(
  clientY: number,
  rowTop: number,
  minH: number,
): number {
  return Math.max(rowTop + minH, clientY);
}
