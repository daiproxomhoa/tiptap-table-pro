import { useIntl } from "../../../lib/intl";
import type { Editor } from "@tiptap/react";
import {
  ArrowUpToLine,
  ArrowDownToLine,
  ArrowLeftToLine,
  ArrowRightToLine,
  SquareMinus,
} from "lucide-react";
import { Toggle } from "../../primitives/toggle";
import { Separator } from "../../primitives/separator";
import { Tip } from "./Tip";

export function RowColumnControls({ editor }: { editor: Editor }) {
  const intl = useIntl();
  return (
    <>
      {/* Hàng */}
      <Tip
        label={intl.formatMessage({
          defaultMessage: "Thêm hàng phía trên",
          id: "72ns8b",
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
          defaultMessage: "Thêm hàng phía dưới",
          id: "08BSnP",
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
          defaultMessage: "Xoá hàng",
          id: "r42PHI",
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

      {/* Cột */}
      <Tip
        label={intl.formatMessage({
          defaultMessage: "Thêm cột bên trái",
          id: "PKMfyo",
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
          defaultMessage: "Thêm cột bên phải",
          id: "Wld4nM",
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
          defaultMessage: "Xoá cột",
          id: "xJ7qqT",
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
