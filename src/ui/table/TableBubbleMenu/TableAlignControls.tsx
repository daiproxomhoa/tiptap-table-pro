import { useIntl } from "../../../lib/intl";
import type { Editor } from "@tiptap/react";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import { Toggle } from "../../primitives/toggle";
import { Tip } from "./Tip";

export function TableAlignControls({
  editor,
  tableAlign,
}: {
  editor: Editor;
  tableAlign: string;
}) {
  const intl = useIntl();
  return (
    <>
      <Tip
        label={intl.formatMessage({
          defaultMessage: "Căn trái bảng",
          id: "wgqC+A",
        })}
      >
        <Toggle
          size="sm"
          pressed={tableAlign === "left"}
          onPressedChange={() =>
            editor
              .chain()
              .focus()
              .updateAttributes("table", { align: "left" })
              .run()
          }
        >
          <AlignLeft className="size-4" />
        </Toggle>
      </Tip>
      <Tip
        label={intl.formatMessage({
          defaultMessage: "Căn giữa bảng",
          id: "hb99+d",
        })}
      >
        <Toggle
          size="sm"
          pressed={tableAlign === "center"}
          onPressedChange={() =>
            editor
              .chain()
              .focus()
              .updateAttributes("table", { align: "center" })
              .run()
          }
        >
          <AlignCenter className="size-4" />
        </Toggle>
      </Tip>
      <Tip
        label={intl.formatMessage({
          defaultMessage: "Căn phải bảng",
          id: "VOFrmT",
        })}
      >
        <Toggle
          size="sm"
          pressed={tableAlign === "right"}
          onPressedChange={() =>
            editor
              .chain()
              .focus()
              .updateAttributes("table", { align: "right" })
              .run()
          }
        >
          <AlignRight className="size-4" />
        </Toggle>
      </Tip>
    </>
  );
}
