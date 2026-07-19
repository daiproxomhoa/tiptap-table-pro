import { useState } from "react";
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
import { CellColorField } from "../CellColorField";
import { BorderStyleSelect } from "../BorderStyleSelect";
import { DialogSideTabs, type DialogTab } from "../DialogSideTabs";
import { NONE } from "./constants";
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

export function CellPropertiesDialog({
  editor,
  open,
  onOpenChange,
}: CellPropertiesDialogProps) {
  const intl = useIntl();
  const attrs = currentCellAttrs(editor);
  const isHeader = editor.isActive("tableHeader");

  const [tab, setTab] = useState<DialogTab>("general");
  const [cellType, setCellType] = useState(isHeader ? "header" : "cell");
  const [scope, setScope] = useState<string>(attrs.scope ?? NONE);
  const [hAlign, setHAlign] = useState<string>(attrs.textAlign ?? NONE);
  const [vAlign, setVAlign] = useState<string>(attrs.verticalAlign ?? NONE);
  const [borderWidth, setBorderWidth] = useState<string>(
    attrs.borderWidth ?? "",
  );
  const [borderStyle, setBorderStyle] = useState<string>(
    attrs.borderStyle ?? NONE,
  );
  const [borderColor, setBorderColor] = useState<string>(
    attrs.borderColor && attrs.borderColor !== "transparent"
      ? attrs.borderColor
      : "",
  );
  const [bgColor, setBgColor] = useState<string>(attrs.backgroundColor ?? "");

  const save = () => {
    const chain = editor.chain().focus();
    // Change the cell type (cell ↔ header) if it differs from the current one.
    if ((cellType === "header") !== isHeader) chain.toggleHeaderCell();
    chain
      .setCellAttribute("scope", scope === NONE ? null : scope)
      .setCellAttribute("textAlign", hAlign === NONE ? null : hAlign)
      .setCellAttribute("verticalAlign", vAlign === NONE ? null : vAlign)
      .setCellAttribute("borderWidth", borderWidth.trim() || null)
      .setCellAttribute("borderStyle", borderStyle === NONE ? null : borderStyle)
      .setCellAttribute("borderColor", borderColor.trim() || null)
      .setCellAttribute("backgroundColor", bgColor.trim() || null)
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
              <GeneralTab
                cellType={cellType}
                setCellType={setCellType}
                scope={scope}
                setScope={setScope}
                hAlign={hAlign}
                setHAlign={setHAlign}
                vAlign={vAlign}
                setVAlign={setVAlign}
              />
            ) : (
              <div className="space-y-3">
                <FieldLabel
                  label={intl.formatMessage({
                    defaultMessage: "Border width", id: "borderWidth",
                  })}
                >
                  <input
                    value={borderWidth}
                    onChange={(e) => setBorderWidth(e.target.value)}
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
                    value={borderStyle}
                    onChange={setBorderStyle}
                  />
                </FieldLabel>

                <CellColorField
                  label={intl.formatMessage({
                    defaultMessage: "Border color", id: "borderColor",
                  })}
                  value={borderColor}
                  onChange={setBorderColor}
                />

                <CellColorField
                  label={intl.formatMessage({
                    defaultMessage: "Background color", id: "background",
                  })}
                  value={bgColor}
                  onChange={setBgColor}
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
