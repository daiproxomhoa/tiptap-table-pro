import { useState } from "react";
import type { Editor } from "@tiptap/core";
import { cn } from "../lib/utils";
import { FormattedMessage, useIntl } from "../lib/intl";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./primitives/dialog";
import { Button } from "./primitives/button";
import { Input } from "./primitives/input";
import { FieldLabel } from "./primitives/field-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./primitives/select";

interface LinkDialogProps {
  editor: Editor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Extra class names merged onto the dialog content. */
  className?: string;
}

type Target = "_self" | "_blank";

/** The text currently highlighted in the selection (used to pre-fill "Text to display"). */
function selectedText(editor: Editor): string {
  const { from, to } = editor.state.selection;
  return editor.state.doc.textBetween(from, to, " ");
}

/** Dialog for inserting/editing a link: URL, display text, title, and which window to open it in. */
export function LinkDialog({
  editor,
  open,
  onOpenChange,
  className,
}: LinkDialogProps) {
  const intl = useIntl();
  const attrs = editor.getAttributes("link");
  const [href, setHref] = useState<string>(attrs.href ?? "");
  const [text, setText] = useState<string>(() => selectedText(editor));
  const [title, setTitle] = useState<string>(attrs.title ?? "");
  const [target, setTarget] = useState<Target>(
    attrs.target === "_blank" ? "_blank" : "_self",
  );

  const save = () => {
    const url = href.trim();
    if (!url) {
      editor.chain().focus().unsetLink().run();
      onOpenChange(false);
      return;
    }
    const linkAttrs = {
      href: url,
      title: title.trim() || null,
      target,
      rel: target === "_blank" ? "noopener noreferrer nofollow" : null,
    };
    const chain = editor.chain().focus();
    const display = text.trim();
    const { from, to } = editor.state.selection;
    if (display && (editor.state.selection.empty || display !== selectedText(editor))) {
      // Replace the selection (or insert new content) with the display text, then attach the link to it
      chain
        .insertContentAt({ from, to }, display)
        .setTextSelection({ from, to: from + display.length })
        .setLink(linkAttrs)
        .run();
    } else {
      chain.setLink(linkAttrs).run();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("ttp-link-dialog sm:max-w-lg", className)}>
        <DialogHeader>
          <DialogTitle>
            <FormattedMessage defaultMessage="Insert / edit link" id="insertEditLink" />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 px-3 pb-3 sm:px-6 sm:pb-6">
          <FieldLabel label="URL">
            <Input
              autoFocus
              value={href}
              onChange={(e) => setHref(e.target.value)}
              placeholder="https://..."
            />
          </FieldLabel>
          <FieldLabel
            label={intl.formatMessage({
              defaultMessage: "Text to display", id: "displayText",
            })}
          >
            <Input value={text} onChange={(e) => setText(e.target.value)} />
          </FieldLabel>
          <FieldLabel
            label={intl.formatMessage({ defaultMessage: "Title", id: "title" })}
          >
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </FieldLabel>
          <FieldLabel
            label={intl.formatMessage({ defaultMessage: "Open in", id: "openIn" })}
          >
            <Select value={target} onValueChange={(v) => setTarget(v as Target)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_self">
                  {intl.formatMessage({
                    defaultMessage: "Current window", id: "currentWindow",
                  })}
                </SelectItem>
                <SelectItem value="_blank">
                  {intl.formatMessage({ defaultMessage: "New tab", id: "newTab" })}
                </SelectItem>
              </SelectContent>
            </Select>
          </FieldLabel>
        </div>

        <DialogFooter className="border-t">
          <Button
            variant="outline"
            className="min-w-25"
            onClick={() => onOpenChange(false)}
          >
            <FormattedMessage defaultMessage="Cancel" id="cancel" />
          </Button>
          <Button className="min-w-25" onClick={save}>
            <FormattedMessage defaultMessage="Save" id="save" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
