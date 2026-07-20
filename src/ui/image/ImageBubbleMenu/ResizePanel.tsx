import { useRef, useState } from "react";
import { useEditorState } from "@tiptap/react";
import { ChevronLeft, Lock, Unlock } from "../../../lib/icons";
import { useIntl } from "../../../lib/intl";
import { Button } from "../../primitives/button";
import { Input } from "../../primitives/input";
import type { PanelProps } from "./constants";

/** Natural size of the selected image (used to infer the aspect ratio when W/H
 * isn't set yet). */
function naturalSize(editor: PanelProps["editor"]): { w: number; h: number } | null {
  const { from } = editor.state.selection;
  const dom = editor.view.nodeDOM(from) as HTMLElement | null;
  const img = dom?.querySelector?.("img") ?? (dom as HTMLImageElement | null);
  if (img && img.naturalWidth && img.naturalHeight) {
    return { w: img.naturalWidth, h: img.naturalHeight };
  }
  return null;
}

export function ResizePanel({ editor, onBack }: PanelProps) {
  const intl = useIntl();
  // Read W/H live from the image attrs → updates while dragging a handle too (not
  // only when typing in the panel).
  const { width, height } = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      const a = e.getAttributes("image");
      return {
        width: a.width != null ? String(a.width) : "",
        height: a.height != null ? String(a.height) : "",
      };
    },
  }) ?? { width: "", height: "" };

  const [locked, setLocked] = useState(true);
  // The W/H ratio locked when the lock is enabled; initialized from the current
  // W/H or the natural size.
  const ratioRef = useRef<number>(
    (() => {
      const attrs = editor.getAttributes("image");
      const w = Number(attrs.width);
      const h = Number(attrs.height);
      if (w && h) return w / h;
      const nat = naturalSize(editor);
      return nat ? nat.w / nat.h : 1;
    })(),
  );

  const apply = (w: string, h: string) =>
    // Do NOT call .focus() — while typing in the <input>, focus() would pull back
    // to the editor and blur the input. Keep the image NodeSelection intact (don't
    // move the selection).
    editor
      .chain()
      .updateAttributes("image", {
        width: w.trim() ? Number(w) : null,
        height: h.trim() ? Number(h) : null,
      })
      .run();

  const onWidth = (v: string) => {
    if (locked && v.trim() && ratioRef.current) {
      apply(v, String(Math.round(Number(v) / ratioRef.current)));
    } else {
      apply(v, height);
    }
  };

  const onHeight = (v: string) => {
    if (locked && v.trim() && ratioRef.current) {
      apply(String(Math.round(Number(v) * ratioRef.current)), v);
    } else {
      apply(width, v);
    }
  };

  const toggleLock = () => {
    // When re-enabling the lock, fix the ratio from the current W/H.
    const w = Number(width);
    const h = Number(height);
    if (!locked && w && h) ratioRef.current = w / h;
    setLocked((v) => !v);
  };

  const reset = () => apply("", "");

  return (
    <div className="flex items-center gap-1.5">
      <Button variant="ghost" size="icon-sm" onClick={onBack}
        tooltip={intl.formatMessage({ defaultMessage: "Back", id: "back" })}>
        <ChevronLeft className="size-4" />
      </Button>
      <span className="text-xs text-muted-foreground">
        {intl.formatMessage({ defaultMessage: "Width", id: "width" })}
      </span>
      <Input
        value={width}
        onChange={(e) => onWidth(e.target.value)}
        placeholder="auto"
        className="h-8 w-16"
      />
      <Button variant="ghost" size="icon-sm" onClick={toggleLock}
        tooltip={intl.formatMessage({ defaultMessage: "Lock aspect ratio", id: "lockAspect" })}>
        {locked ? <Lock className="size-4" /> : <Unlock className="size-4" />}
      </Button>
      <span className="text-xs text-muted-foreground">
        {intl.formatMessage({ defaultMessage: "Height", id: "height" })}
      </span>
      <Input
        value={height}
        onChange={(e) => onHeight(e.target.value)}
        placeholder="auto"
        className="h-8 w-16"
      />
      <Button variant="ghost" size="sm" onClick={reset}>
        {intl.formatMessage({ defaultMessage: "Reset", id: "reset" })}
      </Button>
    </div>
  );
}
