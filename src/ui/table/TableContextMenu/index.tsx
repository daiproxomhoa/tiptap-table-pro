import { useState } from "react";
import type { Editor } from "@tiptap/react";
import type { ReactNode } from "react";
import { cn } from "../../../lib/utils";
import { FormattedMessage } from "../../../lib/intl";
import { Link, Paintbrush, Settings, Trash2 } from "../../../lib/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../../primitives/dropdown-menu";
import { TableCellColorPicker } from "../TableCellColorPicker";
import { useTableActions } from "./useTableActions";
import { CellSubmenu } from "./CellSubmenu";
import { RowSubmenu } from "./RowSubmenu";
import { ColumnSubmenu } from "./ColumnSubmenu";
import { SortSubmenu } from "./SortSubmenu";
import { TablePropertiesDialog } from "./TablePropertiesDialog";
import { CellPropertiesDialog } from "./CellPropertiesDialog";
import { AdvancedSortDialog } from "./AdvancedSortDialog";
import { LinkDialog } from "../../LinkDialog";

interface TableContextMenuProps {
  editor: Editor;
  children: ReactNode;
  /** Extra class names merged onto the popup menu content. */
  className?: string;
  /** Custom swatch colors for the cell background submenu. */
  cellColors?: string[];
}

export function TableContextMenu({
  editor,
  children,
  className,
  cellColors,
}: TableContextMenuProps) {
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [propsOpen, setPropsOpen] = useState(false);
  const [cellPropsOpen, setCellPropsOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const actions = useTableActions(editor);

  const handleContextMenu = (e: React.MouseEvent) => {
    if (!editor.isActive("table")) return;
    e.preventDefault();
    // Move the cursor to the cell under the right-click so actions apply to that cell (not the focused one).
    // Leave it unchanged when multiple cells are selected (for Merge) or text is highlighted (for Link).
    const multiSelect =
      editor.view.dom.querySelectorAll(".selectedCell").length > 1;
    const hasTextSelection = !editor.state.selection.empty;
    const at = editor.view.posAtCoords({ left: e.clientX, top: e.clientY });
    if (at && !multiSelect && !hasTextSelection) {
      editor.chain().focus().setTextSelection(at.pos).run();
    }
    setMenuPos({ x: e.clientX, y: e.clientY });
  };

  const close = () => setMenuPos(null);
  const run = (fn: () => void) => {
    fn();
    close();
  };


  // Merge: more than one cell is selected. Split: the current cell is already merged (colspan/rowspan > 1).
  const canMerge = editor.view.dom.querySelectorAll(".selectedCell").length > 1;
  const cellAttrs = {
    ...editor.getAttributes("tableCell"),
    ...editor.getAttributes("tableHeader"),
  };
  const canSplit = (cellAttrs.colspan ?? 1) > 1 || (cellAttrs.rowspan ?? 1) > 1;

  return (
    <div
      onContextMenu={handleContextMenu}
      className="ttp-context-menu__trigger contents"
    >
      {children}

      {/* key based on coordinates → remount when clicking elsewhere so Radix re-measures the anchor */}
      <DropdownMenu
        key={menuPos ? `${menuPos.x},${menuPos.y}` : "closed"}
        open={!!menuPos}
        onOpenChange={(open) => !open && close()}
      >
        <DropdownMenuTrigger asChild>
          <span
            style={{
              position: "fixed",
              left: menuPos?.x ?? 0,
              top: menuPos?.y ?? 0,
              width: 0,
              height: 0,
              pointerEvents: "none",
            }}
          />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className={cn("ttp-context-menu w-56", className)}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DropdownMenuItem onClick={() => run(() => setLinkOpen(true))}>
            <Link className="mr-2 size-4" />
            <FormattedMessage defaultMessage="Link…" id="link" />
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <CellSubmenu
            actions={actions}
            run={run}
            canMerge={canMerge}
            canSplit={canSplit}
            onProperties={() => setCellPropsOpen(true)}
          />
          <RowSubmenu actions={actions} run={run} />
          <ColumnSubmenu actions={actions} run={run} />
          <SortSubmenu
            actions={actions}
            run={run}
            onAdvanced={() => setSortOpen(true)}
          />

          <DropdownMenuSeparator />

          {/* Cell background color — submenu */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Paintbrush className="mr-2 size-4" />
              <FormattedMessage defaultMessage="Cell background" id="cellBackground" />
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="p-0">
              <TableCellColorPicker
                editor={editor}
                onClose={close}
                presetColors={cellColors}
              />
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuItem onClick={() => run(() => setPropsOpen(true))}>
            <Settings className="mr-2 size-4" />
            <FormattedMessage defaultMessage="Table properties" id="tableProperties" />
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => run(actions.deleteTable)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 size-4" />
            <FormattedMessage defaultMessage="Delete entire table" id="deleteEntireTable" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {propsOpen && (
        <TablePropertiesDialog
          editor={editor}
          open={propsOpen}
          onOpenChange={setPropsOpen}
        />
      )}
      {cellPropsOpen && (
        <CellPropertiesDialog
          editor={editor}
          open={cellPropsOpen}
          onOpenChange={setCellPropsOpen}
        />
      )}
      {sortOpen && (
        <AdvancedSortDialog
          editor={editor}
          open={sortOpen}
          onOpenChange={setSortOpen}
          onSort={(col, dir) => actions.sortBy(col, dir)}
        />
      )}
      {linkOpen && (
        <LinkDialog editor={editor} open={linkOpen} onOpenChange={setLinkOpen} />
      )}
    </div>
  );
}
