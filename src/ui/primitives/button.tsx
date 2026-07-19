import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "../../lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./tooltip";

const buttonVariants = cva(
  "cursor-pointer w-fit inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-foreground/8 hover:text-accent-foreground",
      },
      size: {
        default: "min-w-9 h-9 px-2 md:px-3 py-2",
        sm: "h-7 text-xs rounded-md px-2",
        lg: "h-10 rounded-md px-8",
        icon: "h-8 min-w-8",
        "icon-sm": "size-7",
        "icon-xs": "size-6 min-w-6",
      },
      color: {
        default: "",
        success: "",
        error: "",
        warning: "",
      },
    },
    compoundVariants: [
      // Filled (default variant): color sets the background.
      {
        variant: "default",
        color: "success",
        className: "bg-green-600 text-white hover:bg-green-600/90",
      },
      {
        variant: "default",
        color: "error",
        className: "bg-destructive text-white hover:bg-destructive/90",
      },
      {
        variant: "default",
        color: "warning",
        className: "bg-amber-500 text-white hover:bg-amber-500/90",
      },
      // Outline: color tints border + text.
      {
        variant: "outline",
        color: "success",
        className:
          "border-green-600/50 text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-500/10",
      },
      {
        variant: "outline",
        color: "error",
        className:
          "border-destructive/50 text-destructive hover:bg-destructive/10",
      },
      {
        variant: "outline",
        color: "warning",
        className:
          "border-amber-500/50 text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-500/10",
      },
      // Ghost: color tints text only.
      {
        variant: "ghost",
        color: "success",
        className:
          "text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-500/10",
      },
      {
        variant: "ghost",
        color: "error",
        className: "text-destructive hover:bg-destructive/10",
      },
      {
        variant: "ghost",
        color: "warning",
        className:
          "text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-500/10",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      color: "default",
    },
  },
);

export interface ButtonProps
  extends
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** When true, disables the button and replaces children with a spinning loader. */
  loading?: boolean;
  /** When set, wraps the button in a tooltip showing this content on hover. */
  tooltip?: React.ReactNode;
  /** Side the tooltip appears on. */
  tooltipSide?: "top" | "right" | "bottom" | "left";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      color,
      asChild = false,
      loading = false,
      disabled,
      children,
      tooltip,
      tooltipSide,
      ...props
    },
    ref,
  ) => {
    // `loading` can't apply with asChild (Slot requires a single child element).
    const Comp = asChild ? Slot : "button";
    const showLoader = !asChild && loading;
    const button = (
      <Comp
        className={cn(
          buttonVariants({ variant, size, color, className }),
          showLoader && "relative",
        )}
        ref={ref}
        type="button"
        disabled={disabled || (!asChild && loading)}
        {...props}
      >
        {showLoader ? (
          <>
            <span className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="animate-spin" />
            </span>
            {/* Keep children mounted (just hidden) while loading so size/layout
                and any child context are preserved — spinner overlays them. */}
            <span className="invisible contents">{children}</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );

    if (tooltip == null) return button;
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side={tooltipSide}>{tooltip}</TooltipContent>
      </Tooltip>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
