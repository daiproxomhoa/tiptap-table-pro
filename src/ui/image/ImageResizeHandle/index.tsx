import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useEditorState } from "@tiptap/react";
import type { Editor } from "@tiptap/react";

import { HANDLES } from "./constants";
import {
  computeDragResize,
  focusedImageWrapper,
  initialResizeBox,
  setBodyStyle,
} from "./utils";
import { setResizeDragging } from "../../resize-drag-store";

interface ImageResizeHandleProps {
  editor: Editor;
}

export function ImageResizeHandle({ editor }: ImageResizeHandleProps) {
  // Wrapper of the selected image — handles are portaled into it and positioned
  // absolutely relative to it.
  const [wrapperEl, setWrapperEl] = useState<HTMLElement | null>(null);
  const wrapperRef = useRef<HTMLElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [badge, setBadge] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);
  const isDragging = useRef(false);
  // Abort the in-progress drag (remove the pointer listeners) — called when unmounting
  // mid-drag.
  const abortDragRef = useRef<(() => void) | null>(null);

  const isImage = useEditorState({
    editor,
    selector: ({ editor: e }) => e.isActive("image"),
  });

  useEffect(() => {
    if (!isImage) return;
    const update = () => {
      if (isDragging.current) return;
      const found = focusedImageWrapper(editor);
      if (!found) return;
      const { wrapper, img } = found;
      wrapper.style.position = "relative";
      wrapper.style.outline = "2px solid var(--color-primary)";
      wrapper.style.outlineOffset = "0px";
      wrapperRef.current = wrapper;
      imgRef.current = img;
      setWrapperEl(wrapper);
    };
    const raf = requestAnimationFrame(update);
    editor.on("selectionUpdate", update);
    editor.on("update", update);
    return () => {
      cancelAnimationFrame(raf);
      editor.off("selectionUpdate", update);
      editor.off("update", update);
      // abort a dangling drag if unmounting mid-drag (the ref holds a fn, not a node)
      abortDragRef.current?.();
      const w = wrapperRef.current;
      if (w) w.style.outline = "";
      wrapperRef.current = null;
      imgRef.current = null;
      setWrapperEl(null);
    };
  }, [isImage, editor]);

  const startDrag = (
    e: React.PointerEvent,
    mode: "width" | "height" | "both",
    sx: 1 | -1,
    sy: 1 | -1,
    cursor: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const img = imgRef.current;
    if (!img) return;

    isDragging.current = true;
    setResizeDragging(true); // the bubble menus hide while dragging
    setBodyStyle(cursor, "none");

    // The source of the original size = the width/height attrs (falling back to
    // naturalWidth/Height). Do NOT read offsetWidth of the absolute img when
    // rotated — it's unreliable.
    const start = initialResizeBox(editor.getAttributes("image"), img);
    const { rot } = start;
    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const wrapper = wrapperRef.current;

    const onMouseMove = (ev: MouseEvent) => {
      // Drag directly along the screen axes (handles are positioned by the
      // displayed bbox).
      const dx = (ev.clientX - startMouseX) * sx;
      const dy = (ev.clientY - startMouseY) * sy;
      const { bw, bh, imgW, imgH, applyW, applyH, applyImgW, applyImgH } =
        computeDragResize(start, mode, dx, dy, ev.shiftKey);

      // Apply straight to img.style for smooth dragging; commit to the attrs on
      // mouse release.
      if (applyImgW) img.style.width = `${imgW}px`;
      if (applyImgH) img.style.height = `${imgH}px`;
      // Wrapper follows the bbox in real time so the outline/handles track it
      // (only when rotated). Force-remove max-width/height (Preflight) so the width
      // wins when the absolute img sits inside a narrow wrapper — otherwise the
      // drag gets clipped to the wrapper's width.
      if (rot && wrapper) {
        img.style.maxWidth = "none";
        img.style.maxHeight = "none";
        wrapper.style.width = `${bw}px`;
        wrapper.style.height = `${bh}px`;
      }

      const wText = applyW ? `${bw}px` : "";
      const hText = applyH ? `${bh}px` : "";
      const text =
        applyW && applyH ? `${wText} × ${hText}` : applyW ? wText : hText;
      const estW = text.length * 8 + 12;
      const x =
        ev.clientX + 14 + estW > window.innerWidth
          ? ev.clientX - 14 - estW
          : ev.clientX + 14;
      setBadge({ x, y: ev.clientY + 14, text });
    };

    // Remove exactly the listeners that were added (each addEventListener ↔ one
    // removeEventListener), reset the cursor + drag flag. Shared by mouse release
    // and mid-drag unmount.
    const cleanup = () => {
      document.removeEventListener("pointermove", onMouseMove);
      document.removeEventListener("pointerup", onMouseUp);
      document.removeEventListener("pointercancel", onMouseUp);
      abortDragRef.current = null;
      setBodyStyle("", "");
      isDragging.current = false;
      setResizeDragging(false);
    };

    const onMouseUp = () => {
      cleanup();
      setBadge(null);

      // Commit from the img.style that was set (the original image size), do NOT
      // read offsetWidth. Only the dimension that actually changed (img.style set)
      // — Shift changes both.
      const commitW = img.style.width ? parseFloat(img.style.width) : null;
      const commitH = img.style.height ? parseFloat(img.style.height) : null;
      // Do NOT chain .focus() — focus() moves the selection to the editor, losing
      // the image NodeSelection → the handles disappear after resizing. Keep the
      // image selection intact.
      editor
        .chain()
        .updateAttributes("image", {
          ...(commitW != null ? { width: Math.round(commitW) } : {}),
          ...(commitH != null ? { height: Math.round(commitH) } : {}),
        })
        .run();
      // Hand DOM focus back to the editor (view.focus() is pure DOM and does NOT
      // touch the selection, so the image NodeSelection survives) — otherwise the
      // editor is left blurred after the drag.
      editor.view.focus();
    };

    // Pointer events cover both mouse and touch (mobile); pointercancel = the browser
    // stole the gesture mid-drag → commit as if the pointer was released.
    document.addEventListener("pointermove", onMouseMove);
    document.addEventListener("pointerup", onMouseUp);
    document.addEventListener("pointercancel", onMouseUp);
    // Unmount mid-drag → cleanup (remove listeners, don't commit since the
    // selection is already lost).
    abortDragRef.current = cleanup;
  };

  if (!isImage || !wrapperEl) return null;

  // A solid blue square at each edge/corner (like TableResizeHandle).
  // touch-none: without it mobile treats a touch-drag as page scrolling and resizing dies.
  const handleClass =
    "absolute size-2.5 rounded-[2px] bg-primary border border-background shadow-sm touch-none";

  return (
    <>
      {badge && (
        <div
          style={{
            position: "fixed",
            left: badge.x,
            top: badge.y,
            zIndex: 60,
            pointerEvents: "none",
          }}
          className="rounded bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground shadow"
        >
          {badge.text}
        </div>
      )}

      {createPortal(
        HANDLES.map(({ key, mode, sx, sy, cursor, z, style }) => (
          <div
            key={key}
            onPointerDown={(e) => startDrag(e, mode, sx, sy, cursor)}
            style={{ ...style, zIndex: z, cursor }}
            className={handleClass}
          />
        )),
        wrapperEl,
      )}
    </>
  );
}
