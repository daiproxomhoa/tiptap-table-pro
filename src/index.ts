// tiptap-ui-pro — styled, resizable TipTap table extensions + editing UI.
//
// Two layers:
//   - Core (headless): node extensions you register with your editor.
//   - UI (React): bubble menu, context menu, resize handles, property dialogs.
//
// Import the whole thing from the package root, or cherry-pick from
// "tiptap-ui-pro/core" (no React UI) if you only need the extensions.

export * from "./core";
export * from "./ui";

// i18n: wrap the editor in <TableIntlProvider> to override the default
// (English) labels; by default strings render as-is.
export { TableIntlProvider } from "./lib/intl";
export type { IntlMessages } from "./lib/intl";
