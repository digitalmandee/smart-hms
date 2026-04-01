import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAccounts, type Account } from "@/hooks/useAccounts";
import { useTranslation } from "@/lib/i18n";
import { formatCurrency } from "@/lib/currency";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { AccountPicker } from "@/components/accounts/AccountPicker";

interface JournalLine {
  id: string;
  account_id: string;
  description: string;
  debit_amount: number;
  credit_amount: number;
}

const emptyLine = (): JournalLine => ({
  id: crypto.randomUUID(),
  account_id: "",
  description: "",
  debit_amount: 0,
  credit_amount: 0,
});

const JournalEntryFormPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { t } = useTranslation();

  const [entryDate, setEntryDate] = useState<Date>(new Date());
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [referenceType, setReferenceType] = useState("manual");
  const [lines, setLines] = useState<JournalLine[]>([emptyLine(), emptyLine()]);
  const [saving, setSaving] = useState(false);

  // Load only L4 posting accounts
  const { data: allAccounts = [] } = useAccounts({ isActive: true });
  const postingAccounts = allAccounts.filter((a) => !a.is_header);
  const usedAccountIds = lines.map((l) => l.account_id).filter(Boolean);

  const totalDebit = lines.reduce((s, l) => s + (l.debit_amount || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (l.credit_amount || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;
  const hasMinLines = lines.filter((l) => l.account_id).length >= 2;
  const canPost = isBalanced && hasMinLines && totalDebit > 0 && description.trim().length > 0;

  const updateLine = (id: string, field: keyof JournalLine, value: any) => {
    setLines((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const updated = { ...l, [field]: value };
        // Auto-clear the other side
        if (field === "debit_amount" && value > 0) updated.credit_amount = 0;
        if (field === "credit_amount" && value > 0) updated.debit_amount = 0;
        return updated;
      })
    );
  };

  const removeLine = (id: string) => {
    if (lines.length <= 2) return;
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  const handleSave = async (post: boolean) => {
    if (!profile?.organization_id) return;
    if (post && !canPost) return;

    setSaving(true);
    try {
      // 1. Insert journal entry
      const entryPayload: any = {
        organization_id: profile.organization_id,
        entry_number: 'TEMP', // overwritten by generate_journal_entry_number trigger
        entry_date: format(entryDate, "yyyy-MM-dd"),
        description: description.trim(),
        notes: notes.trim() || null,
        reference_type: referenceType,
        is_posted: post,
        created_by: profile.id,
      };
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

      // 2. Insert lines
      const linePayloads = lines
        .filter((l) => l.account_id)
        .map((l) => ({
          journal_entry_id: entry.id,
          account_id: l.account_id,
          description: l.description || null,
          debit_amount: l.debit_amount || 0,
          credit_amount: l.credit_amount || 0,
        }));

      const { error: linesError } = await supabase
        .from("journal_entry_lines")
        .insert(linePayloads);

      if (linesError) throw linesError;

      toast.success(post ? t("common.submit", "Entry posted successfully") : t("common.save", "Draft saved successfully"));
      navigate(`/app/accounts/journal-entries/${entry.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to save journal entry");
    } finally {
      setSaving(false);
    }
  };

  const labels = {
    title: { en: "New Journal Entry", ur: "نئی جرنل انٹری", ar: "قيد يومية جديد" },
    desc: { en: "Create a manual journal entry", ur: "دستی جرنل انٹری بنائیں", ar: "إنشاء قيد يومية يدوي" },
    entryDate: { en: "Entry Date", ur: "تاریخ", ar: "تاريخ القيد" },
    description: { en: "Description", ur: "تفصیل", ar: "الوصف" },
    notesLabel: { en: "Notes", ur: "نوٹس", ar: "ملاحظات" },
    refType: { en: "Reference Type", ur: "حوالہ قسم", ar: "نوع المرجع" },
    account: { en: "Account", ur: "اکاؤنٹ", ar: "الحساب" },
    lineDesc: { en: "Line Description", ur: "لائن تفصیل", ar: "وصف السطر" },
    debit: { en: "Debit", ur: "ڈیبٹ", ar: "مدين" },
    credit: { en: "Credit", ur: "کریڈٹ", ar: "دائن" },
    addLine: { en: "Add Line", ur: "لائن شامل کریں", ar: "إضافة سطر" },
    saveDraft: { en: "Save as Draft", ur: "ڈرافٹ محفوظ کریں", ar: "حفظ كمسودة" },
    postEntry: { en: "Post Entry", ur: "انٹری پوسٹ کریں", ar: "ترحيل القيد" },
    total: { en: "Total", ur: "کل", ar: "المجموع" },
    balanced: { en: "Balanced", ur: "متوازن", ar: "متوازن" },
    unbalanced: { en: "Unbalanced", ur: "غیر متوازن", ar: "غير متوازن" },
    refManual: { en: "Manual", ur: "دستی", ar: "يدوي" },
    refInvoice: { en: "Invoice", ur: "انوائس", ar: "فاتورة" },
    refPayment: { en: "Payment", ur: "ادائیگی", ar: "دفعة" },
    refExpense: { en: "Expense", ur: "خرچ", ar: "مصروف" },
    refPayroll: { en: "Payroll", ur: "پے رول", ar: "رواتب" },
    refPosSale: { en: "POS Sale", ur: "پی او ایس سیل", ar: "بيع نقطة البيع" },
    refShipment: { en: "Shipment", ur: "شپمنٹ", ar: "شحنة" },
    refStockAdj: { en: "Stock Adjustment", ur: "اسٹاک ایڈجسٹمنٹ", ar: "تعديل مخزون" },
    refGrn: { en: "GRN", ur: "جی آر این", ar: "إذن استلام" },
    refVendorPay: { en: "Vendor Payment", ur: "وینڈر ادائیگی", ar: "دفعة مورد" },
    refPatientDep: { en: "Patient Deposit", ur: "مریض ڈپازٹ", ar: "إيداع مريض" },
    refCreditNote: { en: "Credit Note", ur: "کریڈٹ نوٹ", ar: "إشعار دائن" },
    refDonation: { en: "Donation", ur: "عطیہ", ar: "تبرع" },
  };

  const l = (key: keyof typeof labels) => {
    const lang = (profile as any)?.organization?.default_language || "en";
    return (labels[key] as any)[lang] || (labels[key] as any).en;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={l("title")}
        description={l("desc")}
        breadcrumbs={[
          { label: "Accounts", href: "/app/accounts" },
          { label: "Journal Entries", href: "/app/accounts/journal-entries" },
          { label: l("title") },
        ]}
      />

      {/* Header Fields */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label>{l("entryDate")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !entryDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {entryDate ? format(entryDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={entryDate}
                    onSelect={(d) => d && setEntryDate(d)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>{l("refType")}</Label>
              <Select value={referenceType} onValueChange={setReferenceType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">{l("refManual")}</SelectItem>
                  <SelectItem value="invoice">{l("refInvoice")}</SelectItem>
                  <SelectItem value="payment">{l("refPayment")}</SelectItem>
                  <SelectItem value="expense">{l("refExpense")}</SelectItem>
                  <SelectItem value="payroll">{l("refPayroll")}</SelectItem>
                  <SelectItem value="pos_sale">{l("refPosSale")}</SelectItem>
                  <SelectItem value="shipment">{l("refShipment")}</SelectItem>
                  <SelectItem value="stock_adjustment">{l("refStockAdj")}</SelectItem>
                  <SelectItem value="grn">{l("refGrn")}</SelectItem>
                  <SelectItem value="vendor_payment">{l("refVendorPay")}</SelectItem>
                  <SelectItem value="patient_deposit">{l("refPatientDep")}</SelectItem>
                  <SelectItem value="credit_note">{l("refCreditNote")}</SelectItem>
                  <SelectItem value="donation">{l("refDonation")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>{l("description")} *</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={l("description")}
              />
            </div>
            <div className="md:col-span-4">
              <Label>{l("notesLabel")}</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={l("notesLabel")}
                rows={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Line Items</CardTitle>
            <Button size="sm" variant="outline" onClick={() => setLines((p) => [...p, emptyLine()])}>
              <Plus className="h-4 w-4 mr-1" /> {l("addLine")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">{l("account")}</TableHead>
                <TableHead>{l("lineDesc")}</TableHead>
                <TableHead className="text-right w-[140px]">{l("debit")}</TableHead>
                <TableHead className="text-right w-[140px]">{l("credit")}</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((line) => (
                <TableRow key={line.id}>
                  <TableCell>
                    <AccountPicker
                      value={line.account_id || undefined}
                      onChange={(id) => updateLine(line.id, "account_id", id || "")}
                      placeholder={l("account")}
                      excludeIds={usedAccountIds.filter((i) => i !== line.account_id)}
                      postingOnly
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={line.description}
                      onChange={(e) => updateLine(line.id, "description", e.target.value)}
                      placeholder={l("lineDesc")}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      className="text-right"
                      value={line.debit_amount || ""}
                      onChange={(e) => updateLine(line.id, "debit_amount", parseFloat(e.target.value) || 0)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      className="text-right"
                      value={line.credit_amount || ""}
                      onChange={(e) => updateLine(line.id, "credit_amount", parseFloat(e.target.value) || 0)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={lines.length <= 2}
                      onClick={() => removeLine(line.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2} className="text-right font-bold">
                  {l("total")}
                </TableCell>
                <TableCell className="text-right font-bold">
                  {formatCurrency(totalDebit)}
                </TableCell>
                <TableCell className="text-right font-bold">
                  {formatCurrency(totalCredit)}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          </Table>

          {/* Balance indicator */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              {isBalanced && totalDebit > 0 ? (
                <span className="flex items-center gap-1 text-sm text-primary">
                  <CheckCircle2 className="h-4 w-4" /> {l("balanced")}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" /> {l("unbalanced")} ({formatCurrency(Math.abs(totalDebit - totalCredit))})
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" disabled={saving || !description.trim()} onClick={() => handleSave(false)}>
                {l("saveDraft")}
              </Button>
              <Button disabled={saving || !canPost} onClick={() => handleSave(true)}>
                {l("postEntry")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JournalEntryFormPage;
