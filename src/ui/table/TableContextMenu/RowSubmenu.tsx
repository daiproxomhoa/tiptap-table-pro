import { FormattedMessage } from "../../../lib/intl";
import {
  ArrowUpToLine,
  ArrowDownToLine,
  Scissors,
  Copy,
  ClipboardPaste,
  Trash2,
  Rows3,
} from "lucide-react";
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

/** Submenu "Hàng": thêm/xoá/cut/copy/paste hàng. */
export function RowSubmenu({ actions, run }: RowSubmenuProps) {
  const canPaste = actions.canPasteRow();
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Rows3 className="mr-2 size-4" />
        <FormattedMessage defaultMessage="Hàng" id="YwJzyx" />
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem onClick={() => run(actions.addRowBefore)}>
          <ArrowUpToLine className="mr-2 size-4" />
          <FormattedMessage defaultMessage="Thêm hàng phía trên" id="72ns8b" />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => run(actions.addRowAfter)}>
          <ArrowDownToLine className="mr-2 size-4" />
          <FormattedMessage defaultMessage="Thêm hàng phía dưới" id="08BSnP" />
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => run(actions.deleteRow)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 size-4" />
          <FormattedMessage defaultMessage="Xoá hàng hiện tại" id="4Vx0tG" />
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => run(actions.cutRow)}>
          <Scissors className="mr-2 size-4" />
          <FormattedMessage defaultMessage="Cắt hàng" id="6XNfrm" />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => run(actions.copyRow)}>
          <Copy className="mr-2 size-4" />
          <FormattedMessage defaultMessage="Sao chép hàng" id="Oj5Edn" />
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!canPaste}
          onClick={() => run(actions.pasteRowBefore)}
        >
          <ClipboardPaste className="mr-2 size-4" />
          <FormattedMessage defaultMessage="Dán hàng phía trên" id="8MwLmY" />
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!canPaste}
          onClick={() => run(actions.pasteRowAfter)}
        >
          <ClipboardPaste className="mr-2 size-4" />
          <FormattedMessage defaultMessage="Dán hàng phía dưới" id="a80ld/" />
        </DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
