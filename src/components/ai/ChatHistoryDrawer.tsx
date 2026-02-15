import { useEffect, useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "@/hooks/useAIChat";
import { format } from "date-fns";

interface ConversationSummary {
  id: string;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
  context_type: string;
}

interface ChatHistoryDrawerProps {
  onSelect: (id: string, messages: ChatMessage[]) => void;
}

export function ChatHistoryDrawer({ onSelect }: ChatHistoryDrawerProps) {
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(false);

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

  const getSnippet = (msgs: ChatMessage[]) => {
    const firstUser = msgs.find((m) => m.role === "user");
    if (firstUser) return firstUser.content.slice(0, 80) + (firstUser.content.length > 80 ? "..." : "");
    return "Consultation";
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2">
          <Clock className="h-3.5 w-3.5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[70dvh]">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-sm">Past Consultations</DrawerTitle>
        </DrawerHeader>
        <ScrollArea className="px-4 pb-4 flex-1">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-6">Loading...</p>
          ) : conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No past consultations</p>
          ) : (
            <div className="space-y-2">
              {conversations.map((c) => (
                <button
                  key={c.id}
                  className="w-full text-left rounded-xl border border-border/40 p-3 hover:bg-accent/50 transition-colors"
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
              ))}
            </div>
          )}
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
