import { ChevronLeft } from "../../../lib/icons";
import { useEditorState } from "@tiptap/react";
import { useIntl } from "../../../lib/intl";
import { Button } from "../../primitives/button";
import { ADJUST_FIELDS, DEFAULT_ADJUST, type Adjust } from "./constants";
import type { PanelProps } from "./constants";

export function AdjustPanel({ editor, onBack }: PanelProps) {
  const intl = useIntl();
  const adjust = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      (e.getAttributes("image").adjust as Adjust) ?? DEFAULT_ADJUST,
  });
  const set = (key: keyof Adjust, value: number) =>
    editor
      .chain()
      .focus()
      .updateAttributes("image", { adjust: { ...adjust, [key]: value } })
      .run();

  return (
    <div className="flex w-64 flex-col gap-2 p-1">
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" onClick={onBack}
          tooltip={intl.formatMessage({ defaultMessage: "Back", id: "back" })}>
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-sm font-medium">
          {intl.formatMessage({ defaultMessage: "Adjust", id: "adjust" })}
        </span>
      </div>
      {ADJUST_FIELDS.map((f) => (
        <label key={f.key} className="flex items-center gap-2 text-xs">
          <span className="w-20 shrink-0">{f.label}</span>
          <input
            type="range"
            min={f.min}
            max={f.max}
            step={f.step}
            value={adjust[f.key]}
            onChange={(e) => set(f.key, Number(e.target.value))}
            className="w-full accent-primary"
          />
          <span className="w-8 text-right tabular-nums">{adjust[f.key]}</span>
        </label>
      ))}
    </div>
  );
}
