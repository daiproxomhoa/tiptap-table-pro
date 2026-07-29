export const NONE = "none";

/** Cell-properties form state — 8 fields describing one entity, managed by a single
 * patch-style useReducer in index.tsx instead of 8 separate useState hooks. */
export interface CellForm {
  cellType: string;
  scope: string;
  hAlign: string;
  vAlign: string;
  borderWidth: string;
  borderStyle: string;
  borderColor: string;
  bgColor: string;
}
