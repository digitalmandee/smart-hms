/**
 * Deep-link helpers for the native shell.
 *
 * Custom URL scheme registered with Android/iOS:
 *   app.lovable.0eeac6953ca245ba87e8f046d5957181://<path>?<query>
 *
 * This is what third-party services (HyperPay, Tap, Stripe, STC Pay, Nafath,
 * Supabase magic links) should redirect to after the user completes an action
 * in an external browser tab. The OS routes the URL into the app via
 * `App.addListener('appUrlOpen', ...)` which is wired in `boot.ts`.
 *
 * Supported in-app deep-link paths:
 *   /~oauth                          → Supabase magic link / OAuth return
 *   /portal/invoices/:id/return      → Payment gateway return (success/fail)
 *   /app/settings/ksa/nafath         → Nafath verification callback
 *   /portal/dashboard                → Generic patient app open
 *   /mobile/dashboard                → Generic staff app open
 */
import { Capacitor } from "@capacitor/core";

export const APP_SCHEME = "app.lovable.0eeac6953ca245ba87e8f046d5957181";

/**
 * Build a return URL that third-party services can redirect back to.
 * - Native: returns `app.lovable.<id>://<path>` (handled by appUrlOpen)
 * - Web:    returns `<origin><path>` (regular browser nav)
 */
export function getNativeReturnUrl(path: string): string {
  const safePath = path.startsWith("/") ? path : `/${path}`;
  if (Capacitor.isNativePlatform()) {
    // Strip the leading slash — custom-scheme URLs use `scheme://path`
    return `${APP_SCHEME}://${safePath.replace(/^\//, "")}`;
  }
  if (typeof window !== "undefined") {
    return `${window.location.origin}${safePath}`;
  }
  return safePath;
}

/**
 * Convert an incoming deep-link URL into an in-app router path.
 * Returns `null` if the URL can't be parsed.
 */
export function resolveDeepLink(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    let path = url.pathname || "/";
    if (!path.startsWith("/")) path = "/" + path;

    // Some custom-scheme URLs embed the path in the host portion
    // (e.g. `app.lovable.xxx://~oauth?code=...` → host is `~oauth`).
    if ((!url.pathname || url.pathname === "/") && url.host) {
      path = "/" + url.host + (url.pathname || "");
    }

    return path + (url.search || "") + (url.hash || "");
  } catch {
    return null;
  }
}

/** Push the resolved path into React Router via the history API. */
export function navigateToDeepLink(path: string) {
  if (typeof window === "undefined") return;
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
