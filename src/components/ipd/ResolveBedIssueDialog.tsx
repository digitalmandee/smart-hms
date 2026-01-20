import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useResolveBedIssue } from "@/hooks/useBedProfile";

interface ResolveBedIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issueId: string;
  bedId: string;
}

export function ResolveBedIssueDialog({ 
  open, 
  onOpenChange, 
  issueId,
  bedId
}: ResolveBedIssueDialogProps) {
  const [resolutionNotes, setResolutionNotes] = useState("");

  const { mutate: resolveIssue, isPending } = useResolveBedIssue();

  const handleSubmit = () => {
    resolveIssue(
      {
        issueId,
        bedId,
        resolutionNotes: resolutionNotes || undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setResolutionNotes("");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resolve Issue</DialogTitle>
          <DialogDescription>
            Mark this issue as resolved and add any resolution notes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resolution-notes">Resolution Notes (Optional)</Label>
            <Textarea
              id="resolution-notes"
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Describe how the issue was resolved..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Resolving..." : "Mark as Resolved"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
