import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, ArrowUpRight, ArrowDownLeft, ArrowLeft, Banknote } from "lucide-react";
import { format } from "date-fns";
import { formatCurrencyFull } from "@/lib/currency";
import { CashToBankDepositDialog } from "@/components/accounts/CashToBankDepositDialog";

const labels = {
  title: { en: "Bank Account Details", ur: "بینک اکاؤنٹ کی تفصیلات", ar: "تفاصيل الحساب البنكي" },
  accountInfo: { en: "Account Information", ur: "اکاؤنٹ کی معلومات", ar: "معلومات الحساب" },
  transactions: { en: "Recent Transactions", ur: "حالیہ لین دین", ar: "المعاملات الأخيرة" },
  bankName: { en: "Bank Name", ur: "بینک کا نام", ar: "اسم البنك" },
  accountNumber: { en: "Account Number", ur: "اکاؤنٹ نمبر", ar: "رقم الحساب" },
  holderName: { en: "Account Holder", ur: "اکاؤنٹ ہولڈر", ar: "صاحب الحساب" },
  accountType: { en: "Account Type", ur: "اکاؤنٹ قسم", ar: "نوع الحساب" },
  branch: { en: "Branch", ur: "برانچ", ar: "الفرع" },
  ifsc: { en: "IFSC Code", ur: "IFSC کوڈ", ar: "رمز IFSC" },
  swift: { en: "SWIFT Code", ur: "SWIFT کوڈ", ar: "رمز SWIFT" },
  openingBalance: { en: "Opening Balance", ur: "ابتدائی بیلنس", ar: "الرصيد الافتتاحي" },
  currentBalance: { en: "Current Balance", ur: "موجودہ بیلنس", ar: "الرصيد الحالي" },
  status: { en: "Status", ur: "حالت", ar: "الحالة" },
  defaultAccount: { en: "Default Account", ur: "ڈیفالٹ اکاؤنٹ", ar: "الحساب الافتراضي" },
  back: { en: "Back", ur: "واپس", ar: "رجوع" },
  noTransactions: { en: "No transactions found", ur: "کوئی لین دین نہیں ملا", ar: "لم يتم العثور على معاملات" },
  active: { en: "Active", ur: "فعال", ar: "نشط" },
  inactive: { en: "Inactive", ur: "غیر فعال", ar: "غير نشط" },
  yes: { en: "Yes", ur: "ہاں", ar: "نعم" },
  no: { en: "No", ur: "نہیں", ar: "لا" },
  notFound: { en: "Bank account not found", ur: "بینک اکاؤنٹ نہیں ملا", ar: "لم يتم العثور على الحساب البنكي" },
};

export default function BankAccountDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const lang = (profile as any)?.organization?.default_language || "en";
  const l = (key: keyof typeof labels) => (labels[key] as any)[lang] || (labels[key] as any).en;

  const { data: account, isLoading } = useQuery({
    queryKey: ["bank-account", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_accounts")
        .select(`*, branch:branches(id, name)`)
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: transactions } = useQuery({
    queryKey: ["bank-account-transactions", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_transactions")
        .select("*")
        .eq("bank_account_id", id!)
        .order("transaction_date", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">{l("notFound")}</p>
          <Button variant="outline" onClick={() => navigate("/app/accounts/bank-accounts")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {l("back")}
          </Button>
        </div>
      </div>
    );
  }

  const infoRows: { label: string; value: React.ReactNode }[] = [
    { label: l("bankName"), value: account.bank_name },
    { label: l("accountNumber"), value: account.account_number },
    { label: l("holderName"), value: account.account_holder_name || "—" },
    { label: l("accountType"), value: account.account_type },
    { label: l("branch"), value: (account as any).branch?.name || "—" },
    { label: l("ifsc"), value: account.ifsc_code || "—" },
    { label: l("swift"), value: account.swift_code || "—" },
    { label: l("openingBalance"), value: formatCurrencyFull(account.opening_balance || 0) },
    { label: l("currentBalance"), value: <span className="font-bold text-lg">{formatCurrencyFull(account.current_balance || 0)}</span> },
    { label: l("status"), value: <Badge variant={account.is_active ? "default" : "secondary"}>{account.is_active ? l("active") : l("inactive")}</Badge> },
    { label: l("defaultAccount"), value: account.is_default ? l("yes") : l("no") },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${account.bank_name} - ${account.account_number}`}
        description={l("title")}
        breadcrumbs={[
          { label: "Accounts", href: "/app/accounts" },
          { label: "Bank & Cash", href: "/app/accounts/bank-accounts" },
          { label: account.bank_name },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate("/app/accounts/bank-accounts")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {l("back")}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>{l("accountInfo")}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {infoRows.map((row, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                  <span className="text-sm text-muted-foreground">{row.label}</span>
                  <span className="text-sm font-medium">{row.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>{l("transactions")}</CardTitle>
          </CardHeader>
          <CardContent>
            {!transactions || transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {l("noTransactions")}
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${txn.credit_amount > 0 ? "bg-green-100" : "bg-red-100"}`}>
                        {txn.credit_amount > 0 ? (
                          <ArrowDownLeft className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{txn.description || "Transaction"}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(txn.transaction_date), "dd MMM yyyy")}
                          {txn.reference_number && ` • ${txn.reference_number}`}
                        </div>
                      </div>
                    </div>
                    <div className={`font-bold ${txn.credit_amount > 0 ? "text-green-600" : "text-red-600"}`}>
                      {txn.credit_amount > 0 ? "+" : "-"}
                      {formatCurrencyFull(txn.credit_amount || txn.debit_amount || 0)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
