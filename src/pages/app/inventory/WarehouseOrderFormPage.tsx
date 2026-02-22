import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDefaultStore } from "@/hooks/useDefaultStore";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";

export default function WarehouseOrderFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { defaultStoreId } = useDefaultStore();
  const qc = useQueryClient();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [requiredDate, setRequiredDate] = useState("");
  const [notes, setNotes] = useState("");

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await (supabase as any).from("warehouse_orders").insert({
        organization_id: profile!.organization_id,
        store_id: defaultStoreId,
        order_number: "",
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        required_date: requiredDate || null,
        notes,
        created_by: profile!.id,
        status: "draft",
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["warehouse-orders"] });
      toast.success("Order created");
      navigate(`/app/inventory/warehouse-orders/${data.id}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <PageHeader title="New Warehouse Order" />
      <Button variant="outline" onClick={() => navigate("/app/inventory/warehouse-orders")}>
        <ArrowLeft className="mr-2 h-4 w-4" />Back
      </Button>
      <Card>
        <CardHeader><CardTitle>Order Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Customer Name *</Label>
              <Input value={customerName} onChange={e => setCustomerName(e.target.value)} />
            </div>
            <div>
              <Label>Customer Phone</Label>
              <Input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>Customer Address</Label>
              <Input value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} />
            </div>
            <div>
              <Label>Required Date</Label>
              <Input type="date" value={requiredDate} onChange={e => setRequiredDate(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <Button onClick={() => createMutation.mutate()} disabled={!customerName || createMutation.isPending}>
            <Save className="mr-2 h-4 w-4" />Create Order
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
