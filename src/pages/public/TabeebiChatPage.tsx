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

  const userInitials = userName
    ? userName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <DoctorAvatar state="thinking" size="lg" />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      {/* Premium gradient header */}
      <div
        className="flex-shrink-0 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="flex items-center justify-between px-3 py-2.5">
          {/* Left: branding */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <DoctorAvatar state="idle" size="xs" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-tight">Dr. Tabeebi</span>
              <span className="text-[10px] opacity-80 leading-tight">AI Medical Assistant</span>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1">
            {userName && (
              <div className="flex items-center gap-1.5 mr-1 bg-white/15 rounded-full px-2 py-1">
                <div className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center text-[9px] font-bold">
                  {userInitials}
                </div>
                <span className="text-[11px] font-medium truncate max-w-[80px] hidden sm:inline">
                  {userName.split(" ")[0]}
                </span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNewChat}
              className="h-8 w-8 p-0 text-primary-foreground hover:bg-white/15 rounded-full"
              title="New consultation"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <ChatHistoryDrawer
              onSelect={handleSelectHistory}
              onNewChat={handleNewChat}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="h-8 w-8 p-0 text-primary-foreground hover:bg-white/15 rounded-full"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
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
