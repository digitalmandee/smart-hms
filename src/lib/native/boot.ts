/**
 * Native boot orchestrator — runs once on app startup when running inside
 * a Capacitor shell (Android / iOS). Web builds skip this entirely.
 *
 * Responsibilities:
 *  1. Hide the splash screen after the first paint
 *  2. Apply status bar styling (matches brand colour)
 *  3. Restore the saved locale (EN / AR / UR) and apply <html lang/dir>
 *  4. Wire global app lifecycle listeners (resume → flush outbox, deep-link
 *     handler, Android hardware back button)
 *  5. Register for push notifications and persist the token
 *
 * Intentionally side-effect free on web — every Capacitor import is guarded
 * by `Capacitor.isNativePlatform()` so the same bundle ships to both worlds.
 */
import { Capacitor } from "@capacitor/core";
import { App, type URLOpenListenerEvent } from "@capacitor/app";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Preferences } from "@capacitor/preferences";
import { Network } from "@capacitor/network";
import { PushNotifications } from "@capacitor/push-notifications";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Device } from "@capacitor/device";
import { supabase } from "@/integrations/supabase/client";
import { forceSync as flushOutbox } from "@/lib/offline-sync/sync-engine";

type SupportedLocale = "en" | "ar" | "ur";
const LOCALE_KEY = "healthos.locale";
const RTL_LOCALES: SupportedLocale[] = ["ar", "ur"];

let booted = false;

/** Apply <html lang> / <html dir> globally. Safe on both web + native. */
export function applyLocaleToDocument(locale: SupportedLocale) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = locale;
  document.documentElement.dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
}

/** Persist user-chosen locale to native secure store (and localStorage fallback). */
export async function persistLocale(locale: SupportedLocale) {
  applyLocaleToDocument(locale);
  try {
    if (Capacitor.isNativePlatform()) {
      await Preferences.set({ key: LOCALE_KEY, value: locale });
    } else if (typeof localStorage !== "undefined") {
      localStorage.setItem(LOCALE_KEY, locale);
    }
  } catch {
    /* non-fatal */
  }
}

async function restoreLocale(): Promise<SupportedLocale> {
  try {
    if (Capacitor.isNativePlatform()) {
      const { value } = await Preferences.get({ key: LOCALE_KEY });
      if (value && ["en", "ar", "ur"].includes(value)) return value as SupportedLocale;
    } else if (typeof localStorage !== "undefined") {
      const v = localStorage.getItem(LOCALE_KEY);
      if (v && ["en", "ar", "ur"].includes(v)) return v as SupportedLocale;
    }
  } catch {
    /* ignore */
  }
  return "en";
}

/**
 * Map deep link path → in-app route.
 * Custom URL scheme: `app.lovable.0eeac6953ca245ba87e8f046d5957181://<path>`
 * Universal/App link host: `0eeac695-3ca2-45ba-87e8-f046d5957181.lovableproject.com`
 */
function resolveDeepLink(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    // Custom scheme → use pathname + search, with `/` fallback
    let path = url.pathname || "/";
    if (!path.startsWith("/")) path = "/" + path;
    // Preserve query string for OAuth/payment returns
    return path + (url.search || "") + (url.hash || "");
  } catch {
    return null;
  }
}

async function registerPushAsync(): Promise<void> {
  try {
    let perm = await PushNotifications.checkPermissions();
    if (perm.receive === "prompt") {
      perm = await PushNotifications.requestPermissions();
    }
    if (perm.receive !== "granted") return;
    await PushNotifications.register();
  } catch (e) {
    console.warn("[native-boot] push register failed", e);
  }
}

async function upsertDeviceToken(token: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Lookup organization_id so push fan-out by org works.
    let organization_id: string | null = null;
    try {
      const { data: prof } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .maybeSingle();
      organization_id = prof?.organization_id ?? null;
    } catch {
      /* non-fatal */
    }

    let deviceId: string | null = null;
    let deviceName = navigator.userAgent.substring(0, 100);
    try {
      const id = await Device.getId();
      deviceId = id.identifier;
      const info = await Device.getInfo();
      deviceName = `${info.manufacturer ?? ""} ${info.model ?? info.platform} (${info.osVersion ?? ""})`.trim();
    } catch {
      /* fall back to UA */
    }

    const platform = Capacitor.getPlatform();
    await (supabase as any)
      .from("push_device_tokens")
      .upsert(
        {
          user_id: user.id,
          organization_id,
          token,
          platform,
          device_id: deviceId,
          device_name: deviceName,
          is_active: true,
          last_used_at: new Date().toISOString(),
        },
        { onConflict: "user_id,token" }
      );
  } catch (e) {
    console.warn("[native-boot] device token upsert failed", e);
  }
}

