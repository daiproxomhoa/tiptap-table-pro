/**
 * Pure math for table resizing — separated from the component so it is testable and
 * reused across all 3 handles (table / column / row). Does NOT touch the DOM, editor, or
 * React here: every input is a number/array of pre-measured numbers, and the output is a
 * number/array/string for the component to apply.
 */

/** Width of the table being dragged, clamped to [minW, maxW]. `sx` = 1 drags the right
 * edge, -1 drags the left edge (inverts the delta sign). minW = the columns' min-content;
 * maxW = the container width (don't let the table exceed 100%). Rounded to whole px. */
export function clampDragWidth(
  startW: number,
  mouseDx: number,
  sx: 1 | -1,
  minW: number,
  maxW: number = Infinity,
): number {
  return Math.min(maxW, Math.max(minW, Math.round(startW + mouseDx * sx)));
}

/** Height of the table being dragged, clamped to no less than minTableH (the table when
 * the last row shrinks to its floor). `sy` = 1 drags the bottom edge, -1 drags the top edge. */
export function clampDragHeight(
  startH: number,
  mouseDy: number,
  sy: 1 | -1,
  minTableH: number,
): number {
  return Math.max(minTableH, Math.round(startH + mouseDy * sy));
}

/** The MINIMUM height of the whole table = the current height minus the amount the last
 * row can shrink (startRowH → minRowH). Never negative. */
export function minTableHeight(
  startH: number,
  startRowH: number,
  minRowH: number,
): number {
  return startH - Math.max(0, startRowH - minRowH);
}

/** The height to commit for the last row = the starting height + the table's change,
 * floored at minRowH. */
export function finalRowHeight(
  startRowH: number,
  pendingH: number,
  startH: number,
  minRowH: number,
): number {
  return Math.max(minRowH, Math.round(startRowH + (pendingH - startH)));
}

/**
 * Scale each column's px by the ratio new table width / current total column px, KEEPING
 * the ratio between columns. Floor ≥1: a 0px column makes normalizeColWidths bail (it
 * skips when any col ≤ 0) → the whole table stays stuck at the old px. Returns null when
 * the columns haven't been measured yet (sumColPx ≤ 0) so the caller skips the colwidth
 * commit step.
 */
export function scaleColWidths(
  startColPx: number[],
  pendingW: number,
  sumColPx: number,
): number[] | null {
  if (sumColPx <= 0) return null;
  return startColPx.map((px) => Math.max(1, Math.round((px * pendingW) / sumColPx)));
}

/** The width value to commit: `%` relative to the container if measurable, otherwise an
 * absolute px. Rounded to 1 decimal place for `%` (matching the badge). */
export function widthValue(pendingW: number, container: number): string {
  return container > 0
    ? `${Math.round((pendingW / container) * 1000) / 10}%`
    : `${pendingW}px`;
}

/** Clamp the column boundary's X coordinate within [leftEdge+min, rightEdge-min] —
 * both the left and right columns stay ≥ minCol. */
export function clampColBoundary(
  clientX: number,
  leftEdge: number,
  rightEdge: number,
  minCol: number,
): number {
  return Math.max(leftEdge + minCol, Math.min(rightEdge - minCol, clientX));
}

/** Redistribute the widths of 2 adjacent columns after dragging the boundary to `x`:
 * left column = x-leftEdge, right column = total - left (preserving the total). Returns
 * [left, right]. */
export function splitAdjacentWidths(
  x: number,
  leftEdge: number,
  total: number,
): [number, number] {
  const left = Math.round(x - leftEdge);
  return [left, total - left];
}

/** Clamp the Y coordinate of a row's bottom edge: it can't go above (rowTop + minH) —
 * the row is never shorter than its content. */
export function clampRowBottom(
  clientY: number,
  rowTop: number,
  minH: number,
): number {
  return Math.max(rowTop + minH, clientY);
}
