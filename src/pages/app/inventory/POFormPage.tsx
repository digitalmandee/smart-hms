import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useVendors } from "@/hooks/useVendors";
import { useBranches } from "@/hooks/useBranches";
import { useCreatePurchaseOrder, type PurchaseOrderItem } from "@/hooks/usePurchaseOrders";
import { usePurchaseRequest } from "@/hooks/usePurchaseRequests";
import { useRequisition } from "@/hooks/useRequisitions";
import { UnifiedPOItemsBuilder } from "@/components/inventory/UnifiedPOItemsBuilder";
import { StoreSelector } from "@/components/inventory/StoreSelector";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";

const poSchema = z.object({
  vendor_id: z.string().min(1, "Vendor is required"),
  branch_id: z.string().min(1, "Branch is required"),
  store_id: z.string().optional(),
  expected_delivery_date: z.string().optional(),
  terms: z.string().optional(),
  notes: z.string().optional(),
});

type POFormData = z.infer<typeof poSchema>;

export default function POFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vendorIdParam = searchParams.get("vendor_id");
  const fromPrId = searchParams.get("from_pr");
  const fromRequisitionId = searchParams.get("from_requisition");
  const { profile } = useAuth();

  const [items, setItems] = useState<PurchaseOrderItem[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("");

  const { data: vendors } = useVendors();
  const { data: branches } = useBranches();
  const createPO = useCreatePurchaseOrder();
  const { data: sourcePR } = usePurchaseRequest(fromPrId || "");
  const { data: sourceRequisition } = useRequisition(fromRequisitionId || "");
  const isSingleBranch = branches && branches.length === 1;
  const autoSelectedBranchId = profile?.branch_id || (isSingleBranch ? branches[0]?.id : "") || "";

  const form = useForm<POFormData>({
    resolver: zodResolver(poSchema),
    defaultValues: {
      vendor_id: vendorIdParam || "",
      branch_id: "",
      store_id: "",
      expected_delivery_date: "",
      terms: "",
      notes: "",
    },
  });

  // Auto-select branch from profile or single-branch org
  useEffect(() => {
    if (autoSelectedBranchId && !form.getValues("branch_id")) {
      form.setValue("branch_id", autoSelectedBranchId);
      setSelectedBranch(autoSelectedBranchId);
    }
  }, [autoSelectedBranchId, form]);

  // Pre-fill from PR
  useEffect(() => {
    if (sourcePR && sourcePR.items && items.length === 0) {
      // Set branch from PR
      if (sourcePR.branch_id) {
        form.setValue("branch_id", sourcePR.branch_id);
        setSelectedBranch(sourcePR.branch_id);
      }
      // Set store from PR
      if (sourcePR.store_id) {
        form.setValue("store_id", sourcePR.store_id);
      }
      // Set notes referencing PR
      form.setValue("notes", `From PR: ${sourcePR.pr_number}`);
      // Pre-fill items
      const prItems: PurchaseOrderItem[] = sourcePR.items.map((prItem) => ({
        item_id: prItem.item_id || "",
        medicine_id: (prItem as any).medicine_id || undefined,
        item_type: (prItem as any).medicine_id ? "medicine" as const : "inventory" as const,
        quantity: prItem.quantity_requested,
        unit_price: prItem.estimated_unit_cost,
        tax_percent: 0,
        discount_percent: 0,
        total_price: prItem.quantity_requested * prItem.estimated_unit_cost,
      }));
      setItems(prItems);
    }
  }, [sourcePR, form, items.length]);

  // Pre-fill from Requisition
  useEffect(() => {
    if (sourceRequisition && sourceRequisition.items && items.length === 0 && !fromPrId) {
      if (sourceRequisition.branch_id) {
        form.setValue("branch_id", sourceRequisition.branch_id);
        setSelectedBranch(sourceRequisition.branch_id);
      }
      if (sourceRequisition.from_store) {
        form.setValue("store_id", sourceRequisition.from_store.id);
      }
      form.setValue("notes", `From Requisition: ${sourceRequisition.requisition_number}`);
      const reqItems: PurchaseOrderItem[] = sourceRequisition.items.map((reqItem) => ({
        item_id: reqItem.item_id || "",
        medicine_id: reqItem.medicine_id || undefined,
        item_type: reqItem.medicine_id ? "medicine" as const : "inventory" as const,
        quantity: reqItem.quantity_approved || reqItem.quantity_requested,
        unit_price: 0,
        tax_percent: 0,
        discount_percent: 0,
        total_price: 0,
      }));
      setItems(reqItems);
    }
  }, [sourceRequisition, form, items.length, fromPrId]);

  const onSubmit = async (data: POFormData) => {
    if (items.length === 0) {
      return;
    }

    try {
      const result = await createPO.mutateAsync({
        vendor_id: data.vendor_id,
        branch_id: data.branch_id,
        store_id: data.store_id || undefined,
        expected_delivery_date: data.expected_delivery_date,
        terms: data.terms,
        notes: data.notes,
        items,
      });
      navigate(`/app/inventory/purchase-orders/${result.id}`);
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Purchase Order"
        description="Create a new purchase order"
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="vendor_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vendor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vendors?.map((vendor) => (
                            <SelectItem key={vendor.id} value={vendor.id}>
                              {vendor.name} ({vendor.vendor_code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!isSingleBranch && (
                <FormField
                  control={form.control}
                  name="branch_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch *</FormLabel>
                      <Select value={field.value} onValueChange={(v) => {
                        field.onChange(v);
                        setSelectedBranch(v);
                        form.setValue("store_id", "");
                      }}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {branches?.map((branch) => (
                            <SelectItem key={branch.id} value={branch.id}>
                              {branch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                )}

                <FormField
                  control={form.control}
                  name="store_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination Warehouse</FormLabel>
                      <FormControl>
                        <StoreSelector
                          branchId={selectedBranch || undefined}
                          value={field.value || "all"}
                          onChange={(v) => field.onChange(v === "all" ? "" : v)}
                          showAll
                          placeholder="Select warehouse"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expected_delivery_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Delivery Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <UnifiedPOItemsBuilder items={items} onChange={setItems} />
              {items.length === 0 && (
                <p className="text-sm text-destructive mt-2">
                  Add at least one item to the purchase order
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Terms & Conditions</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Payment terms, delivery terms, etc." rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Internal Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Notes for internal use..." rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createPO.isPending || items.length === 0}>
              {createPO.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Purchase Order
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
