import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TableKit } from "@tiptap/extension-table";
import {
  // headless core
  AlignableTableView,
  TableWithStyle,
  TableRowWithHeight,
  TableCellWithAttrs,
  TableHeaderWithAttrs,
  LinkWithStyle,
  blockLinkNav,
  ImageWithAlign,
  Figure,
  Figcaption,
  // React UI
  TablePicker,
  TableBubbleMenu,
  TableContextMenu,
  TableResizeHandle,
  RowResizeHandle,
  ColResizeHandle,
  ImageBubbleMenu,
  ImageResizeHandle,
  TableIntlProvider,
} from "tiptap-ui-pro";
import { viMessages } from "./viMessages";

const PKG_VERSION = "0.2.4";
const SAMPLE_IMAGE_URL = "https://picsum.photos/200/300";

const INITIAL = `
<h2>Meet tiptap-ui-pro</h2>
<p>A drop-in table &amp; image editing UI for TipTap. Right-click a cell for the context menu, select a table to reveal the bubble menu and drag handles, or grab a table edge to resize.</p>
<table style="width:100%;border-collapse:collapse">
  <tbody>
    <tr><th>Feature</th><th>Where</th><th>Try it</th></tr>
    <tr><td>Context menu</td><td>Inside a cell</td><td>Right-click</td></tr>
    <tr><td>Bubble menu</td><td>Above the table</td><td>Click any cell</td></tr>
    <tr><td>Resize handles</td><td>Table edges</td><td>Drag</td></tr>
  </tbody>
</table>
<p>Images support align, resize, rotate and flip. Select the one below to see its bubble menu:</p>
<img src="${SAMPLE_IMAGE_URL}" alt="Random sample" />
<p></p>
`;

// A custom palette passed to the cell-background submenu.
const BRAND_COLORS = ["#ffffff", "#fee2e2", "#dcfce7", "#dbeafe", "#fef9c3", "#f3e8ff"];

