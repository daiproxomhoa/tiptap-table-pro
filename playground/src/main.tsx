import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
// The library ships its own self-contained stylesheet — no Tailwind or shadcn
// setup required in this app. Just import it once.
import "tiptap-ui-pro/styles.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
