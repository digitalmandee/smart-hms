import Dexie, { Table } from "dexie";
import type { OutboxItem } from "./types";

class OfflineSyncDB extends Dexie {
  outbox!: Table<OutboxItem, string>;

  constructor() {
    super("healthos_offline_sync");
    this.version(1).stores({
      // client_uuid is the primary key; secondary indexes for the engine to query
      outbox: "client_uuid, status, user_id, entity_type, next_attempt_at",
    });
  }
}

export const offlineDB = new OfflineSyncDB();

const DEVICE_ID_KEY = "healthos_device_id";

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}
