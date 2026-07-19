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

  /** NodeView render DOM riêng nên phải tự áp align lên <table>.
   * Viền ô do attr borderColor của từng cell lo (renderHTML), không xử lý ở đây. */
  private applyAttrs(node: ProseMirrorNode) {
    this.applyAlign(node.attrs.align ?? "left");
    this.normalizeColWidths();
  }

  /**
   * prosemirror-tables set `<col style="width:Npx">` + `table.style.width` px cố
   * định khi mọi cột có colwidth → bảng thành FIXED px, không resize width cả
   * bảng được nữa. Convert px → % (theo tổng) để colwidth thành TỈ LỆ: bảng giữ
   * width % (wrapper/attr style lo), các cột co giãn theo. Bỏ table.style.width
   * px mà plugin vừa set.
   */
  private normalizeColWidths() {
    const table = this.dom.querySelector("table") as HTMLElement | null;
    const colgroup = table?.querySelector("colgroup");
    if (!table || !colgroup) return;
    const cols = Array.from(colgroup.children) as HTMLElement[];
    const pxs = cols.map((c) => parseFloat(c.style.width) || 0);
    const total = pxs.reduce((s, w) => s + w, 0);
    // Chỉ chuẩn hoá khi mọi cột đã có width px (tổng > 0 và không col nào rỗng).
    if (total <= 0 || pxs.some((w) => w <= 0)) return;
    cols.forEach((c, i) => {
      c.style.width = `${Math.round((pxs[i] / total) * 10000) / 100}%`;
    });
    // Table = 100% wrapper (KHÔNG bỏ hẳn width: bỏ hẳn thì table co về min-content
    // và col % thành % của auto-width → vô nghĩa). Wrapper mang width % thật (từ
    // attr style, applyStoredStyles set), table full wrapper → col % scale đúng
    // khi resize cả bảng.
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
 * HTML dán/khởi tạo thường KHÔNG có `colwidth` trên cell. Khi đó bảng render
 * đầy khung (CSS width), nhưng lần đầu tương tác `columnResizing` tự đo & gán
 * colwidth theo min-content → bảng "nhảy" co lại. Seed colwidth 1 lần ngay sau
 * khi view sẵn sàng: đo bề rộng thật của từng `<col>` (đang đầy khung) rồi ghi
 * vào node, để plugin resize không còn phải tự suy ra.
 */
function seedColwidths(view: EditorView) {
  const { state } = view;
  let tr = state.tr;
  let changed = false;

  state.doc.descendants((node, pos) => {
    if (node.type.name !== "table") return true;

    // Hàng đầu quyết định colwidth cho cả bảng.
    const firstRow = node.firstChild;
    if (!firstRow) return false;

    // Cell nào cũng có colwidth rồi → bỏ qua bảng này.
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

    // Đo bề rộng thật của mỗi <col> (bảng đang đầy khung).
    const widths = Array.from(cols).map((c) =>
      Math.round((c as HTMLElement).getBoundingClientRect().width),
    );
    if (widths.some((w) => w <= 0)) return false;

    // Duyệt cell hàng đầu, gán colwidth (mảng theo colspan) cho từng cell.
    let colIndex = 0;
    let cellPos = pos + 2; // table(pos) → row(pos+1) → cell đầu(pos+2)
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

    return false; // không lồng bảng
  });

  if (changed) view.dispatch(tr.setMeta("addToHistory", false));
}

/** Đếm tổng số ô (td/th) trong doc. */
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

/** Sau khi cấu trúc bảng đổi (thêm dòng/cột, dán, tách ô), ô mới mang
 * borderColor mặc định (null). Đồng bộ mọi ô trong bảng về màu chung của bảng
 * (màu non-null đầu tiên) để viền đồng nhất. Bảng toàn null → bỏ qua. */
function syncTableBorderColors(doc: ProseMirrorNode, tr: Transaction): boolean {
  let changed = false;
  doc.descendants((node, pos) => {
    if (node.type.name !== "table") return true;
    let target: string | null = null;
    node.descendants((cell) => {
      if (target === null && isCellNode(cell.type.name)) {
        target = (cell.attrs.borderColor as string | null) ?? null;
      }
      return true;
    });
    if (target !== null) {
      node.descendants((cell, offset) => {
        if (isCellNode(cell.type.name) && cell.attrs.borderColor !== target) {
          tr.setNodeAttribute(pos + 1 + offset, "borderColor", target);
          changed = true;
        }
        return true;
      });
    }
    return false; // không lồng bảng trong bảng
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
      // Seed colwidth 1 lần sau khi view mount (bảng đã đầy khung), để lần đầu
      // click không kích columnResizing tự đo min-content khiến bảng nhảy co.
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
          // Chỉ đồng bộ khi có ô MỚI (thêm dòng/cột, dán, tách). Đổi attr 1 ô
          // không tăng số ô → bỏ qua để không lan màu viền ra cả bảng.
          if (countCells(newState.doc) <= countCells(oldState.doc)) return null;
          const tr = newState.tr;
          return syncTableBorderColors(newState.doc, tr) ? tr : null;
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

/** Attr style-based dùng chung cho td/th. Mỗi attr render 1 mảnh `style`;
 * mergeAttributes gộp các mảnh `style` lại nên không đè nhau. */
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
        // Row TẠO MỚI (createAndFill khi addRow) dùng default 34px. Row LOAD từ
        // HTML: parseHTML trả giá trị thật (null nếu không có) → giữ null, không
        // rơi về default (null ≠ undefined nên TipTap không fallback).
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
