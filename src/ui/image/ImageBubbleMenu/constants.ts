export type Panel =
  | "main"
  | "align"
  | "transform"
  | "resize"
  | "adjust"
  | "alt"
  | "caption";

export type FilterKey =
  | "brightness"
  | "contrast"
  | "exposure"
  | "gamma"
  | "vibrance"
  | "saturation"
  | "blur";

export interface Adjust {
  brightness: number;
  contrast: number;
  exposure: number;
  gamma: number;
  vibrance: number;
  saturation: number;
  blur: number;
}

// "No change" values: percentages = 100, blur = 0 (px).
export const DEFAULT_ADJUST: Adjust = {
  brightness: 100,
  contrast: 100,
  exposure: 100,
  gamma: 100,
  vibrance: 100,
  saturation: 100,
  blur: 0,
};

export const ADJUST_FIELDS: {
  key: FilterKey;
  label: string;
  min: number;
  max: number;
  step: number;
}[] = [
  { key: "brightness", label: "Brightness", min: 0, max: 200, step: 1 },
  { key: "contrast", label: "Contrast", min: 0, max: 200, step: 1 },
  { key: "exposure", label: "Exposure", min: 0, max: 200, step: 1 },
  { key: "gamma", label: "Gamma", min: 0, max: 200, step: 1 },
  { key: "vibrance", label: "Vibrance", min: 0, max: 200, step: 1 },
  { key: "saturation", label: "Saturation", min: 0, max: 200, step: 1 },
  { key: "blur", label: "Blur", min: 0, max: 20, step: 1 },
];

import type { Editor } from "@tiptap/react";

export interface PanelProps {
  editor: Editor;
  onBack: () => void;
}
