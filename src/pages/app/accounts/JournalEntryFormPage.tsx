import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2, CheckCircle2, AlertCircle, Copy, Eye } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAccounts } from "@/hooks/useAccounts";
import { useBranches } from "@/hooks/useBranches";
import { useCostCenters } from "@/hooks/useCostCenters";
import { useTranslation } from "@/lib/i18n";
import { formatCurrency } from "@/lib/currency";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { AccountPicker } from "@/components/accounts/AccountPicker";

type VoucherType = "CPV" | "CRV" | "BPV" | "BRV" | "JV";

interface VoucherLine {
  id: string;
  account_id: string;
  description: string;
  debit_amount: number;
  credit_amount: number;
  cost_center_id: string;
  branch_id: string;
}

const emptyLine = (): VoucherLine => ({
  id: crypto.randomUUID(),
  account_id: "",
  description: "",
  debit_amount: 0,
  credit_amount: 0,
  cost_center_id: "",
  branch_id: "",
});

const VOUCHER_TYPES: { value: VoucherType; labelKey: string }[] = [
  { value: "CPV", labelKey: "voucher.cpv" },
  { value: "CRV", labelKey: "voucher.crv" },
  { value: "BPV", labelKey: "voucher.bpv" },
  { value: "BRV", labelKey: "voucher.brv" },
  { value: "JV", labelKey: "voucher.jv" },
];

const isCashType = (vt: VoucherType) => vt === "CPV" || vt === "CRV";
const isBankType = (vt: VoucherType) => vt === "BPV" || vt === "BRV";
const isPaymentType = (vt: VoucherType) => vt === "CPV" || vt === "BPV";
const isReceiptType = (vt: VoucherType) => vt === "CRV" || vt === "BRV";
const needsPaymentAccount = (vt: VoucherType) => vt !== "JV";

const JournalEntryFormPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { t } = useTranslation();

  // Header state
  const [voucherType, setVoucherType] = useState<VoucherType>("JV");
  const [entryDate, setEntryDate] = useState<Date>(new Date());
  const [postingDate, setPostingDate] = useState<Date>(new Date());
  const [branchId, setBranchId] = useState("");
  const [costCenterId, setCostCenterId] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentAccountId, setPaymentAccountId] = useState("");
  const [chequeNumber, setChequeNumber] = useState("");
  const [instrumentDate, setInstrumentDate] = useState<Date | undefined>();
  const [instrumentReference, setInstrumentReference] = useState("");
  const [currency, setCurrency] = useState("PKR");
  const [exchangeRate, setExchangeRate] = useState(1);
  const [externalReference, setExternalReference] = useState("");

  // Lines state
  const [lines, setLines] = useState<VoucherLine[]>([emptyLine(), emptyLine()]);
  const [saving, setSaving] = useState(false);
  const [showPostConfirm, setShowPostConfirm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Data hooks
  const { data: branches = [] } = useBranches(profile?.organization_id);
  const { data: costCenters = [] } = useCostCenters();
  const { data: allAccounts = [] } = useAccounts({ isActive: true });

  // Find cash account (CASH-001) for CPV/CRV
  const cashAccount = useMemo(() =>
    allAccounts.find(a => a.account_number === "CASH-001" && !a.is_header),
    [allAccounts]
  );

  // Bank accounts available via AccountPicker with category="asset" filter

  const selectedPaymentAccount = useMemo(() =>
    allAccounts.find(a => a.id === paymentAccountId),
    [allAccounts, paymentAccountId]
  );

  // Auto-set cash account for CPV/CRV
  const handleVoucherTypeChange = (vt: VoucherType) => {
    setVoucherType(vt);
    if (isCashType(vt) && cashAccount) {
      setPaymentAccountId(cashAccount.id);
    } else if (isBankType(vt)) {
      setPaymentAccountId("");
    } else {
      setPaymentAccountId("");
    }
    setChequeNumber("");
    setInstrumentDate(undefined);
    setInstrumentReference("");
  };

  // Calculations
  const totalDebit = lines.reduce((s, l) => s + (l.debit_amount || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (l.credit_amount || 0), 0);

  // For payment types (CPV/BPV): auto-balance = totalDebit (credit side is auto)
  // For receipt types (CRV/BRV): auto-balance = totalCredit (debit side is auto)
  const autoBalanceAmount = useMemo(() => {
    if (voucherType === "JV") return 0;
    if (isPaymentType(voucherType)) return totalDebit; // credit auto line
    return totalCredit; // debit auto line
  }, [voucherType, totalDebit, totalCredit]);

  const effectiveDebit = voucherType === "JV" ? totalDebit : (isReceiptType(voucherType) ? totalDebit + autoBalanceAmount : totalDebit);
  const effectiveCredit = voucherType === "JV" ? totalCredit : (isPaymentType(voucherType) ? totalCredit + autoBalanceAmount : totalCredit);

  const isBalanced = voucherType === "JV"
    ? Math.abs(totalDebit - totalCredit) < 0.01
    : true; // Auto-balanced for non-JV
  const hasMinLines = lines.filter(l => l.account_id).length >= 1;
  const hasValidAmount = voucherType === "JV" ? totalDebit > 0 : autoBalanceAmount > 0;
  const hasPaymentAccount = !needsPaymentAccount(voucherType) || !!paymentAccountId;
  const canPost = isBalanced && hasMinLines && hasValidAmount && description.trim().length > 0 && !!branchId && hasPaymentAccount;
  const canSaveDraft = description.trim().length > 0;

  const difference = Math.abs(effectiveDebit - effectiveCredit);

  const updateLine = (id: string, field: keyof VoucherLine, value: any) => {
    setLines(prev =>
      prev.map(l => {
        if (l.id !== id) return l;
        const updated = { ...l, [field]: value };
        if (field === "debit_amount" && value > 0) updated.credit_amount = 0;
        if (field === "credit_amount" && value > 0) updated.debit_amount = 0;
        return updated;
      })
    );
  };

  const removeLine = (id: string) => {
    if (lines.length <= 1) return;
    setLines(prev => prev.filter(l => l.id !== id));
  };

  const duplicateLine = (id: string) => {
    const source = lines.find(l => l.id === id);
    if (!source) return;
    const newLine = { ...source, id: crypto.randomUUID() };
    setLines(prev => {
      const idx = prev.findIndex(l => l.id === id);
      const next = [...prev];
      next.splice(idx + 1, 0, newLine);
      return next;
    });
  };

  const handleSave = async (post: boolean) => {
    if (!profile?.organization_id) return;
    if (post && !canPost) return;
    if (!post && !canSaveDraft) return;

    setSaving(true);
    try {
      // Generate voucher number via RPC
      const { data: voucherNumber, error: rpcError } = await supabase
        .rpc("generate_voucher_number", {
          p_voucher_type: voucherType,
          p_org_id: profile.organization_id,
        });
      if (rpcError) throw rpcError;

      // Build entry payload
      const entryPayload: any = {
        organization_id: profile.organization_id,
        entry_number: voucherNumber || '',
        entry_date: format(entryDate, "yyyy-MM-dd"),
        posting_date: format(postingDate, "yyyy-MM-dd"),
        description: description.trim(),
        notes: notes.trim() || null,
        voucher_type: voucherType,
        reference_type: voucherType === "JV" ? "manual" : voucherType.toLowerCase(),
        currency,
        exchange_rate: currency !== "PKR" ? exchangeRate : 1,
        external_reference: externalReference.trim() || null,
        branch_id: branchId || null,
        status: post ? "posted" : "draft",
        is_posted: post,
        created_by: profile.id,
      };

      if (needsPaymentAccount(voucherType)) {
        entryPayload.payment_account_id = paymentAccountId || null;
      }
      if (isBankType(voucherType)) {
        entryPayload.cheque_number = chequeNumber.trim() || null;
        entryPayload.instrument_date = instrumentDate ? format(instrumentDate, "yyyy-MM-dd") : null;
        entryPayload.instrument_reference = instrumentReference.trim() || null;
      }
      if (post) {
        entryPayload.posted_at = new Date().toISOString();
        entryPayload.posted_by = profile.id;
      }

      const { data: entry, error: entryError } = await supabase
        .from("journal_entries")
        .insert(entryPayload)
        .select("id")
        .single();

      if (entryError) throw entryError;

      // Build line payloads
      const validLines = lines.filter(l => l.account_id && (l.debit_amount > 0 || l.credit_amount > 0));
      const linePayloads: any[] = validLines.map(l => ({
        journal_entry_id: entry.id,
        account_id: l.account_id,
        description: l.description || null,
        debit_amount: l.debit_amount || 0,
        credit_amount: l.credit_amount || 0,
        cost_center_id: l.cost_center_id || null,
        branch_id: l.branch_id || null,
      }));

      // Add auto-balancing line for payment/receipt types
      if (voucherType !== "JV" && paymentAccountId && autoBalanceAmount > 0) {
        linePayloads.push({
          journal_entry_id: entry.id,
          account_id: paymentAccountId,
          description: isPaymentType(voucherType)
            ? t("voucher.payment_line", "Payment from " + (selectedPaymentAccount?.name || "Cash/Bank"))
            : t("voucher.receipt_line", "Receipt to " + (selectedPaymentAccount?.name || "Cash/Bank")),
          debit_amount: isReceiptType(voucherType) ? autoBalanceAmount : 0,
          credit_amount: isPaymentType(voucherType) ? autoBalanceAmount : 0,
          cost_center_id: null,
          branch_id: branchId || null,
        });
      }

      if (linePayloads.length > 0) {
        const { error: linesError } = await supabase
          .from("journal_entry_lines")
          .insert(linePayloads);
        if (linesError) throw linesError;
      }

      toast.success(post
        ? t("voucher.posted_success", "Voucher posted successfully")
        : t("voucher.draft_saved", "Draft saved successfully")
      );
      navigate(`/app/accounts/journal-entries/${entry.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to save voucher");
    } finally {
      setSaving(false);
    }
  };

  // Determine which amount column user enters for non-JV types
  const userEntersDebit = isPaymentType(voucherType); // CPV/BPV: user enters debit lines
  const userEntersCredit = isReceiptType(voucherType); // CRV/BRV: user enters credit lines

  const paymentAccountLabel = isCashType(voucherType)
    ? t("voucher.cash_account", "Cash Account")
    : isBankType(voucherType)
      ? t("voucher.bank_account", "Bank Account")
      : "";

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("voucher.create_title", "Create Accounting Voucher")}
        description={t("voucher.create_desc", "Create CPV, CRV, BPV, BRV, or Journal Voucher")}
        breadcrumbs={[
          { label: t("nav.accounts", "Accounts"), href: "/app/accounts" },
          { label: t("nav.journalEntries", "Journal Entries"), href: "/app/accounts/journal-entries" },
          { label: t("voucher.new", "New Voucher") },
        ]}
      />

      {/* Header Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">{t("voucher.header", "Voucher Header")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {/* Row 1: Voucher Type + Entry Date + Posting Date + Branch */}
            <div>
              <Label>{t("voucher.type", "Voucher Type")} *</Label>
              <Select value={voucherType} onValueChange={(v) => handleVoucherTypeChange(v as VoucherType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VOUCHER_TYPES.map(vt => (
                    <SelectItem key={vt.value} value={vt.value}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs font-mono">{vt.value}</Badge>
                        <span>{t(vt.labelKey, vt.value)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t("voucher.entry_date", "Entry Date")} *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(entryDate, "dd MMM yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={entryDate} onSelect={(d) => { if (d) { setEntryDate(d); setPostingDate(d); } }} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>{t("voucher.posting_date", "Posting Date")} *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(postingDate, "dd MMM yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={postingDate} onSelect={(d) => d && setPostingDate(d)} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>{t("voucher.branch", "Branch")} *</Label>
              <Select value={branchId} onValueChange={setBranchId}>
                <SelectTrigger><SelectValue placeholder={t("voucher.select_branch", "Select branch...")} /></SelectTrigger>
                <SelectContent>
                  {branches.map((b: any) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Row 2: Payment Account (conditional) + Bank fields */}
            {needsPaymentAccount(voucherType) && (
              <div className="md:col-span-2">
                <Label>{paymentAccountLabel} *</Label>
                {isCashType(voucherType) ? (
                  <Input
                    value={cashAccount ? `${cashAccount.account_number} — ${cashAccount.name}` : "Cash account not found"}
                    disabled
                    className="bg-muted"
                  />
                ) : (
                  <AccountPicker
                    value={paymentAccountId || undefined}
                    onChange={(id) => setPaymentAccountId(id || "")}
                    placeholder={t("voucher.select_bank", "Select bank account...")}
                    category="asset"
                    postingOnly
                  />
                )}
              </div>
            )}

            {isBankType(voucherType) && (
              <>
                <div>
                  <Label>{t("voucher.cheque_no", "Cheque / Instrument No")}</Label>
                  <Input value={chequeNumber} onChange={e => setChequeNumber(e.target.value)} placeholder="CHQ-00001" />
                </div>
                <div>
                  <Label>{t("voucher.instrument_date", "Instrument Date")}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {instrumentDate ? format(instrumentDate, "dd MMM yyyy") : t("voucher.pick_date", "Pick date")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={instrumentDate} onSelect={setInstrumentDate} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
              </>
            )}

            {/* Row 3: Currency + Exchange Rate + External Ref + Cost Center */}
            <div>
              <Label>{t("voucher.currency", "Currency")}</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PKR">PKR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="SAR">SAR</SelectItem>
                  <SelectItem value="AED">AED</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {currency !== "PKR" && (
              <div>
                <Label>{t("voucher.exchange_rate", "Exchange Rate")} *</Label>
                <Input type="number" min={0} step="0.0001" value={exchangeRate} onChange={e => setExchangeRate(parseFloat(e.target.value) || 1)} />
              </div>
            )}

            <div>
              <Label>{t("voucher.external_ref", "External Reference")}</Label>
              <Input value={externalReference} onChange={e => setExternalReference(e.target.value)} placeholder={t("voucher.ext_ref_placeholder", "Invoice no, ref...")} />
            </div>

            <div>
              <Label>{t("voucher.cost_center", "Cost Center")}</Label>
              <Select value={costCenterId} onValueChange={setCostCenterId}>
                <SelectTrigger><SelectValue placeholder={t("voucher.select_cc", "Select...")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">—</SelectItem>
                  {costCenters?.map((cc: any) => (
                    <SelectItem key={cc.id} value={cc.id}>{cc.code} — {cc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description - full width */}
            <div className="md:col-span-4">
              <Label>{t("voucher.narration", "Description / Narration")} *</Label>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={t("voucher.narration_placeholder", "Describe the purpose of this voucher...")}
                rows={2}
                className="resize-none"
              />
            </div>

            {isBankType(voucherType) && (
              <div className="md:col-span-4">
                <Label>{t("voucher.transaction_ref", "Transaction Reference / Deposit Slip")}</Label>
                <Input value={instrumentReference} onChange={e => setInstrumentReference(e.target.value)} placeholder={t("voucher.txn_ref_placeholder", "Bank reference number...")} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                {voucherType === "JV"
                  ? t("voucher.line_items", "Line Items")
                  : isPaymentType(voucherType)
                    ? t("voucher.debit_entries", "Debit Entries (Expenses / Payments)")
                    : t("voucher.credit_entries", "Credit Entries (Income / Receipts)")
                }
              </CardTitle>
              {voucherType !== "JV" && (
                <p className="text-sm text-muted-foreground mt-1">
                  {isPaymentType(voucherType)
                    ? t("voucher.auto_credit_note", "Credit side will be auto-generated from the selected payment account")
                    : t("voucher.auto_debit_note", "Debit side will be auto-generated from the selected receipt account")
                  }
                </p>
              )}
            </div>
            <Button size="sm" variant="outline" onClick={() => setLines(p => [...p, emptyLine()])}>
              <Plus className="h-4 w-4 mr-1" /> {t("voucher.add_line", "Add Line")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[28%]">{t("voucher.account", "Account")}</TableHead>
                <TableHead className="w-[22%]">{t("voucher.line_desc", "Description")}</TableHead>
                {(voucherType === "JV" || userEntersDebit) && (
                  <TableHead className="text-right w-[130px]">{t("voucher.debit", "Debit")}</TableHead>
                )}
                {(voucherType === "JV" || userEntersCredit) && (
                  <TableHead className="text-right w-[130px]">{t("voucher.credit", "Credit")}</TableHead>
                )}
                <TableHead className="w-[140px]">{t("voucher.cost_center", "Cost Center")}</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((line) => (
                <TableRow key={line.id}>
                  <TableCell>
                    <AccountPicker
                      value={line.account_id || undefined}
                      onChange={(id) => updateLine(line.id, "account_id", id || "")}
                      placeholder={t("voucher.select_account", "Select account...")}
                      postingOnly
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={line.description}
                      onChange={e => updateLine(line.id, "description", e.target.value)}
                      placeholder={t("voucher.line_desc", "Description")}
                    />
                  </TableCell>
                  {(voucherType === "JV" || userEntersDebit) && (
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        className="text-right font-mono"
                        value={line.debit_amount || ""}
                        onChange={e => updateLine(line.id, "debit_amount", parseFloat(e.target.value) || 0)}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const inputs = document.querySelectorAll<HTMLInputElement>('input[type="number"]');
                            const idx = Array.from(inputs).indexOf(e.currentTarget);
                            inputs[idx + 1]?.focus();
                          }
                        }}
                      />
                    </TableCell>
                  )}
                  {(voucherType === "JV" || userEntersCredit) && (
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        className="text-right font-mono"
                        value={line.credit_amount || ""}
                        onChange={e => updateLine(line.id, "credit_amount", parseFloat(e.target.value) || 0)}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const inputs = document.querySelectorAll<HTMLInputElement>('input[type="number"]');
                            const idx = Array.from(inputs).indexOf(e.currentTarget);
                            inputs[idx + 1]?.focus();
                          }
                        }}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <Select value={line.cost_center_id} onValueChange={v => updateLine(line.id, "cost_center_id", v)}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">—</SelectItem>
                        {costCenters?.map((cc: any) => (
                          <SelectItem key={cc.id} value={cc.id}>{cc.code}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => duplicateLine(line.id)} title={t("voucher.duplicate", "Duplicate")}>
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" disabled={lines.length <= 1} onClick={() => removeLine(line.id)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {/* Auto-balancing row for non-JV */}
              {voucherType !== "JV" && paymentAccountId && autoBalanceAmount > 0 && (
                <TableRow className="bg-muted/30">
                  <TableCell>
                    <span className="text-sm font-medium text-muted-foreground">
                      {selectedPaymentAccount?.account_number} — {selectedPaymentAccount?.name}
                    </span>
                    <Badge variant="outline" className="ml-2 text-xs">{t("voucher.auto", "Auto")}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground italic">
                      {isPaymentType(voucherType) ? t("voucher.payment_auto", "Payment") : t("voucher.receipt_auto", "Receipt")}
                    </span>
                  </TableCell>
                  {(voucherType === "JV" || userEntersDebit) && (
                    <TableCell className="text-right font-mono font-bold">
                      {isReceiptType(voucherType) ? formatCurrency(autoBalanceAmount) : "—"}
                    </TableCell>
                  )}
                  {(voucherType === "JV" || userEntersCredit) && (
                    <TableCell className="text-right font-mono font-bold">
                      {isPaymentType(voucherType) ? formatCurrency(autoBalanceAmount) : "—"}
                    </TableCell>
                  )}
                  <TableCell />
                  <TableCell />
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow className="sticky bottom-0 bg-background border-t-2">
                <TableCell colSpan={2} className="text-right font-bold">
                  {t("voucher.total", "Total")}
                </TableCell>
                {(voucherType === "JV" || userEntersDebit) && (
                  <TableCell className="text-right font-bold font-mono">
                    {formatCurrency(effectiveDebit)}
                  </TableCell>
                )}
                {(voucherType === "JV" || userEntersCredit) && (
                  <TableCell className="text-right font-bold font-mono">
                    {formatCurrency(effectiveCredit)}
                  </TableCell>
                )}
                <TableCell />
                <TableCell />
              </TableRow>
            </TableFooter>
          </Table>

          {/* Balance indicator + Actions */}
          <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {isBalanced && hasValidAmount ? (
                <span className="flex items-center gap-1.5 text-sm font-medium text-primary">
                  <CheckCircle2 className="h-4 w-4" /> {t("voucher.balanced", "Balanced")}
                </span>
              ) : voucherType === "JV" && difference > 0 ? (
                <span className="flex items-center gap-1.5 text-sm font-semibold text-destructive">
                  <AlertCircle className="h-4 w-4" /> {t("voucher.unbalanced", "Unbalanced")}: {formatCurrency(difference)}
                </span>
              ) : !hasValidAmount ? (
                <span className="text-sm text-muted-foreground">
                  {t("voucher.enter_amounts", "Enter line amounts")}
                </span>
              ) : null}

              {/* Warnings */}
              {postingDate < entryDate && (
                <span className="text-xs text-warning">⚠ {t("voucher.warn_backdate", "Posting date is before entry date")}</span>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowPreview(true)} disabled={!hasMinLines}>
                <Eye className="h-4 w-4 mr-1" /> {t("voucher.preview", "Preview")}
              </Button>
              <Button variant="outline" disabled={saving || !canSaveDraft} onClick={() => handleSave(false)}>
                {t("voucher.save_draft", "Save Draft")}
              </Button>
              <Button disabled={saving || !canPost} onClick={() => setShowPostConfirm(true)}>
                {t("voucher.post_voucher", "Post Voucher")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Post Confirmation Dialog */}
      <Dialog open={showPostConfirm} onOpenChange={setShowPostConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("voucher.confirm_post_title", "Confirm Posting")}</DialogTitle>
            <DialogDescription>
              {t("voucher.confirm_post_desc", "Once posted, this voucher will be locked and cannot be edited. A reversal entry will be required for corrections.")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>{t("voucher.type", "Type")}:</span> <Badge variant="outline">{voucherType}</Badge></div>
            <div className="flex justify-between"><span>{t("voucher.total_amount", "Amount")}:</span> <span className="font-mono font-bold">{formatCurrency(effectiveDebit)}</span></div>
            <div className="flex justify-between"><span>{t("voucher.narration", "Narration")}:</span> <span className="text-muted-foreground truncate max-w-[200px]">{description}</span></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPostConfirm(false)}>{t("common.cancel", "Cancel")}</Button>
            <Button onClick={() => { setShowPostConfirm(false); handleSave(true); }} disabled={saving}>
              {t("voucher.confirm_post", "Post Now")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("voucher.preview_title", "Voucher Preview")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground">{t("voucher.type", "Type")}:</span> <Badge variant="outline">{voucherType}</Badge></div>
              <div><span className="text-muted-foreground">{t("voucher.entry_date", "Date")}:</span> {format(entryDate, "dd MMM yyyy")}</div>
              <div className="col-span-2"><span className="text-muted-foreground">{t("voucher.narration", "Narration")}:</span> {description}</div>
              {selectedPaymentAccount && (
                <div className="col-span-2"><span className="text-muted-foreground">{paymentAccountLabel}:</span> {selectedPaymentAccount.account_number} — {selectedPaymentAccount.name}</div>
              )}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("voucher.account", "Account")}</TableHead>
                  <TableHead className="text-right">{t("voucher.debit", "Debit")}</TableHead>
                  <TableHead className="text-right">{t("voucher.credit", "Credit")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.filter(l => l.account_id).map(line => {
                  const acc = allAccounts.find(a => a.id === line.account_id);
                  return (
                    <TableRow key={line.id}>
                      <TableCell>{acc?.account_number} — {acc?.name}</TableCell>
                      <TableCell className="text-right font-mono">{line.debit_amount > 0 ? formatCurrency(line.debit_amount) : "—"}</TableCell>
                      <TableCell className="text-right font-mono">{line.credit_amount > 0 ? formatCurrency(line.credit_amount) : "—"}</TableCell>
                    </TableRow>
                  );
                })}
                {voucherType !== "JV" && selectedPaymentAccount && autoBalanceAmount > 0 && (
                  <TableRow className="bg-muted/30">
                    <TableCell>{selectedPaymentAccount.account_number} — {selectedPaymentAccount.name} <Badge variant="outline" className="ml-1 text-xs">Auto</Badge></TableCell>
                    <TableCell className="text-right font-mono">{isReceiptType(voucherType) ? formatCurrency(autoBalanceAmount) : "—"}</TableCell>
                    <TableCell className="text-right font-mono">{isPaymentType(voucherType) ? formatCurrency(autoBalanceAmount) : "—"}</TableCell>
                  </TableRow>
                )}
                <TableRow className="font-bold border-t-2">
                  <TableCell>{t("voucher.total", "Total")}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(effectiveDebit)}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(effectiveCredit)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>{t("common.close", "Close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JournalEntryFormPage;
