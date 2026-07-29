import { useReducer, useState } from "react";
import type { Editor } from "@tiptap/react";
import { FormattedMessage, useIntl } from "../../../../lib/intl";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../primitives/dialog";
import { Button } from "../../../primitives/button";
import { FieldLabel } from "../../../primitives/field-label";
import { normalizeBorderWidth } from "../../utils";
import { CellColorField } from "../CellColorField";
import { BorderStyleSelect } from "../BorderStyleSelect";
import { DialogSideTabs, type DialogTab } from "../DialogSideTabs";
import { NONE, type CellForm } from "./constants";
import { GeneralTab } from "./GeneralTab";

interface CellPropertiesDialogProps {
  editor: Editor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Read the current cell's attributes (merging tableCell + tableHeader; whichever is active has values). */
function currentCellAttrs(editor: Editor) {
  return {
    ...editor.getAttributes("tableCell"),
    ...editor.getAttributes("tableHeader"),
  };
}

/** Seed the form from the selected cell's attrs (the dialog mounts fresh each time it opens). */
function initCellForm(editor: Editor): CellForm {
  const attrs = currentCellAttrs(editor);
  return {
    cellType: editor.isActive("tableHeader") ? "header" : "cell",
    scope: attrs.scope ?? NONE,
    hAlign: attrs.textAlign ?? NONE,
    vAlign: attrs.verticalAlign ?? NONE,
    borderWidth: attrs.borderWidth ?? "",
    borderStyle: attrs.borderStyle ?? NONE,
    borderColor:
      attrs.borderColor && attrs.borderColor !== "transparent"
        ? attrs.borderColor
        : "",
    bgColor: attrs.backgroundColor ?? "",
  };
}

export function CellPropertiesDialog({
  editor,
  open,
  onOpenChange,
}: CellPropertiesDialogProps) {
  const intl = useIntl();
  const isHeader = editor.isActive("tableHeader");

  const [tab, setTab] = useState<DialogTab>("general");
  // 8 fields of one form → a single patch-style reducer instead of 8 useState hooks:
  // patch({ scope: "row" }) — adding a field only touches CellForm + initCellForm.
  const [form, patch] = useReducer(
    (s: CellForm, p: Partial<CellForm>): CellForm => ({ ...s, ...p }),
    editor,
    initCellForm,
  );

  const save = () => {
    const chain = editor.chain().focus();
    // Change the cell type (cell ↔ header) if it differs from the current one.
    if ((form.cellType === "header") !== isHeader) chain.toggleHeaderCell();
    chain
      .setCellAttribute("scope", form.scope === NONE ? null : form.scope)
      .setCellAttribute("textAlign", form.hAlign === NONE ? null : form.hAlign)
      .setCellAttribute(
        "verticalAlign",
        form.vAlign === NONE ? null : form.vAlign,
      )
      // A bare number is read as px (normalizeBorderWidth).
      .setCellAttribute("borderWidth", normalizeBorderWidth(form.borderWidth))
      .setCellAttribute(
        "borderStyle",
        form.borderStyle === NONE ? null : form.borderStyle,
      )
      .setCellAttribute("borderColor", form.borderColor.trim() || null)
      .setCellAttribute("backgroundColor", form.bgColor.trim() || null)
      .run();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            <FormattedMessage defaultMessage="Cell properties" id="cellProperties" />
          </DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 gap-4 overflow-y-auto px-3 pb-3 sm:px-6 sm:pb-6">
          <DialogSideTabs tab={tab} onChange={setTab} />

          <div className="flex-1 space-y-3">
            {tab === "general" ? (
              <GeneralTab form={form} onPatch={patch} />
            ) : (
              <div className="space-y-3">
                <FieldLabel
                  label={intl.formatMessage({
                    defaultMessage: "Border width", id: "borderWidth",
                  })}
                >
                  <input
                    value={form.borderWidth}
                    onChange={(e) => patch({ borderWidth: e.target.value })}
                    placeholder="1px"
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-hidden focus:ring-1 focus:ring-ring"
                  />
                </FieldLabel>

                <FieldLabel
                  label={intl.formatMessage({
                    defaultMessage: "Border style", id: "borderStyle",
                  })}
                >
                  <BorderStyleSelect
                    value={form.borderStyle}
                    onChange={(v) => patch({ borderStyle: v })}
                  />
                </FieldLabel>

                <CellColorField
                  label={intl.formatMessage({
                    defaultMessage: "Border color", id: "borderColor",
                  })}
                  value={form.borderColor}
                  onChange={(v) => patch({ borderColor: v })}
                />

                <CellColorField
                  label={intl.formatMessage({
                    defaultMessage: "Background color", id: "background",
                  })}
                  value={form.bgColor}
                  onChange={(v) => patch({ bgColor: v })}
                />
              </div>
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
