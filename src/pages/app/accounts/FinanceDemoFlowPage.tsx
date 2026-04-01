import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation, useDirection } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  CheckCircle2, ArrowRight, ChevronDown, ChevronUp, RotateCcw,
  LayoutDashboard, GitBranch, FileText, PenLine, BookOpen, BarChart3,
  Receipt, CreditCard, Wallet, CalendarCheck, Clock, Users,
  ShoppingCart, Truck, PieChart, Landmark, Building2, Star
} from "lucide-react";

const STORAGE_KEY = "finance_demo_completed_steps";

interface DemoStep {
  id: string;
  titleKey: string;
  descKey: string;
  talkingPointsKey: string;
  route: string;
  icon: React.ElementType;
}

interface DemoSection {
  titleKey: string;
  steps: DemoStep[];
}

const SECTIONS: DemoSection[] = [
  {
    titleKey: "demo.section.foundation",
    steps: [
      { id: "s1", titleKey: "demo.step.accountsDashboard", descKey: "demo.step.accountsDashboard.desc", talkingPointsKey: "demo.step.accountsDashboard.talk", route: "/app/accounts", icon: LayoutDashboard },
      { id: "s2", titleKey: "demo.step.chartOfAccounts", descKey: "demo.step.chartOfAccounts.desc", talkingPointsKey: "demo.step.chartOfAccounts.talk", route: "/app/accounts/chart-of-accounts", icon: GitBranch },
      { id: "s3", titleKey: "demo.step.accountTypes", descKey: "demo.step.accountTypes.desc", talkingPointsKey: "demo.step.accountTypes.talk", route: "/app/accounts/types", icon: FileText },
    ],
  },
  {
    titleKey: "demo.section.transactions",
    steps: [
      { id: "s4", titleKey: "demo.step.createJournalEntry", descKey: "demo.step.createJournalEntry.desc", talkingPointsKey: "demo.step.createJournalEntry.talk", route: "/app/accounts/journal-entries/new", icon: PenLine },
      { id: "s5", titleKey: "demo.step.journalEntries", descKey: "demo.step.journalEntries.desc", talkingPointsKey: "demo.step.journalEntries.talk", route: "/app/accounts/journal-entries", icon: BookOpen },
      { id: "s6", titleKey: "demo.step.generalLedger", descKey: "demo.step.generalLedger.desc", talkingPointsKey: "demo.step.generalLedger.talk", route: "/app/accounts/ledger", icon: BarChart3 },
    ],
  },
  {
    titleKey: "demo.section.billing",
    steps: [
      { id: "s7", titleKey: "demo.step.billingDashboard", descKey: "demo.step.billingDashboard.desc", talkingPointsKey: "demo.step.billingDashboard.talk", route: "/app/billing", icon: Receipt },
      { id: "s8", titleKey: "demo.step.createInvoice", descKey: "demo.step.createInvoice.desc", talkingPointsKey: "demo.step.createInvoice.talk", route: "/app/billing/invoices/new", icon: FileText },
      { id: "s9", titleKey: "demo.step.invoiceList", descKey: "demo.step.invoiceList.desc", talkingPointsKey: "demo.step.invoiceList.talk", route: "/app/billing/invoices", icon: Receipt },
      { id: "s10", titleKey: "demo.step.paymentCollection", descKey: "demo.step.paymentCollection.desc", talkingPointsKey: "demo.step.paymentCollection.talk", route: "/app/billing/payment-collection", icon: CreditCard },
    ],
  },
  {
    titleKey: "demo.section.operations",
    steps: [
      { id: "s11", titleKey: "demo.step.dailyClosing", descKey: "demo.step.dailyClosing.desc", talkingPointsKey: "demo.step.dailyClosing.talk", route: "/app/billing/daily-closing", icon: CalendarCheck },
      { id: "s12", titleKey: "demo.step.billingSessions", descKey: "demo.step.billingSessions.desc", talkingPointsKey: "demo.step.billingSessions.talk", route: "/app/billing/sessions", icon: Clock },
      { id: "s13", titleKey: "demo.step.patientDeposits", descKey: "demo.step.patientDeposits.desc", talkingPointsKey: "demo.step.patientDeposits.talk", route: "/app/accounts/patient-deposits", icon: Wallet },
    ],
  },
  {
    titleKey: "demo.section.payables",
    steps: [
      { id: "s14", titleKey: "demo.step.expenses", descKey: "demo.step.expenses.desc", talkingPointsKey: "demo.step.expenses.talk", route: "/app/accounts/expenses", icon: ShoppingCart },
      { id: "s15", titleKey: "demo.step.vendorPayments", descKey: "demo.step.vendorPayments.desc", talkingPointsKey: "demo.step.vendorPayments.talk", route: "/app/accounts/vendor-payments", icon: Truck },
      { id: "s16", titleKey: "demo.step.accountsPayable", descKey: "demo.step.accountsPayable.desc", talkingPointsKey: "demo.step.accountsPayable.talk", route: "/app/accounts/payables", icon: Users },
    ],
  },
  {
    titleKey: "demo.section.reports",
    steps: [
      { id: "s17", titleKey: "demo.step.financialReports", descKey: "demo.step.financialReports.desc", talkingPointsKey: "demo.step.financialReports.talk", route: "/app/accounts/reports", icon: PieChart },
      { id: "s18", titleKey: "demo.step.bankReconciliation", descKey: "demo.step.bankReconciliation.desc", talkingPointsKey: "demo.step.bankReconciliation.talk", route: "/app/accounts/bank-reconciliation", icon: Landmark },
    ],
  },
];

