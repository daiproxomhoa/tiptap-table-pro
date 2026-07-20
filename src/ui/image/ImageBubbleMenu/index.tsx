import { useEditorState } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import { useEffect, useState } from "react";
import { useIntl } from "../../../lib/intl";
import {
  AlignLeft,
  SlidersHorizontal,
  Frame,
  Captions,
  RotateCcw as ResetIcon,
} from "../../../lib/icons";
import { Button } from "../../primitives/button";
import { TooltipProvider } from "../../primitives/tooltip";
import type { Panel } from "./constants";
import { DEFAULT_ADJUST } from "./constants";
import { unwrapFigure } from "./utils";
import { AlignPanel } from "./AlignPanel";
import { TransformPanel } from "./TransformPanel";
import { ResizePanel } from "./ResizePanel";
import { AdjustPanel } from "./AdjustPanel";
import { AltPanel } from "./AltPanel";
import { CaptionPanel } from "./CaptionPanel";

export function ImageBubbleMenu({ editor }: { editor: Editor }) {
  const intl = useIntl();
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [panel, setPanel] = useState<Panel>("main");

  const isImage = useEditorState({
    editor,
    selector: ({ editor: e }) => e.isActive("image"),
  });

  useEffect(() => {
    if (!isImage) return;
    let observed: HTMLImageElement | null = null;
    const ro = new ResizeObserver(() => updatePos());
    const updatePos = () => {
      const selection = editor.view.state.selection;
      // nodeDOM may return a Text node (caret at a text boundary) — if it's not
      // an Element, skip it, otherwise ro.observe(Text) throws mid-dispatch of
      // selectionUpdate.
      const node = editor.view.nodeDOM(selection.from) as HTMLElement | null;
      const img =
        node?.querySelector?.("img") ??
        (node instanceof HTMLImageElement ? node : null);
      if (img) {
        if (observed !== img) {
          if (observed) ro.unobserve(observed);
          ro.observe(img);
          observed = img;
        }
        // With a caption → measure against the <figure> (which includes the
        // figcaption) so the menu sits BELOW the caption without covering it.
        // No figure → use the displayed bbox (the wrapper, with W↔H already
        // swapped when rotated), and finally fall back to the img.
        const anchor =
          img.closest("figure") ??
          img.closest("[data-resize-wrapper]") ??
          img;
        const r = anchor.getBoundingClientRect();
        setPos({ x: r.left + r.width / 2, y: r.bottom });
      }
    };
    updatePos();
    editor.on("selectionUpdate", updatePos);
    editor.on("update", updatePos);
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      ro.disconnect();
      editor.off("selectionUpdate", updatePos);
      editor.off("update", updatePos);
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
      setPanel("main");
    };
  }, [isImage, editor]);

  if (!isImage || !pos) return null;

  const back = () => setPanel("main");
  const reset = () => {
    unwrapFigure(editor);
    editor
      .chain()
      .focus()
      .updateAttributes("image", {
        align: "left",
        rotate: 0,
        flipX: false,
        flipY: false,
        adjust: { ...DEFAULT_ADJUST },
        width: null,
        height: null,
        alt: "",
      })
      .run();
  };

  return (
    <TooltipProvider delayDuration={400}>
      <div
        style={{
          position: "fixed",
          left: pos.x,
          top: pos.y + 8,
          transform: "translate(-50%, 0)",
          zIndex: 50,
        }}
        className="flex items-center gap-0.5 rounded-md border bg-background px-1 py-0.5 shadow-md"
      >
        {panel === "main" && (
          <>
            <Button variant="ghost" size="icon-sm" onClick={() => setPanel("align")}
              tooltip={intl.formatMessage({ defaultMessage: "Alignment", id: "alignment" })}>
              <AlignLeft className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => setPanel("transform")}
              tooltip={intl.formatMessage({ defaultMessage: "Transform", id: "transform" })}>
              <Frame className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => setPanel("adjust")}
              tooltip={intl.formatMessage({ defaultMessage: "Adjust", id: "adjust" })}>
              <SlidersHorizontal className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => setPanel("alt")}
              tooltip={intl.formatMessage({ defaultMessage: "Alt text", id: "altText" })}>
              <span className="text-[10px] font-bold">ALT</span>
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => setPanel("caption")}
              tooltip={intl.formatMessage({ defaultMessage: "Caption", id: "caption" })}>
              <Captions className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={reset}
              tooltip={intl.formatMessage({ defaultMessage: "Reset", id: "reset" })}>
              <ResetIcon className="size-4" />
            </Button>
          </>
        )}
        {panel === "align" && <AlignPanel editor={editor} onBack={back} />}
        {panel === "transform" && (
          <TransformPanel
            editor={editor}
            onBack={back}
            onOpenResize={() => setPanel("resize")}
          />
        )}
        {panel === "resize" && (
          <ResizePanel editor={editor} onBack={() => setPanel("transform")} />
        )}
        {panel === "adjust" && <AdjustPanel editor={editor} onBack={back} />}
        {panel === "alt" && <AltPanel editor={editor} onBack={back} />}
        {panel === "caption" && <CaptionPanel editor={editor} onBack={back} />}
      </div>
    </TooltipProvider>
  );
}
