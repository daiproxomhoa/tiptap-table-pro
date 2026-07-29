import { useSyncExternalStore } from "react";

/**
 * Shared "a resize drag is in progress" flag, used by every handle
 * (table / row / column / image) and by any UI that should get out of the way
 * (the bubble menus hide while dragging). A module-level store is fine here:
 * there is only ever one pointer dragging at a time.
 *
 * Handles set it imperatively — `setResizeDragging(true / false)`;
 * components read it reactively — `useResizeDrag((s) => s.dragging)`.
 *
 * Implemented with `useSyncExternalStore` (React built-in) instead of an
 * external state library, so the package stays dependency-light.
 */
interface ResizeDragState {
  dragging: boolean;
}

let state: ResizeDragState = { dragging: false };
const listeners = new Set<() => void>();

/** Subscribe to drag-flag changes. Returns an unsubscribe function. */
export function subscribeResizeDrag(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): ResizeDragState {
  return state;
}

/** Read the flag imperatively (outside React) — e.g. to bail out of a handler mid-drag. */
export function getResizeDragging(): boolean {
  return state.dragging;
}

/** Flip the global drag flag. Called by the resize handles on drag start / end. */
export function setResizeDragging(dragging: boolean): void {
  if (state.dragging === dragging) return;
  // New object identity so selector results compare unequal and subscribers re-render.
  state = { dragging };
  for (const listener of listeners) listener();
}

/**
 * Subscribe to the drag flag. Pass a selector so a component only re-renders
 * when the value it reads changes: `useResizeDrag((s) => s.dragging)`.
 */
export function useResizeDrag<T>(selector: (s: ResizeDragState) => T): T {
  return useSyncExternalStore(
    subscribeResizeDrag,
    () => selector(getSnapshot()),
    () => selector(getSnapshot()),
  );
}
