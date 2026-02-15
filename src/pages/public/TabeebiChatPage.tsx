import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PatientAIChat } from "@/components/ai/PatientAIChat";
import { supabase } from "@/integrations/supabase/client";
import { DoctorAvatar } from "@/components/ai/DoctorAvatar";
import { Stethoscope, Sparkles, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TabeebiChatPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

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

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <DoctorAvatar state="thinking" size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b bg-background/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Stethoscope className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <span className="font-bold text-sm text-foreground">Tabeebi</span>
            <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">
              <Sparkles className="h-3 w-3 inline text-primary" /> AI Doctor
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {userName && (
            <span className="text-xs text-muted-foreground hidden sm:block">
              {userName}
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={handleLogout} className="h-8 px-2">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Chat */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <PatientAIChat
          mode="patient_intake"
          className="flex-1 border-0 rounded-none h-auto"
          compact={false}
        />
      </main>
    </div>
  );
}
