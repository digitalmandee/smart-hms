import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useBranches } from "@/hooks/useBranches";
import { AccountPicker } from "@/components/accounts/AccountPicker";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BankAccountFormPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: branches = [] } = useBranches(profile?.organization_id);

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    bank_name: "",
    account_number: "",
    account_holder_name: "",
    account_type: "current",
    branch_id: "",
    ifsc_code: "",
    swift_code: "",
    opening_balance: 0,
    is_default: false,
    account_id: "" as string | undefined,
  });

  const set = (field: string, value: any) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async () => {
    if (!profile?.organization_id) return;
    if (!form.bank_name.trim() || !form.account_number.trim()) {
      toast.error("Bank name and account number are required");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("bank_accounts").insert({
        organization_id: profile.organization_id,
        created_by: profile.id,
        bank_name: form.bank_name.trim(),
        account_number: form.account_number.trim(),
        account_holder_name: form.account_holder_name.trim() || null,
        account_type: form.account_type,
        branch_id: form.branch_id || null,
        ifsc_code: form.ifsc_code.trim() || null,
        swift_code: form.swift_code.trim() || null,
        opening_balance: form.opening_balance,
        current_balance: form.opening_balance,
        is_default: form.is_default,
        account_id: form.account_id || null,
      });

      if (error) throw error;
      toast.success("Bank account created successfully");
      navigate("/app/accounts/bank-accounts");
    } catch (err: any) {
      toast.error(err.message || "Failed to create bank account");
    } finally {
      setSaving(false);
    }
  };

  const labels = {
    title: { en: "New Bank Account", ur: "نیا بینک اکاؤنٹ", ar: "حساب بنكي جديد" },
    desc: { en: "Add a new bank account", ur: "نیا بینک اکاؤنٹ شامل کریں", ar: "إضافة حساب بنكي جديد" },
    bankName: { en: "Bank Name", ur: "بینک کا نام", ar: "اسم البنك" },
    accountNumber: { en: "Account Number", ur: "اکاؤنٹ نمبر", ar: "رقم الحساب" },
    holderName: { en: "Account Holder Name", ur: "اکاؤنٹ ہولڈر کا نام", ar: "اسم صاحب الحساب" },
    accountType: { en: "Account Type", ur: "اکاؤنٹ قسم", ar: "نوع الحساب" },
    branch: { en: "Branch", ur: "برانچ", ar: "الفرع" },
    ifsc: { en: "IFSC Code", ur: "IFSC کوڈ", ar: "رمز IFSC" },
    swift: { en: "SWIFT Code", ur: "SWIFT کوڈ", ar: "رمز SWIFT" },
    openingBalance: { en: "Opening Balance", ur: "ابتدائی بیلنس", ar: "الرصيد الافتتاحي" },
    isDefault: { en: "Set as default account", ur: "بطور ڈیفالٹ سیٹ کریں", ar: "تعيين كحساب افتراضي" },
    linkedAccount: { en: "Linked Chart of Accounts", ur: "منسلک اکاؤنٹ", ar: "الحساب المرتبط" },
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
          { label: "Bank & Cash", href: "/app/accounts/bank-accounts" },
          { label: l("title") },
        ]}
      />

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>{l("bankName")} *</Label>
              <Input value={form.bank_name} onChange={(e) => set("bank_name", e.target.value)} />
            </div>
            <div>
              <Label>{l("accountNumber")} *</Label>
              <Input value={form.account_number} onChange={(e) => set("account_number", e.target.value)} />
            </div>
            <div>
              <Label>{l("holderName")}</Label>
              <Input value={form.account_holder_name} onChange={(e) => set("account_holder_name", e.target.value)} />
            </div>
            <div>
              <Label>{l("accountType")}</Label>
              <Select value={form.account_type} onValueChange={(v) => set("account_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="current">Current</SelectItem>
                  <SelectItem value="fixed_deposit">Fixed Deposit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{l("branch")}</Label>
              <Select value={form.branch_id} onValueChange={(v) => set("branch_id", v)}>
                <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{l("openingBalance")}</Label>
              <Input
                type="number"
                step="0.01"
                value={form.opening_balance}
                onChange={(e) => set("opening_balance", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>{l("ifsc")}</Label>
              <Input value={form.ifsc_code} onChange={(e) => set("ifsc_code", e.target.value)} />
            </div>
            <div>
              <Label>{l("swift")}</Label>
              <Input value={form.swift_code} onChange={(e) => set("swift_code", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>{l("linkedAccount")}</Label>
              <AccountPicker
                value={form.account_id}
                onChange={(id) => set("account_id", id)}
                placeholder="Link to Chart of Accounts (optional)"
                category="asset"
              />
            </div>
            <div className="flex items-center gap-2 md:col-span-2">
              <Checkbox
                id="is_default"
                checked={form.is_default}
                onCheckedChange={(v) => set("is_default", !!v)}
              />
              <Label htmlFor="is_default" className="cursor-pointer">{l("isDefault")}</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => navigate("/app/accounts/bank-accounts")}>
              Cancel
            </Button>
            <Button disabled={saving} onClick={handleSubmit}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BankAccountFormPage;
