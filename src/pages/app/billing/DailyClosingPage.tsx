import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useDailyClosingSummary, useDailyClosing, useCreateDailyClosing } from "@/hooks/useDailyClosing";
import { useBranchSessions, useOpenSessionsCount, CashDenominations } from "@/hooks/useBillingSessions";
import { useBranchExpenses } from "@/hooks/useExpenses";
import { DailyClosingSummaryCard } from "@/components/billing/DailyClosingSummary";
import { CashDenominationInput } from "@/components/billing/CashDenominationInput";
import { SessionStatusBadge } from "@/components/billing/SessionStatusBadge";
import { ExpenseEntryCard } from "@/components/billing/ExpenseEntryCard";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import {
  Calendar,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Save,
  Send,
  Receipt,
} from "lucide-react";

type Step = 'sessions' | 'expenses' | 'reconciliation' | 'summary';

export default function DailyClosingPage() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];
  
  const [currentStep, setCurrentStep] = useState<Step>('sessions');
  const [cashDenominations, setCashDenominations] = useState<CashDenominations>({});
  const [actualCash, setActualCash] = useState(0);
  const [notes, setNotes] = useState("");

  const { data: summary, isLoading: summaryLoading } = useDailyClosingSummary(today);
  const { data: sessions, isLoading: sessionsLoading } = useBranchSessions(undefined, today);
  const { data: existingClosing } = useDailyClosing(today);
  const { data: openCount } = useOpenSessionsCount();
  const { data: expenses } = useBranchExpenses(undefined, today);
  const createClosingMutation = useCreateDailyClosing();

  const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;

  const hasOpenSessions = (openCount || 0) > 0;

  const handleDenominationChange = (denom: CashDenominations, total: number) => {
    setCashDenominations(denom);
    setActualCash(total);
  };

  const handleSaveDraft = async () => {
    if (!summary) return;
    await createClosingMutation.mutateAsync({
      date: today,
      summary,
      actualCash,
      cashDenominations,
      notes,
      submitForApproval: false,
    });
  };

  const handleSubmit = async () => {
    if (!summary) return;
    await createClosingMutation.mutateAsync({
      date: today,
      summary,
      actualCash,
      cashDenominations,
      notes,
      submitForApproval: true,
    });
    navigate("/app/billing");
  };

  if (summaryLoading || sessionsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Closing"
        description={`End of day reconciliation for ${format(new Date(today), 'MMMM dd, yyyy')}`}
        actions={
          <Button variant="outline" onClick={() => navigate("/app/billing")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      {/* Existing closing warning */}
      {existingClosing && existingClosing.status !== 'draft' && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-primary/10 border border-primary/20">
          <CheckCircle className="h-5 w-5 text-primary" />
          <span>
            Daily closing for today has been{" "}
            <strong>{existingClosing.status}</strong>
            {existingClosing.status === 'approved' && ' and cannot be modified'}.
          </span>
        </div>
      )}

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        {[
          { key: 'sessions', label: 'Sessions' },
          { key: 'expenses', label: 'Expenses' },
          { key: 'reconciliation', label: 'Cash Count' },
          { key: 'summary', label: 'Summary' },
        ].map((step, idx, arr) => (
          <div key={step.key} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === step.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {idx + 1}
            </div>
            <span className={currentStep === step.key ? 'font-medium' : 'text-muted-foreground'}>
              {step.label}
            </span>
            {idx < arr.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />}
          </div>
        ))}
      </div>

      {/* Step 1: Sessions Review */}
      {currentStep === 'sessions' && (
        <div className="space-y-4">
          {hasOpenSessions && (
            <div className="flex items-center gap-2 p-4 rounded-lg bg-warning/10 border border-warning/20 text-warning">
              <AlertTriangle className="h-5 w-5" />
              <span>
                <strong>{openCount}</strong> session(s) are still open. Please close all sessions before proceeding.
              </span>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today's Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sessions?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No sessions today</p>
              ) : (
                <div className="space-y-3">
                  {sessions?.map((session: any) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{session.session_number}</span>
                          <SessionStatusBadge status={session.status} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {session.opened_by_profile?.full_name} • {session.counter_type}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(session.total_collections)}</p>
                        <p className="text-xs text-muted-foreground">
                          {session.transaction_count} transactions
                        </p>
                      </div>
                    </div>
                  ))
                  }
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={() => setCurrentStep('expenses')}
              disabled={hasOpenSessions}
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Expenses Review */}
      {currentStep === 'expenses' && (
        <div className="space-y-4">
          <ExpenseEntryCard date={today} showAddButton={true} />

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-destructive" />
                  <span className="font-medium">Total Expenses Today</span>
                </div>
                <span className="text-lg font-bold text-destructive">
                  {formatCurrency(totalExpenses)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                These expenses will be deducted from the net cash calculation.
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep('sessions')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={() => setCurrentStep('reconciliation')}>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Cash Reconciliation */}
      {currentStep === 'reconciliation' && summary && (
        <div className="space-y-4">
          <CashDenominationInput
            value={cashDenominations}
            onChange={handleDenominationChange}
            expectedCash={summary.cashReconciliation.expected}
          />

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep('expenses')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={() => setCurrentStep('summary')} disabled={actualCash === 0}>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Summary & Submit */}
      {currentStep === 'summary' && summary && (
        <div className="space-y-4">
          <DailyClosingSummaryCard summary={summary} />

          <Card>
            <CardContent className="pt-4 space-y-4">
              <div>
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any closing remarks..."
                  rows={3}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setCurrentStep('reconciliation')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleSaveDraft}
                  disabled={createClosingMutation.isPending}
                  className="sm:ml-auto"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Draft
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createClosingMutation.isPending || existingClosing?.status === 'approved'}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Submit for Approval
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
