import { FormattedMessage } from "../../../lib/intl";
import {
  ArrowLeftToLine,
  ArrowRightToLine,
  Scissors,
  Copy,
  ClipboardPaste,
  Trash2,
  Columns3,
} from "../../../lib/icons";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "../../primitives/dropdown-menu";
import type { useTableActions } from "./useTableActions";

interface ColumnSubmenuProps {
  actions: ReturnType<typeof useTableActions>;
  run: (fn: () => void) => void;
}

/** "Column" submenu: add/delete/cut/copy/paste columns. */
export function ColumnSubmenu({ actions, run }: ColumnSubmenuProps) {
  const canPaste = actions.canPasteColumn();
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Columns3 className="mr-2 size-4" />
        <FormattedMessage defaultMessage="Column" id="column" />
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem onClick={() => run(actions.addColumnBefore)}>
          <ArrowLeftToLine className="mr-2 size-4" />
          <FormattedMessage defaultMessage="Insert column left" id="insertColumnLeft" />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => run(actions.addColumnAfter)}>
          <ArrowRightToLine className="mr-2 size-4" />
          <FormattedMessage defaultMessage="Insert column right" id="insertColumnRight" />
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => run(actions.deleteColumn)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 size-4" />
          <FormattedMessage defaultMessage="Delete current column" id="deleteCurrentColumn" />
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => run(actions.cutColumn)}>
          <Scissors className="mr-2 size-4" />
          <FormattedMessage defaultMessage="Cut column" id="cutColumn" />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => run(actions.copyColumn)}>
          <Copy className="mr-2 size-4" />
          <FormattedMessage defaultMessage="Copy column" id="copyColumn" />
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!canPaste}
          onClick={() => run(actions.pasteColumnBefore)}
        >
          <ClipboardPaste className="mr-2 size-4" />
          <FormattedMessage defaultMessage="Paste column left" id="pasteColumnLeft" />
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!canPaste}
          onClick={() => run(actions.pasteColumnAfter)}
        >
          <ClipboardPaste className="mr-2 size-4" />
          <FormattedMessage defaultMessage="Paste column right" id="pasteColumnRight" />
        </DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
