import { describe, it, expect } from "vitest";
import { isValidHex, normalizeBorderWidth } from "./utils";

describe("normalizeBorderWidth", () => {
  it("treats a bare number as px", () => {
    expect(normalizeBorderWidth("2")).toBe("2px");
    expect(normalizeBorderWidth("1.5")).toBe("1.5px");
  });

  it("keeps a value that already has a unit", () => {
    expect(normalizeBorderWidth("3px")).toBe("3px");
    expect(normalizeBorderWidth("0.2rem")).toBe("0.2rem");
    expect(normalizeBorderWidth("thin")).toBe("thin");
  });

  it("trims surrounding whitespace", () => {
    expect(normalizeBorderWidth("  4  ")).toBe("4px");
  });

  it("returns null for empty input (drops the attr)", () => {
    expect(normalizeBorderWidth("")).toBeNull();
    expect(normalizeBorderWidth("   ")).toBeNull();
  });
});

describe("isValidHex", () => {
  it("accepts a 6-digit hex color", () => {
    expect(isValidHex("#a1b2c3")).toBe(true);
    expect(isValidHex("#FFFFFF")).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isValidHex("#fff")).toBe(false);
    expect(isValidHex("a1b2c3")).toBe(false);
    expect(isValidHex("")).toBe(false);
  });
});
