import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Search, CheckCircle, Clock, AlertCircle, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/currency";
import {
  useReconciliationClaims,
  usePostToAccounts,
  getSettlementStatus,
  getAdjustmentAmount,
  type ReconciliationStatus,
} from "@/hooks/usePaymentReconciliation";

const statusConfig: Record<ReconciliationStatus, { label: string; variant: string; icon: any }> = {
  unreconciled: { label: "Unreconciled", variant: "secondary", icon: Clock },
  matched: { label: "Matched", variant: "default", icon: AlertCircle },
  posted: { label: "Posted", variant: "success", icon: CheckCircle },
};

export default function PaymentReconciliationPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [settlementFilter, setSettlementFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data: claims, isLoading } = useReconciliationClaims({
    settlementStatus: settlementFilter !== "all" ? (settlementFilter as ReconciliationStatus) : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const postToAccounts = usePostToAccounts();

  const filteredClaims =
    claims?.filter(
      (c) =>
        c.claim_number.toLowerCase().includes(search.toLowerCase()) ||
        c.patient_insurance?.patient?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.patient_insurance?.patient?.last_name?.toLowerCase().includes(search.toLowerCase())
    ) || [];

  const totalApproved = filteredClaims.reduce((s, c) => s + c.approved_amount, 0);
  const totalAdjustments = filteredClaims.reduce((s, c) => s + getAdjustmentAmount(c), 0);
  const totalPosted = filteredClaims.filter((c) => getSettlementStatus(c) === "posted").reduce((s, c) => s + c.approved_amount, 0);

  return (
    <div>
      <PageHeader
        title={t("era.title" as any, "Payment Reconciliation (ERA)")}
        description={t("era.description" as any, "Match NPHIES remittance responses to claims and post to accounts")}
        breadcrumbs={[
          { label: t("nav.billing"), href: "/app/billing" },
          { label: t("era.title" as any, "Payment Reconciliation") },
        ]}
      />

      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Approved</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalApproved)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Adjustments</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalAdjustments)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Posted</CardTitle>
              <BookOpen className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalPosted)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredClaims.filter((c) => getSettlementStatus(c) !== "posted").length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search claims..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={settlementFilter} onValueChange={setSettlementFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unreconciled">Unreconciled</SelectItem>
              <SelectItem value="matched">Matched</SelectItem>
              <SelectItem value="posted">Posted</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40" placeholder="From" />
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-40" placeholder="To" />
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Claim #</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Payer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Claimed</TableHead>
                    <TableHead className="text-right">Approved</TableHead>
                    <TableHead className="text-right">Adjustment</TableHead>
                    <TableHead>Settlement</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClaims.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No reconciliation records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClaims.map((claim) => {
                      const settlement = getSettlementStatus(claim);
                      const config = statusConfig[settlement];
                      const Icon = config.icon;
                      return (
                        <TableRow key={claim.id}>
                          <TableCell className="font-medium">{claim.claim_number}</TableCell>
                          <TableCell>
                            {claim.patient_insurance?.patient
                              ? `${claim.patient_insurance.patient.first_name} ${claim.patient_insurance.patient.last_name}`
                              : "-"}
                          </TableCell>
                          <TableCell>{claim.patient_insurance?.insurance_plan?.insurance_company?.name || "-"}</TableCell>
                          <TableCell>{format(new Date(claim.claim_date), "dd MMM yyyy")}</TableCell>
                          <TableCell className="text-right">{formatCurrency(claim.total_amount)}</TableCell>
                          <TableCell className="text-right text-green-600">{formatCurrency(claim.approved_amount)}</TableCell>
                          <TableCell className="text-right text-yellow-600">{formatCurrency(getAdjustmentAmount(claim))}</TableCell>
                          <TableCell>
                            <Badge variant={config.variant as any} className="gap-1">
                              <Icon className="h-3 w-3" />
                              {config.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {settlement === "matched" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => postToAccounts.mutate(claim.id)}
                                disabled={postToAccounts.isPending}
                              >
                                <BookOpen className="h-3.5 w-3.5 me-1" />
                                Post
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
