/**
 * Subscribe to the Android hardware back button. The most recently mounted
 * handler runs first; returning `true` consumes the event (default back
 * navigation is skipped). No-op on iOS / web.
 *
 * Useful for modal dismissal, multi-step wizards, or "are you sure?" prompts.
 */
import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";

type Handler = () => boolean | void | Promise<boolean | void>;

const stack: Handler[] = [];
let installed = false;

function install() {
  if (installed) return;
  installed = true;
  if (!Capacitor.isNativePlatform()) return;
  App.addListener("backButton", async (ev) => {
    // Run handlers most-recent first
    for (let i = stack.length - 1; i >= 0; i--) {
      try {
        const consumed = await stack[i]();
        if (consumed) return;
      } catch {
        /* keep going */
      }
    }
    // No handler consumed it → default global behaviour (boot.ts wires this)
    if (ev.canGoBack && window.history.length > 1) {
      window.history.back();
    }
  });
}

export function useBackButton(handler: Handler, enabled = true) {
  useEffect(() => {
    if (!enabled || !Capacitor.isNativePlatform()) return;
    install();
    stack.push(handler);
    return () => {
      const i = stack.lastIndexOf(handler);
      if (i >= 0) stack.splice(i, 1);
    };
  }, [handler, enabled]);
}
