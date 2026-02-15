import { useEffect, useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, MessageSquare, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "@/hooks/useAIChat";
import { format } from "date-fns";
import { toast } from "sonner";

interface ConversationSummary {
  id: string;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
  context_type: string;
}

interface ChatHistoryDrawerProps {
  onSelect: (id: string, messages: ChatMessage[]) => void;
  onNewChat?: () => void;
}

export function ChatHistoryDrawer({ onSelect, onNewChat }: ChatHistoryDrawerProps) {
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      supabase
        .from("ai_conversations")
        .select("id, created_at, updated_at, messages, context_type")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(20)
        .then(({ data }) => {
        if (data) {
          setConversations(
            data
              .filter((c) => {
                const msgs = c.messages as unknown as ChatMessage[] | null;
                return msgs && Array.isArray(msgs) && msgs.length > 0;
              })
              .map((c) => ({
                ...c,
                messages: c.messages as unknown as ChatMessage[],
              }))
          );
        }
        setLoading(false);
      });
    })();
  }, [open]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
    const { error } = await supabase
      .from("ai_conversations")
      .delete()
      .eq("id", id);
    
    if (error) {
      toast.error("Failed to delete conversation");
    } else {
      setConversations(prev => prev.filter(c => c.id !== id));
      toast.success("Conversation deleted");
    }
    setDeletingId(null);
  };

  const getSnippet = (msgs: ChatMessage[]) => {
    const firstUser = msgs.find((m) => m.role === "user");
    if (firstUser) return firstUser.content.slice(0, 80) + (firstUser.content.length > 80 ? "..." : "");
    return "Consultation";
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground rounded-full">
          <Clock className="h-3.5 w-3.5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[70dvh]">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-sm">Past Consultations</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-2">
          <button
            className="w-full flex items-center gap-2 rounded-xl border border-dashed border-primary/40 p-3 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
            onClick={() => {
              onNewChat?.();
              setOpen(false);
            }}
          >
            <Plus className="h-4 w-4" />
            New Consultation
          </button>
        </div>
        <ScrollArea className="px-4 pb-4 flex-1">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-6">Loading...</p>
          ) : conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No past consultations</p>
          ) : (
            <div className="space-y-2">
              {conversations.map((c) => (
                <div
                  key={c.id}
                  className="w-full text-left rounded-xl border border-border/40 p-3 hover:bg-accent/50 transition-colors flex items-start gap-2"
                >
                  <button
                    className="flex-1 text-left min-w-0"
                    onClick={() => {
                      onSelect(c.id, c.messages);
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-start gap-2.5">
                      <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{getSnippet(c.messages)}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {format(new Date(c.updated_at), "MMM d, yyyy · h:mm a")}
                          {" · "}
                          {c.messages.length} messages
                        </p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, c.id)}
                    disabled={deletingId === c.id}
                    className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Delete conversation"
                  >
                    <Trash2 className={cn("h-3.5 w-3.5", deletingId === c.id && "animate-spin")} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
