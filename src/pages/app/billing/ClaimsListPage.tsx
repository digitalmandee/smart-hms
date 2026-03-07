import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Plus, Search, Eye, ClipboardList, 
  Clock, CheckCircle, XCircle, DollarSign, Send
} from "lucide-react";
import { useInsuranceClaims, useInsuranceStats } from "@/hooks/useInsurance";
import { useSubmitClaimToNphies } from "@/hooks/useNphiesConfig";
import { BatchSubmitDialog } from "@/components/insurance/BatchSubmitDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  draft: "secondary",
  submitted: "default",
  in_review: "default",
  approved: "success",
  partially_approved: "warning",
  rejected: "destructive",
  paid: "success",
  appealed: "warning",
};

export default function ClaimsListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const { data: claims, isLoading } = useInsuranceClaims({ 
    status: statusFilter !== "all" ? statusFilter : undefined 
  });
  const { data: stats } = useInsuranceStats();

  const filteredClaims = claims?.filter(c => 
    c.claim_number.toLowerCase().includes(search.toLowerCase()) ||
    c.patient_insurance?.patient?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.patient_insurance?.patient?.last_name?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const { t } = useTranslation();

  const draftClaims = filteredClaims.filter(c => c.status === 'draft' || c.status === 'submitted');
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    if (selectedIds.size === draftClaims.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(draftClaims.map(c => c.id)));
    }
  };
  const selectedClaims = filteredClaims.filter(c => selectedIds.has(c.id));

  const handleBatchSubmit = async (claimIds: string[]): Promise<{ success: string[]; failed: { id: string; error: string }[] }> => {
    const success: string[] = [];
    const failed: { id: string; error: string }[] = [];
    for (const cid of claimIds) {
      try {
        await submitToNphies.mutateAsync(cid);
        success.push(cid);
      } catch (e: any) {
        failed.push({ id: cid, error: e?.message || "Submission failed" });
      }
    }
    return { success, failed };
  };

  return (
    <div>
      <PageHeader
        title="Insurance Claims"
        description="Manage and track insurance claims"
        breadcrumbs={[
          { label: t('nav.billing'), href: "/app/billing" },
          { label: t('nav.claims') },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <Button variant="outline" onClick={() => setBatchDialogOpen(true)}>
                <Send className="mr-2 h-4 w-4" />
                Submit {selectedIds.size} to NPHIES
              </Button>
            )}
            <Button onClick={() => navigate("/app/billing/claims/new")}>
              <Plus className="mr-2 h-4 w-4" />
              New Claim
            </Button>
          </div>
        }
      />

      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_claims || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pending_claims || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.approved_claims || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.rejected_claims || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Approved</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats?.approved_amount || 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search claims..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="partially_approved">Partially Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={draftClaims.length > 0 && selectedIds.size === draftClaims.length}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Claim #</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Insurance</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Approved</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClaims.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No claims found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClaims.map((claim) => (
                      <TableRow key={claim.id}>
                        <TableCell>
                          {(claim.status === 'draft' || claim.status === 'submitted') && (
                            <Checkbox
                              checked={selectedIds.has(claim.id)}
                              onCheckedChange={() => toggleSelect(claim.id)}
                            />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{claim.claim_number}</TableCell>
                        <TableCell>
                          {claim.patient_insurance?.patient ? (
                            <div>
                              <div>{claim.patient_insurance.patient.first_name} {claim.patient_insurance.patient.last_name}</div>
                              <div className="text-sm text-muted-foreground">
                                {claim.patient_insurance.patient.patient_number}
                              </div>
                            </div>
                          ) : "-"}
                        </TableCell>
                        <TableCell>
                          {claim.patient_insurance?.insurance_plan?.insurance_company?.name || "-"}
                        </TableCell>
                        <TableCell>
                          {format(new Date(claim.claim_date), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(claim.total_amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(claim.approved_amount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusColors[claim.status] as "default" | "secondary" | "destructive" | "outline"}>
                            {claim.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/app/billing/claims/${claim.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <BatchSubmitDialog
        open={batchDialogOpen}
        onOpenChange={setBatchDialogOpen}
        claims={selectedClaims}
        onSubmit={handleBatchSubmit}
      />
    </div>
  );
}
