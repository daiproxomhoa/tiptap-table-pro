import { useReducer, useState } from "react";
import type { Editor } from "@tiptap/react";
import { FormattedMessage } from "../../../../lib/intl";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../primitives/dialog";
import { Button } from "../../../primitives/button";
import { DialogSideTabs, type DialogTab } from "../DialogSideTabs";
import {
  firstCellBorderColor,
  firstCellAttr,
  normalizeBorderWidth,
  setAllCellsAttrs,
} from "../../utils";
import { NONE, type TableForm } from "./constants";
import { GeneralTab } from "./GeneralTab";
import { AdvancedTab } from "./AdvancedTab";

interface TablePropertiesDialogProps {
  editor: Editor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Read width/height from the table's style attribute "width: ...; height: ...". */
function parseStyle(style: string | null): { width: string; height: string } {
  const w = style?.match(/width:\s*([^;]+)/)?.[1]?.trim() ?? "";
  const h = style?.match(/height:\s*([^;]+)/)?.[1]?.trim() ?? "";
  return { width: w, height: h };
}

/** Seed the form from the table's attrs + the first cell's (the border is a per-cell attr). */
function initTableForm(editor: Editor): TableForm {
  const attrs = editor.getAttributes("table");
  const initial = parseStyle(attrs.style ?? null);
  const cellBorder = firstCellBorderColor(editor);
  return {
    width: initial.width,
    height: initial.height,
    align: attrs.align ?? "left",
    borderless: cellBorder === "transparent",
    borderColor: cellBorder && cellBorder !== "transparent" ? cellBorder : "",
    borderWidth: firstCellAttr(editor, "borderWidth") ?? "",
    borderStyle: firstCellAttr(editor, "borderStyle") ?? NONE,
  };
}

export function TablePropertiesDialog({
  editor,
  open,
  onOpenChange,
}: TablePropertiesDialogProps) {
  const [tab, setTab] = useState<DialogTab>("general");
  // 7 fields of one form → a single patch-style reducer instead of 7 useState hooks:
  // patch({ width: "50%" }) — adding a field only touches TableForm + initTableForm.
  const [form, patch] = useReducer(
    (s: TableForm, p: Partial<TableForm>): TableForm => ({ ...s, ...p }),
    editor,
    initTableForm,
  );

  const save = () => {
    const parts: string[] = [];
    if (form.width.trim()) parts.push(`width: ${form.width.trim()}`);
    if (form.height.trim()) parts.push(`height: ${form.height.trim()}`);
    const style = parts.join("; ") || null;
    const cellBorderColor = form.borderless
      ? "transparent"
      : form.borderColor.trim() || null;
    editor
      .chain()
      .focus()
      .updateAttributes("table", { style, align: form.align })
      .run();
    setAllCellsAttrs(editor, {
      borderColor: cellBorderColor,
      // A bare number is read as px (normalizeBorderWidth).
      borderWidth: normalizeBorderWidth(form.borderWidth),
      borderStyle: form.borderStyle === NONE ? null : form.borderStyle,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            <FormattedMessage defaultMessage="Table properties" id="tableProperties" />
          </DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 gap-4 overflow-y-auto px-3 pb-3 sm:px-6 sm:pb-6">
          <DialogSideTabs tab={tab} onChange={setTab} />

          <div className="flex-1 space-y-3">
            {tab === "general" ? (
              <GeneralTab form={form} onPatch={patch} />
            ) : (
              <AdvancedTab form={form} onPatch={patch} />
            )}
          </div>
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
