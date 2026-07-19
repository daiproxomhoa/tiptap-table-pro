import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useEditorState } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import {
  focusedTableEl,
  setBodyStyle,
  setColumnWidths,
  setRowHeight,
} from "../utils";
import { HANDLES } from "./constants";
import { applyStoredStyles, tableMinContentWidth } from "./utils";
import {
  clampDragWidth,
  clampDragHeight,
  minTableHeight,
  finalRowHeight,
  scaleColWidths,
  widthValue,
} from "../resize-math";

interface TableResizeHandleProps {
  editor: Editor;
}

/** Box của table THẬT tính theo hệ toạ độ của wrapper (portal target). Table có
 * thể tràn wrapper khi content ép cột giãn → outline + handle phải neo theo box
 * này, không theo mép wrapper (right:0/bottom:0 cũ làm khung lệch). */
interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function TableResizeHandle({ editor }: TableResizeHandleProps) {
  // Wrapper (.tableWrapper) của bảng đang focus — handle portal vào đây và định
  // vị absolute theo BOX của table (bên trong wrapper), nên tự cuộn cùng bảng.
  // State để render/portal; ref để đọc khi kéo (state là snapshot).
  const [wrapperEl, setWrapperEl] = useState<HTMLElement | null>(null);
  const wrapperRef = useRef<HTMLElement | null>(null);
  // Box table trong hệ wrapper — tính lại mỗi focus/update (content đổi kích
  // thước table thì khung resize bám theo, không lệch).
  const [box, setBox] = useState<Box | null>(null);
  // Badge hiển thị kích thước (%) khi đang kéo
  const [badge, setBadge] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);
  const tableInner = useRef<HTMLElement | null>(null);
  const isDragging = useRef(false);
  // Huỷ drag đang chạy (gỡ mousemove/mouseup) — gọi khi unmount giữa chừng.
  const abortDragRef = useRef<(() => void) | null>(null);
  // "Table ảo": khung outline (w×h px) + lưới cột/hàng phủ lên bảng thật khi
  // kéo, thay cho preview live. KHÔNG set style DOM thật khi kéo: <table> là
  // NodeView (AlignableTableView) chạy normalizeColWidths mỗi update → ghi đè
  // ngay; source of truth là node attr (commit khi thả). `cols`/`rows` = tỉ lệ
  // 0..1 vị trí ranh cột/hàng (nhân với w/h khi vẽ). `left`/`top` = gốc box
  // trong wrapper. null khi không kéo.
  const [ghost, setGhost] = useState<{
    left: number;
    top: number;
    w: number;
    h: number;
    cols: number[];
    rows: number[];
  } | null>(null);

  useEffect(() => {
    applyStoredStyles(editor);
    const handler = () => applyStoredStyles(editor);
    editor.on("update", handler);
    return () => {
      editor.off("update", handler);
    };
  }, [editor]);

  const inTable = useEditorState({
    editor,
    selector: ({ editor: e }) => e.isActive("table"),
  });

  useEffect(() => {
    if (!inTable) return;
    let raf = 0;
    // Đọc rect trong rAF → sau khi browser reflow (gõ text làm cột giãn thì box
    // lấy kích thước MỚI, không trễ 1 nhịp). Mỗi selectionUpdate/update lên lịch
    // đo lại → khung resize luôn bám table thật.
    const update = () => {
      if (isDragging.current) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const table = focusedTableEl(editor);
        if (!table) return;
        const w = (table.closest(".tableWrapper") ?? table) as HTMLElement;
        // Containing block cho handle/outline absolute.
        w.style.position = "relative";
        tableInner.current = table;
        wrapperRef.current = w;
        setWrapperEl(w);
        // Box = table rect trừ wrapper rect → toạ độ table trong wrapper. Bám
        // mép table thật kể cả khi table tràn wrapper.
        const wr = w.getBoundingClientRect();
        const tr = table.getBoundingClientRect();
        setBox({
          left: tr.left - wr.left,
          top: tr.top - wr.top,
          width: tr.width,
          height: tr.height,
        });
      });
    };
    update();
    editor.on("selectionUpdate", update);
    editor.on("update", update);
    return () => {
      cancelAnimationFrame(raf);
      editor.off("selectionUpdate", update);
      editor.off("update", update);
      abortDragRef.current?.(); // huỷ drag còn treo nếu unmount giữa chừng
      wrapperRef.current = null;
      setWrapperEl(null);
      setBox(null);
    };
  }, [inTable, editor]);

  const startDrag = (
    e: React.MouseEvent,
    mode: "width" | "height" | "both",
    sx: 1 | -1,
    sy: 1 | -1,
    cursor: string,
  ) => {
    e.preventDefault();
    // Lưu selection để restore sau commit — thao tác kéo/commit có thể làm
    // editor mất focus (selection ra ngoài table → handle biến mất).
    const savedFrom = editor.state.selection.from;
    e.stopPropagation();
    const wrapper = wrapperRef.current;
    const table = tableInner.current;
    if (!wrapper || !table) return;

    const doWidth = mode !== "height";
    const doHeight = mode !== "width";

    // Hàng CUỐI của bảng — mọi thao tác height (kéo mép/góc) đổi chiều cao hàng
    // này (height per-row; không còn height cả bảng). Lấy phần tử cuối của danh
    // sách <tr> (không dựa :last-child selector cho chắc).
    const allRows = Array.from(
      table.querySelectorAll(":scope > tbody > tr, :scope > tr"),
    ) as HTMLElement[];
    const lastRow = doHeight ? (allRows[allRows.length - 1] ?? null) : null;

    isDragging.current = true;
    setBodyStyle(cursor, "none");

    // Kích thước bắt đầu = box table THẬT (không phải wrapper).
    const tr0 = table.getBoundingClientRect();
    const wr0 = wrapper.getBoundingClientRect();
    const startW = tr0.width;
    const startH = tr0.height;
    const boxLeft = tr0.left - wr0.left;
    const boxTop = tr0.top - wr0.top;
    const startMouseX = e.clientX;
    const startMouseY = e.clientY;

    // Min width = tổng min-content THẬT của từng cột (đo bằng cách gỡ ràng buộc
    // width tạm thời — xem tableMinContentWidth).
    const minW = tableMinContentWidth(table);

    // Bề rộng px render của từng <col> (1 <col> = 1 column, khớp index mà
    // setColumnWidths dùng — không lệch colspan như đo theo cell). Commit chỉ cần
    // TỈ LỆ giữa các cột: colwidth ghi vào node rồi normalizeColWidths convert
    // px→% mỗi update, nên giữ đúng tỉ lệ là cột co giãn đều theo width bảng.
    // Fallback header cells khi bảng chưa có <colgroup> (trước seedColwidths).
    const colEls = doWidth
      ? (() => {
          const cols = Array.from(
            table.querySelectorAll(":scope > colgroup > col"),
          ) as HTMLElement[];
          return cols.length
            ? cols
            : ((allRows[0]?.children
                ? Array.from(allRows[0].children)
                : []) as HTMLElement[]);
        })()
      : [];
    const startColPx = colEls.map((c) => c.getBoundingClientRect().width);
    const sumColPx = startColPx.reduce((a, b) => a + b, 0);

    const minRowH = 34; // sàn chiều cao 1 hàng
    const startRowH = lastRow ? lastRow.getBoundingClientRect().height : 0;
    // Chiều cao TỐI THIỂU của cả bảng khi co hàng cuối về min.
    const minTableH = minTableHeight(startH, startRowH, minRowH);

    // Lưới trong table ảo:
    // - CỘT: tỉ lệ 0..1 (scale theo width — kéo rộng thì cột giãn đều).
    // - HÀNG: px TUYỆT ĐỐI (ranh dưới mỗi hàng, trừ hàng cuối). Chỉ hàng cuối
    //   đổi height khi kéo → các ranh hàng trên GIỮ NGUYÊN px, không scale theo h.
    const tableLeft = tr0.left;
    const tableTop = tr0.top;
    const headerCells = allRows[0]
      ? (Array.from(allRows[0].children) as HTMLElement[])
      : [];
    const colRatios =
      startW > 0
        ? headerCells
            .map((c) => (c.getBoundingClientRect().right - tableLeft) / startW)
            .filter((rt) => rt > 0 && rt < 0.999)
        : [];
    // Ranh dưới các hàng TRÊN hàng cuối (px). Bỏ hàng cuối (= đáy khung).
    const rowLinesPx = allRows
      .slice(0, -1)
      .map((rw) => rw.getBoundingClientRect().bottom - tableTop);

    // Kích thước "table ảo" đang kéo — chỉ vẽ khung outline, KHÔNG set style DOM
    // thật (bị normalizeColWidths của TableView ghi đè). Commit vào node khi thả.
    let pendingW = startW;
    let pendingH = startH;

    // Trần width = bề rộng container (100%). Không cho kéo bảng rộng quá container.
    const maxW = wrapper.parentElement?.clientWidth ?? Infinity;

    const onMouseMove = (ev: MouseEvent) => {
      if (doWidth) {
        pendingW = clampDragWidth(
          startW,
          ev.clientX - startMouseX,
          sx,
          minW,
          maxW,
        );
      }
      if (doHeight && lastRow) {
        pendingH = clampDragHeight(
          startH,
          ev.clientY - startMouseY,
          sy,
          minTableH,
        );
      }
      // Gốc box: kéo từ mép trái (sx=-1) thì mép phải đứng yên → left dịch theo
      // chênh lệch width; kéo mép trên (sy=-1) tương tự cho top.
      const left = sx < 0 ? boxLeft - (pendingW - startW) : boxLeft;
      const top = sy < 0 ? boxTop - (pendingH - startH) : boxTop;
      setGhost({
        left,
        top,
        w: pendingW,
        h: pendingH,
        cols: colRatios,
        rows: rowLinesPx,
      });

      // Badge: width theo % container (khớp giá trị commit), height theo px.
      const container = wrapper.parentElement?.clientWidth ?? 0;
      const wText =
        container > 0
          ? `${(Math.round((pendingW / container) * 1000) / 10).toFixed(1)}%`
          : `${pendingW}px`;
      const hText = `${pendingH}px`;
      const text =
        mode === "width"
          ? wText
          : mode === "height"
            ? hText
            : `${wText} × ${hText}`;
      const estW = text.length * 8 + 12;
      const x =
        ev.clientX + 14 + estW > window.innerWidth
          ? ev.clientX - 14 - estW
          : ev.clientX + 14;
      setBadge({ x, y: ev.clientY + 14, text });
    };

    // Gỡ đúng listener đã add (mỗi addEventListener ↔ một removeEventListener),
    // reset cursor + cờ drag. Dùng chung cho thả chuột và unmount giữa drag.
    const cleanup = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      abortDragRef.current = null;
      setBodyStyle("", "");
      isDragging.current = false;
    };

    const onMouseUp = () => {
      cleanup();
      setBadge(null);
      setGhost(null);

      // Width commit — 2 nguồn, mỗi nguồn 1 vai trò khác nhau:
      //  1. wrapper.style.width + table attr `style: width:%` = width THẬT của
      //     bảng (attr để persist khi export HTML; applyStoredStyles set lại lên
      //     wrapper khi load). AlignableTableView ép table.style.width=100% nên
      //     wrapper mới là chỗ giữ %.
      //  2. colwidth (px) = chỉ để giữ TỈ LỆ cột; normalizeColWidths convert
      //     px→% mỗi update. Floor ≥1 để không cột nào về 0 (0 làm normalize bail
      //     → cả bảng kẹt px cũ).
      if (doWidth) {
        const container = wrapper.parentElement?.clientWidth ?? 0;
        const widthVal = widthValue(pendingW, container);
        wrapper.style.width = widthVal;
        const scaled = scaleColWidths(startColPx, pendingW, sumColPx);
        editor
          .chain()
          .focus()
          .updateAttributes("table", { style: `width: ${widthVal}` })
          .run();
        if (scaled) setColumnWidths(editor, scaled);
      }

      // Height → cộng phần thay đổi vào hàng cuối, commit vào row node (-1).
      if (doHeight && lastRow) {
        const finalRowH = finalRowHeight(startRowH, pendingH, startH, minRowH);
        setRowHeight(editor, -1, `${finalRowH}px`);
      }

      // Restore focus + selection về chỗ cũ (trong bảng) để handle không biến
      // mất sau khi kéo. clamp phòng doc đổi kích thước.
      const pos = Math.min(savedFrom, editor.state.doc.content.size);
      editor.chain().focus().setTextSelection(pos).run();
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    // Unmount giữa drag → cleanup (gỡ listener, không commit vì selection đã mất).
    abortDragRef.current = cleanup;
  };

  if (!inTable || !wrapperEl || !box) return null;

  // Ô vuông xanh đặc ở mỗi mép/góc (giống TinyMCE), không icon.
  const handleClass =
    "absolute size-2.5 rounded-[2px] bg-primary border border-background shadow-sm";
  // Vị trí handle theo cạnh của box (left/top px trong wrapper).
  const cxPos = {
    l: box.left,
    c: box.left + box.width / 2,
    r: box.left + box.width,
  };
  const cyPos = {
    t: box.top,
    m: box.top + box.height / 2,
    b: box.top + box.height,
  };

  return (
    <>
      {badge && (
        <div
          style={{
            position: "fixed",
            left: badge.x,
            top: badge.y,
            zIndex: 60,
            pointerEvents: "none",
          }}
          className="rounded bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground shadow"
        >
          {badge.text}
        </div>
      )}

      {createPortal(
        <>
          {/* Outline bao bảng đang chọn — neo theo box table thật. */}
          <div
            className="pointer-events-none absolute z-20 border-2 border-primary"
            style={{
              left: box.left,
              top: box.top,
              width: box.width,
              height: box.height,
            }}
          />
          {HANDLES.map(({ key, mode, sx, sy, cursor, z, cx, cy }) => (
            <div
              key={key}
              onMouseDown={(e) => startDrag(e, mode, sx, sy, cursor)}
              style={{
                left: cxPos[cx],
                top: cyPos[cy],
                transform: "translate(-50%, -50%)",
                zIndex: z,
                cursor,
              }}
              className={handleClass}
            />
          ))}
          {ghost && (
            // Table ảo: khung outline w×h + lưới cột/hàng, phủ lên bảng thật.
            <div
              className="pointer-events-none absolute z-30 border-2 border-blue-500 bg-blue-500/5"
              style={{
                left: ghost.left,
                top: ghost.top,
                width: ghost.w,
                height: ghost.h,
              }}
            >
              {ghost.cols.map((rt, i) => (
                <div
                  key={`c${i}`}
                  className="absolute top-0 bottom-0 w-px bg-blue-500/50"
                  style={{ left: rt * ghost.w }}
                />
              ))}
              {ghost.rows.map((py, i) => (
                <div
                  key={`r${i}`}
                  className="absolute left-0 right-0 h-px bg-blue-500/50"
                  style={{ top: py }}
                />
              ))}
            </div>
          )}
        </>,
        wrapperEl,
      )}
    </>
  );
}
