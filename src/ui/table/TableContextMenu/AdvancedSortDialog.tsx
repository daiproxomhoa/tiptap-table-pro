import { useState } from "react";
import type { Editor } from "@tiptap/react";
import { TableMap } from "@tiptap/pm/tables";
import { FormattedMessage, useIntl } from "../../../lib/intl";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../primitives/dialog";
import { Button } from "../../primitives/button";
import { FieldLabel } from "../../primitives/field-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../primitives/select";

interface AdvancedSortDialogProps {
  editor: Editor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Sort by column (0-based) + direction. */
  onSort: (column: number, dir: "asc" | "desc") => void;
}

/** List of columns of the focused table; the label comes from the header cell if present, otherwise "Column N". */
function useColumns(editor: Editor): string[] {
  const attrs = editor.getAttributes("table");
  if (!attrs) return [];
  const node = editor.state.selection.$anchor.node(
    findTableDepth(editor),
  );
  if (!node) return [];
  try {
    const map = TableMap.get(node);
    const cols: string[] = [];
    for (let c = 0; c < map.width; c++) {
      const rel = map.map[c]; // row 0
      const cell = node.nodeAt(rel);
      const text = cell?.textContent.trim();
      cols.push(text || "");
    }
    return cols;
  } catch {
    return [];
  }
}

function findTableDepth(editor: Editor): number {
  const $a = editor.state.selection.$anchor;
  for (let d = $a.depth; d > 0; d--) {
    if ($a.node(d).type.spec.tableRole === "table") return d;
  }
  return 0;
}

export function AdvancedSortDialog({
  editor,
  open,
  onOpenChange,
  onSort,
}: AdvancedSortDialogProps) {
  const intl = useIntl();
  const columns = useColumns(editor);
  const [col, setCol] = useState("0");
  const [dir, setDir] = useState<"asc" | "desc">("asc");

  const submit = () => {
    onSort(Number(col), dir);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            <FormattedMessage defaultMessage="Advanced sort" id="advancedSort" />
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 px-3 pb-3 sm:px-6 sm:pb-6">
          <FieldLabel
            label={intl.formatMessage({ defaultMessage: "Column", id: "column" })}
          >
            <Select value={col} onValueChange={setCol}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {columns.map((label, i) => (
                  <SelectItem key={i} value={String(i)}>
                    {label ||
                      intl.formatMessage(
                        { defaultMessage: "Column {n}", id: "columnN" },
                        { n: i + 1 },
                      )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldLabel>
          <FieldLabel
            label={intl.formatMessage({ defaultMessage: "Order", id: "order" })}
          >
            <Select value={dir} onValueChange={(v) => setDir(v as "asc" | "desc")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">
                  {intl.formatMessage({ defaultMessage: "Ascending", id: "ascending" })}
                </SelectItem>
                <SelectItem value="desc">
                  {intl.formatMessage({ defaultMessage: "Descending", id: "descending" })}
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
          <Button className="min-w-25" onClick={submit}>
            <FormattedMessage defaultMessage="Sort" id="sort" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
