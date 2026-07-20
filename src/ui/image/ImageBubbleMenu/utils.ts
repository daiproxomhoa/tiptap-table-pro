import type { Editor } from "@tiptap/react";
import { DEFAULT_ADJUST, type Adjust } from "./constants";

/** Build the transform from rotate/flip (empty if there's nothing). */
export function buildTransform(attrs: {
  rotate?: number;
  flipX?: boolean;
  flipY?: boolean;
}): string {
  const parts: string[] = [];
  if (attrs.rotate) parts.push(`rotate(${attrs.rotate}deg)`);
  if (attrs.flipX) parts.push("scaleX(-1)");
  if (attrs.flipY) parts.push("scaleY(-1)");
  return parts.join(" ");
}

/** CSS filter string from Adjust. brightness & exposure are multiplied together;
 * gamma is approximated by an additional contrast term; vibrance + saturation are
 * both folded into saturate. */
export function buildFilter(a: Adjust): string {
  const parts: string[] = [];
  const bright = (a.brightness / 100) * (a.exposure / 100);
  if (bright !== 1) parts.push(`brightness(${bright})`);
  const contrast = (a.contrast / 100) * (a.gamma / 100);
  if (contrast !== 1) parts.push(`contrast(${contrast})`);
  const sat = (a.saturation / 100) * (a.vibrance / 100);
  if (sat !== 1) parts.push(`saturate(${sat})`);
  if (a.blur > 0) parts.push(`blur(${a.blur}px)`);
  return parts.join(" ");
}

/** We don't reverse-parse each individual key (buildFilter folds several keys
 * into a single CSS function, which isn't invertible). Adjust is stored directly
 * as data-adjust JSON. */
export function parseAdjust(json: string | null): Adjust {
  if (!json) return { ...DEFAULT_ADJUST };
  try {
    return { ...DEFAULT_ADJUST, ...(JSON.parse(json) as Partial<Adjust>) };
  } catch {
    return { ...DEFAULT_ADJUST };
  }
}

/** If the image is inside a figure, unwrap the figure back to a bare img. Returns
 * true if it was unwrapped. */
export function unwrapFigure(editor: Editor): boolean {
  return editor
    .chain()
    .focus()
    .command(({ tr, state }) => {
      const { $from } = state.selection;
      for (let d = $from.depth; d > 0; d--) {
        if ($from.node(d).type.name === "figure") {
          const figurePos = $from.before(d);
          const figure = $from.node(d);
          tr.replaceWith(
            figurePos,
            figurePos + figure.nodeSize,
            figure.child(0),
          );
          return true;
        }
      }
      return false;
    })
    .run();
}
