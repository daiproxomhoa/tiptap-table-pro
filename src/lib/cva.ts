// Minimal `class-variance-authority` replacement covering the subset this
// package uses: base classes, variants, compoundVariants, defaultVariants, and
// a className merge. No external dependency.
type VariantShape = Record<string, Record<string, string>>;

type VariantSelection<T extends VariantShape> = {
  [K in keyof T]?: keyof T[K];
};

type CompoundVariant<T extends VariantShape> = VariantSelection<T> & {
  className: string;
};

interface CvaConfig<T extends VariantShape> {
  variants?: T;
  compoundVariants?: CompoundVariant<T>[];
  defaultVariants?: VariantSelection<T>;
}

export interface CvaFn<T extends VariantShape> {
  (props?: VariantSelection<T> & { className?: string }): string;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function cva<T extends VariantShape = {}>(
  base: string,
  config: CvaConfig<T> = {},
): CvaFn<T> {
  const { variants, compoundVariants = [], defaultVariants = {} } = config;
  return (props = {}) => {
    const classes: string[] = [base];
    const resolved: Record<string, unknown> = { ...defaultVariants, ...props };

    if (variants) {
      for (const key in variants) {
        const value = resolved[key] as string | undefined;
        if (value != null && variants[key][value]) {
          classes.push(variants[key][value]);
        }
      }
    }

    for (const cv of compoundVariants) {
      const { className: cvClass, ...conds } = cv as Record<string, unknown> & {
        className: string;
      };
      const matches = Object.keys(conds).every(
        (k) => resolved[k] === conds[k],
      );
      if (matches) classes.push(cvClass);
    }

    const { className } = props as { className?: string };
    if (className) classes.push(className);
    return classes.filter(Boolean).join(" ");
  };
}

export type VariantProps<F> =
  F extends CvaFn<infer T> ? VariantSelection<T> : never;
