import { useState } from "react";
import type { Editor } from "@tiptap/core";
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
}

type Target = "_self" | "_blank";

/** Text đang bôi đen trong selection (để điền sẵn "Text to display"). */
function selectedText(editor: Editor): string {
  const { from, to } = editor.state.selection;
  return editor.state.doc.textBetween(from, to, " ");
}

/** Dialog chèn/sửa link: URL, text hiển thị, title, mở ở cửa sổ nào. */
export function LinkDialog({ editor, open, onOpenChange }: LinkDialogProps) {
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
      // Thay phần chọn (hoặc chèn mới) bằng text hiển thị rồi gắn link lên đó
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            <FormattedMessage defaultMessage="Chèn / Sửa liên kết" id="OJojNl" />
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
              defaultMessage: "Văn bản hiển thị",
              id: 'f8sYHj',
            })}
          >
            <Input value={text} onChange={(e) => setText(e.target.value)} />
          </FieldLabel>
          <FieldLabel
            label={intl.formatMessage({ defaultMessage: "Tiêu đề", id: 'El1V48' })}
          >
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </FieldLabel>
          <FieldLabel
            label={intl.formatMessage({ defaultMessage: "Mở ở", id: 'NmxeEt' })}
          >
            <Select value={target} onValueChange={(v) => setTarget(v as Target)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_self">
                  {intl.formatMessage({
                    defaultMessage: "Cửa sổ hiện tại",
                    id: 'G1V5pr',
                  })}
                </SelectItem>
                <SelectItem value="_blank">
                  {intl.formatMessage({ defaultMessage: "Tab mới", id: 'S1372C' })}
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
            <FormattedMessage defaultMessage="Huỷ" id="NfX0sh" />
          </Button>
          <Button className="min-w-25" onClick={save}>
            <FormattedMessage defaultMessage="Lưu" id="oa/wrx" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
