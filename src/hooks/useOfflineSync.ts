import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { offlineDB } from "@/lib/offline-sync/db";
import { counts } from "@/lib/offline-sync/outbox";
import { forceSync, getLastSyncedAt, subscribe } from "@/lib/offline-sync/sync-engine";

export interface OfflineSyncState {
  online: boolean;
  pending: number;
  failed: number;
  conflicts: number;
  applied: number;
  lastSyncedAt: number | null;
  forceSync: typeof forceSync;
}

export function useOfflineSync(): OfflineSyncState {
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(getLastSyncedAt());

  // Live query against IndexedDB
  const stats = useLiveQuery(() => counts(), [], {
    pending: 0,
    failed: 0,
    conflicts: 0,
    applied: 0,
  });

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    const unsub = subscribe(() => setLastSyncedAt(getLastSyncedAt()));
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      unsub();
    };
  }, []);

  return {
    online,
    pending: stats.pending,
    failed: stats.failed,
    conflicts: stats.conflicts,
    applied: stats.applied,
    lastSyncedAt,
    forceSync,
  };
}

/** Hook into all outbox rows for the dashboard. */
export function useOutboxItems() {
  return useLiveQuery(
    () => offlineDB.outbox.orderBy("client_created_at").reverse().limit(500).toArray(),
    [],
    [],
  );
}
