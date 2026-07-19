import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useEditorState, type Editor } from "@tiptap/react";
import { focusedTableEl, setBodyStyle, setRowHeight } from "../utils";
import { clampRowBottom } from "../resize-math";

interface RowResizeHandleProps {
  editor: Editor;
}

/**
 * Kéo mép dưới từng <tr> để chỉnh chiều cao hàng đó (height per-row lưu trên
 * row node — xem TableRowWithHeight). Handle portal vào .tableWrapper của bảng
 * đang focus, mỗi hàng (trừ hàng cuối) có 1 thanh mỏng ở mép dưới, chỉ hiện
 * khi hover. Kéo KHÔNG resize hàng ngay: hiện 1 "line ảo" ngang chạy theo
 * chuột; THẢ mới commit 1 transaction ghi height vào row node đó.
 */
export function RowResizeHandle({ editor }: RowResizeHandleProps) {
  const [wrapperEl, setWrapperEl] = useState<HTMLElement | null>(null);
  const wrapperRef = useRef<HTMLElement | null>(null);
  const tableRef = useRef<HTMLElement | null>(null);
  const isDragging = useRef(false);
  const [rows, setRows] = useState<HTMLElement[]>([]);
  // Line ảo khi đang kéo: toạ độ top (px) trong wrapper, null khi không kéo.
  const [guideTop, setGuideTop] = useState<number | null>(null);

  const inTable = useEditorState({
    editor,
    selector: ({ editor: e }) => e.isActive("table"),
  });

  useEffect(() => {
    if (!inTable) return;
    const update = () => {
      if (isDragging.current) return;
      const table = focusedTableEl(editor);
      if (!table) return;
      const w = (table.closest(".tableWrapper") ?? table) as HTMLElement;
      w.style.position = "relative";
      tableRef.current = table;
      wrapperRef.current = w;
      setWrapperEl(w);
      setRows(
        Array.from(
          table.querySelectorAll(":scope > tbody > tr, :scope > tr"),
        ) as HTMLElement[],
      );
    };
    const raf = requestAnimationFrame(update);
    editor.on("selectionUpdate", update);
    editor.on("update", update);
    return () => {
      cancelAnimationFrame(raf);
      editor.off("selectionUpdate", update);
      editor.off("update", update);
      wrapperRef.current = null;
      tableRef.current = null;
      setWrapperEl(null);
      setRows([]);
    };
  }, [inTable, editor]);

  const startDrag = (e: React.MouseEvent, rowIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    const table = tableRef.current;
    const wrapper = wrapperRef.current;
    if (!table || !wrapper) return;
    const currentRows = Array.from(
      table.querySelectorAll(":scope > tbody > tr, :scope > tr"),
    ) as HTMLElement[];
    const tr = currentRows[rowIndex];
    if (!tr) return;

    isDragging.current = true;
    setBodyStyle("ns-resize", "none");

    const trRect = tr.getBoundingClientRect();
    const rowTop = trRect.top;
    // Min = chiều cao nội dung hàng. Tạm ép tr.style.height='0' rồi đọc
    // scrollHeight — nếu đọc khi hàng đang bị height cũ kéo cao thì scrollHeight
    // = chính height đó (content < box) → minH = height hiện tại → hàng chỉ to,
    // không co được. Khôi phục ngay sau khi đo.
    const prev = tr.style.height;
    tr.style.height = "0";
    const minH = tr.scrollHeight;
    tr.style.height = prev;

    // Đổi toạ độ trang (clientY) → toạ độ trong wrapper cho line ảo.
    const wrapTop = () => wrapper.getBoundingClientRect().top;
    const clampY = (clientY: number) => clampRowBottom(clientY, rowTop, minH);

    setGuideTop(clampY(trRect.bottom) - wrapTop());

    const onMove = (ev: MouseEvent) => {
      setGuideTop(clampY(ev.clientY) - wrapTop());
    };
    const onUp = (ev: MouseEvent) => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      setBodyStyle("", "");
      isDragging.current = false;
      setGuideTop(null);

      const finalH = Math.round(clampY(ev.clientY) - rowTop);
      setRowHeight(editor, rowIndex, `${finalH}px`);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  if (!inTable || !wrapperEl || rows.length === 0) return null;

  const wrapTop = wrapperEl.getBoundingClientRect().top;

  return createPortal(
    <>
      {rows.slice(0, -1).map((tr, i) => {
        const top = tr.getBoundingClientRect().bottom - wrapTop;
        return (
          <div
            key={i}
            onMouseDown={(e) => startDrag(e, i)}
            className="group absolute left-0 right-0 flex h-2.5 -translate-y-1/2 items-center cursor-ns-resize"
            style={{ top }}
          >
            <div className="h-0.5 w-full rounded-full bg-blue-500 opacity-0 shadow-[0_0_8px_2px] shadow-blue-500/40 transition-all duration-200 group-hover:h-1 group-hover:opacity-100" />
          </div>
        );
      })}
      {guideTop !== null && (
        <div
          className="pointer-events-none absolute left-0 right-0 z-20 h-1 -translate-y-1/2 rounded bg-blue-500"
          style={{ top: guideTop }}
        />
      )}
    </>,
    wrapperEl,
  );
}
