import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CashDenominationInput } from "@/components/billing/CashDenominationInput";
import { CashDenominations } from "@/hooks/useBillingSessions";
import { toast } from "@/hooks/use-toast";
import { Banknote, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";

const labels = {
  title: { en: "Deposit Cash to Bank", ur: "بینک میں نقد جمع کروائیں", ar: "إيداع نقدي في البنك" },
  description: { en: "Record a cash deposit into this bank account", ur: "اس بینک اکاؤنٹ میں نقد رقم جمع کرائیں", ar: "تسجيل إيداع نقدي في هذا الحساب البنكي" },
  amount: { en: "Deposit Amount", ur: "جمع کی رقم", ar: "مبلغ الإيداع" },
  reference: { en: "Deposit Slip / Reference No.", ur: "ڈپازٹ سلپ / حوالہ نمبر", ar: "إيصال الإيداع / رقم المرجع" },
  date: { en: "Deposit Date", ur: "جمع کی تاریخ", ar: "تاريخ الإيداع" },
  notes: { en: "Notes (Optional)", ur: "نوٹس (اختیاری)", ar: "ملاحظات (اختياري)" },
  showDenominations: { en: "Show Denomination Breakdown", ur: "فرقہ وار تفصیل دکھائیں", ar: "إظهار تفصيل الفئات" },
  hideDenominations: { en: "Hide Denomination Breakdown", ur: "فرقہ وار تفصیل چھپائیں", ar: "إخفاء تفصيل الفئات" },
  submit: { en: "Record Deposit", ur: "جمع ریکارڈ کریں", ar: "تسجيل الإيداع" },
  cancel: { en: "Cancel", ur: "منسوخ", ar: "إلغاء" },
  success: { en: "Cash deposit recorded successfully", ur: "نقد جمع کامیابی سے ریکارڈ ہو گئی", ar: "تم تسجيل الإيداع النقدي بنجاح" },
  error: { en: "Failed to record deposit", ur: "جمع ریکارڈ کرنے میں ناکامی", ar: "فشل في تسجيل الإيداع" },
  amountRequired: { en: "Please enter an amount", ur: "براہ کرم رقم درج کریں", ar: "يرجى إدخال المبلغ" },
};

interface CashToBankDepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bankAccount: {
    id: string;
    bank_name: string;
    account_number: string;
    account_id: string | null;
    organization_id: string;
  };
}

export function CashToBankDepositDialog({ open, onOpenChange, bankAccount }: CashToBankDepositDialogProps) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const lang = (profile as any)?.organization?.default_language || "en";
  const l = (key: keyof typeof labels) => (labels[key] as any)[lang] || (labels[key] as any).en;

  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [depositDate, setDepositDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [notes, setNotes] = useState("");
  const [showDenominations, setShowDenominations] = useState(false);
  const [denominations, setDenominations] = useState<CashDenominations>({});

  const resetForm = () => {
    setAmount("");
    setReference("");
    setDepositDate(format(new Date(), "yyyy-MM-dd"));
    setNotes("");
    setShowDenominations(false);
    setDenominations({});
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const depositAmount = parseFloat(amount);
      if (!depositAmount || depositAmount <= 0) throw new Error("Invalid amount");

      const narration = `Cash deposit to ${bankAccount.bank_name} (${bankAccount.account_number})${reference ? ` - Ref: ${reference}` : ""}`;

      // 1. Insert bank transaction
      const { error: txnError } = await supabase.from("bank_transactions").insert({
        bank_account_id: bankAccount.id,
        transaction_date: depositDate,
        description: narration,
        credit_amount: depositAmount,
        debit_amount: 0,
        reference_number: reference || null,
        transaction_type: "cash_deposit",
        created_by: profile?.id,
      });
      if (txnError) throw txnError;

      // 2. Update bank account balance
      const { error: balError } = await supabase.rpc("update_bank_balance_on_deposit" as any, {
        p_bank_account_id: bankAccount.id,
        p_amount: depositAmount,
      }).then(async (res: any) => {
        // Fallback: direct update if RPC doesn't exist
        if (res.error) {
          return supabase
            .from("bank_accounts")
            .update({ current_balance: undefined as any }) // will use raw SQL below
            .eq("id", bankAccount.id);
        }
        return res;
      });

      // Direct balance update (increment)
      const { data: currentAccount } = await supabase
        .from("bank_accounts")
        .select("current_balance")
        .eq("id", bankAccount.id)
        .single();

      if (currentAccount) {
        await supabase
          .from("bank_accounts")
          .update({ current_balance: (currentAccount.current_balance || 0) + depositAmount })
          .eq("id", bankAccount.id);
      }

      // 3. Create journal entry (DR Bank GL, CR Cash GL)
      if (bankAccount.account_id) {
        // Get cash account
        const { data: cashAccount } = await supabase
          .from("accounts")
          .select("id")
          .eq("organization_id", bankAccount.organization_id)
          .eq("account_number", "CASH-001")
          .single();

        if (cashAccount) {
          const tempEntryNum = `JE-DEP-${format(new Date(), "yyMMdd")}-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;
          const { data: journalEntry, error: jeError } = await supabase
            .from("journal_entries")
            .insert({
              organization_id: bankAccount.organization_id,
              entry_number: tempEntryNum,
              entry_date: depositDate,
              description: narration,
              reference_type: "bank_deposit",
              is_posted: true,
            })
            .select()
            .single();

          if (jeError) throw jeError;

          if (journalEntry) {
            const { error: lineError } = await supabase.from("journal_entry_lines").insert([
              {
                journal_entry_id: journalEntry.id,
                account_id: bankAccount.account_id,
                description: "Cash deposit to bank",
                debit_amount: depositAmount,
                credit_amount: 0,
              },
              {
                journal_entry_id: journalEntry.id,
                account_id: cashAccount.id,
                description: "Cash deposited to bank",
                debit_amount: 0,
                credit_amount: depositAmount,
              },
            ]);
            if (lineError) throw lineError;
          }
        }
      }
    },
    onSuccess: () => {
      toast({ title: l("success") });
      queryClient.invalidateQueries({ queryKey: ["bank-account", bankAccount.id] });
      queryClient.invalidateQueries({ queryKey: ["bank-account-transactions", bankAccount.id] });
      resetForm();
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Deposit error:", error);
      toast({ title: l("error"), description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({ title: l("amountRequired"), variant: "destructive" });
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            {l("title")}
          </DialogTitle>
          <DialogDescription>{l("description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Amount */}
          <div className="space-y-2">
            <Label>{l("amount")} *</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="text-lg font-semibold"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>{l("date")}</Label>
            <Input
              type="date"
              value={depositDate}
              onChange={(e) => setDepositDate(e.target.value)}
            />
          </div>

          {/* Reference */}
          <div className="space-y-2">
            <Label>{l("reference")}</Label>
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. DEP-2024-001"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>{l("notes")}</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Denomination Toggle */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-between"
            onClick={() => setShowDenominations(!showDenominations)}
          >
            {showDenominations ? l("hideDenominations") : l("showDenominations")}
            {showDenominations ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {showDenominations && (
            <CashDenominationInput
              value={denominations}
              onChange={(d, total) => {
                setDenominations(d);
                if (total > 0) setAmount(total.toString());
              }}
              compact
              showTotal
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            {l("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? "..." : l("submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
