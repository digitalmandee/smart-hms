import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle2, ShieldCheck, FileSearch, RefreshCw } from "lucide-react";
import { format, startOfYear } from "date-fns";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useTrialBalanceHealth, useGlCoverageReport } from "@/hooks/useAccountingIntegrity";

export default function AccountingIntegrityPage() {
  const { formatCurrency } = useCurrencyFormatter();
  const today = new Date();
  const [startDate, setStartDate] = useState(format(startOfYear(today), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(today, "yyyy-MM-dd"));

  const tb = useTrialBalanceHealth(startDate, endDate);
  const cov = useGlCoverageReport(startDate, endDate);

  const tbRows = tb.data || [];
  const unbalanced = tbRows.filter(r => !r.is_balanced);
  const covRows = cov.data || [];
  const totalOrphans = covRows.reduce((s, r) => s + Number(r.orphan_count || 0), 0);

  const refresh = () => {
    tb.refetch();
    cov.refetch();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounting Integrity"
        description="Verify trial balance health and journal-entry coverage across every revenue, expense and inventory source."
        icon={ShieldCheck}
        action={
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        }
      />

      {/* Date range */}
      <Card>
        <CardContent className="pt-6 flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs text-muted-foreground">From</label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-44" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">To</label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-44" />
          </div>
        </CardContent>
      </Card>

      {/* Status banners */}
      <div className="grid gap-4 md:grid-cols-2">
        {tb.isLoading ? (
          <Skeleton className="h-24" />
        ) : unbalanced.length > 0 ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Trial balance is OUT OF BALANCE</AlertTitle>
            <AlertDescription>
              {unbalanced.length} month(s) have debit ≠ credit. Review the table below and post a correction.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <CheckCircle2 className="h-4 w-4 text-success" />
            <AlertTitle>Trial balance is balanced</AlertTitle>
            <AlertDescription>
              Every month in the selected range has Σ debits = Σ credits.
            </AlertDescription>
          </Alert>
        )}

        {cov.isLoading ? (
          <Skeleton className="h-24" />
        ) : totalOrphans > 0 ? (
          <Alert variant="destructive">
            <FileSearch className="h-4 w-4" />
            <AlertTitle>{totalOrphans} source row(s) without a journal entry</AlertTitle>
            <AlertDescription>
              Likely caused by a failed posting trigger. Investigate the rows in the coverage table.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <CheckCircle2 className="h-4 w-4 text-success" />
            <AlertTitle>Full GL coverage</AlertTitle>
            <AlertDescription>
              Every eligible source row has at least one matching journal entry.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Trial Balance Health */}
      <Card>
        <CardHeader>
          <CardTitle>Trial Balance Health (by month)</CardTitle>
          <CardDescription>
            Σ debits and Σ credits per month across posted journal entries. Difference must be 0.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tb.isLoading ? (
            <Skeleton className="h-40" />
          ) : tbRows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No posted entries in this range.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Entries</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                  <TableHead className="text-right">Difference</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tbRows.map((r) => (
                  <TableRow key={r.period_month} className={!r.is_balanced ? "bg-destructive/5" : ""}>
                    <TableCell>{format(new Date(r.period_month), "MMM yyyy")}</TableCell>
                    <TableCell className="text-right">{Number(r.entries_count).toLocaleString()}</TableCell>
                    <TableCell className="text-right">{formatCurrency(Number(r.total_debit))}</TableCell>
                    <TableCell className="text-right">{formatCurrency(Number(r.total_credit))}</TableCell>
                    <TableCell className={`text-right font-medium ${!r.is_balanced ? "text-destructive" : ""}`}>
                      {formatCurrency(Number(r.difference))}
                    </TableCell>
                    <TableCell>
                      {r.is_balanced ? (
                        <Badge variant="outline" className="text-success border-success">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Balanced
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <AlertTriangle className="h-3 w-3 mr-1" /> Out of balance
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* GL Coverage */}
      <Card>
        <CardHeader>
          <CardTitle>GL Source Coverage</CardTitle>
          <CardDescription>
            For each source module, how many eligible rows have a matching posted journal entry. Orphans mean a trigger
            failed to post — fix at the trigger level, never by inserting journals from the app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {cov.isLoading ? (
            <Skeleton className="h-40" />
          ) : covRows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No source rows in this range.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Eligible</TableHead>
                  <TableHead className="text-right">Posted</TableHead>
                  <TableHead className="text-right">Orphans</TableHead>
                  <TableHead className="text-right">Coverage %</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {covRows.map((r) => {
                  const expected = Number(r.expected_count) || 0;
                  const posted = Number(r.posted_count) || 0;
                  const orphans = Number(r.orphan_count) || 0;
                  const pct = expected > 0 ? Math.round((posted / expected) * 100) : 100;
                  return (
                    <TableRow key={r.source_type} className={orphans > 0 ? "bg-destructive/5" : ""}>
                      <TableCell className="font-medium">{r.source_label}</TableCell>
                      <TableCell className="text-right">{expected.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{posted.toLocaleString()}</TableCell>
                      <TableCell className={`text-right ${orphans > 0 ? "font-semibold text-destructive" : ""}`}>
                        {orphans.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">{pct}%</TableCell>
                      <TableCell>
                        {orphans === 0 ? (
                          <Badge variant="outline" className="text-success border-success">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Full coverage
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" /> {orphans} missing
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
