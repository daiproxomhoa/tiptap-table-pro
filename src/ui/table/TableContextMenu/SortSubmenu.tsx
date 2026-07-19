import { FormattedMessage } from "../../../lib/intl";
import { ArrowDownAZ, ArrowUpAZ, Settings2, ArrowDownUp } from "lucide-react";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "../../primitives/dropdown-menu";
import type { useTableActions } from "./useTableActions";

interface SortSubmenuProps {
  actions: ReturnType<typeof useTableActions>;
  run: (fn: () => void) => void;
  onAdvanced: () => void;
}

/** Submenu "Sắp xếp": tăng/giảm theo cột hiện tại, hoặc nâng cao (chọn cột). */
export function SortSubmenu({ actions, run, onAdvanced }: SortSubmenuProps) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <ArrowDownUp className="mr-2 size-4" />
        <FormattedMessage defaultMessage="Sắp xếp" id="/4Jcip" />
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem onClick={() => run(actions.sortAsc)}>
          <ArrowUpAZ className="mr-2 size-4" />
          <FormattedMessage defaultMessage="Tăng dần theo cột này" id="oElUlp" />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => run(actions.sortDesc)}>
          <ArrowDownAZ className="mr-2 size-4" />
          <FormattedMessage defaultMessage="Giảm dần theo cột này" id="TuwNzI" />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => run(onAdvanced)}>
          <Settings2 className="mr-2 size-4" />
          <FormattedMessage defaultMessage="Sắp xếp nâng cao…" id="sOBGNT" />
        </DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
