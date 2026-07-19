import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../primitives/popover";
import { Toggle } from "../primitives/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../primitives/tooltip";
import { cn } from "../../lib/utils";
import type { Editor } from "@tiptap/react";
import { Table } from "lucide-react";
import { useState } from "react";
import { FormattedMessage, useIntl } from "../../lib/intl";

const COLS = 10;
const ROWS = 8;

export function TablePicker({ editor }: { editor: Editor }) {
  const intl = useIntl();
  const [hover, setHover] = useState<{ row: number; col: number } | null>(null);
  const [open, setOpen] = useState(false);

  const insert = (rows: number, cols: number) => {
    editor
      .chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow: true })
      .run();
    setOpen(false);
    setHover(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Toggle size="sm" pressed={editor.isActive("table")}>
              <Table className="size-4" />
            </Toggle>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <FormattedMessage defaultMessage="Chèn bảng" id="uaTtrj" />
        </TooltipContent>
      </Tooltip>
      <PopoverContent className="w-auto p-2" align="start">
        <p className="mb-1.5 text-center text-xs text-muted-foreground">
          {hover
            ? `${hover.row} × ${hover.col}`
            : intl.formatMessage({ defaultMessage: "Chọn kích thước bảng", id: 'tOHxCN' })}
        </p>
        <div
          className="grid gap-0.5"
          style={{ gridTemplateColumns: `repeat(${COLS}, 1.25rem)` }}
          onMouseLeave={() => setHover(null)}
        >
          {Array.from({ length: ROWS }, (_, r) =>
            Array.from({ length: COLS }, (_, c) => {
              const active = hover && r < hover.row && c < hover.col;
              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  className={cn(
                    "h-5 w-5 rounded-sm border",
                    active
                      ? "border-primary bg-primary/20"
                      : "border-border bg-muted/40",
                  )}
                  onMouseEnter={() => setHover({ row: r + 1, col: c + 1 })}
                  onClick={() => insert(r + 1, c + 1)}
                />
              );
            }),
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
