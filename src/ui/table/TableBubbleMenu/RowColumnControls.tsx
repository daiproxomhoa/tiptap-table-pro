import { useIntl } from "../../../lib/intl";
import type { Editor } from "@tiptap/react";
import {
  ArrowUpToLine,
  ArrowDownToLine,
  ArrowLeftToLine,
  ArrowRightToLine,
  SquareMinus,
} from "../../../lib/icons";
import { Toggle } from "../../primitives/toggle";
import { Separator } from "../../primitives/separator";
import { Tip } from "./Tip";

export function RowColumnControls({ editor }: { editor: Editor }) {
  const intl = useIntl();
  return (
    <>
      {/* Rows */}
      <Tip
        label={intl.formatMessage({
          defaultMessage: "Insert row above", id: "insertRowAbove",
        })}
      >
        <Toggle
          size="sm"
          pressed={false}
          onPressedChange={() => editor.chain().focus().addRowBefore().run()}
        >
          <ArrowUpToLine className="size-4" />
        </Toggle>
      </Tip>
      <Tip
        label={intl.formatMessage({
          defaultMessage: "Insert row below", id: "insertRowBelow",
        })}
      >
        <Toggle
          size="sm"
          pressed={false}
          onPressedChange={() => editor.chain().focus().addRowAfter().run()}
        >
          <ArrowDownToLine className="size-4" />
        </Toggle>
      </Tip>
      <Tip
        label={intl.formatMessage({
          defaultMessage: "Delete row", id: "deleteRow",
        })}
      >
        <Toggle
          size="sm"
          pressed={false}
          onPressedChange={() => editor.chain().focus().deleteRow().run()}
        >
          <SquareMinus className="size-4 text-destructive" />
        </Toggle>
      </Tip>

      <Separator orientation="vertical" className="mx-0.5 h-5" />

      {/* Columns */}
      <Tip
        label={intl.formatMessage({
          defaultMessage: "Insert column left", id: "insertColumnLeft",
        })}
      >
        <Toggle
          size="sm"
          pressed={false}
          onPressedChange={() => editor.chain().focus().addColumnBefore().run()}
        >
          <ArrowLeftToLine className="size-4" />
        </Toggle>
      </Tip>
      <Tip
        label={intl.formatMessage({
          defaultMessage: "Insert column right", id: "insertColumnRight",
        })}
      >
        <Toggle
          size="sm"
          pressed={false}
          onPressedChange={() => editor.chain().focus().addColumnAfter().run()}
        >
          <ArrowRightToLine className="size-4" />
        </Toggle>
      </Tip>
      <Tip
        label={intl.formatMessage({
          defaultMessage: "Delete column", id: "deleteColumn",
        })}
      >
        <Toggle
          size="sm"
          pressed={false}
          onPressedChange={() => editor.chain().focus().deleteColumn().run()}
        >
          <SquareMinus className="size-4 text-destructive" />
        </Toggle>
      </Tip>
    </>
  );
}
