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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, CheckCircle, XCircle, ArrowUpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";

function usePDCRegister() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["pdc-register", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pdc_register")
        .select("*")
        .eq("organization_id", profile!.organization_id!)
        .order("cheque_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });
}

function useCreatePDC() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (values: {
      cheque_number: string;
      cheque_date: string;
      party_name: string;
      amount: number;
      pdc_type: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("pdc_register")
        .insert({
          organization_id: profile!.organization_id!,
          branch_id: profile!.branch_id,
          ...values,
          created_by: profile!.id,
        })
        .select();
      if (error) throw error;
      return data?.[0];
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pdc-register"] });
      toast.success("PDC registered");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

function useUpdatePDCStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: any = { status };
      if (status === "deposited") updates.deposited_at = new Date().toISOString();
      if (status === "cleared") updates.cleared_at = new Date().toISOString();
      if (status === "bounced") updates.bounced_at = new Date().toISOString();
      const { error } = await supabase.from("pdc_register").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pdc-register"] });
      toast.success("PDC status updated");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

const statusColors: Record<string, string> = {
  received: "default",
  deposited: "secondary",
  cleared: "default",
  bounced: "destructive",
  cancelled: "outline",
};

export default function PDCRegisterPage() {
  const { t } = useTranslation();
  const { data: pdcs, isLoading } = usePDCRegister();
  const createMutation = useCreatePDC();
  const updateStatus = useUpdatePDCStatus();
  const { formatCurrency } = useCurrencyFormatter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    cheque_number: "", cheque_date: "", party_name: "", amount: "", pdc_type: "received", notes: "",
  });

  const handleCreate = () => {
    createMutation.mutate({
      cheque_number: form.cheque_number,
      cheque_date: form.cheque_date,
      party_name: form.party_name,
      amount: parseFloat(form.amount),
      pdc_type: form.pdc_type,
      notes: form.notes || undefined,
    }, {
      onSuccess: () => {
        setOpen(false);
        setForm({ cheque_number: "", cheque_date: "", party_name: "", amount: "", pdc_type: "received", notes: "" });
      },
    });
  };

  const received = (pdcs || []).filter((p: any) => p.pdc_type === "received");
  const issued = (pdcs || []).filter((p: any) => p.pdc_type === "issued");

  const renderTable = (items: any[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("finance.chequeNo")}</TableHead>
          <TableHead>{t("finance.chequeDate")}</TableHead>
          <TableHead>{t("finance.partyName")}</TableHead>
          <TableHead className="text-right">{t("common.amount")}</TableHead>
          <TableHead>{t("common.status")}</TableHead>
          <TableHead>{t("common.actions")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((pdc: any) => (
          <TableRow key={pdc.id}>
            <TableCell className="font-mono">{pdc.cheque_number}</TableCell>
            <TableCell>{format(new Date(pdc.cheque_date), "dd MMM yyyy")}</TableCell>
            <TableCell>{pdc.party_name}</TableCell>
            <TableCell className="text-right font-medium">{formatCurrency(pdc.amount)}</TableCell>
            <TableCell>
              <Badge variant={statusColors[pdc.status] as any || "default"} className="capitalize">{pdc.status}</Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                {pdc.status === "received" && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: pdc.id, status: "deposited" })}>
                    <ArrowUpCircle className="h-3 w-3 mr-1" />{t("finance.deposit")}
                  </Button>
                )}
                {pdc.status === "deposited" && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: pdc.id, status: "cleared" })}>
                      <CheckCircle className="h-3 w-3 mr-1" />{t("finance.clear")}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => updateStatus.mutate({ id: pdc.id, status: "bounced" })}>
                      <XCircle className="h-3 w-3 mr-1" />{t("finance.bounce")}
                    </Button>
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
        {items.length === 0 && (
          <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">{t("finance.noPDCs")}</TableCell></TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div>
      <PageHeader
        title={t("finance.pdcRegister")}
        description={t("finance.pdcRegisterDesc")}
        breadcrumbs={[
          { label: t("nav.accounts"), href: "/app/accounts" },
          { label: t("finance.pdcRegister") },
        ]}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />{t("finance.addPDC")}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t("finance.registerPDC")}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>{t("finance.chequeNo")}</Label><Input value={form.cheque_number} onChange={e => setForm(p => ({ ...p, cheque_number: e.target.value }))} /></div>
                  <div><Label>{t("finance.chequeDate")}</Label><Input type="date" value={form.cheque_date} onChange={e => setForm(p => ({ ...p, cheque_date: e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>{t("finance.partyName")}</Label><Input value={form.party_name} onChange={e => setForm(p => ({ ...p, party_name: e.target.value }))} /></div>
                  <div><Label>{t("common.amount")}</Label><Input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} /></div>
                </div>
                <div>
                  <Label>{t("finance.type")}</Label>
                  <Select value={form.pdc_type} onValueChange={v => setForm(p => ({ ...p, pdc_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="received">{t("finance.received")}</SelectItem>
                      <SelectItem value="issued">{t("finance.issued")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>{t("common.notes")}</Label><Input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
                <Button onClick={handleCreate} disabled={!form.cheque_number || !form.cheque_date || !form.party_name || !form.amount || createMutation.isPending} className="w-full">
                  {createMutation.isPending ? t("common.loading") : t("finance.registerPDC")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Tabs defaultValue="received">
              <TabsList>
                <TabsTrigger value="received">{t("finance.received")} ({received.length})</TabsTrigger>
                <TabsTrigger value="issued">{t("finance.issued")} ({issued.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="received">{renderTable(received)}</TabsContent>
              <TabsContent value="issued">{renderTable(issued)}</TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
