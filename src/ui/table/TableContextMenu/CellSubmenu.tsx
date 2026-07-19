import { FormattedMessage } from "../../../lib/intl";
import {
  Columns2,
  Combine,
  Split,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
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

/** Submenu "Ô": thuộc tính ô (căn lề), merge/split. */
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
        <FormattedMessage defaultMessage="Ô" id="wT3UNz" />
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem onClick={() => run(onProperties)}>
          <FormattedMessage defaultMessage="Thuộc tính ô (căn lề)" id="M8lKBW" />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => run(() => actions.setCellAlign("left"))}>
          <AlignLeft className="mr-2 size-4" />
          <FormattedMessage defaultMessage="Căn trái" id="hnlnfK" />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => run(() => actions.setCellAlign("center"))}>
          <AlignCenter className="mr-2 size-4" />
          <FormattedMessage defaultMessage="Căn giữa" id="GQDYpC" />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => run(() => actions.setCellAlign("right"))}>
          <AlignRight className="mr-2 size-4" />
          <FormattedMessage defaultMessage="Căn phải" id="C7BB9/" />
        </DropdownMenuItem>
        {(canMerge || canSplit) && <DropdownMenuSeparator />}
        {canMerge && (
          <DropdownMenuItem onClick={() => run(actions.mergeCells)}>
            <Combine className="mr-2 size-4" />
            <FormattedMessage defaultMessage="Merge các ô đã chọn" id="pd7oWl" />
          </DropdownMenuItem>
        )}
        {canSplit && (
          <DropdownMenuItem onClick={() => run(actions.splitCell)}>
            <Split className="mr-2 size-4" />
            <FormattedMessage defaultMessage="Split ô đã merge" id="KEMj8C" />
          </DropdownMenuItem>
        )}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
