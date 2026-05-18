import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { WifiOff } from "lucide-react";
import { toast } from "sonner";
import { useOnlineStatus } from "@/lib/native/network";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Sticky offline banner + transition toasts. Mount once near the top of
 * your layout. Hidden on auth/login routes so the splash/login flows
 * stay clean.
 */
export function OfflineBanner() {
  const online = useOnlineStatus();
  const location = useLocation();
  const { t } = useTranslation();
  const prevOnline = useRef<boolean>(online);
  const firedInitial = useRef<boolean>(false);

  useEffect(() => {
    // Skip first render — only toast on actual transitions.
    if (!firedInitial.current) {
      firedInitial.current = true;
      prevOnline.current = online;
      return;
    }
    if (prevOnline.current === online) return;
    prevOnline.current = online;

    if (online) {
      toast.success(t("mobile.online.toastTitle" as any), {
        description: t("mobile.online.toastBody" as any),
        duration: 3000,
      });
    } else {
      toast.error(t("mobile.offline.toastTitle" as any), {
        description: t("mobile.offline.toastBody" as any),
        duration: 4000,
      });
    }
  }, [online, t]);

  const isAuthRoute =
    location.pathname.startsWith("/auth") ||
    location.pathname.startsWith("/mobile/login");

  if (online || isAuthRoute) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed left-0 right-0 z-[60] flex items-center justify-center gap-2",
        "bg-destructive text-destructive-foreground text-xs font-medium",
        "px-4 py-2 shadow-md",
        "top-[env(safe-area-inset-top,0px)]",
        "animate-in slide-in-from-top duration-200"
      )}
    >
      <WifiOff className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{t("mobile.offline.banner" as any)}</span>
    </div>
  );
}
