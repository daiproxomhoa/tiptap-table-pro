// Minimal className joiner (clsx-like) with no external dependencies.
// Accepts strings, numbers, arrays, and objects ({ "class": condition }),
// skipping falsy values. Later classes win by CSS source order, which is all
// this library's controlled utility classes require.
export type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | ClassValue[]
  | Record<string, boolean | null | undefined>;

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  const walk = (v: ClassValue) => {
    if (!v) return;
    if (typeof v === "string" || typeof v === "number") {
      out.push(String(v));
    } else if (Array.isArray(v)) {
      v.forEach(walk);
    } else if (typeof v === "object") {
      for (const key in v) if (v[key]) out.push(key);
    }
  };
  inputs.forEach(walk);
  return out.join(" ");
}
