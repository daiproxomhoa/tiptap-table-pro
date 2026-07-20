import { useState } from "react";
import { ChevronLeft, Check } from "../../../lib/icons";
import { useIntl } from "../../../lib/intl";
import { Button } from "../../primitives/button";
import { Input } from "../../primitives/input";
import type { PanelProps } from "./constants";

export function AltPanel({ editor, onBack }: PanelProps) {
  const intl = useIntl();
  const [alt, setAlt] = useState<string>(editor.getAttributes("image").alt ?? "");
  const save = () => {
    editor.chain().focus().updateAttributes("image", { alt }).run();
    onBack();
  };
  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon-sm" onClick={onBack}
        tooltip={intl.formatMessage({ defaultMessage: "Back", id: "back" })}>
        <ChevronLeft className="size-4" />
      </Button>
      <Input
        value={alt}
        onChange={(e) => setAlt(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && save()}
        placeholder={intl.formatMessage({ defaultMessage: "Alt text", id: "altText" })}
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
