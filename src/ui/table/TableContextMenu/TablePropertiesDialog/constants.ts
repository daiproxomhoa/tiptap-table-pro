export const NONE = "none";

export type Align = "left" | "center" | "right";

/** Table-properties form state — managed by a single patch-style useReducer in index.tsx
 * instead of 7 separate useState hooks. */
export interface TableForm {
  width: string;
  height: string;
  align: Align;
  borderless: boolean;
  borderColor: string;
  borderWidth: string;
  borderStyle: string;
}

export const BORDER_PRESETS = [
  // neutrals
  "#000000",
  "#1e293b",
  "#475569",
  "#64748b",
  "#94a3b8",
  "#cbd5e1",
  "#e2e8f0",
  "#ffffff",
  // red → orange → yellow
  "#dc2626",
  "#ef4444",
  "#f97316",
  "#fb923c",
  "#f59e0b",
  "#eab308",
  "#facc15",
  "#fde047",
  // green → teal → cyan
  "#16a34a",
  "#22c55e",
  "#4ade80",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#38bdf8",
  // blue → purple → pink
  "#2563eb",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
];
