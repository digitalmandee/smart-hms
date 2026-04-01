import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/lib/i18n";
import { useCountryConfig } from "@/contexts/CountryConfigContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  FileText,
  CreditCard,
  Wallet,
  ChevronDown,
  ChevronRight,
  Download,
  Printer,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

interface PatientFinancialLedgerProps {
  patientId: string;
}

interface LedgerEntry {
  id: string;
  date: string;
  type: "invoice" | "payment" | "deposit";
  reference: string;
  description: string;
  debit: number;
  credit: number;
  journalEntryId?: string;
  journalEntryNumber?: string;
  journalLines?: { account_name: string; debit_amount: number; credit_amount: number }[];
}

export function PatientFinancialLedger({ patientId }: PatientFinancialLedgerProps) {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const { currency_code } = useCountryConfig();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const orgId = profile?.organization_id;

  // Fetch invoices
  const { data: invoices, isLoading: loadingInv } = useQuery({
    queryKey: ["patient-ledger-invoices", orgId, patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("id, invoice_number, invoice_date, total_amount, status, notes")
        .eq("organization_id", orgId!)
        .eq("patient_id", patientId)
        .order("invoice_date", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!orgId,
  });

  // Fetch payments via invoices
  const invoiceIds = useMemo(() => invoices?.map((i) => i.id) || [], [invoices]);

  const { data: payments, isLoading: loadingPay } = useQuery({
    queryKey: ["patient-ledger-payments", orgId, patientId, invoiceIds],
    queryFn: async () => {
      if (!invoiceIds.length) return [];
      const { data, error } = await supabase
        .from("payments")
        .select("id, reference_number, payment_date, amount, payment_method_id, notes, invoice_id")
        .in("invoice_id", invoiceIds)
        .order("payment_date", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!orgId && invoiceIds.length > 0,
  });

  // Fetch deposits
  const { data: deposits, isLoading: loadingDep } = useQuery({
    queryKey: ["patient-ledger-deposits", orgId, patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_deposits")
        .select("id, amount, type, reference_number, notes, created_at, status")
        .eq("organization_id", orgId!)
        .eq("patient_id", patientId)
        .eq("status", "completed")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!orgId,
  });

  // Fetch journal entries linked to this patient's transactions
  const allRefIds = useMemo(() => {
    const ids: string[] = [];
    invoices?.forEach((i) => ids.push(i.id));
    payments?.forEach((p) => ids.push(p.id));
    deposits?.forEach((d) => ids.push(d.id));
    return ids;
  }, [invoices, payments, deposits]);

  const { data: journalEntries } = useQuery({
    queryKey: ["patient-ledger-journals", orgId, allRefIds],
    queryFn: async () => {
      if (!allRefIds.length) return [];
      const { data, error } = await supabase
        .from("journal_entries")
        .select("id, entry_number, reference_type, reference_id, journal_entry_lines(account_id, debit_amount, credit_amount, accounts(name))")
        .eq("organization_id", orgId!)
        .in("reference_id", allRefIds) as any;
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!orgId && allRefIds.length > 0,
  });

  const journalMap = useMemo(() => {
    const map = new Map<string, { id: string; number: string; lines: any[] }>();
    journalEntries?.forEach((je: any) => {
      map.set(je.reference_id, {
        id: je.id,
        number: je.entry_number,
        lines: (je.journal_entry_lines || []).map((l: any) => ({
          account_name: l.accounts?.name || "Unknown",
          debit_amount: Number(l.debit_amount) || 0,
          credit_amount: Number(l.credit_amount) || 0,
        })),
      });
    });
    return map;
  }, [journalEntries]);

  // Build unified ledger
  const ledgerEntries = useMemo<LedgerEntry[]>(() => {
    const entries: LedgerEntry[] = [];

    invoices?.forEach((inv) => {
      const je = journalMap.get(inv.id);
      entries.push({
        id: inv.id,
        date: inv.invoice_date,
        type: "invoice",
        reference: inv.invoice_number,
        description: inv.notes || t("ledger.invoiceBilled"),
        debit: Number(inv.total_amount) || 0,
        credit: 0,
        journalEntryId: je?.id,
        journalEntryNumber: je?.number,
        journalLines: je?.lines,
      });
    });

    payments?.forEach((pay) => {
      const je = journalMap.get(pay.id);
      entries.push({
        id: pay.id,
        date: pay.payment_date || "",
        type: "payment",
        reference: pay.reference_number || "-",
        description: t("ledger.payment"),
        debit: 0,
        credit: Number(pay.amount) || 0,
        journalEntryId: je?.id,
        journalEntryNumber: je?.number,
        journalLines: je?.lines,
      });
    });

    deposits?.forEach((dep) => {
      const je = journalMap.get(dep.id);
      const isRefund = dep.type === "refund";
      entries.push({
        id: dep.id,
        date: dep.created_at?.split("T")[0] || "",
        type: "deposit",
        reference: dep.reference_number || "-",
        description: isRefund ? t("ledger.depositRefund") : dep.type === "applied" ? t("ledger.depositApplied") : t("ledger.deposit"),
        debit: isRefund ? Number(dep.amount) : 0,
        credit: !isRefund ? Number(dep.amount) : 0,
        journalEntryId: je?.id,
        journalEntryNumber: je?.number,
        journalLines: je?.lines,
      });
    });

    entries.sort((a, b) => a.date.localeCompare(b.date));
    return entries;
  }, [invoices, payments, deposits, journalMap, t]);

  // Apply filters
  const filtered = useMemo(() => {
    return ledgerEntries.filter((e) => {
      if (typeFilter !== "all" && e.type !== typeFilter) return false;
      if (dateFrom && e.date < dateFrom) return false;
      if (dateTo && e.date > dateTo) return false;
      return true;
    });
  }, [ledgerEntries, typeFilter, dateFrom, dateTo]);

  // Summary
  const summary = useMemo(() => {
    const totalBilled = ledgerEntries.filter((e) => e.type === "invoice").reduce((s, e) => s + e.debit, 0);
    const totalPaid = ledgerEntries.filter((e) => e.type === "payment").reduce((s, e) => s + e.credit, 0);
    const totalDeposits = ledgerEntries.filter((e) => e.type === "deposit" && e.credit > 0).reduce((s, e) => s + e.credit, 0);
    return { totalBilled, totalPaid, outstanding: totalBilled - totalPaid, deposits: totalDeposits };
  }, [ledgerEntries]);

  const fmt = (n: number) => `${currency_code} ${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  const isLoading = loadingInv || loadingPay || loadingDep;

  // CSV export
  const exportCSV = () => {
    const headers = ["Date", "Type", "Reference", "Description", "Debit", "Credit", "GL Entry"];
    const rows = filtered.map((e) => [
      e.date, e.type, e.reference, e.description,
      e.debit || "", e.credit || "", e.journalEntryNumber || "",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `patient-ledger-${patientId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const typeBadge = (type: string) => {
    const colors: Record<string, string> = {
      invoice: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      payment: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      deposit: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    };
    const icons: Record<string, any> = { invoice: FileText, payment: CreditCard, deposit: Wallet };
    const Icon = icons[type] || FileText;
    return (
      <Badge variant="outline" className={`gap-1 ${colors[type] || ""}`}>
        <Icon className="h-3 w-3" />
        {t(`ledger.type.${type}` as any)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Running balance
  let runningBalance = 0;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{t("ledger.totalBilled")}</p>
            <p className="text-lg font-bold">{fmt(summary.totalBilled)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{t("ledger.totalPaid")}</p>
            <p className="text-lg font-bold text-green-600">{fmt(summary.totalPaid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{t("ledger.outstanding")}</p>
            <p className={`text-lg font-bold ${summary.outstanding > 0 ? "text-destructive" : "text-green-600"}`}>
              {fmt(summary.outstanding)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{t("ledger.depositsBalance")}</p>
            <p className="text-lg font-bold text-purple-600">{fmt(summary.deposits)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.all")}</SelectItem>
            <SelectItem value="invoice">{t("ledger.type.invoice")}</SelectItem>
            <SelectItem value="payment">{t("ledger.type.payment")}</SelectItem>
            <SelectItem value="deposit">{t("ledger.type.deposit")}</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-[150px]" placeholder={t("common.date")} />
        <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-[150px]" />
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-1" />
            {t("common.export")}
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-1" />
            {t("common.print")}
          </Button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>{t("common.date")}</TableHead>
              <TableHead>{t("ledger.type.label")}</TableHead>
              <TableHead>{t("ledger.reference")}</TableHead>
              <TableHead>{t("ledger.description")}</TableHead>
              <TableHead className="text-right">{t("ledger.debit")}</TableHead>
              <TableHead className="text-right">{t("ledger.credit")}</TableHead>
              <TableHead className="text-right">{t("ledger.balance")}</TableHead>
              <TableHead>{t("ledger.glEntry")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center h-24 text-muted-foreground">
                  {t("ledger.noTransactions")}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((entry) => {
                runningBalance += entry.debit - entry.credit;
                const isExpanded = expandedRow === entry.id;
                return (
                  <>
                    <TableRow
                      key={entry.id}
                      className={`cursor-pointer hover:bg-muted/50 ${isExpanded ? "bg-muted/30" : ""}`}
                      onClick={() => setExpandedRow(isExpanded ? null : entry.id)}
                    >
                      <TableCell>
                        {entry.journalLines?.length ? (
                          isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                        ) : null}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{format(new Date(entry.date), "MMM dd, yyyy")}</TableCell>
                      <TableCell>{typeBadge(entry.type)}</TableCell>
                      <TableCell className="font-mono text-xs">{entry.reference}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{entry.description}</TableCell>
                      <TableCell className="text-right font-mono">
                        {entry.debit > 0 ? fmt(entry.debit) : "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-green-600">
                        {entry.credit > 0 ? fmt(entry.credit) : "-"}
                      </TableCell>
                      <TableCell className={`text-right font-mono font-semibold ${runningBalance > 0 ? "text-destructive" : "text-green-600"}`}>
                        {fmt(runningBalance)}
                      </TableCell>
                      <TableCell>
                        {entry.journalEntryNumber ? (
                          <Link
                            to={`/app/accounts/journal-entries/${entry.journalEntryId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            {entry.journalEntryNumber}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                    {isExpanded && entry.journalLines && (
                      <TableRow key={`${entry.id}-detail`} className="bg-muted/20">
                        <TableCell colSpan={9}>
                          <div className="py-2 px-4">
                            <p className="text-xs font-semibold mb-2 text-muted-foreground">{t("ledger.journalDetails")}</p>
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="text-muted-foreground">
                                  <th className="text-left py-1">{t("ledger.account")}</th>
                                  <th className="text-right py-1">{t("ledger.debit")}</th>
                                  <th className="text-right py-1">{t("ledger.credit")}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {entry.journalLines.map((line, i) => (
                                  <tr key={i} className="border-t border-border/50">
                                    <td className="py-1">{line.account_name}</td>
                                    <td className="text-right py-1 font-mono">
                                      {line.debit_amount > 0 ? fmt(line.debit_amount) : "-"}
                                    </td>
                                    <td className="text-right py-1 font-mono">
                                      {line.credit_amount > 0 ? fmt(line.credit_amount) : "-"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })
            )}
            {/* Totals row */}
            {filtered.length > 0 && (
              <TableRow className="bg-muted/50 font-bold">
                <TableCell colSpan={5} className="text-right">{t("common.total")}</TableCell>
                <TableCell className="text-right font-mono">
                  {fmt(filtered.reduce((s, e) => s + e.debit, 0))}
                </TableCell>
                <TableCell className="text-right font-mono text-green-600">
                  {fmt(filtered.reduce((s, e) => s + e.credit, 0))}
                </TableCell>
                <TableCell className="text-right font-mono font-semibold">
                  {fmt(runningBalance)}
                </TableCell>
                <TableCell />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
