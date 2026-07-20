import {
  ChevronLeft,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Maximize2,
} from "../../../lib/icons";
import { useIntl } from "../../../lib/intl";
import { Button } from "../../primitives/button";
import type { PanelProps } from "./constants";

interface TransformPanelProps extends PanelProps {
  onOpenResize: () => void;
}

export function TransformPanel({
  editor,
  onBack,
  onOpenResize,
}: TransformPanelProps) {
  const intl = useIntl();
  const attrs = () => editor.getAttributes("image");
  const upd = (patch: Record<string, unknown>) =>
    editor.chain().focus().updateAttributes("image", patch).run();
  const rotate = (delta: number) =>
    upd({ rotate: ((((attrs().rotate ?? 0) + delta) % 360) + 360) % 360 });

  return (
    <div className="flex items-center gap-0.5">
      <Button variant="ghost" size="icon-sm" onClick={onBack}
        tooltip={intl.formatMessage({ defaultMessage: "Back", id: "back" })}>
        <ChevronLeft className="size-4" />
      </Button>
      <Button variant="ghost" size="icon-sm" onClick={() => rotate(-90)}
        tooltip={intl.formatMessage({ defaultMessage: "Rotate left", id: "rotateLeft" })}>
        <RotateCcw className="size-4" />
      </Button>
      <Button variant="ghost" size="icon-sm" onClick={() => rotate(90)}
        tooltip={intl.formatMessage({ defaultMessage: "Rotate right", id: "rotateRight" })}>
        <RotateCw className="size-4" />
      </Button>
      <Button variant="ghost" size="icon-sm" onClick={() => upd({ flipX: !attrs().flipX })}
        tooltip={intl.formatMessage({ defaultMessage: "Flip horizontal", id: "flipHorizontal" })}>
        <FlipHorizontal className="size-4" />
      </Button>
      <Button variant="ghost" size="icon-sm" onClick={() => upd({ flipY: !attrs().flipY })}
        tooltip={intl.formatMessage({ defaultMessage: "Flip vertical", id: "flipVertical" })}>
        <FlipVertical className="size-4" />
      </Button>
      <Button variant="ghost" size="icon-sm" onClick={onOpenResize}
        tooltip={intl.formatMessage({ defaultMessage: "Size", id: "size" })}>
        <Maximize2 className="size-4" />
      </Button>
    </div>
  );
}
