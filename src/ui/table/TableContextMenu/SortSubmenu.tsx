import { FormattedMessage } from "../../../lib/intl";
import { ArrowDownAZ, ArrowUpAZ, Settings2, ArrowDownUp } from "../../../lib/icons";
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

/** "Sort" submenu: ascending/descending by the current column, or advanced (choose a column). */
export function SortSubmenu({ actions, run, onAdvanced }: SortSubmenuProps) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <ArrowDownUp className="mr-2 size-4" />
        <FormattedMessage defaultMessage="Sort" id="sort" />
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem onClick={() => run(actions.sortAsc)}>
          <ArrowUpAZ className="mr-2 size-4" />
          <FormattedMessage defaultMessage="Sort ascending by this column" id="sortAscByColumn" />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => run(actions.sortDesc)}>
          <ArrowDownAZ className="mr-2 size-4" />
          <FormattedMessage defaultMessage="Sort descending by this column" id="sortDescByColumn" />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => run(onAdvanced)}>
          <Settings2 className="mr-2 size-4" />
          <FormattedMessage defaultMessage="Advanced sort…" id="advancedSortMenu" />
        </DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
