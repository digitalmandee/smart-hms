// Healthcare Management System - Main Entry Point
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { installGlobalErrorHandlers } from "./lib/errorReporter";
import { bootNative } from "./lib/native/boot";

console.log("[boot] main.tsx start", { ua: navigator.userAgent, ts: Date.now() });

window.addEventListener("error", (e) => {
  console.error("[boot] window.error", e?.message, e?.error?.stack || e?.filename + ":" + e?.lineno);
});
window.addEventListener("unhandledrejection", (e) => {
  console.error("[boot] unhandledrejection", (e as any)?.reason?.message || e.reason, (e as any)?.reason?.stack);
});

try {
  installGlobalErrorHandlers();
  console.log("[boot] global error handlers installed");
} catch (e) {
  console.error("[boot] installGlobalErrorHandlers failed", e);
}

// Fire-and-forget: native boot is no-op on web.
console.log("[boot] calling bootNative");
bootNative()
  .then(() => console.log("[boot] bootNative resolved"))
  .catch((e) => console.error("[boot] bootNative failed", e?.message, e?.stack));

try {
  console.log("[boot] mounting React root");
  createRoot(document.getElementById("root")!).render(<App />);
  console.log("[boot] React root mounted");
} catch (e) {
  console.error("[boot] React mount failed", (e as any)?.message, (e as any)?.stack);
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `<pre style="padding:16px;color:#b91c1c;font:12px monospace;white-space:pre-wrap">Mount error: ${(e as any)?.message}\n${(e as any)?.stack || ""}</pre>`;
  }
}