async function deactivateDeviceTokens() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    let deviceId: string | null = null;
    try {
      const id = await Device.getId();
      deviceId = id.identifier;
    } catch {
      /* ignore */
    }
    let q = (supabase as any)
      .from("push_device_tokens")
      .update({ is_active: false })
      .eq("user_id", user.id);
    if (deviceId) q = q.eq("device_id", deviceId);
    await q;
  } catch (e) {
    console.warn("[native-boot] deactivate device tokens failed", e);
  }
}

/** Surface an incoming push as a local notification when the app is foregrounded. */
async function handleForegroundPush(notification: {
  title?: string;
  body?: string;
  data?: Record<string, any>;
}) {
  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: Date.now() % 2147483647,
          title: notification.title || "HealthOS 24",
          body: notification.body || "",
          extra: notification.data ?? {},
          smallIcon: "ic_stat_icon",
          iconColor: "#0891b2",
        },
      ],
    });
  } catch (e) {
    console.warn("[native-boot] local notification failed", e);
  }
}

/** Route into the app when the user taps a push. */
function handlePushTap(data: Record<string, any> | undefined) {
  const route = data?.route || data?.url;
  if (typeof route !== "string" || !route.startsWith("/")) return;
  window.history.pushState({}, "", route);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

/**
 * Boot the native shell. Call exactly once from `main.tsx`.
 * No-op on web.
 */
export async function bootNative(): Promise<void> {
  if (booted) return;
  booted = true;

  // Always restore locale (web + native) so the document direction is correct
  // even before React mounts.
  const locale = await restoreLocale();
  applyLocaleToDocument(locale);

  if (!Capacitor.isNativePlatform()) return;

  // --- Status bar ---
  try {
    await StatusBar.setStyle({ style: Style.Light });
    if (Capacitor.getPlatform() === "android") {
      await StatusBar.setBackgroundColor({ color: "#0891b2" });
    }
  } catch {
    /* device may not support it */
  }

  // --- Splash: hide once first paint is done ---
  // Defer one tick so the React root has a chance to render its skeleton.
  requestAnimationFrame(() => {
    setTimeout(() => {
      SplashScreen.hide().catch(() => {});
    }, 200);
  });

  // --- App lifecycle: resume → flush offline outbox ---
  App.addListener("appStateChange", ({ isActive }) => {
    if (isActive) {
      document.body.classList.remove("app-paused");
      flushOutbox().catch(() => {});
    } else {
      document.body.classList.add("app-paused");
    }
  });

  // --- Network change: flush outbox when coming back online ---
  Network.addListener("networkStatusChange", (status) => {
    if (status.connected) {
      flushOutbox().catch(() => {});
    }
  });

  // --- Deep links: payment return, magic links, Nafath callbacks ---
  App.addListener("appUrlOpen", (event: URLOpenListenerEvent) => {
    const path = resolveDeepLink(event.url);
    if (!path) return;
    // Use history API so React Router picks it up without a full reload.
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  });

  // --- Android hardware back button ---
  App.addListener("backButton", ({ canGoBack }) => {
    if (canGoBack && window.history.length > 1) {
      window.history.back();
    } else {
      App.exitApp();
    }
  });

  // --- Push notifications ---
  PushNotifications.addListener("registration", (token) => {
    upsertDeviceToken(token.value);
  });
  PushNotifications.addListener("registrationError", (err) => {
    console.warn("[native-boot] push registration error", err);
  });
  // Foreground push → surface as a local notification banner
  PushNotifications.addListener("pushNotificationReceived", (notif) => {
    handleForegroundPush({
      title: notif.title,
      body: notif.body,
      data: notif.data as Record<string, any>,
    });
  });
  // Tap on push → deep-link into the app
  PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
    handlePushTap(action.notification.data as Record<string, any> | undefined);
  });
  // Tap on a locally-scheduled notification (foreground push) → also route
  LocalNotifications.addListener("localNotificationActionPerformed", (action) => {
    handlePushTap(action.notification.extra as Record<string, any> | undefined);
  });

  // Request local-notification permission too (Android 13+ / iOS).
  LocalNotifications.requestPermissions().catch(() => {});

  // Register push when session appears, deactivate tokens on sign-out.
  supabase.auth.onAuthStateChange((event, session) => {
    if (session && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION")) {
      registerPushAsync();
    } else if (event === "SIGNED_OUT") {
      deactivateDeviceTokens();
    }
  });
}
