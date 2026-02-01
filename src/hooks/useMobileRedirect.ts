import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Capacitor } from "@capacitor/core";

const MOBILE_PREFERENCE_KEY = "healthos_prefer_mobile";

export function useMobileRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Don't redirect if already on mobile routes
    if (location.pathname.startsWith("/mobile")) {
      setChecked(true);
      return;
    }

    // Don't redirect on auth pages, public pages, or super-admin
    if (
      location.pathname.startsWith("/auth") ||
      location.pathname.startsWith("/super-admin") ||
      location.pathname.startsWith("/display") ||
      location.pathname.startsWith("/kiosk") ||
      location.pathname.startsWith("/lab-reports") ||
      location.pathname === "/" ||
      location.pathname === "/presentation" ||
      location.pathname === "/pricing-proposal"
    ) {
      setChecked(true);
      return;
    }

    // Check if user has explicitly chosen desktop view
    const preference = localStorage.getItem(MOBILE_PREFERENCE_KEY);
    if (preference === "desktop") {
      setChecked(true);
      return;
    }

    // Check if on native platform (Capacitor)
    const isNative = Capacitor.isNativePlatform();

    // Check screen width for mobile web
    const isMobileScreen = window.innerWidth < 768;

    // Redirect to mobile if native or mobile screen
    if (isNative || isMobileScreen) {
      // Map desktop routes to mobile equivalents
      const mobileRoute = mapToMobileRoute(location.pathname);
      navigate(mobileRoute, { replace: true });
    }

    setChecked(true);
  }, [location.pathname, navigate]);

  return { checked };
}

function mapToMobileRoute(desktopPath: string): string {
  // Map common desktop routes to mobile equivalents
  if (desktopPath.startsWith("/app/dashboard") || desktopPath === "/app") {
    return "/mobile/dashboard";
  }
  if (desktopPath.startsWith("/app/appointments")) {
    return "/mobile/appointments";
  }
  if (desktopPath.startsWith("/app/opd")) {
    return "/mobile/dashboard";
  }
  if (desktopPath.startsWith("/app/pharmacy")) {
    return "/mobile/pharmacy";
  }
  if (desktopPath.startsWith("/app/lab")) {
    return "/mobile/lab";
  }
  // Default to mobile dashboard
  return "/mobile/dashboard";
}

export function usePreferDesktop() {
  const setPreference = (preferDesktop: boolean) => {
    if (preferDesktop) {
      localStorage.setItem(MOBILE_PREFERENCE_KEY, "desktop");
    } else {
      localStorage.removeItem(MOBILE_PREFERENCE_KEY);
    }
  };

  const getPreference = () => {
    return localStorage.getItem(MOBILE_PREFERENCE_KEY) === "desktop";
  };

  return { setPreference, getPreference };
}

// Check if should show mobile (for components that need to know)
export function useIsMobileView() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isNative = Capacitor.isNativePlatform();
      const isMobileScreen = window.innerWidth < 768;
      setIsMobile(isNative || isMobileScreen);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}
