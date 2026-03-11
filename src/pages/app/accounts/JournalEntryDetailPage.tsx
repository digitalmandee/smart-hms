import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, FileText, Calendar, Hash, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";

const JournalEntryDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { formatCurrency } = useCurrencyFormatter();
  const navigate = useNavigate();

  const { data: entry, isLoading } = useQuery({
    queryKey: ["journal-entry", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("journal_entries")
        .select(`
          *,
          lines:journal_entry_lines(
            id,
            account:accounts(id, name, account_number),
            description,
            debit_amount,
            credit_amount
          ),
          created_by_profile:profiles!journal_entries_created_by_fkey(id, full_name),
          posted_by_profile:profiles!journal_entries_posted_by_fkey(id, full_name)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const totalDebits = entry?.lines?.reduce((sum: number, line: any) => sum + (line.debit_amount || 0), 0) || 0;
  const totalCredits = entry?.lines?.reduce((sum: number, line: any) => sum + (line.credit_amount || 0), 0) || 0;
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  const getStatusBadge = () => {
    if (entry?.is_posted) {
      return (
        <Badge className="bg-success/10 text-success border-success">
          <CheckCircle className="h-3 w-3 mr-1" />
          Posted
        </Badge>
      );
    }
    if (entry?.is_reversed) {
      return (
        <Badge variant="outline" className="text-muted-foreground">
          <AlertCircle className="h-3 w-3 mr-1" />
          Reversed
        </Badge>
      );
    }
    return (
      <Badge className="bg-warning/10 text-warning border-warning">
        <Clock className="h-3 w-3 mr-1" />
        Draft
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="space-y-6">
        <PageHeader title="Journal Entry Not Found" />
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">The journal entry you're looking for doesn't exist.</p>
            <Button variant="outline" onClick={() => navigate("/app/accounts/journal-entries")} className="mt-4">
              Back to Journal Entries
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader 
          title={`Journal Entry: ${entry.entry_number}`}
          description={entry.description || "Journal entry details"}
        />
      </div>

      {/* Entry Header */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Entry Number</p>
                <p className="font-medium">{entry.entry_number}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Entry Date</p>
                <p className="font-medium">{format(new Date(entry.entry_date), "dd MMM yyyy")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Reference</p>
                <p className="font-medium">{entry.reference_id ? `${entry.reference_type || "ref"}: ${String(entry.reference_id).slice(0, 8)}...` : "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              {getStatusBadge()}
            </div>
            {entry.posted_at && (
              <p className="text-xs text-muted-foreground mt-2">
                Posted: {format(new Date(entry.posted_at), "dd MMM yyyy HH:mm")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {entry.description && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{entry.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entry.lines?.map((line: any) => (
                <TableRow key={line.id}>
                  <TableCell>
                    <Link 
                      to={`/app/accounts/chart-of-accounts/${line.account?.id}`}
                      className="text-primary hover:underline"
                    >
                      {line.account?.account_number} - {line.account?.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{line.description || "-"}</TableCell>
                  <TableCell className="text-right font-mono">
                    {line.debit_amount > 0 ? formatCurrency(line.debit_amount) : "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {line.credit_amount > 0 ? formatCurrency(line.credit_amount) : "-"}
                  </TableCell>
                </TableRow>
              ))}
              {/* Totals Row */}
              <TableRow className="font-bold border-t-2">
                <TableCell colSpan={2} className="text-right">Totals:</TableCell>
                <TableCell className="text-right font-mono">Rs. {totalDebits.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono">Rs. {totalCredits.toLocaleString()}</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {/* Balance Check */}
          <div className={`mt-4 p-3 rounded-lg ${isBalanced ? 'bg-success/10' : 'bg-destructive/10'}`}>
            <div className="flex items-center gap-2">
              {isBalanced ? (
                <>
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-success font-medium">Entry is balanced</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-destructive font-medium">
                    Entry is not balanced. Difference: Rs. {Math.abs(totalDebits - totalCredits).toLocaleString()}
                  </span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 text-sm">
            <div>
              <p className="text-muted-foreground">Created By</p>
              <p>{entry.created_by_profile?.full_name || "System"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Created At</p>
              <p>{format(new Date(entry.created_at), "dd MMM yyyy HH:mm")}</p>
            </div>
            {entry.posted_by_profile && (
              <div>
                <p className="text-muted-foreground">Posted By</p>
                <p>{entry.posted_by_profile.full_name}</p>
              </div>
            )}
            {entry.reference_type && (
              <div>
                <p className="text-muted-foreground">Reference Type</p>
                <p className="capitalize">{entry.reference_type}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JournalEntryDetailPage;