export function App() {
  const [lang, setLang] = useState<"en" | "vi">("en");
  const [html, setHtml] = useState("");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      // StarterKit v3 already ships a `link` extension — disable it since we
      // register the styled LinkWithStyle below (avoids a duplicate-name warning).
      StarterKit.configure({ link: false }),
      LinkWithStyle.configure({ openOnClick: false }),
      // Image with align + rotate/flip/adjust + drag-resize NodeView.
      ImageWithAlign.configure({
        resize: {
          enabled: true,
          directions: ["top", "bottom", "left", "right", "top-left", "bottom-right"],
          minWidth: 50,
          minHeight: 50,
        },
      }),
      Figure,
      Figcaption,
      // Disable TableKit's built-in nodes; the styled ones replace them.
      TableKit.configure({
        table: false,
        tableRow: false,
        tableCell: false,
        tableHeader: false,
      }),
      TableWithStyle.configure({ resizable: false, View: AlignableTableView }),
      TableRowWithHeight,
      TableCellWithAttrs,
      TableHeaderWithAttrs,
    ],
    content: INITIAL,
    editorProps: {
      handleDOMEvents: {
        mousedown: blockLinkNav,
        click: blockLinkNav,
        auxclick: blockLinkNav,
      },
    },
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  });

  // Seed the HTML preview once the editor is ready (avoids setState-in-render).
  useEffect(() => {
    if (editor) setHtml(editor.getHTML());
  }, [editor]);

  if (!editor) return null;

  // Demo image insert: read the picked file as a data URL and insert it.
  const onImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      editor.chain().focus().setImage({ src: reader.result as string }).run();
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(html);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };

  return (
    <div className="page">
      {/* ---- Top bar ---- */}
      <div className="topbar">
        <div className="brand">
          <div className="brand__mark">T</div>
          <div>
            <div className="brand__name">
              tiptap-ui-pro <span className="badge">v{PKG_VERSION}</span>
            </div>
            <div className="brand__sub">Styled table &amp; image UI for TipTap</div>
          </div>
        </div>
        <div className="topbar__actions">
          <label className="linkbtn" style={{ cursor: "default" }}>
            <Icon.Globe />
            <select
              className="select"
              style={{ border: "none", padding: 0, background: "transparent" }}
              value={lang}
              onChange={(e) => setLang(e.target.value as "en" | "vi")}
            >
              <option value="en">English</option>
              <option value="vi">Tiếng Việt</option>
            </select>
          </label>
          <a
            className="linkbtn"
            href="https://www.npmjs.com/package/tiptap-ui-pro"
            target="_blank"
            rel="noreferrer"
          >
            <Icon.Package />
            npm
          </a>
          <a
            className="linkbtn"
            href="https://github.com/daiproxomhoa/tiptap-ui-pro"
            target="_blank"
            rel="noreferrer"
          >
            <Icon.Github />
            GitHub
          </a>
        </div>
      </div>

      {/* ---- Hero ---- */}
      <div className="hero">
        <h1>Table &amp; image editing, done for you.</h1>
        <p>
          Everything below is powered by <code>tiptap-ui-pro</code> — one import
          for the extensions, one import for <code>styles.css</code>. No Tailwind
          or shadcn setup in this app.
        </p>
      </div>

      {/* Everything that renders library UI must be under the provider. */}
      <TableIntlProvider messages={lang === "vi" ? viMessages : {}}>
        <div className="card">
          {/* ---- Toolbar ---- */}
          <div className="toolbar">
            <div className="toolbar__group">
              <TablePicker editor={editor} maxRows={8} maxCols={10} />
            </div>

            <div className="toolbar__divider" />

            <div className="toolbar__group">
              <ToolbarButton
                title="Bold"
                active={editor.isActive("bold")}
                onClick={() => editor.chain().focus().toggleBold().run()}
              >
                <Icon.Bold />
              </ToolbarButton>
              <ToolbarButton
                title="Italic"
                active={editor.isActive("italic")}
                onClick={() => editor.chain().focus().toggleItalic().run()}
              >
                <Icon.Italic />
              </ToolbarButton>
            </div>

            <div className="toolbar__divider" />

            <div className="toolbar__group">
              <ToolbarButton
                title="Upload image"
                onClick={() => fileInputRef.current?.click()}
              >
                <Icon.Upload />
              </ToolbarButton>
              <ToolbarButton
                title="Insert image from URL"
                onClick={() =>
                  editor.chain().focus().setImage({ src: SAMPLE_IMAGE_URL }).run()
                }
              >
                <Icon.Link />
              </ToolbarButton>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={onImageFile}
              />
            </div>
          </div>

          {/* ---- Editing surface ---- */}
          <TableContextMenu editor={editor} cellColors={BRAND_COLORS}>
            <div className="editor-surface">
              <TableBubbleMenu editor={editor} />
              <TableResizeHandle editor={editor} />
              <RowResizeHandle editor={editor} />
              <ColResizeHandle editor={editor} />
              {/* Image editing UI */}
              <ImageBubbleMenu editor={editor} />
              <ImageResizeHandle editor={editor} />
              <EditorContent editor={editor} />
            </div>
          </TableContextMenu>
        </div>
      </TableIntlProvider>

      {/* ---- Feature legend ---- */}
      <div className="legend">
        <div className="legend__item">
          <h3>Right-click a cell</h3>
          <p>Insert/delete rows &amp; columns, merge cells, set a cell background.</p>
        </div>
        <div className="legend__item">
          <h3>Select the table</h3>
          <p>A bubble menu floats above with the most common quick actions.</p>
        </div>
        <div className="legend__item">
          <h3>Drag the edges</h3>
          <p>Resize columns, rows and the whole table with the drag handles.</p>
        </div>
        <div className="legend__item">
          <h3>Switch language</h3>
          <p>
            Labels default to English; the picker in the header swaps in the
            Vietnamese overrides via <code>TableIntlProvider</code>.
          </p>
        </div>
      </div>

      {/* ---- Live HTML output ---- */}
      <div className="output">
        <div className="output__header">
          <span className="output__label">editor.getHTML()</span>
          <button className="copybtn" onClick={copyHtml}>
            {copied ? <Icon.Check /> : <Icon.Copy />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="output__pre">
          <code>{html}</code>
        </pre>
      </div>

      <div className="footer">
        Built with{" "}
        <a href="https://www.npmjs.com/package/tiptap-ui-pro" target="_blank" rel="noreferrer">
          tiptap-ui-pro
        </a>{" "}
        · This playground aliases the package to the local <code>src/</code> for
        live debugging.
      </div>
    </div>
  );
}

function ToolbarButton({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="tbtn"
      title={title}
      aria-label={title}
      data-active={active ? "true" : "false"}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/* Minimal inline icon set (no icon dependency in the demo). */
const Icon = {
  Bold: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4h8a4 4 0 0 1 0 8H6zM6 12h9a4 4 0 0 1 0 8H6z" />
    </svg>
  ),
  Italic: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" />
    </svg>
  ),
  Upload: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  Link: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5" /><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5" />
    </svg>
  ),
  Globe: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <circle cx="12" cy="12" r="9" /><line x1="3" y1="12" x2="21" y2="12" /><path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z" />
    </svg>
  ),
  Package: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
      <path d="M16.5 9.4 7.5 4.2" /><path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.3 7 12 12 20.7 7" /><line x1="12" y1="22" x2="12" y2="12" />
    </svg>
  ),
  Github: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
      <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.4-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17 4.5 18 4.8 18 4.8c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z" />
    </svg>
  ),
  Copy: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
      <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};
