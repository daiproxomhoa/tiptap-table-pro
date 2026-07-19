import { FormattedMessage } from "../../../lib/intl";
import {
  ArrowLeftToLine,
  ArrowRightToLine,
  Scissors,
  Copy,
  ClipboardPaste,
  Trash2,
  Columns3,
} from "lucide-react";
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

/** Submenu "Cột": thêm/xoá/cut/copy/paste cột. */
export function ColumnSubmenu({ actions, run }: ColumnSubmenuProps) {
  const canPaste = actions.canPasteColumn();
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Columns3 className="mr-2 size-4" />
        <FormattedMessage defaultMessage="Cột" id="9JDnfL" />
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem onClick={() => run(actions.addColumnBefore)}>
          <ArrowLeftToLine className="mr-2 size-4" />
          <FormattedMessage defaultMessage="Thêm cột bên trái" id="PKMfyo" />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => run(actions.addColumnAfter)}>
          <ArrowRightToLine className="mr-2 size-4" />
          <FormattedMessage defaultMessage="Thêm cột bên phải" id="Wld4nM" />
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => run(actions.deleteColumn)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 size-4" />
          <FormattedMessage defaultMessage="Xoá cột hiện tại" id="nmjWQ+" />
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => run(actions.cutColumn)}>
          <Scissors className="mr-2 size-4" />
          <FormattedMessage defaultMessage="Cắt cột" id="wiUPb4" />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => run(actions.copyColumn)}>
          <Copy className="mr-2 size-4" />
          <FormattedMessage defaultMessage="Sao chép cột" id="P5Oapb" />
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!canPaste}
          onClick={() => run(actions.pasteColumnBefore)}
        >
          <ClipboardPaste className="mr-2 size-4" />
          <FormattedMessage defaultMessage="Dán cột bên trái" id="J1uCc3" />
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!canPaste}
          onClick={() => run(actions.pasteColumnAfter)}
        >
          <ClipboardPaste className="mr-2 size-4" />
          <FormattedMessage defaultMessage="Dán cột bên phải" id="D40ZCt" />
        </DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
