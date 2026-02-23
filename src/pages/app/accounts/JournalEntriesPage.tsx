import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Plus, FileText, Eye, Download } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { exportToCSV, formatDate, formatCurrency } from "@/lib/exportUtils";

const PAGE_SIZE = 25;

const JournalEntriesPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [refTypeFilter, setRefTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["journal-entries", profile?.organization_id, startDate, endDate, statusFilter, refTypeFilter, page],
    queryFn: async () => {
      if (!profile?.organization_id) return { entries: [], count: 0 };
      
      let query = supabase
        .from("journal_entries")
        .select(`
          *,
          created_by_profile:profiles!journal_entries_created_by_fkey(full_name),
          posted_by_profile:profiles!journal_entries_posted_by_fkey(full_name),
          journal_entry_lines(debit_amount, credit_amount)
        `, { count: "exact" })
        .eq("organization_id", profile.organization_id)
        .order("entry_date", { ascending: false });
      
      if (startDate) query = query.gte("entry_date", startDate);
      if (endDate) query = query.lte("entry_date", endDate);
      if (statusFilter === "posted") query = query.eq("is_posted", true);
      if (statusFilter === "draft") query = query.eq("is_posted", false);
      if (refTypeFilter !== "all") query = query.eq("reference_type", refTypeFilter);
      
      query = query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      
      const { data: entries, error, count } = await query;
      if (error) throw error;
      return { entries: entries || [], count: count || 0 };
    },
    enabled: !!profile?.organization_id,
  });

  const entries = data?.entries || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const filteredEntries = entries.filter(
    (entry: any) =>
      entry.entry_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRefLabel = (type: string | null, refId: string | null) => {
    if (!type) return "-";
    const labels: Record<string, string> = {
      invoice: "Invoice",
      shipment: "Shipment",
      stock_adjustment: "Stock Adj.",
      manual: "Manual",
    };
    return labels[type] || type;
  };

  const handleExport = () => {
    exportToCSV(filteredEntries, "journal-entries", [
      { key: "entry_number", header: "Entry #" },
      { key: "entry_date", header: "Date", format: (v: string) => formatDate(v) },
      { key: "description", header: "Description" },
      { key: "reference_type", header: "Reference Type" },
      { key: "is_posted", header: "Status", format: (v: boolean) => v ? "Posted" : "Draft" },
      { key: "journal_entry_lines", header: "Total Debit", format: (lines: any[]) => formatCurrency(lines?.reduce((s: number, l: any) => s + (l.debit_amount || 0), 0)) },
      { key: "journal_entry_lines", header: "Total Credit", format: (lines: any[]) => formatCurrency(lines?.reduce((s: number, l: any) => s + (l.credit_amount || 0), 0)) },
    ]);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Journal Entries"
        description="Manage accounting journal entries"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
            <Button onClick={() => navigate("/app/accounts/journal-entries/new")}>
              <Plus className="h-4 w-4 mr-2" /> New Entry
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-end flex-wrap">
            <div className="space-y-2">
              <Label>From</Label>
              <Input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(0); }} />
            </div>
            <div className="space-y-2">
              <Label>To</Label>
              <Input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(0); }} />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="posted">Posted</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={refTypeFilter} onValueChange={(v) => { setRefTypeFilter(v); setPage(0); }}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="invoice">Invoice</SelectItem>
                <SelectItem value="shipment">Shipment</SelectItem>
                <SelectItem value="stock_adjustment">Stock Adjustment</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Search entries..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-xs" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">All Entries ({totalCount})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading entries...</div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No journal entries found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entry #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry: any) => {
                    const totalDebit = entry.journal_entry_lines?.reduce((s: number, l: any) => s + (l.debit_amount || 0), 0) || 0;
                    const totalCredit = entry.journal_entry_lines?.reduce((s: number, l: any) => s + (l.credit_amount || 0), 0) || 0;
                    return (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.entry_number}</TableCell>
                        <TableCell>{format(new Date(entry.entry_date), "dd MMM yyyy")}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{entry.description || "-"}</TableCell>
                        <TableCell>
                          {entry.reference_type ? (
                            <Badge variant="outline">{getRefLabel(entry.reference_type, entry.reference_id)}</Badge>
                          ) : "-"}
                        </TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(totalDebit)}</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(totalCredit)}</TableCell>
                        <TableCell>
                          <Badge variant={entry.is_posted ? "default" : "secondary"}>
                            {entry.is_posted ? "Posted" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/app/accounts/journal-entries/${entry.id}`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page + 1} of {totalPages} ({totalCount} entries)
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
                    <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JournalEntriesPage;
