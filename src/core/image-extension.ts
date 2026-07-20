import type { NodeViewRendererProps } from "@tiptap/core";
import { mergeAttributes, Node as TiptapNode } from "@tiptap/core";
import { Node as ProseMirrorNode } from "@tiptap/pm/model";
import Image from "@tiptap/extension-image";
import {
  buildTransform,
  buildFilter,
  parseAdjust,
} from "../ui/image/ImageBubbleMenu/utils";
import {
  DEFAULT_ADJUST,
  type Adjust,
} from "../ui/image/ImageBubbleMenu/constants";
import { FIGURE_STYLE, FIGCAPTION_STYLE } from "./editor-styles";
import { withStyle } from "./utils";

// ── Image with align ──────────────────────────────────────────────────────────

function applyAlignToWrapper(container: HTMLElement, align: string) {
  const wrapper = container.querySelector<HTMLElement>("[data-resize-wrapper]");
  if (!wrapper) return;
  if (align === "center") {
    wrapper.style.marginLeft = "auto";
    wrapper.style.marginRight = "auto";
  } else if (align === "right") {
    wrapper.style.marginLeft = "auto";
    wrapper.style.marginRight = "0";
  } else {
    wrapper.style.marginLeft = "";
    wrapper.style.marginRight = "";
  }
}

/** Image box (in the original axis) derived from the width/height attrs. When
 * only one dimension is set, the other is inferred from the natural aspect ratio
 * (matching how the browser renders when only one dimension is set). When both
 * are null, the natural size is used. Used so the wrapper hugs the bounding box
 * tightly when rotated. */
function resolveImageBox(
  img: HTMLImageElement,
  width: number | string | null,
  height: number | string | null,
): { w: number; h: number } {
  const nw = img.naturalWidth || 1;
  const nh = img.naturalHeight || 1;
  const aspect = nw / nh;
  const w = width ? Number(width) : null;
  const h = height ? Number(height) : null;
  if (w && h) return { w, h };
  if (w) return { w, h: Math.round(w / aspect) };
  if (h) return { w: Math.round(h * aspect), h };
  return { w: nw, h: nh };
}

function applyImageStyles(
  container: HTMLElement,
  attrs: Record<string, unknown>,
) {
  const img = container.querySelector<HTMLImageElement>("img");
  if (!img) return;
  const filter = buildFilter((attrs.adjust as Adjust) ?? DEFAULT_ADJUST);
  img.style.filter = filter;

  // Image dimensions (original axis) from the attrs; the NodeView extension
  // ignores them, so we apply them ourselves.
  const width = attrs.width as number | string | null;
  const height = attrs.height as number | string | null;
  const px = (v: number | string) => (typeof v === "number" ? `${v}px` : v);
  img.style.width = width ? px(width) : "";
  img.style.height = height ? px(height) : "";

  const rotate = (((Number(attrs.rotate) || 0) % 360) + 360) % 360;
  // The actual image box (original axis) so the wrapper hugs it tightly when
  // rotated. When only one dimension is set (resizing one edge), the other is
  // inferred from the natural aspect ratio — do NOT take naturalWidth/Height
  // directly (it would mismatch the set dimension, leaving the wrapper with gaps
  // or overflow).
  const box = resolveImageBox(img, width, height);
  const flip = buildTransform({
    flipX: attrs.flipX as boolean,
    flipY: attrs.flipY as boolean,
  });
  const wrapper = container.querySelector<HTMLElement>("[data-resize-wrapper]");

  if (!rotate) {
    // No rotation: the img follows normal flow; remove any overrides set earlier.
    img.style.position = "";
    img.style.top = "";
    img.style.left = "";
    img.style.maxWidth = "";
    img.style.maxHeight = "";
    img.style.transform = flip;
    if (wrapper) {
      wrapper.style.width = "";
      wrapper.style.height = "";
    }
    return;
  }

  // Rotation of 90/180/270: the wrapper must hug the bounding box AFTER rotation
  // (90/270 swap W↔H). The img is positioned absolute and centered in the
  // wrapper, then rotated around its center.
  const swap = rotate === 90 || rotate === 270;
  img.style.position = "absolute";
  img.style.top = "50%";
  img.style.left = "50%";
  // The absolute img sits inside a narrow wrapper (W↔H already swapped).
  // Tailwind's preflight sets `img { max-width:100%; height:auto }`, which clamps
  // the width to the wrapper's width (distorting the image, misaligning the
  // border). Set the original size explicitly and remove max-* so the width wins.
  img.style.width = `${box.w}px`;
  img.style.height = `${box.h}px`;
  img.style.maxWidth = "none";
  img.style.maxHeight = "none";
  img.style.transform = `translate(-50%, -50%) rotate(${rotate}deg) ${flip}`;
  if (wrapper) {
    wrapper.style.position = "relative";
    wrapper.style.width = `${swap ? box.h : box.w}px`;
    wrapper.style.height = `${swap ? box.w : box.h}px`;
  }
}

