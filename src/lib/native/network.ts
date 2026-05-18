/**
 * Unified online/offline status across web and native (Capacitor) shells.
 * Combines `navigator.onLine`, window online/offline events, and the
 * `@capacitor/network` listener so subscribers get a single source of truth.
 */
import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";

let currentOnline: boolean =
  typeof navigator !== "undefined" ? navigator.onLine !== false : true;

type Listener = (online: boolean) => void;
const listeners = new Set<Listener>();

function setOnline(next: boolean) {
  if (currentOnline === next) return;
  currentOnline = next;
  listeners.forEach((l) => {
    try { l(next); } catch { /* swallow */ }
  });
}

let wired = false;
function wireListenersOnce() {
  if (wired || typeof window === "undefined") return;
  wired = true;

  window.addEventListener("online", () => setOnline(true));
  window.addEventListener("offline", () => setOnline(false));

  if (Capacitor.isNativePlatform()) {
    // Lazy import so web bundle stays small.
    import("@capacitor/network")
      .then(({ Network }) => {
        Network.getStatus().then((s) => setOnline(!!s.connected)).catch(() => {});
        Network.addListener("networkStatusChange", (s) => setOnline(!!s.connected));
      })
      .catch(() => { /* plugin unavailable — fall back to navigator only */ });
  }
}

export function getOnlineStatus(): boolean {
  wireListenersOnce();
  return currentOnline;
}

export function useOnlineStatus(): boolean {
  wireListenersOnce();
  const [online, setLocal] = useState<boolean>(currentOnline);
  useEffect(() => {
    const l: Listener = (v) => setLocal(v);
    listeners.add(l);
    // Sync on mount in case the singleton changed between render and effect.
    setLocal(currentOnline);
    return () => { listeners.delete(l); };
  }, []);
  return online;
}
