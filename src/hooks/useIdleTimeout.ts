import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { CLINICAL_ROLES, NURSING_ROLES, PHARMACY_ROLES } from "@/constants/roles";
import type { AppRole } from "@/constants/roles";

const CLINICAL_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const ADMIN_TIMEOUT_MS = 30 * 60 * 1000;    // 30 minutes
const CLINICAL_WARNING_MS = 12 * 60 * 1000;  // 12 minutes
const ADMIN_WARNING_MS = 25 * 60 * 1000;     // 25 minutes

const CLINICAL_ROLE_SET: AppRole[] = [
  ...CLINICAL_ROLES,
  ...NURSING_ROLES,
  ...PHARMACY_ROLES,
  "lab_technician",
  "radiologist",
  "radiology_technician",
];

function isClinicalUser(roles: AppRole[]): boolean {
  return roles.some((r) => CLINICAL_ROLE_SET.includes(r));
}

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "click",
] as const;

export function useIdleTimeout() {
  const { user, roles, signOut } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const lastActivityRef = useRef(Date.now());
  const warningTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isClinical = isClinicalUser(roles);
  const timeoutMs = isClinical ? CLINICAL_TIMEOUT_MS : ADMIN_TIMEOUT_MS;
  const warningMs = isClinical ? CLINICAL_WARNING_MS : ADMIN_WARNING_MS;

  const clearTimers = useCallback(() => {
    if (warningTimerRef.current) clearInterval(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    warningTimerRef.current = null;
    logoutTimerRef.current = null;
  }, []);

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (showWarning) {
      setShowWarning(false);
      clearTimers();
    }
  }, [showWarning, clearTimers]);

  const handleStayLoggedIn = useCallback(() => {
    resetActivity();
  }, [resetActivity]);

  const handleLogout = useCallback(async () => {
    clearTimers();
    setShowWarning(false);
    await signOut();
  }, [signOut, clearTimers]);

  useEffect(() => {
    if (!user) return;

    const onActivity = () => {
      lastActivityRef.current = Date.now();
      // Don't reset warning if it's already showing — user must click "Stay Logged In"
    };

    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, onActivity, { passive: true }));

    const checkInterval = setInterval(() => {
      const idle = Date.now() - lastActivityRef.current;

      if (idle >= timeoutMs) {
        // Auto logout
        handleLogout();
        return;
      }

      if (idle >= warningMs && !showWarning) {
        setShowWarning(true);
        const remaining = Math.ceil((timeoutMs - idle) / 1000);
        setRemainingSeconds(remaining);

        // Countdown timer
        warningTimerRef.current = setInterval(() => {
          const currentIdle = Date.now() - lastActivityRef.current;
          const secs = Math.max(0, Math.ceil((timeoutMs - currentIdle) / 1000));
          setRemainingSeconds(secs);
          if (secs <= 0) {
            handleLogout();
          }
        }, 1000);
      }
    }, 10_000); // Check every 10 seconds

    return () => {
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, onActivity));
      clearInterval(checkInterval);
      clearTimers();
    };
  }, [user, timeoutMs, warningMs, showWarning, handleLogout, clearTimers]);

  return {
    showWarning,
    remainingSeconds,
    handleStayLoggedIn,
    handleLogout,
    isClinical,
  };
}
