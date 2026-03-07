import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, AlertTriangle, Lightbulb, RotateCcw, Pencil, Hash } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import {
  ParsedDenialReason,
  parseDenialReasonsFromResponse,
  getCategoryColor,
  getCategoryLabel,
} from "@/lib/nphiesDenialCodes";

interface DenialManagementPanelProps {
  nphiesResponse: any;
  denialReasons: ParsedDenialReason[] | null;
  resubmissionCount: number;
  claimId: string;
  currentIcdCodes: string[];
  currentNotes: string;
  onEditAndResubmit: (updates: {
    icd_codes?: string[];
    notes?: string;
  }) => void;
  isResubmitting: boolean;
}

export function DenialManagementPanel({
  nphiesResponse,
  denialReasons,
  resubmissionCount,
  claimId,
  currentIcdCodes,
  currentNotes,
  onEditAndResubmit,
  isResubmitting,
}: DenialManagementPanelProps) {
  const { t, language } = useTranslation();
  const lang = (language || 'en') as 'en' | 'ar' | 'ur';
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editIcdCodes, setEditIcdCodes] = useState<string>(currentIcdCodes?.join(", ") || "");
  const [editNotes, setEditNotes] = useState(currentNotes || "");

  // Use stored denial_reasons if available, otherwise parse from response
  const reasons: ParsedDenialReason[] = denialReasons && denialReasons.length > 0
    ? denialReasons
    : parseDenialReasonsFromResponse(nphiesResponse, lang);

  if (reasons.length === 0 && !nphiesResponse) return null;

  const errors = reasons.filter(r => r.severity === 'error');
  const warnings = reasons.filter(r => r.severity === 'warning');

  const handleSubmitEdits = () => {
    const icdArray = editIcdCodes
      .split(",")
      .map(c => c.trim())
      .filter(Boolean);
    onEditAndResubmit({
      icd_codes: icdArray.length > 0 ? icdArray : undefined,
      notes: editNotes || undefined,
    });
    setIsEditDialogOpen(false);
  };

  return (
    <Card className="border-l-4 border-l-destructive">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            {t("nphies.denialManagement" as any, "Denial Management")}
          </CardTitle>
          <div className="flex items-center gap-2">
            {resubmissionCount > 0 && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Hash className="h-3 w-3" />
                {t("nphies.resubmissionCount" as any, "Resubmissions")}: {resubmissionCount}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Error reasons */}
        {errors.length > 0 && (
          <div className="space-y-3">
            {errors.map((reason, idx) => (
              <Alert key={`err-${idx}`} variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="flex items-center gap-2 flex-wrap">
                  <span>{reason.display}</span>
                  <Badge variant="outline" className={`text-xs ${getCategoryColor(reason.category)}`}>
                    {getCategoryLabel(reason.category, lang)}
                  </Badge>
                  {reason.raw_code && reason.raw_code !== reason.code && (
                    <span className="text-xs font-mono text-muted-foreground">({reason.raw_code})</span>
                  )}
                </AlertTitle>
                <AlertDescription className="mt-2">
                  <div className="flex items-start gap-2 bg-background/50 p-2 rounded text-sm">
                    <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <span>{reason.suggested_action}</span>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Warning reasons */}
        {warnings.length > 0 && (
          <div className="space-y-3">
            {warnings.map((reason, idx) => (
              <Alert key={`warn-${idx}`}>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertTitle className="flex items-center gap-2 flex-wrap">
                  <span>{reason.display}</span>
                  <Badge variant="outline" className={`text-xs ${getCategoryColor(reason.category)}`}>
                    {getCategoryLabel(reason.category, lang)}
                  </Badge>
                </AlertTitle>
                <AlertDescription className="mt-2">
                  <div className="flex items-start gap-2 bg-muted p-2 rounded text-sm">
                    <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <span>{reason.suggested_action}</span>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {reasons.length === 0 && nphiesResponse && (
          <p className="text-sm text-muted-foreground">
            {t("nphies.noStructuredDenialInfo" as any, "No structured denial information available. Check raw NPHIES response.")}
          </p>
        )}

        <Separator />

        {/* Edit & Resubmit */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsEditDialogOpen(true)}
            disabled={isResubmitting}
            className="border-destructive text-destructive hover:bg-destructive/10"
          >
            <Pencil className="h-4 w-4 mr-2" />
            {t("nphies.editAndResubmit" as any, "Edit & Resubmit")}
          </Button>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t("nphies.editBeforeResubmit" as any, "Edit Claim Before Resubmission")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t("nphies.icdCodes" as any, "ICD-10 Diagnosis Codes")}</Label>
                <Input
                  value={editIcdCodes}
                  onChange={(e) => setEditIcdCodes(e.target.value)}
                  placeholder="A01.0, J18.9, E11.9"
                />
                <p className="text-xs text-muted-foreground">
                  {t("nphies.icdCodesHelp" as any, "Comma-separated ICD-10 codes")}
                </p>
              </div>
              <div className="space-y-2">
                <Label>{t("common.notes")}</Label>
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder={t("nphies.resubmissionNotesPlaceholder" as any, "Add notes about corrections made...")}
                  rows={3}
                />
              </div>

              {/* Show corrections suggested */}
              {errors.length > 0 && (
                <div className="bg-muted p-3 rounded-lg space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    {t("nphies.suggestedCorrections" as any, "Suggested Corrections")}
                  </Label>
                  {errors.map((r, i) => (
                    <p key={i} className="text-xs flex items-start gap-1">
                      <Lightbulb className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
                      {r.suggested_action}
                    </p>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  {t("common.cancel")}
                </Button>
                <Button
                  onClick={handleSubmitEdits}
                  disabled={isResubmitting}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {t("nphies.resubmitToNphies" as any, "Resubmit to NPHIES")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
