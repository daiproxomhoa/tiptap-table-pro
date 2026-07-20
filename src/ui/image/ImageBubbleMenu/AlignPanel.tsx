import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronLeft,
} from "../../../lib/icons";
import { useEditorState } from "@tiptap/react";
import { useIntl } from "../../../lib/intl";
import { Button } from "../../primitives/button";
import type { PanelProps } from "./constants";

export function AlignPanel({ editor, onBack }: PanelProps) {
  const intl = useIntl();
  const align = useEditorState({
    editor,
    selector: ({ editor: e }) => e.getAttributes("image").align ?? "left",
  });
  const set = (v: string) =>
    editor.chain().focus().updateAttributes("image", { align: v }).run();
  return (
    <div className="flex items-center gap-0.5">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onBack}
        tooltip={intl.formatMessage({
          defaultMessage: "Back", id: "back",
        })}
      >
        <ChevronLeft className="size-4" />
      </Button>
      <Button
        variant={align === "left" ? "default" : "ghost"}
        size="icon-sm"
        onClick={() => set("left")}
        tooltip={intl.formatMessage({
          defaultMessage: "Align left", id: "alignLeft",
        })}
      >
        <AlignLeft className="size-4" />
      </Button>
      <Button
        variant={align === "center" ? "default" : "ghost"}
        size="icon-sm"
        onClick={() => set("center")}
        tooltip={intl.formatMessage({
          defaultMessage: "Align center", id: "alignCenter",
        })}
      >
        <AlignCenter className="size-4" />
      </Button>
      <Button
        variant={align === "right" ? "default" : "ghost"}
        size="icon-sm"
        onClick={() => set("right")}
        tooltip={intl.formatMessage({
          defaultMessage: "Align right", id: "alignRight",
        })}
      >
        <AlignRight className="size-4" />
      </Button>
    </div>
  );
}
