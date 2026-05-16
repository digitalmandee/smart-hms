/**
 * Biometric login (Face ID / Touch ID / Fingerprint) for the native shell.
 *
 * Flow:
 *  1. After a successful password sign-in, call `enableBiometric(session)`.
 *     The refresh token is stored in Capacitor Preferences (Keychain on iOS,
 *     EncryptedSharedPreferences-style on Android).
 *  2. On the next launch, `signInWithBiometric()` shows the OS prompt; on
 *     success it restores the Supabase session from the stored refresh token.
 *
 * Web fallback: every function returns `unsupported` — UI hides the button.
 */
import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";
import {
  BiometricAuth,
  BiometryError,
  BiometryErrorType,
} from "@aparajita/capacitor-biometric-auth";
import { supabase } from "@/integrations/supabase/client";

const ENABLED_KEY = "healthos.biometric.enabled";
const REFRESH_KEY = "healthos.biometric.refresh_token";
const EMAIL_KEY = "healthos.biometric.email";

export type BiometricStatus =
  | "available"
  | "not-enrolled" // device has hardware but no fingerprint/face registered
  | "no-hardware"
  | "unsupported"; // web or unsupported platform

export async function getBiometricStatus(): Promise<BiometricStatus> {
  if (!Capacitor.isNativePlatform()) return "unsupported";
  try {
    const info = await BiometricAuth.checkBiometry();
    if (info.isAvailable) return "available";
    switch (info.reason) {
      case BiometryErrorType.biometryNotEnrolled:
        return "not-enrolled";
      case BiometryErrorType.biometryNotAvailable:
      case BiometryErrorType.noDeviceCredential:
        return "no-hardware";
      default:
        return "no-hardware";
    }
  } catch {
    return "unsupported";
  }
}

export async function isBiometricEnabled(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  const { value } = await Preferences.get({ key: ENABLED_KEY });
  return value === "1";
}

export async function getStoredEmail(): Promise<string | null> {
  if (!Capacitor.isNativePlatform()) return null;
  const { value } = await Preferences.get({ key: EMAIL_KEY });
  return value || null;
}

/**
 * Enable biometric login for the *current* session. Call right after a
 * successful password sign-in. Persists the refresh token + email so the
 * next launch can restore the session without typing a password.
 */
export async function enableBiometric(opts: {
  email: string;
  refreshToken: string;
}): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  // Verify identity before persisting credentials.
  await BiometricAuth.authenticate({
    reason: "Enable biometric sign-in",
    cancelTitle: "Cancel",
    allowDeviceCredential: true,
    iosFallbackTitle: "Use passcode",
    androidTitle: "Enable biometric sign-in",
    androidSubtitle: "Confirm your identity to protect your account",
    androidConfirmationRequired: false,
  });
  await Preferences.set({ key: REFRESH_KEY, value: opts.refreshToken });
  await Preferences.set({ key: EMAIL_KEY, value: opts.email });
  await Preferences.set({ key: ENABLED_KEY, value: "1" });
}

export async function disableBiometric(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  await Preferences.remove({ key: REFRESH_KEY });
  await Preferences.remove({ key: EMAIL_KEY });
  await Preferences.remove({ key: ENABLED_KEY });
}

/**
 * Prompt for biometric and restore the Supabase session.
 * Returns true on success, throws on user cancel / lockout.
 */
export async function signInWithBiometric(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  if (!(await isBiometricEnabled())) return false;

  try {
    await BiometricAuth.authenticate({
      reason: "Sign in to HealthOS 24",
      cancelTitle: "Cancel",
      allowDeviceCredential: true,
      iosFallbackTitle: "Use passcode",
      androidTitle: "Sign in",
      androidSubtitle: "Use biometric to continue",
      androidConfirmationRequired: false,
    });
  } catch (e) {
    if (e instanceof BiometryError) {
      // Wipe credentials on lockout so we don't repeatedly fail.
      if (e.code === BiometryErrorType.biometryLockout) {
        await disableBiometric();
      }
    }
    throw e;
  }

  const { value: refreshToken } = await Preferences.get({ key: REFRESH_KEY });
  if (!refreshToken) {
    await disableBiometric();
    throw new Error("Stored credentials missing — please sign in with password.");
  }

  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });
  if (error || !data.session) {
    await disableBiometric();
    throw error ?? new Error("Session expired — please sign in with password.");
  }

  // Rotate stored refresh token (Supabase issues a new one on every refresh).
  await Preferences.set({
    key: REFRESH_KEY,
    value: data.session.refresh_token,
  });
  return true;
}
