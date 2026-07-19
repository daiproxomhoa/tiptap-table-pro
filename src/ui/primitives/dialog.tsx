"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "../../lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    /** Ẩn nút X góc phải (vd. fullscreen editor có toolbar riêng che chỗ đó). */
    hideClose?: boolean;
  }
>(({ className, children, hideClose, onEscapeKeyDown, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      onEscapeKeyDown={(e) => {
        onEscapeKeyDown?.(e);
        // Editor compact dùng Esc để bật/tắt bubble menu (đánh dấu bằng
        // [data-esc-bubble]). Khi focus đang trong đó, chặn Esc đóng dialog để
        // editor nhận Esc — nếu không Radix (capture-phase) sẽ đóng trước.
        if (document.activeElement?.closest("[data-esc-bubble]"))
          e.preventDefault();
      }}
      className={cn(
        // Column layout so DialogHeader/DialogFooter stay fixed and only the
        // body (the flex-1 region a consumer marks with overflow-y-auto) scrolls.
        // No padding here — each part (header/body/footer) owns its own padding
        // so the scrollbar sits at the edge, not inside a padded box.
        "flex max-h-[90svh] flex-col overflow-hidden",
        "fixed left-[50%] top-[50%] z-50 w-[calc(100%-24px)] max-w-lg translate-x-[-50%] translate-y-[-50%] border bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg",
        className,
      )}
      {...props}
    >
      {children}
      {!hideClose && (
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex shrink-0 flex-col space-y-1.5 px-3 py-4 text-center sm:p-6 sm:text-left",
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex shrink-0 justify-end space-x-2 border-t px-3 py-3 sm:px-6 [&>button]:min-w-25",
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

/**
 * Scrollable body region between DialogHeader and DialogFooter. Owns its own
 * padding (responsive) and is the ONLY part that scrolls — header/footer stay
 * fixed. Use in every dialog (form or not) for the middle content.
 */
const DialogBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "min-h-0 flex-1 space-y-3 overflow-y-auto px-3 pt-2 pb-3 sm:px-6 sm:pb-6",
      className,
    )}
    {...props}
  />
);
DialogBody.displayName = "DialogBody";

/** Same as DialogBody but renders a `<form>` — the scrollable body of a form dialog. */
const DialogBodyForm = ({
  className,
  ...props
}: React.FormHTMLAttributes<HTMLFormElement>) => (
  <form
    noValidate
    className={cn(
      "min-h-0 flex-1 space-y-3 overflow-y-auto px-3 pt-2 pb-3 sm:px-6 sm:pb-6",
      className,
    )}
    {...props}
  />
);
DialogBodyForm.displayName = "DialogBodyForm";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogBodyForm,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
