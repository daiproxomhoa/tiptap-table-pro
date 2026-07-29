import { describe, it, expect, afterEach } from "vitest";
import {
  setResizeDragging,
  getResizeDragging,
  subscribeResizeDrag,
  useResizeDrag,
} from "./resize-drag-store";
import { setBodyStyle } from "./table/utils";

afterEach(() => {
  setResizeDragging(false);
  setBodyStyle("", "");
});

describe("resize drag store", () => {
  it("starts idle", () => {
    expect(getResizeDragging()).toBe(false);
  });

  it("flips the flag", () => {
    setResizeDragging(true);
    expect(getResizeDragging()).toBe(true);
    setResizeDragging(false);
    expect(getResizeDragging()).toBe(false);
  });

  it("notifies subscribers once per actual change", () => {
    let notifications = 0;
    const unsubscribe = subscribeResizeDrag(() => notifications++);

    setResizeDragging(true);
    setResizeDragging(true); // same value → no extra notification
    setResizeDragging(false);

    unsubscribe();
    expect(notifications).toBe(2);
  });

  it("stops notifying after unsubscribe", () => {
    let notifications = 0;
    const unsubscribe = subscribeResizeDrag(() => notifications++);
    unsubscribe();
    setResizeDragging(true);
    expect(notifications).toBe(0);
  });

  it("exposes the hook the bubble menus use", () => {
    expect(typeof useResizeDrag).toBe("function");
  });
});

describe("setBodyStyle", () => {
  it("sets the body cursor and injects a global cursor rule while dragging", () => {
    setBodyStyle("col-resize", "none");
    expect(document.body.style.cursor).toBe("col-resize");
    expect(document.body.style.userSelect).toBe("none");
    const injected = [...document.head.querySelectorAll("style")].some((s) =>
      s.textContent?.includes("cursor: col-resize !important"),
    );
    expect(injected).toBe(true);
  });

  it("replaces the rule when the cursor changes mid-session", () => {
    setBodyStyle("col-resize", "none");
    setBodyStyle("ns-resize", "none");
    const styles = [...document.head.querySelectorAll("style")].map(
      (s) => s.textContent ?? "",
    );
    expect(styles.some((t) => t.includes("ns-resize"))).toBe(true);
    expect(styles.some((t) => t.includes("col-resize"))).toBe(false);
  });

  it("removes the injected rule when the drag ends", () => {
    setBodyStyle("ns-resize", "none");
    setBodyStyle("", "");
    expect(document.body.style.cursor).toBe("");
    const leftover = [...document.head.querySelectorAll("style")].some((s) =>
      s.textContent?.includes("!important"),
    );
    expect(leftover).toBe(false);
  });
});
