import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type SuggestionType = "diagnosis" | "prescription" | "lab_order" | "soap_note";

interface AISuggestionCardProps {
  type: SuggestionType;
  content: string;
  confidence?: string;
  onAccept: () => void;
  onReject: () => void;
}

const typeStyles: Record<SuggestionType, { border: string; label: string }> = {
  diagnosis: { border: "border-l-blue-500", label: "Diagnosis" },
  prescription: { border: "border-l-green-500", label: "Prescription" },
  lab_order: { border: "border-l-orange-500", label: "Lab Order" },
  soap_note: { border: "border-l-purple-500", label: "SOAP Note" },
};

export function AISuggestionCard({ type, content, confidence, onAccept, onReject }: AISuggestionCardProps) {
  const [status, setStatus] = useState<"pending" | "accepted" | "rejected">("pending");
  const style = typeStyles[type];

  if (status === "rejected") return null;

  return (
    <Card className={cn("border-l-4", style.border, status === "accepted" && "opacity-60")}>
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            AI {style.label}
          </span>
          {confidence && (
            <span className="text-xs text-muted-foreground">{confidence}</span>
          )}
        </div>
        <p className="text-sm whitespace-pre-wrap">{content}</p>
        {status === "pending" && (
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7 gap-1"
              onClick={() => { setStatus("accepted"); onAccept(); }}
            >
              <Check className="h-3 w-3" /> Accept
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-7 gap-1"
              onClick={() => { setStatus("rejected"); onReject(); }}
            >
              <X className="h-3 w-3" /> Dismiss
            </Button>
          </div>
        )}
        {status === "accepted" && (
          <span className="text-xs text-green-600 font-medium">✓ Applied</span>
        )}
      </CardContent>
    </Card>
  );
}
