import { mergeAttributes } from "@tiptap/core";
import { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import type { Transaction } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";
import {
  TableCell,
  TableHeader,
  Table,
  TableRow,
  TableView,
} from "@tiptap/extension-table";
import {
  TABLE_STYLE,
  CELL_STYLE,
  HEADER_STYLE,
} from "./editor-styles";
import { withStyle } from "./utils";

// ── Table with align ──────────────────────────────────────────────────────────

export class AlignableTableView extends TableView {
  constructor(node: ProseMirrorNode, cellMinWidth: number) {
    super(node, cellMinWidth);
    this.applyAttrs(node);
  }

  override update(node: ProseMirrorNode) {
    const result = super.update(node);
    if (result === false) return false;
    this.applyAttrs(node);
    this.normalizeColWidths();
    return result;
  }

  /** The NodeView renders its own DOM, so we must apply align to the <table> ourselves.
   * Cell borders are handled by each cell's borderColor attr (renderHTML), not here. */
  private applyAttrs(node: ProseMirrorNode) {
    this.applyAlign(node.attrs.align ?? "left");
    this.normalizeColWidths();
  }

  /**
   * prosemirror-tables sets `<col style="width:Npx">` + a fixed `table.style.width`
   * in px once every column has a colwidth → the table becomes FIXED px and the whole
   * table's width can no longer be resized. Convert px → % (relative to the total) so
   * colwidth becomes a RATIO: the table keeps its % width (handled by wrapper/attr style)
   * and the columns scale accordingly. Remove the px table.style.width the plugin just set.
   */
  private normalizeColWidths() {
    const table = this.dom.querySelector("table") as HTMLElement | null;
    const colgroup = table?.querySelector("colgroup");
    if (!table || !colgroup) return;
    const cols = Array.from(colgroup.children) as HTMLElement[];
    const pxs = cols.map((c) => parseFloat(c.style.width) || 0);
    const total = pxs.reduce((s, w) => s + w, 0);
    // Only normalize once every column has a px width (total > 0 and no col is empty).
    if (total <= 0 || pxs.some((w) => w <= 0)) return;
    cols.forEach((c, i) => {
      c.style.width = `${Math.round((pxs[i] / total) * 10000) / 100}%`;
    });
    // Table = 100% of wrapper (do NOT drop width entirely: dropping it shrinks the
    // table to min-content and the col % becomes a % of auto-width → meaningless). The
    // wrapper carries the real % width (from the attr style, set by applyStoredStyles);
    // with the table filling the wrapper, the col % scales correctly when resizing the
    // whole table.
    table.style.width = "100%";
  }

  private applyAlign(align: string) {
    if (align === "center") {
      this.dom.style.marginLeft = "auto";
      this.dom.style.marginRight = "auto";
    } else if (align === "right") {
      this.dom.style.marginLeft = "auto";
      this.dom.style.marginRight = "0";
    } else {
      this.dom.style.marginLeft = "";
      this.dom.style.marginRight = "";
    }
  }
}

const borderSyncKey = new PluginKey("tableBorderColorSync");
const colwidthSeedKey = new PluginKey("tableColwidthSeed");

const isCellNode = (name: string) =>
  name === "tableCell" || name === "tableHeader";

/**
 * Pasted/initial HTML usually has NO `colwidth` on the cells. In that case the table
 * renders full width (CSS width), but on the first interaction `columnResizing` measures
 * and assigns colwidth based on min-content → the table "jumps" and shrinks. Seed
 * colwidth once, right after the view is ready: measure each `<col>`'s real width (while
 * it is still full width) and write it into the node, so the resize plugin no longer has
 * to infer it.
 */
function seedColwidths(view: EditorView) {
  const { state } = view;
  let tr = state.tr;
  let changed = false;

  state.doc.descendants((node, pos) => {
    if (node.type.name !== "table") return true;

    // The first row determines colwidth for the whole table.
    const firstRow = node.firstChild;
    if (!firstRow) return false;

    // Every cell already has a colwidth → skip this table.
    let missing = false;
    firstRow.forEach((cell) => {
      if (!cell.attrs.colwidth) missing = true;
    });
    if (!missing) return false;

    const tableDOM = view.nodeDOM(pos) as HTMLElement | null;
    const cols =
      tableDOM?.querySelector("table")?.querySelectorAll("colgroup > col") ??
      null;
    if (!cols || cols.length === 0) return false;

    // Measure each <col>'s real width (while the table is full width).
    const widths = Array.from(cols).map((c) =>
      Math.round((c as HTMLElement).getBoundingClientRect().width),
    );
    if (widths.some((w) => w <= 0)) return false;

    // Walk the first row's cells and assign colwidth (an array per colspan) to each cell.
    let colIndex = 0;
    let cellPos = pos + 2; // table(pos) → row(pos+1) → first cell(pos+2)
    firstRow.forEach((cell) => {
      const span = (cell.attrs.colspan as number) ?? 1;
      const slice = widths.slice(colIndex, colIndex + span);
      if (slice.length === span) {
        tr = tr.setNodeAttribute(cellPos, "colwidth", slice);
        changed = true;
      }
      colIndex += span;
      cellPos += cell.nodeSize;
    });

    return false; // no nested tables
  });

  if (changed) view.dispatch(tr.setMeta("addToHistory", false));
}

/** Count the total number of cells (td/th) in the doc. */
function countCells(doc: ProseMirrorNode): number {
  let n = 0;
  doc.descendants((node) => {
    if (isCellNode(node.type.name)) {
      n += 1;
      return false;
    }
    return true;
  });
  return n;
}

/** The 3 per-cell border attrs that must fan out when new cells appear. */
const SYNCED_BORDER_ATTRS = [
  "borderColor",
  "borderWidth",
  "borderStyle",
] as const;

/** After the table structure changes (adding rows/columns, pasting, splitting cells), new
 * cells carry the default border attrs (null) → their border no longer matches the rest
 * (e.g. the whole table is dashed but the new row is solid). Sync every cell to the table's
 * common value (the first non-null value, resolved PER ATTR: color / width / style). An attr
 * that is null across the whole table → skip. */
function syncTableBorders(doc: ProseMirrorNode, tr: Transaction): boolean {
  let changed = false;
  doc.descendants((node, pos) => {
    if (node.type.name !== "table") return true;
    const targets: Partial<
      Record<(typeof SYNCED_BORDER_ATTRS)[number], string>
    > = {};
    node.descendants((cell) => {
      if (!isCellNode(cell.type.name)) return true;
      for (const attr of SYNCED_BORDER_ATTRS) {
        if (targets[attr] === undefined && cell.attrs[attr] != null) {
          targets[attr] = cell.attrs[attr] as string;
        }
      }
      return true;
    });
    node.descendants((cell, offset) => {
      if (!isCellNode(cell.type.name)) return true;
      for (const attr of SYNCED_BORDER_ATTRS) {
        const target = targets[attr];
        if (target !== undefined && cell.attrs[attr] !== target) {
          tr.setNodeAttribute(pos + 1 + offset, attr, target);
          changed = true;
        }
      }
      return true;
    });
    return false; // no tables nested inside tables
  });
  return changed;
}

export const TableWithStyle = Table.extend({
  renderHTML({ HTMLAttributes }) {
    return [
      "table",
      mergeAttributes(withStyle(HTMLAttributes, TABLE_STYLE)),
      ["tbody", 0],
    ];
  },
  addProseMirrorPlugins() {
    return [
      ...(this.parent?.() ?? []),
      // Seed colwidth once after the view mounts (while the table is full width), so the
      // first click doesn't trigger columnResizing to measure min-content and make the
      // table jump/shrink.
      new Plugin({
        key: colwidthSeedKey,
        view: (editorView) => {
          const raf = requestAnimationFrame(() => seedColwidths(editorView));
          return { destroy: () => cancelAnimationFrame(raf) };
        },
      }),
      new Plugin({
        key: borderSyncKey,
        appendTransaction: (transactions, oldState, newState) => {
          if (!transactions.some((t) => t.docChanged)) return null;
          // Only sync when there are NEW cells (adding rows/columns, pasting, splitting).
          // Changing one cell's attr doesn't increase the cell count → skip so the border
          // doesn't spread across the whole table.
          if (countCells(newState.doc) <= countCells(oldState.doc)) return null;
          const tr = newState.tr;
          return syncTableBorders(newState.doc, tr) ? tr : null;
        },
      }),
    ];
  },
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute("style") || null,
        renderHTML: (attributes) => {
          if (!attributes.style) return {};
          return { style: attributes.style };
        },
      },
      align: {
        default: "left",
        parseHTML: (element) => {
          const val = element.getAttribute("data-align");
          if (val === "center" || val === "right") return val;
          return "left";
        },
        renderHTML: (attributes) => {
          if (attributes.align === "center" || attributes.align === "right") {
            return { "data-align": attributes.align };
          }
          return {};
        },
      },
    };
  },
});

