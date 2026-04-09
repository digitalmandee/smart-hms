import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { ShieldAlert } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface IdleTimeoutDialogProps {
  open: boolean;
  remainingSeconds: number;
  onStayLoggedIn: () => void;
  onLogout: () => void;
}

export function IdleTimeoutDialog({
  open,
  remainingSeconds,
  onStayLoggedIn,
  onLogout,
}: IdleTimeoutDialogProps) {
  const { t } = useTranslation();
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            {t("hipaa.session_timeout_title")}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>{t("hipaa.session_timeout_message")}</p>
            <p className="text-2xl font-mono font-bold text-center text-destructive">
              {timeDisplay}
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onLogout}>
            {t("hipaa.logout_now")}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onStayLoggedIn}>
            {t("hipaa.stay_logged_in")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
