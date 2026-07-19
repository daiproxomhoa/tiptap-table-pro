/** Prepend a fixed style string before any existing style on HTMLAttributes. */
export function withStyle(
  attrs: Record<string, unknown>,
  fixed: string,
): Record<string, unknown> {
  const existing = typeof attrs.style === "string" ? attrs.style : "";
  return { ...attrs, style: existing ? `${fixed}; ${existing}` : fixed };
}
