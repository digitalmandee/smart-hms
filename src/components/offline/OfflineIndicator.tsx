import { Link } from "react-router-dom";
import { Cloud, CloudOff, Loader2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

function timeAgo(ts: number | null, t: (k: string) => string): string {
  if (!ts) return t("offlineSync.neverSynced") || "never";
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.round(s / 60)}m`;
  return `${Math.round(s / 3600)}h`;
}

export function OfflineIndicator({ className }: { className?: string }) {
  const { online, pending, failed, conflicts, lastSyncedAt } = useOfflineSync();
  const { t } = useTranslation();

  const hasIssues = failed > 0 || conflicts > 0;
  const hasPending = pending > 0;

  let label: string;
  let Icon = Cloud;
  let tone = "bg-emerald-500/10 text-emerald-700 border-emerald-500/30";

  if (!online) {
    Icon = CloudOff;
    tone = "bg-amber-500/10 text-amber-700 border-amber-500/30";
    label = `${t("offlineSync.offline") || "Offline"} · ${pending} ${t("offlineSync.queued") || "queued"}`;
  } else if (hasIssues) {
    Icon = AlertTriangle;
    tone = "bg-rose-500/10 text-rose-700 border-rose-500/30";
    label = `${conflicts} ${t("offlineSync.conflicts") || "conflicts"}, ${failed} ${t("offlineSync.failed") || "failed"}`;
  } else if (hasPending) {
    Icon = Loader2;
    tone = "bg-sky-500/10 text-sky-700 border-sky-500/30";
    label = `${t("offlineSync.syncing") || "Syncing"} · ${pending} ${t("offlineSync.pending") || "pending"}`;
  } else {
    label = `${t("offlineSync.synced") || "Synced"} · ${timeAgo(lastSyncedAt, t)}`;
  }

  return (
    <Link to="/app/sync" aria-label="Sync status">
      <Badge variant="outline" className={cn("gap-1.5 cursor-pointer hover:opacity-90 transition", tone, className)}>
        <Icon className={cn("h-3.5 w-3.5", hasPending && online && !hasIssues && "animate-spin")} />
        <span className="text-xs font-medium">{label}</span>
      </Badge>
    </Link>
  );
}
