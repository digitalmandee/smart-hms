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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateBedIssue } from "@/hooks/useBedProfile";

interface LogBedIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bedId: string;
  bedNumber: string;
}

const ISSUE_TYPES = [
  { value: "maintenance", label: "Maintenance Required" },
  { value: "damage", label: "Damage / Repair" },
  { value: "equipment", label: "Equipment Issue" },
  { value: "cleaning", label: "Deep Cleaning Required" },
  { value: "housekeeping", label: "Housekeeping Issue" },
  { value: "other", label: "Other" },
];

const SEVERITY_LEVELS = [
  { value: "low", label: "Low - Minor issue, not urgent" },
  { value: "medium", label: "Medium - Should be addressed soon" },
  { value: "high", label: "High - Urgent attention needed" },
  { value: "critical", label: "Critical - Bed unusable" },
];

export function LogBedIssueDialog({ 
  open, 
  onOpenChange, 
  bedId, 
  bedNumber 
}: LogBedIssueDialogProps) {
  const [issueType, setIssueType] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [description, setDescription] = useState("");

  const { mutate: createIssue, isPending } = useCreateBedIssue();

  const handleSubmit = () => {
    if (!issueType || !description) return;

    createIssue(
      {
        bedId,
        issueType,
        description,
        severity,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setIssueType("");
          setSeverity("medium");
          setDescription("");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Issue for Bed {bedNumber}</DialogTitle>
          <DialogDescription>
            Report a maintenance issue or problem with this bed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="issue-type">Issue Type</Label>
            <Select value={issueType} onValueChange={setIssueType}>
              <SelectTrigger>
                <SelectValue placeholder="Select issue type" />
              </SelectTrigger>
              <SelectContent>
                {ISSUE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">Severity</Label>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEVERITY_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isPending || !issueType || !description}
          >
            {isPending ? "Logging..." : "Log Issue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
