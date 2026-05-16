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
import { counts as outboxCounts } from "@/lib/offline-sync/outbox";
import { resolveDeepLink, navigateToDeepLink } from "@/lib/native/deep-links";
import { backButtonStack } from "@/hooks/useBackButton";

/**
 * Flush the outbox and, when there were pending items, surface a small
 * toast so users know their offline edits were just synced.
 */
async function flushOnResume(trigger: "resume" | "online") {
  try {
    const before = await outboxCounts().catch(() => null);
    const pending = before?.pending ?? 0;
    const result = await flushOutbox();
    if (pending > 0 && result?.processed) {
      const { toast } = await import("sonner");
      toast.success(
        trigger === "online"
          ? `Back online — synced ${result.processed} change${result.processed === 1 ? "" : "s"}`
          : `Synced ${result.processed} pending change${result.processed === 1 ? "" : "s"}`
      );
    }
  } catch (e) {
    console.warn("[native-boot] resume flush failed", e);
  }
}

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

// Deep-link URL → in-app route resolution lives in `./deep-links.ts`
// so that other modules (payment dialog, Nafath, etc.) can build matching
// return URLs via the same scheme.

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
  console.log("[native-boot] enter", { native: Capacitor.isNativePlatform(), platform: Capacitor.getPlatform() });
  if (booted) { console.log("[native-boot] already booted"); return; }
  booted = true;

  try {
    const locale = await restoreLocale();
    console.log("[native-boot] locale restored", locale);
    applyLocaleToDocument(locale);
  } catch (e) {
    console.error("[native-boot] locale step failed", e);
  }

  if (!Capacitor.isNativePlatform()) { console.log("[native-boot] web — exit"); return; }

  try {
    await StatusBar.setStyle({ style: Style.Light });
    if (Capacitor.getPlatform() === "android") {
      await StatusBar.setBackgroundColor({ color: "#0891b2" });
    }
    console.log("[native-boot] status bar set");
  } catch (e) { console.warn("[native-boot] status bar failed", e); }

  // Safety: always force-hide splash after 3s so a JS error can't leave
  // the user staring at a frozen splash that the OS may kill as ANR.
  setTimeout(() => { SplashScreen.hide().catch(() => {}); }, 3000);
  requestAnimationFrame(() => {
    setTimeout(() => { SplashScreen.hide().catch(() => {}); console.log("[native-boot] splash hidden"); }, 200);
  });

  try {
    App.addListener("appStateChange", ({ isActive }) => {
      console.log("[native-boot] appStateChange", isActive);
      if (isActive) { document.body.classList.remove("app-paused"); flushOnResume("resume"); }
      else { document.body.classList.add("app-paused"); }
    });

    Network.addListener("networkStatusChange", (status) => {
      console.log("[native-boot] network", status);
      if (status.connected) flushOnResume("online");
    });

    App.addListener("appUrlOpen", (event: URLOpenListenerEvent) => {
      console.log("[native-boot] appUrlOpen", event.url);
      const path = resolveDeepLink(event.url);
      if (!path) return;
      navigateToDeepLink(path);
    });

    let lastBackPressAt = 0;
    App.addListener("backButton", async ({ canGoBack }) => {
      for (let i = backButtonStack.length - 1; i >= 0; i--) {
        try { if (await backButtonStack[i]()) return; } catch { /* keep iterating */ }
      }
      if (canGoBack && window.history.length > 1) { window.history.back(); return; }
      const now = Date.now();
      if (now - lastBackPressAt < 2000) { App.exitApp(); return; }
      lastBackPressAt = now;
      try { import("sonner").then(({ toast }) => toast("Press back again to exit")); } catch { /* nf */ }
    });
    console.log("[native-boot] app listeners registered");
  } catch (e) { console.error("[native-boot] app listener registration failed", e); }

  try {
    PushNotifications.addListener("registration", (token) => {
      console.log("[native-boot] push registration token len", token.value?.length);
      upsertDeviceToken(token.value).catch((e) => console.warn("[native-boot] upsert failed", e));
    });
    PushNotifications.addListener("registrationError", (err) => {
      console.warn("[native-boot] push registration error", err);
    });
    PushNotifications.addListener("pushNotificationReceived", (notif) => {
      handleForegroundPush({ title: notif.title, body: notif.body, data: notif.data as Record<string, any> });
    });
    PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
      handlePushTap(action.notification.data as Record<string, any> | undefined);
    });
    LocalNotifications.addListener("localNotificationActionPerformed", (action) => {
      handlePushTap(action.notification.extra as Record<string, any> | undefined);
    });
    LocalNotifications.requestPermissions().catch((e) => console.warn("[native-boot] local notif perms", e));
    console.log("[native-boot] push listeners registered");
  } catch (e) { console.error("[native-boot] push listener registration failed", e); }

  try {
    supabase.auth.onAuthStateChange((event, session) => {
      console.log("[native-boot] authStateChange", event, !!session);
      if (session && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION")) {
        registerPushAsync().catch((e) => console.warn("[native-boot] registerPushAsync failed", e));
      } else if (event === "SIGNED_OUT") {
        deactivateDeviceTokens().catch((e) => console.warn("[native-boot] deactivateDeviceTokens failed", e));
      }
    });
  } catch (e) { console.error("[native-boot] auth subscription failed", e); }

  console.log("[native-boot] complete");
}
