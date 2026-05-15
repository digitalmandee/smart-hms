import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { OutboxItem } from "@/lib/offline-sync/types";
import { offlineDB } from "@/lib/offline-sync/db";
import { useToast } from "@/hooks/use-toast";

interface Props {
  item: OutboxItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConflictDetailDialog({ item, open, onOpenChange }: Props) {
  const { toast } = useToast();

  const keepServer = async () => {
    await offlineDB.outbox.delete(item.client_uuid);
    toast({ title: "Server record kept", description: "Local change discarded." });
    onOpenChange(false);
  };

  const applyLocal = async () => {
    await offlineDB.outbox.update(item.client_uuid, {
      status: "pending",
      operation: "update",
      retries: 0,
      next_attempt_at: Date.now(),
      last_error: undefined,
    });
    toast({ title: "Local change re-queued", description: "Will overwrite the server record on next sync." });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Resolve conflict</DialogTitle>
          <DialogDescription>
            {item.entity_type} · queued {new Date(item.client_created_at).toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Local payload</div>
          <ScrollArea className="h-64 rounded border bg-muted/30 p-3">
            <pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify(item.payload, null, 2)}</pre>
          </ScrollArea>
          {item.last_error && (
            <div className="text-xs text-rose-600">Server message: {item.last_error}</div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={keepServer}>Keep server</Button>
          <Button onClick={applyLocal}>Apply local</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