// Extends the base extension-image: adds the align/rotate/flip/adjust attrs plus
// editable sources (molfile, excalidraw). Each attr has a parseHTML (read from
// saved HTML) and renderHTML (write to HTML on serialize) pair — data-* is where
// the value is kept across the save/reopen cycle.
export const ImageWithAlign = Image.extend({
  addAttributes() {
    return {
      // Keep the base extension-image attrs (src, alt, title, width, height).
      ...this.parent?.(),
      // Alignment of the image block within the line: left/center/right.
      align: {
        default: "left",
        parseHTML: (element) => {
          // Only accept the two valid values; anything else (missing attr, junk) → left.
          const val = element.getAttribute("data-align");
          if (val === "center" || val === "right") return val;
          return "left";
        },
        renderHTML: (attributes) => {
          // left is the default → don't write the attr, keeping the HTML compact.
          if (attributes.align === "center" || attributes.align === "right") {
            return { "data-align": attributes.align };
          }
          return {};
        },
      },
      // Image rotation angle (0/90/180/270 degrees).
      rotate: {
        default: 0,
        // Number(null) = NaN → || 0 falls back to no rotation.
        parseHTML: (element) =>
          Number(element.getAttribute("data-rotate")) || 0,
        renderHTML: (attributes) => {
          // buildTransform combines rotate + flipX/flipY into a single transform
          // string (CSS style for the static viewer; data-rotate is for re-parsing).
          const transform = buildTransform(
            attributes as { rotate?: number; flipX?: boolean; flipY?: boolean },
          );
          return {
            ...(attributes.rotate
              ? { "data-rotate": String(attributes.rotate) }
              : {}),
            ...(transform ? { style: `transform: ${transform}` } : {}),
          };
        },
      },
      // Horizontal flip — serialized as "1"/absent; the transform style is written
      // together by rotate.
      flipX: {
        default: false,
        parseHTML: (element) => element.getAttribute("data-flip-x") === "1",
        renderHTML: (attributes) =>
          attributes.flipX ? { "data-flip-x": "1" } : {},
      },
      // Vertical flip — same as flipX.
      flipY: {
        default: false,
        parseHTML: (element) => element.getAttribute("data-flip-y") === "1",
        renderHTML: (attributes) =>
          attributes.flipY ? { "data-flip-y": "1" } : {},
      },
      // Color adjustments (brightness/contrast/saturate...) — an Adjust object.
      adjust: {
        default: { ...DEFAULT_ADJUST },
        // parseAdjust handles broken JSON itself → returns the default.
        parseHTML: (element) =>
          parseAdjust(element.getAttribute("data-adjust")),
        renderHTML: (attributes) => {
          const a = attributes.adjust as Adjust;
          // Default value → don't write data-adjust (compact HTML).
          const same = JSON.stringify(a) === JSON.stringify(DEFAULT_ADJUST);
          // filter style so the static viewer shows the correct colors without JS.
          const filter = buildFilter(a);
          return {
            ...(same ? {} : { "data-adjust": JSON.stringify(a) }),
            ...(filter ? { style: `filter: ${filter}` } : {}),
          };
        },
      },
      // Ketcher scene (chemical structure) — double-click reopens the chemistry
      // editor for editing.
      molfile: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-molfile"),
        renderHTML: (attributes) =>
          attributes.molfile
            ? { "data-molfile": attributes.molfile as string }
            : {},
      },
      // Excalidraw scene JSON — double-click reopens the drawing editor for editing.
      excalidraw: {
        default: null,
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-excalidraw"),
        renderHTML: (attributes: Record<string, unknown>) =>
          attributes.excalidraw
            ? { "data-excalidraw": attributes.excalidraw }
            : {},
      },
    };
  },

  // The saved HTML is a bare <img> — data-align is handled only by the NodeView
  // (editor) via margin, so in the static HTML viewer the alignment is dead. Wrap
  // it in a flex div for center/right so alignment works outside the editor (the
  // img gets display:block from Tailwind preflight, so text-align has no effect).
  // Re-parsing needs no special rule: the unknown div is stripped, the inner img
  // still matches and keeps its attrs.
  renderHTML({ HTMLAttributes }) {
    // ProseMirror tuple ["tag", attrs] — img with all attrs merged (including the
    // data-* produced by the attrs above).
    const img = [
      "img",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
    ] as const;
    // Read from HTMLAttributes (the result of the align attr's renderHTML above).
    const align = HTMLAttributes["data-align"] as string | undefined;
    // left/no align → keep the bare <img> as before, existing content unchanged.
    if (align !== "center" && align !== "right") return [...img];
    // center/right → wrap in a flex div that pushes the image to center/right.
    return [
      "div",
      {
        style: `display:flex;justify-content:${
          align === "center" ? "center" : "flex-end"
        }`,
      },
      [...img],
    ];
  },

  addNodeView() {
    // The base extension-image resize NodeView (wrapper + 6 drag handles).
    const parentRenderer = this.parent?.();
    // Resize disabled (options.resize.enabled=false) → no NodeView, so bail out.
    if (!parentRenderer) return null;

    return (props: NodeViewRendererProps) => {
      // Create the base NodeView then augment it — don't build the DOM from scratch.
      const nodeView = parentRenderer(props);
      // The base NodeView ignores the custom attrs → apply align (wrapper margin)
      // and styles (size/filter/transform) ourselves on the first render.
      applyAlignToWrapper(nodeView.dom, props.node.attrs.align ?? "left");
      applyImageStyles(nodeView.dom, props.node.attrs);

      // Wrap the base update: the base only handles resize, it doesn't re-render
      // attrs when the node changes (align/adjust/src... change while the DOM stays
      // put) → re-apply after every update.
      const originalUpdate = nodeView.update?.bind(nodeView);
      nodeView.update = (node, ...args) => {
        // Run the base update first; false = a different node type, NodeView is replaced.
        const result = originalUpdate ? originalUpdate(node, ...args) : true;
        if (result !== false && node instanceof ProseMirrorNode) {
          // Re-apply align + style using the NEW attrs (the node param, not the
          // stale props.node).
          applyAlignToWrapper(nodeView.dom, node.attrs.align ?? "left");
          applyImageStyles(nodeView.dom, node.attrs);

          const img = nodeView.dom.querySelector("img");
          if (img) {
            // Image changed (crop/re-export excalidraw...) → update src manually.
            if (node.attrs.src && img.getAttribute("src") !== node.attrs.src) {
              img.setAttribute("src", node.attrs.src as string);
            }
            // Sync data-molfile/data-excalidraw onto the DOM so the double-click
            // handler (dblclick-edit.ts, matching via closest on the img) recognizes
            // the image.
            const molfile = node.attrs.molfile as string | null;
            if (molfile) img.setAttribute("data-molfile", molfile);
            else img.removeAttribute("data-molfile");
            const excalidraw = node.attrs.excalidraw as string | null;
            if (excalidraw) img.setAttribute("data-excalidraw", excalidraw);
            else img.removeAttribute("data-excalidraw");
          }
        }
        // The base update may return undefined → treat it as handled (true).
        return result ?? true;
      };

      return nodeView;
    };
  },
});

export const Figcaption = TiptapNode.create({
  name: "figcaption",
  content: "inline*",
  selectable: false,
  parseHTML() {
    return [{ tag: "figcaption" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "figcaption",
      mergeAttributes(withStyle(HTMLAttributes, FIGCAPTION_STYLE)),
      0,
    ];
  },
});

export const Figure = TiptapNode.create({
  name: "figure",
  group: "block",
  content: "image figcaption",
  draggable: true,
  isolating: true,
  parseHTML() {
    return [{ tag: "figure" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "figure",
      mergeAttributes(withStyle(HTMLAttributes, FIGURE_STYLE)),
      0,
    ];
  },
});
