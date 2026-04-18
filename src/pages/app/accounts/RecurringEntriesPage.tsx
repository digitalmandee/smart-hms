import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Play, Zap } from "lucide-react";
import { useRecurringTemplates, useCreateRecurringTemplate, useGenerateRecurringEntries } from "@/hooks/useRecurringEntries";
import { useAutoPostRecurring } from "@/hooks/useAutoRecurring";
import { AccountPicker } from "@/components/accounts/AccountPicker";

import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";

export default function RecurringEntriesPage() {
  const { t } = useTranslation();
  const { data: templates, isLoading } = useRecurringTemplates();
  const createMutation = useCreateRecurringTemplate();
  const generateMutation = useGenerateRecurringEntries();
  const autoPostMutation = useAutoPostRecurring();
  
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    template_name: "",
    description: "",
    frequency: "monthly",
    start_date: "",
    end_date: "",
    lines: [{ account_id: "", debit_amount: "", credit_amount: "", description: "" }],
  });

  const addLine = () => setForm(p => ({ ...p, lines: [...p.lines, { account_id: "", debit_amount: "", credit_amount: "", description: "" }] }));
  const updateLine = (i: number, field: string, value: string) => {
    const newLines = [...form.lines];
    (newLines[i] as any)[field] = value;
    setForm(p => ({ ...p, lines: newLines }));
  };

  const handleCreate = () => {
    createMutation.mutate({
      template_name: form.template_name,
      description: form.description || undefined,
      frequency: form.frequency,
      start_date: form.start_date,
      end_date: form.end_date || undefined,
      lines: form.lines.filter(l => l.account_id).map(l => ({
        account_id: l.account_id,
        debit_amount: parseFloat(l.debit_amount || "0"),
        credit_amount: parseFloat(l.credit_amount || "0"),
        description: l.description,
      })),
    }, {
      onSuccess: () => {
        setOpen(false);
        setForm({ template_name: "", description: "", frequency: "monthly", start_date: "", end_date: "", lines: [{ account_id: "", debit_amount: "", credit_amount: "", description: "" }] });
      },
    });
  };

  return (
    <div>
      <PageHeader
        title={t("finance.recurringEntries")}
        description={t("finance.recurringEntriesDesc")}
        breadcrumbs={[
          { label: t("nav.accounts"), href: "/app/accounts" },
          { label: t("finance.recurringEntries") },
        ]}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => autoPostMutation.mutate()}
              disabled={autoPostMutation.isPending}
            >
              <Zap className="h-4 w-4 mr-2" />
              {autoPostMutation.isPending ? t("common.loading") : "Auto-post Due"}
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />{t("finance.newTemplate")}</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{t("finance.createRecurringTemplate")}</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>{t("common.name")}</Label><Input value={form.template_name} onChange={e => setForm(p => ({ ...p, template_name: e.target.value }))} placeholder="Monthly Rent" /></div>
                    <div>
                      <Label>{t("finance.frequency")}</Label>
                      <Select value={form.frequency} onValueChange={v => setForm(p => ({ ...p, frequency: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">{t("finance.monthly")}</SelectItem>
                          <SelectItem value="quarterly">{t("finance.quarterly")}</SelectItem>
                          <SelectItem value="yearly">{t("finance.yearly")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div><Label>{t("finance.description")}</Label><Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>{t("finance.startDate")}</Label><Input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} /></div>
                    <div><Label>{t("finance.endDate")}</Label><Input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} /></div>
                  </div>

                  <div>
                    <Label>{t("finance.journalLines")}</Label>
                    <p className="text-xs text-muted-foreground mb-2">Total debits must equal total credits for auto-post to succeed.</p>
                    {form.lines.map((line, i) => (
                      <div key={i} className="grid grid-cols-[2fr_1fr_1fr_2fr] gap-2 mt-2 items-start">
                        <AccountPicker
                          value={line.account_id || undefined}
                          onChange={(id) => updateLine(i, "account_id", id || "")}
                          postingOnly
                          placeholder={t("finance.accountId")}
                        />
                        <Input placeholder={t("finance.debit")} type="number" value={line.debit_amount} onChange={e => updateLine(i, "debit_amount", e.target.value)} />
                        <Input placeholder={t("finance.credit")} type="number" value={line.credit_amount} onChange={e => updateLine(i, "credit_amount", e.target.value)} />
                        <Input placeholder={t("finance.description")} value={line.description} onChange={e => updateLine(i, "description", e.target.value)} />
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addLine} className="mt-2">{t("finance.addLine")}</Button>
                  </div>

                  <Button onClick={handleCreate} disabled={!form.template_name || !form.start_date || createMutation.isPending} className="w-full">
                    {createMutation.isPending ? t("common.loading") : t("finance.createTemplate")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.name")}</TableHead>
                  <TableHead>{t("finance.frequency")}</TableHead>
                  <TableHead>{t("finance.nextRun")}</TableHead>
                  <TableHead>{t("finance.lastRun")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead>{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(templates || []).map((tmpl: any) => (
                  <TableRow key={tmpl.id}>
                    <TableCell className="font-medium">{tmpl.template_name}</TableCell>
                    <TableCell className="capitalize">{tmpl.frequency}</TableCell>
                    <TableCell>{tmpl.next_run_date ? format(new Date(tmpl.next_run_date), "dd MMM yyyy") : "—"}</TableCell>
                    <TableCell>{tmpl.last_run_date ? format(new Date(tmpl.last_run_date), "dd MMM yyyy") : "—"}</TableCell>
                    <TableCell><Badge variant={tmpl.is_active ? "default" : "secondary"}>{tmpl.is_active ? t("finance.active") : t("finance.inactive")}</Badge></TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => generateMutation.mutate(tmpl.id)} disabled={generateMutation.isPending}>
                        <Play className="h-3 w-3 mr-1" />{t("finance.generate")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!templates || templates.length === 0) && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">{t("finance.noTemplates")}</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
