import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { ArrowLeft, Save, Plus, Trash2, Package, Loader2 } from "lucide-react";
import { useInventoryItems } from "@/hooks/useInventory";
import { useCreateRequisition } from "@/hooks/useRequisitions";
import { useBranches } from "@/hooks/useBranches";
import { useAuth } from "@/contexts/AuthContext";
import { format, addDays } from "date-fns";

const formSchema = z.object({
  branch_id: z.string().min(1, "Branch is required"),
  department: z.string().min(1, "Department is required"),
  required_date: z.string().min(1, "Required date is required"),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  notes: z.string().optional(),
});

interface RequisitionItem {
  id: string;
  item_id: string;
  item_name: string;
  requested_quantity: number;
  unit_of_measure: string;
  notes: string;
}

const DEPARTMENTS = [
  "Emergency",
  "ICU",
  "General Ward",
  "Surgery",
  "Pharmacy",
  "Laboratory",
  "Radiology",
  "OPD",
  "Administration",
  "Housekeeping",
];

export default function RequisitionFormPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: branches } = useBranches();
  const { data: items } = useInventoryItems();
  const createRequisition = useCreateRequisition();

  const [requisitionItems, setRequisitionItems] = useState<RequisitionItem[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      branch_id: profile?.branch_id || "",
      department: "",
      required_date: format(addDays(new Date(), 3), "yyyy-MM-dd"),
      priority: "normal",
      notes: "",
    },
  });

  const addItem = () => {
    setRequisitionItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        item_id: "",
        item_name: "",
        requested_quantity: 1,
        unit_of_measure: "",
        notes: "",
      },
    ]);
  };

  const removeItem = (id: string) => {
    setRequisitionItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof RequisitionItem, value: string | number) => {
    setRequisitionItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        if (field === "item_id") {
          const selectedItem = items?.find((i) => i.id === value);
          return {
            ...item,
            item_id: value as string,
            item_name: selectedItem?.item_name || "",
            unit_of_measure: selectedItem?.unit_of_measure || "",
          };
        }

        return { ...item, [field]: value };
      })
    );
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (requisitionItems.length === 0) {
      return;
    }

    const validItems = requisitionItems.filter((i) => i.item_id && i.requested_quantity > 0);
    if (validItems.length === 0) {
      return;
    }

    try {
      await createRequisition.mutateAsync({
        branch_id: values.branch_id,
        requesting_department: values.department,
        required_date: values.required_date,
        priority: values.priority,
        notes: values.notes || null,
        items: validItems.map((item) => ({
          item_id: item.item_id,
          requested_quantity: item.requested_quantity,
          notes: item.notes || null,
        })),
      });
      navigate("/app/inventory/requisitions");
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Stock Requisition"
        description="Request items from central store"
      />

      <Button variant="outline" onClick={() => navigate("/app/inventory/requisitions")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Requisitions
      </Button>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Requisition Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="branch_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {branches?.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.branch_name}
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
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DEPARTMENTS.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
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
                name="required_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required By *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Requested Items
              </CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent>
              {requisitionItems.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Item *</TableHead>
                      <TableHead className="w-32">Quantity *</TableHead>
                      <TableHead className="w-24">Unit</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requisitionItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Select
                            value={item.item_id}
                            onValueChange={(v) => updateItem(item.id, "item_id", v)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select item" />
                            </SelectTrigger>
                            <SelectContent>
                              {items?.map((inv) => (
                                <SelectItem key={inv.id} value={inv.id}>
                                  {inv.item_code} - {inv.item_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.requested_quantity}
                            onChange={(e) =>
                              updateItem(item.id, "requested_quantity", Number(e.target.value))
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">
                            {item.unit_of_measure || "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Optional notes"
                            value={item.notes}
                            onChange={(e) => updateItem(item.id, "notes", e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No items added. Click "Add Item" to start.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Justification / Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Reason for requisition, urgency details, etc."
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
              onClick={() => navigate("/app/inventory/requisitions")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createRequisition.isPending || requisitionItems.length === 0}
            >
              {createRequisition.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <Save className="mr-2 h-4 w-4" />
              Create Requisition
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
