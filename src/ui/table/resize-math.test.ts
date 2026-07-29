import { describe, it, expect } from "vitest";
import {
  clampDragWidth,
  clampDragHeight,
  minTableHeight,
  finalRowHeight,
  scaleColWidths,
  widthValue,
  clampColBoundary,
  splitAdjacentWidths,
  clampRowBottom,
} from "./resize-math";

describe("clampDragWidth", () => {
  it("drags the right edge (sx=1) and rounds", () => {
    expect(clampDragWidth(200, 40.4, 1, 50)).toBe(240);
  });

  it("inverts the delta when dragging the left edge (sx=-1)", () => {
    expect(clampDragWidth(200, 40, -1, 50)).toBe(160);
  });

  it("clamps to the minimum width", () => {
    expect(clampDragWidth(200, -400, 1, 50)).toBe(50);
  });

  it("clamps to the maximum width (container)", () => {
    expect(clampDragWidth(200, 400, 1, 50, 300)).toBe(300);
  });
});

describe("clampDragHeight", () => {
  it("drags the bottom edge (sy=1)", () => {
    expect(clampDragHeight(100, 30, 1, 60)).toBe(130);
  });

  it("never shrinks below the table floor", () => {
    expect(clampDragHeight(100, -80, 1, 60)).toBe(60);
  });
});

describe("minTableHeight", () => {
  it("subtracts how far the last row can shrink", () => {
    expect(minTableHeight(300, 100, 40)).toBe(240);
  });

  it("does not add height when the row is already at its floor", () => {
    expect(minTableHeight(300, 40, 40)).toBe(300);
    expect(minTableHeight(300, 30, 40)).toBe(300); // startRowH < minRowH → no negative shrink
  });
});

describe("finalRowHeight", () => {
  it("applies the table's delta to the row and rounds", () => {
    expect(finalRowHeight(100, 330, 300, 40)).toBe(130);
  });

  it("floors at the minimum row height", () => {
    expect(finalRowHeight(100, 200, 300, 40)).toBe(40);
  });
});

describe("scaleColWidths", () => {
  it("scales columns proportionally to the new width", () => {
    expect(scaleColWidths([100, 100], 300, 200)).toEqual([150, 150]);
  });

  it("keeps the ratio between unequal columns", () => {
    expect(scaleColWidths([50, 150], 400, 200)).toEqual([100, 300]);
  });

  it("floors every column at 1px (never 0)", () => {
    expect(scaleColWidths([1, 1], 2, 1000)).toEqual([1, 1]);
  });

  it("returns null when columns are not measured yet", () => {
    expect(scaleColWidths([100], 300, 0)).toBeNull();
  });
});

describe("widthValue", () => {
  it("returns a percentage relative to the container, rounded to 0.1%", () => {
    expect(widthValue(250, 1000)).toBe("25%");
    expect(widthValue(333, 1000)).toBe("33.3%");
  });

  it("falls back to px when the container is not measurable", () => {
    expect(widthValue(250, 0)).toBe("250px");
  });
});

describe("clampColBoundary", () => {
  it("keeps both adjacent columns at least minCol wide", () => {
    expect(clampColBoundary(5, 0, 200, 30)).toBe(30); // hit the left floor
    expect(clampColBoundary(195, 0, 200, 30)).toBe(170); // hit the right floor
    expect(clampColBoundary(100, 0, 200, 30)).toBe(100); // in range
  });
});

describe("splitAdjacentWidths", () => {
  it("splits the total between the two columns, preserving the sum", () => {
    expect(splitAdjacentWidths(120, 0, 200)).toEqual([120, 80]);
  });

  it("rounds the left column and derives the right from the total", () => {
    const [left, right] = splitAdjacentWidths(120.6, 0, 200);
    expect(left).toBe(121);
    expect(left + right).toBe(200);
  });
});

describe("clampRowBottom", () => {
  it("never lets the bottom go above rowTop + minH", () => {
    expect(clampRowBottom(90, 100, 40)).toBe(140); // clamped up to the floor
    expect(clampRowBottom(200, 100, 40)).toBe(200); // free below the floor
  });
});
