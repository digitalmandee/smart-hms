import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Receipt, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDentalT } from "@/lib/dental/i18n";

export default function BillingTab({ patientId }: { patientId: string }) {
  const { dt } = useDentalT();
  const { profile } = useAuth();

  const { data: invoices } = useQuery({
    queryKey: ["dental-billing-invoices", patientId, profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("id, invoice_number, invoice_date, total_amount, paid_amount, balance_amount, status")
        .eq("patient_id", patientId)
        .eq("organization_id", profile!.organization_id!)
        .order("invoice_date", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!patientId && !!profile?.organization_id,
  });

  const total = (invoices || []).reduce((s, i: any) => s + Number(i.total_amount || 0), 0);
  const balance = (invoices || []).reduce((s, i: any) => s + Number(i.balance_amount || 0), 0);

  return (
    <Card>
      <CardHeader className="pb-3 flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Receipt className="h-4 w-4" /> {dt("dw.tab.billing")}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{dt("dw.billing.total")}: {total.toFixed(2)}</Badge>
          <Badge variant={balance > 0 ? "destructive" : "outline"}>{dt("dw.billing.balance")}: {balance.toFixed(2)}</Badge>
          <Button asChild size="sm" className="gap-1.5">
            <Link to="/app/billing/invoices/new">
              <Plus className="h-4 w-4" /> {dt("dw.billing.new")}
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!invoices?.length ? (
          <p className="text-sm text-muted-foreground">{dt("dw.billing.none")}</p>
        ) : (
          <div className="space-y-2">
            {invoices.map((i: any) => (
              <Link
                key={i.id}
                to={`/app/billing/invoices/${i.id}`}
                className="flex items-center gap-3 p-2.5 border rounded-lg text-sm hover:bg-accent"
              >
                <span className="font-medium">{i.invoice_number}</span>
                <span className="text-muted-foreground">{i.invoice_date}</span>
                <Badge variant="outline" className="ms-auto">{String(i.status).replace(/_/g, " ")}</Badge>
                <span>{Number(i.total_amount || 0).toFixed(2)}</span>
                <span className={Number(i.balance_amount) > 0 ? "text-destructive" : "text-muted-foreground"}>
                  {Number(i.balance_amount || 0).toFixed(2)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
