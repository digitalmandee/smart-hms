/**
 * Native shell route guard.
 *
 * Inside the Capacitor APK/IPA we never want users to see the full desktop
 * dashboard — they should always land in the role-aware `/mobile/*` shell
 * (or the patient `/portal/*` shell). This component:
 *
 *  1. Lets `/mobile/*`, `/portal/*`, `/auth/*`, `/kiosk/*`, `/display/*`,
 *     `/~oauth*` pass through untouched.
 *  2. On any other path, redirects native users to:
 *       - `/portal/dashboard` if the user is a patient (or has no staff roles)
 *       - `/mobile/dashboard` otherwise (MobileDashboard further splits by role)
 *  3. Is a no-op on web — desktop / browser users keep their full app.
 *
 * Place inside <BrowserRouter> at the top of the route tree.
 */
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { useAuth } from "@/contexts/AuthContext";

const PASSTHROUGH_PREFIXES = [
  "/mobile",
  "/portal",
  "/auth",
  "/kiosk",
  "/display",
  "/~oauth",
  "/lab-reports", // public lab report viewer (QR)
];

export function NativeRouteGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, roles, isLoading } = useAuth();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    if (isLoading) return;

    const path = location.pathname;

    // Allow public/auth/mobile/portal routes through.
    if (PASSTHROUGH_PREFIXES.some((p) => path === p || path.startsWith(p + "/"))) {
      return;
    }

    // Unauthenticated → mobile login
    if (!user) {
      navigate("/mobile/login", { replace: true });
      return;
    }

    // Patient (or role-less account) → portal shell
    const isPatient =
      roles.length === 0 ||
      (roles as string[]).includes("patient");

    navigate(isPatient ? "/portal/dashboard" : "/mobile/dashboard", { replace: true });
  }, [location.pathname, user, roles, isLoading, navigate]);

  return <>{children}</>;
}
