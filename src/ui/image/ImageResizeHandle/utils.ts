import type { Editor } from "@tiptap/react";

import { MIN } from "./constants";

export function setBodyStyle(cursor: string, userSelect: string) {
  document.body.style.cursor = cursor;
  document.body.style.userSelect = userSelect;
}

/** The DOM wrapper ([data-resize-wrapper]) of the selected image. */
export function focusedImageWrapper(editor: Editor): {
  wrapper: HTMLElement;
  img: HTMLImageElement;
} | null {
  const { from } = editor.state.selection;
  const dom = editor.view.nodeDOM(from) as HTMLElement | null;
  if (!dom) return null;
  const wrapper =
    (dom.querySelector?.("[data-resize-wrapper]") as HTMLElement | null) ??
    (dom.closest?.("[data-resize-wrapper]") as HTMLElement | null) ??
    dom;
  const img = wrapper.querySelector("img");
  if (!img) return null;
  return { wrapper, img };
}

export interface ResizeStart {
  rot: number;
  swap: boolean;
  startBW: number;
  startBH: number;
  ratio: number;
}

/** The initial state at the start of the drag, expressed in screen axes (the
 * displayed bbox). */
export function initialResizeBox(
  attrs: Record<string, unknown>,
  img: HTMLImageElement,
): ResizeStart {
  const rot = (((Number(attrs.rotate) || 0) % 360) + 360) % 360;
  // Image box in the original axis: when only one dimension is set (resizing one
  // edge), infer the other from the natural aspect ratio — do NOT pair the set
  // width with naturalHeight (a mismatch → wrong bbox).
  const na = img.naturalWidth && img.naturalHeight
    ? img.naturalWidth / img.naturalHeight
    : 1;
  const aw = Number(attrs.width) || null;
  const ah = Number(attrs.height) || null;
  const imgW0 = aw ?? (ah ? Math.round(ah * na) : img.naturalWidth);
  const imgH0 = ah ?? (aw ? Math.round(aw / na) : img.naturalHeight);
  const swap = rot === 90 || rot === 270;
  // Displayed bounding box (screen axes): 90/270 swap W↔H.
  const startBW = swap ? imgH0 : imgW0;
  const startBH = swap ? imgW0 : imgH0;
  // Shift locks the ratio to the ORIGINAL IMAGE (natural), not to the bbox before
  // dragging. Convert the natural ratio to screen axes: 90/270 swap W↔H (→ 1/na).
  const ratio = swap ? 1 / na : na;
  return { rot, swap, startBW, startBH, ratio };
}

export interface DragResizeResult {
  bw: number;
  bh: number;
  imgW: number;
  imgH: number;
  applyW: boolean;
  applyH: boolean;
  applyImgW: boolean;
  applyImgH: boolean;
}

/** Compute sizes during the drag: the screen bbox (bw/bh) + the original image
 * size (imgW/imgH) and which dimension is applied. */
export function computeDragResize(
  start: ResizeStart,
  mode: "width" | "height" | "both",
  dx: number,
  dy: number,
  keepRatio: boolean,
): DragResizeResult {
  const { swap, startBW, startBH, ratio } = start;
  let bw = Math.max(MIN, Math.round(startBW + dx));
  let bh = Math.max(MIN, Math.round(startBH + dy));

  // Hold Shift → lock the bbox ratio. Vertical edges are driven by H, the rest by W.
  let applyW = mode !== "height";
  let applyH = mode !== "width";
  if (keepRatio) {
    if (mode === "height") bw = Math.round(bh * ratio);
    else bh = Math.round(bw / ratio);
    applyW = true;
    applyH = true;
  }

  // Map the bbox (screen) → the original image size: 90/270 swap back.
  const imgW = swap ? bh : bw;
  const imgH = swap ? bw : bh;
  // Whichever screen axis changed → the corresponding original image dimension
  // changes (swap exchanges them).
  const applyImgW = swap ? applyH : applyW;
  const applyImgH = swap ? applyW : applyH;

  return { bw, bh, imgW, imgH, applyW, applyH, applyImgW, applyImgH };
}
