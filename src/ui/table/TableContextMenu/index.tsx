import { useState } from "react";
import type { Editor } from "@tiptap/react";
import type { ReactNode } from "react";
import { FormattedMessage } from "../../../lib/intl";
import { Link, Paintbrush, Settings, Trash2 } from "lucide-react";
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
}

export function TableContextMenu({ editor, children }: TableContextMenuProps) {
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [propsOpen, setPropsOpen] = useState(false);
  const [cellPropsOpen, setCellPropsOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const actions = useTableActions(editor);

  const handleContextMenu = (e: React.MouseEvent) => {
    if (!editor.isActive("table")) return;
    e.preventDefault();
    // Đưa con trỏ về ô dưới chuột phải để thao tác đúng ô đó (không phải ô đang focus).
    // Giữ nguyên khi đang chọn nhiều ô (cho Merge) hoặc đang bôi đen text (cho Link).
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


  // Merge: đang chọn >1 ô. Split: ô hiện tại đã merge (colspan/rowspan > 1).
  const canMerge = editor.view.dom.querySelectorAll(".selectedCell").length > 1;
  const cellAttrs = {
    ...editor.getAttributes("tableCell"),
    ...editor.getAttributes("tableHeader"),
  };
  const canSplit = (cellAttrs.colspan ?? 1) > 1 || (cellAttrs.rowspan ?? 1) > 1;

  return (
    <div onContextMenu={handleContextMenu} className="contents">
      {children}

      {/* key theo toạ độ → remount khi nhấn chỗ khác để Radix đo lại anchor */}
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
          className="w-56"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DropdownMenuItem onClick={() => run(() => setLinkOpen(true))}>
            <Link className="mr-2 size-4" />
            <FormattedMessage defaultMessage="Liên kết…" id="0hwSCX" />
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

          {/* Màu nền ô — submenu */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Paintbrush className="mr-2 size-4" />
              <FormattedMessage defaultMessage="Màu nền ô" id="aj69qU" />
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="p-0">
              <TableCellColorPicker editor={editor} onClose={close} />
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuItem onClick={() => run(() => setPropsOpen(true))}>
            <Settings className="mr-2 size-4" />
            <FormattedMessage defaultMessage="Thuộc tính bảng" id="ifjk7x" />
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => run(actions.deleteTable)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 size-4" />
            <FormattedMessage defaultMessage="Xoá toàn bộ bảng" id="ofjOjA" />
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
