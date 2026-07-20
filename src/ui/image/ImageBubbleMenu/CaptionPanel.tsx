import { useState } from "react";
import { ChevronLeft, Check } from "../../../lib/icons";
import { useIntl } from "../../../lib/intl";
import { Button } from "../../primitives/button";
import { Input } from "../../primitives/input";
import type { PanelProps } from "./constants";

/** Read the current caption: if the image is inside a figure, take the text of
 * its figcaption. */
function currentCaption(editor: PanelProps["editor"]): string {
  const { $from } = editor.state.selection;
  for (let d = $from.depth; d > 0; d--) {
    if ($from.node(d).type.name === "figure") {
      const figure = $from.node(d);
      let text = "";
      figure.forEach((child) => {
        if (child.type.name === "figcaption") text = child.textContent;
      });
      return text;
    }
  }
  return "";
}

export function CaptionPanel({ editor, onBack }: PanelProps) {
  const intl = useIntl();
  const [caption, setCaption] = useState<string>(() => currentCaption(editor));

  const save = () => {
    const text = caption.trim();
    editor
      .chain()
      .focus()
      .command(({ tr, state }) => {
        const { $from } = state.selection;
        let figureDepth = -1;
        for (let d = $from.depth; d >= 0; d--) {
          if ($from.node(d).type.name === "figure") figureDepth = d;
        }
        const sel = state.selection;
        const node = state.doc.nodeAt(sel.from);
        let imagePos = -1;
        if (node?.type.name === "image") {
          imagePos = sel.from;
        } else {
          // Fallback: caret adjacent to the image → the node right before the cursor.
          const before = $from.nodeBefore;
          if (before?.type.name === "image") imagePos = sel.from - before.nodeSize;
        }

        const imageType = state.schema.nodes.image;
        const figureType = state.schema.nodes.figure;
        const figcaptionType = state.schema.nodes.figcaption;

        if (figureDepth >= 0) {
          const figurePos = $from.before(figureDepth);
          const figure = $from.node(figureDepth);
          if (!text) {
            const img = figure.child(0);
            tr.replaceWith(figurePos, figurePos + figure.nodeSize, img);
          } else {
            const img = figure.child(0);
            const cap = figcaptionType.create(null, state.schema.text(text));
            const newFigure = figureType.create(null, [img, cap]);
            tr.replaceWith(figurePos, figurePos + figure.nodeSize, newFigure);
          }
          return true;
        }

        if (imagePos >= 0 && text) {
          const img = state.doc.nodeAt(imagePos)!;
          const cap = figcaptionType.create(null, state.schema.text(text));
          const figure = figureType.create(null, [
            imageType.create(img.attrs),
            cap,
          ]);
          tr.replaceWith(imagePos, imagePos + img.nodeSize, figure);
          return true;
        }
        return false;
      })
      .run();
    onBack();
  };

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon-sm" onClick={onBack}
        tooltip={intl.formatMessage({ defaultMessage: "Back", id: "back" })}>
        <ChevronLeft className="size-4" />
      </Button>
      <Input
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && save()}
        placeholder={intl.formatMessage({ defaultMessage: "Image caption", id: "captionPlaceholder" })}
        className="h-8 w-56"
        autoFocus
      />
      <Button variant="ghost" size="icon-sm" onClick={save}
        tooltip={intl.formatMessage({ defaultMessage: "Save", id: "save" })}>
        <Check className="size-4" />
      </Button>
    </div>
  );
}
