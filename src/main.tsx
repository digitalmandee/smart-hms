// Healthcare Management System - Main Entry Point
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { installGlobalErrorHandlers } from "./lib/errorReporter";
import { bootNative } from "./lib/native/boot";

installGlobalErrorHandlers();

// Fire-and-forget: native boot is no-op on web.
bootNative().catch((e) => console.warn("[native-boot] failed", e));

createRoot(document.getElementById("root")!).render(<App />);
