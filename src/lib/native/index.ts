/**
 * Native (Capacitor) feature wrappers with graceful web fallbacks.
 * Safe to import from any component — when running in browser, web APIs
 * (navigator.geolocation, file input, window.open, WebAuthn) are used instead.
 */
import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Browser } from "@capacitor/browser";
import { Device } from "@capacitor/device";
import { Network } from "@capacitor/network";

export const isNative = () => Capacitor.isNativePlatform();
export const nativePlatform = () => Capacitor.getPlatform(); // 'ios' | 'android' | 'web'

// ---------- Geolocation ----------
export async function getCurrentPosition(): Promise<{ lat: number; lng: number; accuracy: number } | null> {
  try {
    if (isNative()) {
      const p = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
      return { lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy };
    }
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      return await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }),
          () => resolve(null),
          { enableHighAccuracy: true, timeout: 10000 }
        );
      });
    }
    return null;
  } catch (e) {
    console.warn("[native] geolocation failed", e);
    return null;
  }
}

// ---------- Camera / Photo ----------
export async function capturePhoto(): Promise<string | null> {
  try {
    if (isNative()) {
      const photo = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
      });
      return photo.dataUrl ?? null;
    }
    return await new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      (input as any).capture = "environment";
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) return resolve(null);
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      };
      input.click();
    });
  } catch (e) {
    console.warn("[native] camera failed", e);
    return null;
  }
}

// ---------- In-app browser (payments, OAuth) ----------
export async function openExternal(url: string) {
  if (isNative()) {
    await Browser.open({ url, presentationStyle: "popover" });
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

// ---------- Device info ----------
export async function getDeviceInfo() {
  try {
    if (isNative()) {
      const info = await Device.getInfo();
      const id = await Device.getId();
      return {
        platform: info.platform,
        model: info.model,
        osVersion: info.osVersion,
        manufacturer: info.manufacturer,
        deviceId: id.identifier,
      };
    }
    return {
      platform: "web",
      model: navigator.userAgent.substring(0, 80),
      osVersion: "",
      manufacturer: "",
      deviceId: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    };
  } catch (e) {
    console.warn("[native] device info failed", e);
    return null;
  }
}

// ---------- Network status ----------
export async function getNetworkStatus() {
  try {
    if (isNative()) return await Network.getStatus();
    return {
      connected: typeof navigator !== "undefined" ? navigator.onLine : true,
      connectionType: "unknown" as const,
    };
  } catch {
    return { connected: true, connectionType: "unknown" as const };
  }
}

// ---------- Biometric (WebAuthn fallback) ----------
export async function isBiometricAvailable(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  // @ts-ignore
  if (window.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable) {
    try {
      // @ts-ignore
      return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  }
  return false;
}
