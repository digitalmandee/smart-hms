import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/PageHeader";
import { ArrowLeft, Save, Package, Loader2 } from "lucide-react";
import { usePurchaseOrders, usePurchaseOrder } from "@/hooks/usePurchaseOrders";
import { useCreateGRN, GRNItem } from "@/hooks/useGRN";
import { useBranches } from "@/hooks/useBranches";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { toast } from "sonner";

const formSchema = z.object({
  po_id: z.string().min(1, "Please select a purchase order"),
  branch_id: z.string().min(1, "Branch is required"),
  received_date: z.string().min(1, "Received date is required"),
  invoice_number: z.string().optional(),
  invoice_amount: z.coerce.number().optional(),
  notes: z.string().optional(),
});

interface LocalGRNItem {
  po_item_id: string;
  item_type: 'inventory' | 'medicine';
  item_id?: string;
  medicine_id?: string;
  item_name: string;
  ordered_quantity: number;
  quantity_received: number;
  batch_number: string;
  expiry_date: string;
  unit_cost: number;
  selling_price: number;
}

export default function GRNFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedPOId = searchParams.get("poId");
  
  const { profile } = useAuth();
  const { data: branches } = useBranches();
  const { data: purchaseOrders } = usePurchaseOrders({ status: "ordered" });
  const createGRN = useCreateGRN();

  const [selectedPOId, setSelectedPOId] = useState<string>(preselectedPOId || "");
  const [grnItems, setGrnItems] = useState<LocalGRNItem[]>([]);

  const { data: selectedPO } = usePurchaseOrder(selectedPOId);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      po_id: preselectedPOId || "",
      branch_id: profile?.branch_id || "",
      received_date: format(new Date(), "yyyy-MM-dd"),
      invoice_number: "",
      invoice_amount: 0,
      notes: "",
    },
  });

  // When PO is selected, populate items
  useEffect(() => {
    if (selectedPO?.items) {
      const items: LocalGRNItem[] = selectedPO.items.map((item) => ({
        po_item_id: item.id!,
        item_type: item.item_type || 'inventory',
        item_id: item.item_id,
        medicine_id: item.medicine_id,
        item_name: item.item_type === 'medicine' 
          ? (item.medicine?.name || "Unknown Medicine")
          : (item.item?.name || "Unknown Item"),
        ordered_quantity: item.quantity,
        quantity_received: item.quantity - (item.received_quantity || 0),
        batch_number: "",
        expiry_date: "",
        unit_cost: item.unit_price,
        selling_price: item.unit_price, // Default selling price = cost
      }));
      setGrnItems(items.filter((i) => i.quantity_received > 0));
    }
  }, [selectedPO]);

  const handlePOChange = (poId: string) => {
    setSelectedPOId(poId);
    form.setValue("po_id", poId);
  };

  const updateItem = (index: number, field: keyof LocalGRNItem, value: string | number) => {
    setGrnItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (grnItems.length === 0) {
      toast.error("No items to receive");
      return;
    }

    const itemsWithQty = grnItems.filter((i) => i.quantity_received > 0);
    if (itemsWithQty.length === 0) {
      toast.error("Please enter received quantities");
      return;
    }

    try {
      const grnItemsToSubmit: GRNItem[] = itemsWithQty.map((item) => ({
        po_item_id: item.po_item_id,
        item_type: item.item_type,
        item_id: item.item_type === 'inventory' ? item.item_id : undefined,
        medicine_id: item.item_type === 'medicine' ? item.medicine_id : undefined,
        quantity_received: item.quantity_received,
        quantity_accepted: item.quantity_received,
        quantity_rejected: 0,
        batch_number: item.batch_number || null,
        expiry_date: item.expiry_date || null,
        unit_cost: item.unit_cost,
        selling_price: item.item_type === 'medicine' ? item.selling_price : null,
      }));

      await createGRN.mutateAsync({
        vendor_id: selectedPO!.vendor_id,
        branch_id: values.branch_id,
        purchase_order_id: values.po_id,
        invoice_number: values.invoice_number || undefined,
        invoice_amount: values.invoice_amount || undefined,
        notes: values.notes || undefined,
        items: grnItemsToSubmit,
      });
      navigate("/app/inventory/grn");
    } catch {
      // Error handled by mutation
    }
  };

  const totalAmount = grnItems.reduce(
    (sum, item) => sum + item.quantity_received * item.unit_cost,
    0
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Goods Received Note"
        description="Record items received against a purchase order"
      />

      <Button variant="outline" onClick={() => navigate("/app/inventory/grn")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to GRN List
      </Button>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>GRN Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="po_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Order *</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={handlePOChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select PO" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {purchaseOrders?.map((po) => (
                          <SelectItem key={po.id} value={po.id}>
                            {po.po_number} - {po.vendor?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="branch_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Receiving Branch *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
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

              <FormField
                control={form.control}
                name="received_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Received Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invoice_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor Invoice Number</FormLabel>
                    <FormControl>
                      <Input placeholder="INV-12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invoice_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Items Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Items to Receive
              </CardTitle>
            </CardHeader>
            <CardContent>
              {grnItems.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="w-24">Ordered</TableHead>
                      <TableHead className="w-32">Received Qty *</TableHead>
                      <TableHead className="w-32">Batch No.</TableHead>
                      <TableHead className="w-36">Expiry Date</TableHead>
                      <TableHead className="w-24 text-right">Unit Cost</TableHead>
                      <TableHead className="w-28 text-right">Sell Price</TableHead>
                      <TableHead className="w-28 text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grnItems.map((item, index) => (
                      <TableRow key={item.po_item_id}>
                        <TableCell className="font-medium">
                          {item.item_name}
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            item.item_type === 'medicine' 
                              ? 'bg-primary/10 text-primary' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {item.item_type === 'medicine' ? 'Medicine' : 'Inventory'}
                          </span>
                        </TableCell>
                        <TableCell>{item.ordered_quantity}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max={item.ordered_quantity}
                            value={item.quantity_received}
                            onChange={(e) =>
                              updateItem(index, "quantity_received", Number(e.target.value))
                            }
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Batch"
                            value={item.batch_number}
                            onChange={(e) =>
                              updateItem(index, "batch_number", e.target.value)
                            }
                            className="w-28"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="date"
                            value={item.expiry_date}
                            onChange={(e) =>
                              updateItem(index, "expiry_date", e.target.value)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          Rs. {item.unit_cost.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {item.item_type === 'medicine' ? (
                            <Input
                              type="number"
                              min={0}
                              step={0.01}
                              value={item.selling_price}
                              onChange={(e) =>
                                updateItem(index, "selling_price", Number(e.target.value))
                              }
                              className="w-24"
                            />
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          Rs. {(item.quantity_received * item.unit_cost).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a purchase order to load items</p>
                </div>
              )}

              {grnItems.length > 0 && (
                <div className="mt-4 flex justify-end">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-2xl font-bold">
                      Rs. {totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Any notes about this goods receipt..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/app/inventory/grn")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createGRN.isPending}>
              {createGRN.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Create GRN
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