/** Style-based attrs shared by td/th. Each attr renders one `style` fragment;
 * mergeAttributes merges the `style` fragments so they don't override each other. */
const sharedCellAttributes = {
  backgroundColor: {
    default: null as string | null,
    parseHTML: (element: HTMLElement) => element.style.backgroundColor || null,
    renderHTML: (attributes: Record<string, unknown>) => {
      if (!attributes.backgroundColor) return {};
      return { style: `background-color: ${attributes.backgroundColor}` };
    },
  },
  borderColor: {
    default: null as string | null,
    parseHTML: (element: HTMLElement) => element.style.borderColor || null,
    renderHTML: (attributes: Record<string, unknown>) => {
      if (!attributes.borderColor) return {};
      return { style: `border-color: ${attributes.borderColor}` };
    },
  },
  borderWidth: {
    default: null as string | null,
    parseHTML: (element: HTMLElement) => element.style.borderWidth || null,
    renderHTML: (attributes: Record<string, unknown>) => {
      if (!attributes.borderWidth) return {};
      return { style: `border-width: ${attributes.borderWidth}` };
    },
  },
  borderStyle: {
    default: null as string | null,
    parseHTML: (element: HTMLElement) => element.style.borderStyle || null,
    renderHTML: (attributes: Record<string, unknown>) => {
      if (!attributes.borderStyle) return {};
      return { style: `border-style: ${attributes.borderStyle}` };
    },
  },
  textAlign: {
    default: null as string | null,
    parseHTML: (element: HTMLElement) => element.style.textAlign || null,
    renderHTML: (attributes: Record<string, unknown>) => {
      if (!attributes.textAlign) return {};
      return { style: `text-align: ${attributes.textAlign}` };
    },
  },
  verticalAlign: {
    default: null as string | null,
    parseHTML: (element: HTMLElement) => element.style.verticalAlign || null,
    renderHTML: (attributes: Record<string, unknown>) => {
      if (!attributes.verticalAlign) return {};
      return { style: `vertical-align: ${attributes.verticalAlign}` };
    },
  },
  scope: {
    default: null as string | null,
    parseHTML: (element: HTMLElement) => element.getAttribute("scope"),
    renderHTML: (attributes: Record<string, unknown>) => {
      if (!attributes.scope) return {};
      return { scope: attributes.scope };
    },
  },
};

export const TableCellWithAttrs = TableCell.extend({
  renderHTML({ HTMLAttributes }) {
    return ["td", mergeAttributes(withStyle(HTMLAttributes, CELL_STYLE)), 0];
  },
  addAttributes() {
    return {
      ...this.parent?.(),
      ...sharedCellAttributes,
    };
  },
});

export const TableHeaderWithAttrs = TableHeader.extend({
  renderHTML({ HTMLAttributes }) {
    return ["th", mergeAttributes(withStyle(HTMLAttributes, HEADER_STYLE)), 0];
  },
  addAttributes() {
    return {
      ...this.parent?.(),
      ...sharedCellAttributes,
    };
  },
});

export const TableRowWithHeight = TableRow.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      height: {
        // NEWLY CREATED rows (createAndFill on addRow) use the default 34px. Rows LOADED
        // from HTML: parseHTML returns the real value (null if absent) → keep null, don't
        // fall back to the default (null ≠ undefined, so TipTap doesn't fall back).
        default: "34px" as string | null,
        parseHTML: (element: HTMLElement) => element.style.height || null,
        renderHTML: (attributes: Record<string, unknown>) => {
          if (!attributes.height) return {};
          return { style: `height: ${attributes.height as string}` };
        },
      },
    };
  },
});