const BONUS_STEPS: DemoStep[] = [
  { id: "b1", titleKey: "demo.bonus.fixedAssets", descKey: "demo.bonus.fixedAssets.desc", talkingPointsKey: "demo.bonus.fixedAssets.talk", route: "/app/accounts/fixed-assets", icon: Building2 },
  { id: "b2", titleKey: "demo.bonus.creditNotes", descKey: "demo.bonus.creditNotes.desc", talkingPointsKey: "demo.bonus.creditNotes.talk", route: "/app/accounts/credit-notes", icon: FileText },
  { id: "b3", titleKey: "demo.bonus.vatReturn", descKey: "demo.bonus.vatReturn.desc", talkingPointsKey: "demo.bonus.vatReturn.talk", route: "/app/accounts/vat-return", icon: Receipt },
  { id: "b4", titleKey: "demo.bonus.costCenterPnl", descKey: "demo.bonus.costCenterPnl.desc", talkingPointsKey: "demo.bonus.costCenterPnl.talk", route: "/app/accounts/cost-center-pnl", icon: PieChart },
  { id: "b5", titleKey: "demo.bonus.arReconciliation", descKey: "demo.bonus.arReconciliation.desc", talkingPointsKey: "demo.bonus.arReconciliation.talk", route: "/app/accounts/ar-reconciliation", icon: BarChart3 },
  { id: "b6", titleKey: "demo.bonus.auditLog", descKey: "demo.bonus.auditLog.desc", talkingPointsKey: "demo.bonus.auditLog.talk", route: "/app/accounts/audit-log", icon: BookOpen },
  { id: "b7", titleKey: "demo.bonus.payrollAllocation", descKey: "demo.bonus.payrollAllocation.desc", talkingPointsKey: "demo.bonus.payrollAllocation.talk", route: "/app/accounts/payroll-allocation", icon: Users },
];

export default function FinanceDemoFlowPage() {
  const { t } = useTranslation();
  const dir = useDirection();
  const navigate = useNavigate();
  const [completed, setCompleted] = useState<string[]>([]);
  const [showBonus, setShowBonus] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setCompleted(JSON.parse(stored));
    } catch {}
  }, []);

  const totalSteps = SECTIONS.reduce((a, s) => a + s.steps.length, 0);
  const completedMain = completed.filter((id) => id.startsWith("s")).length;
  const progressPct = Math.round((completedMain / totalSteps) * 100);

  const toggleComplete = (id: string) => {
    const next = completed.includes(id) ? completed.filter((c) => c !== id) : [...completed, id];
    setCompleted(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const resetProgress = () => {
    setCompleted([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const goToStep = (route: string, id: string) => {
    if (!completed.includes(id)) toggleComplete(id);
    navigate(route);
  };

  let stepCounter = 0;

  return (
    <div dir={dir} className="space-y-6 p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("demo.title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t("demo.subtitle")}</p>
          </div>
          <Button variant="outline" size="sm" onClick={resetProgress} className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" />
            {t("demo.reset")}
          </Button>
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t("demo.progress")}</span>
            <span>{completedMain}/{totalSteps} — {progressPct}%</span>
          </div>
          <Progress value={progressPct} className="h-2.5" />
        </div>
      </div>

      {/* Sections */}
      {SECTIONS.map((section, si) => (
        <div key={si} className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-bold">
              {si + 1}
            </span>
            {t(section.titleKey as any)}
          </h2>

          <div className="grid gap-3">
            {section.steps.map((step) => {
              stepCounter++;
              const isDone = completed.includes(step.id);
              const Icon = step.icon;
              return (
                <Card key={step.id} className={`transition-all ${isDone ? "border-primary/40 bg-primary/5" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Step number */}
                      <button
                        onClick={() => toggleComplete(step.id)}
                        className={`mt-0.5 flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                          isDone
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-primary/20"
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="h-4 w-4" /> : stepCounter}
                      </button>

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="font-medium text-foreground text-sm">{t(step.titleKey as any)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{t(step.descKey as any)}</p>
                        
                        {/* Talking points */}
                        <div className="bg-muted/50 rounded-md p-2.5 mt-2">
                          <p className="text-xs text-muted-foreground italic flex items-start gap-1.5">
                            <Star className="h-3 w-3 mt-0.5 text-primary flex-shrink-0" />
                            {t(step.talkingPointsKey as any)}
                          </p>
                        </div>
                      </div>

                      <Button size="sm" variant={isDone ? "outline" : "default"} className="flex-shrink-0 gap-1" onClick={() => goToStep(step.route, step.id)}>
                        {t("demo.go")}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {/* Bonus Steps */}
      <Collapsible open={showBonus} onOpenChange={setShowBonus}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between text-muted-foreground">
            <span className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              {t("demo.bonusSteps")} ({BONUS_STEPS.length})
            </span>
            {showBonus ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid gap-3 mt-3">
            {BONUS_STEPS.map((step) => {
              const isDone = completed.includes(step.id);
              const Icon = step.icon;
              return (
                <Card key={step.id} className={`transition-all ${isDone ? "border-primary/40 bg-primary/5" : "border-dashed"}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleComplete(step.id)}
                        className={`mt-0.5 flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                          isDone ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/20"
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Star className="h-3.5 w-3.5" />}
                      </button>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="font-medium text-foreground text-sm">{t(step.titleKey as any)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{t(step.descKey as any)}</p>
                      </div>
                      <Button size="sm" variant="outline" className="flex-shrink-0 gap-1" onClick={() => goToStep(step.route, step.id)}>
                        {t("demo.go")}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
