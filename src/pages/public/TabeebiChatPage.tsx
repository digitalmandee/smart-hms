import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PatientAIChat } from "@/components/ai/PatientAIChat";
import { supabase } from "@/integrations/supabase/client";
import { DoctorAvatar } from "@/components/ai/DoctorAvatar";
import { ChatHistoryDrawer } from "@/components/ai/ChatHistoryDrawer";
import { ChatMessage } from "@/hooks/useAIChat";
import { useIsMobile } from "@/hooks/use-mobile";
import { LogOut, Plus, Globe, MessageSquare, Trash2, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const LANG_CYCLE: Array<"en" | "ar" | "ur"> = ["en", "ar", "ur"];
const LANG_LABELS: Record<string, string> = { en: "عربي", ar: "اردو", ur: "EN" };

interface ConversationSummary {
  id: string;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
  context_type: string;
}

export default function TabeebiChatPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [chatKey, setChatKey] = useState(0);
  const [language, setLanguage] = useState<"en" | "ar" | "ur">("en");
  const [loadedConversation, setLoadedConversation] = useState<{ id: string; messages: ChatMessage[] } | null>(null);

  // Desktop sidebar state
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [sidebarLoading, setSidebarLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/tabeebi", { replace: true });
        return;
      }
      setUserName(session.user.user_metadata?.full_name || session.user.email || "");
      setUserEmail(session.user.email || "");
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  // Load conversations for desktop sidebar
  useEffect(() => {
    if (isMobile || loading) return;
    loadConversations();
  }, [isMobile, loading]);

  const loadConversations = async () => {
    setSidebarLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSidebarLoading(false); return; }
    const { data } = await supabase
      .from("ai_conversations")
      .select("id, created_at, updated_at, messages, context_type")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(30);
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
    setSidebarLoading(false);
  };

  const handleDeleteConversation = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase.from("ai_conversations").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
    } else {
      setConversations(prev => prev.filter(c => c.id !== id));
      toast.success("Deleted");
    }
    setDeletingId(null);
  };

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

  const cycleLang = () => {
    const idx = LANG_CYCLE.indexOf(language);
    setLanguage(LANG_CYCLE[(idx + 1) % LANG_CYCLE.length]);
  };

  const getSnippet = (msgs: ChatMessage[]) => {
    const firstUser = msgs.find((m) => m.role === "user");
    if (firstUser) return firstUser.content.slice(0, 60) + (firstUser.content.length > 60 ? "…" : "");
    return "Consultation";
  };

  const userInitials = userName
    ? userName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <DoctorAvatar state="thinking" size="lg" />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] bg-background flex overflow-hidden">
      {/* ──── Desktop Sidebar ──── */}
      {!isMobile && (
        <aside className={cn(
          "flex-shrink-0 bg-card border-r border-border flex flex-col transition-all duration-300 overflow-hidden",
          sidebarCollapsed ? "w-[60px]" : "w-[280px]"
        )}>
          {/* Toggle button */}
          <div className={cn("flex items-center border-b border-border h-14", sidebarCollapsed ? "justify-center px-0" : "justify-between px-4")}>
            {!sidebarCollapsed && <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Consultations</p>}
            <button
              onClick={() => setSidebarCollapsed(p => !p)}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
            >
              {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
          </div>

          {/* Sidebar header */}
          <div className={cn("border-b border-border", sidebarCollapsed ? "p-2" : "p-4")}>
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                  {userInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{userName}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{userEmail}</p>
                </div>
              </div>
            )}
            {sidebarCollapsed ? (
              <button
                onClick={handleNewChat}
                className="h-9 w-9 mx-auto rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                title="New Consultation"
              >
                <Plus className="h-4 w-4" />
              </button>
            ) : (
              <Button
                onClick={handleNewChat}
                className="w-full gap-2 rounded-xl h-10"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                New Consultation
              </Button>
            )}
          </div>

          {/* Conversations list */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {!sidebarCollapsed && (
              <div className="px-4 pt-3 pb-2">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Recent</p>
              </div>
            )}
            <ScrollArea className={cn("flex-1", sidebarCollapsed ? "px-1" : "px-2")}>
              {sidebarLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : conversations.length === 0 ? (
                !sidebarCollapsed && <p className="text-xs text-muted-foreground text-center py-8">No past consultations</p>
              ) : (
                <div className="space-y-0.5 pb-2">
                  {conversations.map((c) => (
                    <div
                      key={c.id}
                      className={cn(
                        "group flex items-center gap-2 rounded-lg cursor-pointer transition-colors hover:bg-accent/10",
                        sidebarCollapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5",
                        loadedConversation?.id === c.id && "bg-primary/8 border border-primary/15"
                      )}
                      onClick={() => handleSelectHistory(c.id, c.messages)}
                      title={sidebarCollapsed ? getSnippet(c.messages) : undefined}
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      {!sidebarCollapsed && (
                        <>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] truncate">{getSnippet(c.messages)}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {format(new Date(c.updated_at), "MMM d · h:mm a")}
                            </p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteConversation(c.id); }}
                            disabled={deletingId === c.id}
                            className="shrink-0 h-7 w-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                          >
                            <Trash2 className={cn("h-3 w-3", deletingId === c.id && "animate-spin")} />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Sidebar footer */}
          <div className={cn("border-t border-border", sidebarCollapsed ? "p-2 space-y-2" : "p-3 space-y-1")}>
            {sidebarCollapsed ? (
              <>
                <button onClick={cycleLang} className="h-9 w-9 mx-auto rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent/50 transition-colors" title={`Language: ${LANG_LABELS[language]}`}>
                  <Globe className="h-4 w-4" />
                </button>
                <button onClick={handleLogout} className="h-9 w-9 mx-auto rounded-lg flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors" title="Sign out">
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={cycleLang}
                  className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent/10 transition-colors"
                >
                  <Globe className="h-4 w-4" />
                  <span>Language: {LANG_LABELS[language]}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </button>
              </>
            )}
          </div>
        </aside>
      )}

      {/* ──── Main Chat Area ──── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Clean header */}
        <header
          className="flex-shrink-0 bg-card border-b border-border shadow-sm"
          style={{ paddingTop: isMobile ? "env(safe-area-inset-top, 0px)" : undefined }}
        >
          <div className="flex items-center justify-between px-4 h-14">
            {/* Left: doctor branding */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <DoctorAvatar state="idle" size="xs" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-card" />
              </div>
              <div>
                <h1 className="text-sm font-semibold leading-tight">Dr. Tabeebi</h1>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  AI Medical Consultant
                </p>
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-1">
              {isMobile && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={cycleLang}
                    className="h-9 px-2.5 text-muted-foreground hover:text-foreground rounded-full"
                  >
                    <Globe className="h-4 w-4 mr-1" />
                    <span className="text-xs">{LANG_LABELS[language]}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNewChat}
                    className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground rounded-full"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <ChatHistoryDrawer
                    onSelect={handleSelectHistory}
                    onNewChat={handleNewChat}
                  />
                </>
              )}

              {/* Profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-9 w-9 rounded-full bg-primary/10 hover:bg-primary/15 flex items-center justify-center text-xs font-semibold text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    {userInitials}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 z-[100]">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">{userName}</p>
                      {userEmail && (
                        <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Chat area — constrained on desktop */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className={cn(
            "flex-1 flex flex-col overflow-hidden",
            !isMobile && "max-w-[760px] w-full mx-auto"
          )}>
            <PatientAIChat
              key={chatKey}
              mode="patient_intake"
              className="flex-1 rounded-none"
              compact={false}
              language={language}
              onLanguageChange={setLanguage}
              initialConversationId={loadedConversation?.id}
              initialMessages={loadedConversation?.messages}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
