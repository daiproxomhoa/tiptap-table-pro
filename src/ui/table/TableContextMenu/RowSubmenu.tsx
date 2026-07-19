import { FormattedMessage } from "../../../lib/intl";
import {
  ArrowUpToLine,
  ArrowDownToLine,
  Scissors,
  Copy,
  ClipboardPaste,
  Trash2,
  Rows3,
} from "../../../lib/icons";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "../../primitives/dropdown-menu";
import type { useTableActions } from "./useTableActions";

interface RowSubmenuProps {
  actions: ReturnType<typeof useTableActions>;
  run: (fn: () => void) => void;
}

/** "Row" submenu: add/delete/cut/copy/paste rows. */
export function RowSubmenu({ actions, run }: RowSubmenuProps) {
  const canPaste = actions.canPasteRow();
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Rows3 className="mr-2 size-4" />
        <FormattedMessage defaultMessage="Row" id="row" />
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem onClick={() => run(actions.addRowBefore)}>
          <ArrowUpToLine className="mr-2 size-4" />
          <FormattedMessage defaultMessage="Insert row above" id="insertRowAbove" />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => run(actions.addRowAfter)}>
          <ArrowDownToLine className="mr-2 size-4" />
          <FormattedMessage defaultMessage="Insert row below" id="insertRowBelow" />
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => run(actions.deleteRow)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 size-4" />
          <FormattedMessage defaultMessage="Delete current row" id="deleteCurrentRow" />
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => run(actions.cutRow)}>
          <Scissors className="mr-2 size-4" />
          <FormattedMessage defaultMessage="Cut row" id="cutRow" />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => run(actions.copyRow)}>
          <Copy className="mr-2 size-4" />
          <FormattedMessage defaultMessage="Copy row" id="copyRow" />
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!canPaste}
          onClick={() => run(actions.pasteRowBefore)}
        >
          <ClipboardPaste className="mr-2 size-4" />
          <FormattedMessage defaultMessage="Paste row above" id="pasteRowAbove" />
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!canPaste}
          onClick={() => run(actions.pasteRowAfter)}
        >
          <ClipboardPaste className="mr-2 size-4" />
          <FormattedMessage defaultMessage="Paste row below" id="pasteRowBelow" />
        </DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
