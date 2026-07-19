import { FormattedMessage } from "../../../lib/intl";
import {
  Columns2,
  Combine,
  Split,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "../../../lib/icons";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "../../primitives/dropdown-menu";
import type { useTableActions } from "./useTableActions";

interface CellSubmenuProps {
  actions: ReturnType<typeof useTableActions>;
  run: (fn: () => void) => void;
  canMerge: boolean;
  canSplit: boolean;
  onProperties: () => void;
}

/** "Cell" submenu: cell properties (alignment), merge/split. */
export function CellSubmenu({
  actions,
  run,
  canMerge,
  canSplit,
  onProperties,
}: CellSubmenuProps) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Columns2 className="mr-2 size-4" />
        <FormattedMessage defaultMessage="Cell" id="cell" />
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem onClick={() => run(onProperties)}>
          <FormattedMessage defaultMessage="Cell properties (alignment)" id="cellPropertiesAlign" />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => run(() => actions.setCellAlign("left"))}>
          <AlignLeft className="mr-2 size-4" />
          <FormattedMessage defaultMessage="Align left" id="alignLeft" />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => run(() => actions.setCellAlign("center"))}>
          <AlignCenter className="mr-2 size-4" />
          <FormattedMessage defaultMessage="Align center" id="alignCenter" />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => run(() => actions.setCellAlign("right"))}>
          <AlignRight className="mr-2 size-4" />
          <FormattedMessage defaultMessage="Align right" id="alignRight" />
        </DropdownMenuItem>
        {(canMerge || canSplit) && <DropdownMenuSeparator />}
        {canMerge && (
          <DropdownMenuItem onClick={() => run(actions.mergeCells)}>
            <Combine className="mr-2 size-4" />
            <FormattedMessage defaultMessage="Merge selected cells" id="mergeCells" />
          </DropdownMenuItem>
        )}
        {canSplit && (
          <DropdownMenuItem onClick={() => run(actions.splitCell)}>
            <Split className="mr-2 size-4" />
            <FormattedMessage defaultMessage="Split merged cell" id="splitCell" />
          </DropdownMenuItem>
        )}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
