import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PatientAIChat } from "./PatientAIChat";
import { Bot } from "lucide-react";

interface PatientIntakeButtonProps {
  patientContext?: Record<string, unknown>;
  onConversationCreated?: (id: string) => void;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function PatientIntakeButton({
  patientContext,
  onConversationCreated,
  variant = "outline",
  size = "sm",
}: PatientIntakeButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className="gap-1.5">
          <Bot className="h-4 w-4" />
          AI Pre-Visit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI Patient Intake
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-6">
          <PatientAIChat
            patientContext={patientContext}
            onConversationCreated={onConversationCreated}
            compact
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
