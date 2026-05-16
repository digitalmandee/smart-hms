/**
 * Subscribe to the Android hardware back button. The most recently mounted
 * handler runs first; returning `true` consumes the event (default back
 * navigation is skipped). No-op on iOS / web.
 *
 * The single Capacitor listener lives in `src/lib/native/boot.ts` and walks
 * the shared stack exported below, so handlers and the global root-exit
 * guard never fire twice.
 */
import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

type Handler = () => boolean | void | Promise<boolean | void>;

export const backButtonStack: Handler[] = [];

export function useBackButton(handler: Handler, enabled = true) {
  useEffect(() => {
    if (!enabled || !Capacitor.isNativePlatform()) return;
    backButtonStack.push(handler);
    return () => {
      const i = backButtonStack.lastIndexOf(handler);
      if (i >= 0) backButtonStack.splice(i, 1);
    };
  }, [handler, enabled]);
}
