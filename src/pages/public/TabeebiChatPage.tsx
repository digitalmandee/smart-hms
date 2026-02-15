import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PatientAIChat } from "@/components/ai/PatientAIChat";
import { supabase } from "@/integrations/supabase/client";
import { DoctorAvatar } from "@/components/ai/DoctorAvatar";
import { ChatHistoryDrawer } from "@/components/ai/ChatHistoryDrawer";
import { ChatMessage } from "@/hooks/useAIChat";
import { LogOut, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TabeebiChatPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [chatKey, setChatKey] = useState(0);
  const [loadedConversation, setLoadedConversation] = useState<{ id: string; messages: ChatMessage[] } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/tabeebi", { replace: true });
        return;
      }
      setUserName(session.user.user_metadata?.full_name || session.user.email || "");
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/tabeebi", { replace: true });
  };

  const handleNewChat = () => {
    setLoadedConversation(null);
    setChatKey(prev => prev + 1);
  };

  const handleSelectHistory = (id: string, messages: ChatMessage[]) => {
    setLoadedConversation({ id, messages });
    setChatKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <DoctorAvatar state="thinking" size="lg" />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      {/* Minimal top bar */}
      <div className="flex items-center justify-end px-3 py-1.5 bg-background/50 border-b border-border/30">
        {userName && (
          <span className="text-xs text-muted-foreground mr-2 truncate max-w-[200px]">
            {userName}
          </span>
        )}
        <Button variant="ghost" size="sm" onClick={handleNewChat} className="h-7 px-2" title="New consultation">
          <Plus className="h-3.5 w-3.5" />
        </Button>
        <ChatHistoryDrawer
          onSelect={handleSelectHistory}
          onNewChat={handleNewChat}
        />
        <Button variant="ghost" size="sm" onClick={handleLogout} className="h-7 px-2">
          <LogOut className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Chat */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <PatientAIChat
          key={chatKey}
          mode="patient_intake"
          className="flex-1 rounded-none"
          compact={false}
          initialConversationId={loadedConversation?.id}
          initialMessages={loadedConversation?.messages}
        />
      </main>
    </div>
  );
}
