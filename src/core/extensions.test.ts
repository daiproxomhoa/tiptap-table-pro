import { describe, it, expect, afterEach } from "vitest";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import {
  TableWithStyle,
  TableRowWithHeight,
  TableCellWithAttrs,
  TableHeaderWithAttrs,
  ImageWithAlign,
  Figure,
  Figcaption,
  LinkWithStyle,
  withStyle,
} from "./index";

// A single editor per test, torn down afterwards. Content is provided as HTML
// so each test exercises parseHTML (load) → renderHTML (getHTML) round-trip —
// the guarantee that matters for tiptap-ui-pro: portable, inline-styled output.
let editor: Editor | null = null;

function makeEditor(content: string): Editor {
  editor = new Editor({
    extensions: [
      StarterKit.configure({ link: false }),
      LinkWithStyle.configure({ openOnClick: false }),
      ImageWithAlign,
      Figure,
      Figcaption,
      TableWithStyle,
      TableRowWithHeight,
      TableCellWithAttrs,
      TableHeaderWithAttrs,
    ],
    content,
  });
  return editor;
}

afterEach(() => {
  editor?.destroy();
  editor = null;
});

describe("table serialization", () => {
  const TABLE = `<table><tbody><tr><th>H</th></tr><tr><td>C</td></tr></tbody></table>`;

  it("emits border-collapse on the table so it renders without app CSS", () => {
    const html = makeEditor(TABLE).getHTML();
    expect(html).toContain("border-collapse: collapse");
    expect(html).toContain("width: 100%");
  });

  it("emits an inline border + padding on every cell", () => {
    const html = makeEditor(TABLE).getHTML();
    expect(html).toContain("border: 1px solid");
    expect(html).toContain("padding: 0.375rem");
  });

  it("round-trips a row height set in the source HTML", () => {
    const html = makeEditor(
      `<table><tbody><tr style="height: 48px"><td>C</td></tr></tbody></table>`,
    ).getHTML();
    expect(html).toContain("height: 48px");
  });
});

describe("image serialization", () => {
  it("keeps a plain <img> plain (no align/rotate attrs) for clean output", () => {
    const html = makeEditor(`<img src="a.png">`).getHTML();
    expect(html).toContain('src="a.png"');
    expect(html).not.toContain("data-align");
    expect(html).not.toContain("data-rotate");
  });

  it("wraps a center-aligned image so alignment survives outside the editor", () => {
    const html = makeEditor(`<img src="a.png" data-align="center">`).getHTML();
    // The DOM normalizes the inline style, so match loosely on the whitespace.
    expect(html).toMatch(/justify-content:\s*center/);
    expect(html).toContain('data-align="center"');
  });

  it("round-trips rotation as data-rotate + a CSS transform", () => {
    const html = makeEditor(`<img src="a.png" data-rotate="90">`).getHTML();
    expect(html).toContain('data-rotate="90"');
    expect(html).toMatch(/transform:\s*rotate\(90deg\)/);
  });

  it("round-trips a horizontal flip", () => {
    const html = makeEditor(`<img src="a.png" data-flip-x="1">`).getHTML();
    expect(html).toContain('data-flip-x="1"');
    expect(html).toMatch(/scaleX\(-1\)/);
  });
});

describe("figure / figcaption", () => {
  it("serializes a captioned image with inline figure styles", () => {
    const html = makeEditor(
      `<figure><img src="a.png"><figcaption>Cap</figcaption></figure>`,
    ).getHTML();
    expect(html).toContain("<figure");
    expect(html).toContain("display: table");
    expect(html).toContain("<figcaption");
    expect(html).toContain("caption-side: bottom");
    expect(html).toContain("Cap");
  });
});

describe("link mark", () => {
  it("emits an inline-styled anchor with its href", () => {
    const html = makeEditor(`<p><a href="https://x.dev">x</a></p>`).getHTML();
    expect(html).toContain('href="https://x.dev"');
    expect(html).toContain("text-decoration: underline");
  });
});

describe("withStyle util", () => {
  it("adds a style attribute when none exists", () => {
    expect(withStyle({}, "color: red")).toEqual({ style: "color: red" });
  });

  it("prepends to an existing style attribute", () => {
    const out = withStyle({ style: "margin: 0" }, "color: red");
    expect(out.style).toContain("color: red");
    expect(out.style).toContain("margin: 0");
  });

  it("preserves other attributes", () => {
    expect(withStyle({ href: "x" }, "color: red")).toMatchObject({ href: "x" });
  });
});
