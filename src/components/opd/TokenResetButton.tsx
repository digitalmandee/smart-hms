import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { RotateCcw, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface TokenResetButtonProps {
  departmentId?: string;
  className?: string;
}

export function TokenResetButton({ departmentId, className }: TokenResetButtonProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    if (!profile?.branch_id) return;
    
    setIsResetting(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      
      // Reset by updating all today's appointments token numbers to null for this department
      // This effectively resets the counter since generate_opd_token uses MAX(token_number)
      const query = supabase
        .from("appointments")
        .update({ token_number: null })
        .eq("branch_id", profile.branch_id)
        .eq("appointment_date", today)
        .in("status", ["scheduled", "checked_in"]);

      if (departmentId) {
        query.eq("opd_department_id", departmentId);
      }

      const { error } = await query;

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["opd-queue-counts"] });

      toast({
        title: "Token Counter Reset",
        description: "Token numbering has been reset. New tokens will start from 1.",
      });
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "Failed to reset token counter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Tokens
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset Token Counter?</AlertDialogTitle>
          <AlertDialogDescription>
            This will reset the token numbering for today. Existing tokens will be cleared.
            New patients will receive tokens starting from 1. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleReset} disabled={isResetting}>
            {isResetting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RotateCcw className="h-4 w-4 mr-2" />}
            Reset Tokens
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
