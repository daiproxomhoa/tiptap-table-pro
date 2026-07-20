import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../primitives/popover";
import { Toggle } from "../primitives/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../primitives/tooltip";
import { cn } from "../../lib/utils";
import type { Editor } from "@tiptap/react";
import { Table } from "../../lib/icons";
import { useState } from "react";
import { FormattedMessage, useIntl } from "../../lib/intl";

const DEFAULT_COLS = 10;
const DEFAULT_ROWS = 8;

interface TablePickerProps {
  editor: Editor;
  /** Extra class names merged onto the trigger button. */
  className?: string;
  /** Max columns offered in the picker grid. Default 10. */
  maxCols?: number;
  /** Max rows offered in the picker grid. Default 8. */
  maxRows?: number;
  /** Whether inserted tables get a header row. Default true. */
  withHeaderRow?: boolean;
}

export function TablePicker({
  editor,
  className,
  maxCols = DEFAULT_COLS,
  maxRows = DEFAULT_ROWS,
  withHeaderRow = true,
}: TablePickerProps) {
  const intl = useIntl();
  const [hover, setHover] = useState<{ row: number; col: number } | null>(null);
  const [open, setOpen] = useState(false);
  const COLS = maxCols;
  const ROWS = maxRows;

  const insert = (rows: number, cols: number) => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow }).run();
    setOpen(false);
    setHover(null);
  };

  return (
    <TooltipProvider>
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive("table")}
              className={cn("ttp-table-picker", className)}
            >
              <Table className="size-4" />
            </Toggle>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <FormattedMessage defaultMessage="Insert table" id="insertTable" />
        </TooltipContent>
      </Tooltip>
      <PopoverContent
        className="ttp-table-picker__content w-auto p-2"
        align="start"
      >
        <p className="ttp-table-picker__hint mb-1.5 text-center text-xs text-muted-foreground">
          {hover
            ? `${hover.row} × ${hover.col}`
            : intl.formatMessage({ defaultMessage: "Choose table size", id: "pickTableSize" })}
        </p>
        <div
          className="ttp-table-picker__grid grid gap-0.5"
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
                    "ttp-table-picker__cell h-5 w-5 rounded-sm border",
                    active
                      ? "ttp-table-picker__cell--active border-primary bg-primary/20"
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
    </TooltipProvider>
  );
}
