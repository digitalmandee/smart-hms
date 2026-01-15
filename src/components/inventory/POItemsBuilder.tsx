import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Trash2 } from "lucide-react";
import { useInventoryItems } from "@/hooks/useInventory";
import type { PurchaseOrderItem } from "@/hooks/usePurchaseOrders";

interface POItemsBuilderProps {
  items: PurchaseOrderItem[];
  onChange: (items: PurchaseOrderItem[]) => void;
  disabled?: boolean;
}

export function POItemsBuilder({ items, onChange, disabled }: POItemsBuilderProps) {
  const { data: inventoryItems } = useInventoryItems();
  const [newItem, setNewItem] = useState<Partial<PurchaseOrderItem>>({
    item_id: "",
    quantity: 1,
    unit_price: 0,
    tax_percent: 0,
    discount_percent: 0,
  });

  const calculateItemTotal = (item: Partial<PurchaseOrderItem>) => {
    const subtotal = (item.quantity || 0) * (item.unit_price || 0);
    const discount = subtotal * ((item.discount_percent || 0) / 100);
    const afterDiscount = subtotal - discount;
    const tax = afterDiscount * ((item.tax_percent || 0) / 100);
    return afterDiscount + tax;
  };

  const handleAddItem = () => {
    if (!newItem.item_id || !newItem.quantity || !newItem.unit_price) return;
    
    const total = calculateItemTotal(newItem);
    const fullItem: PurchaseOrderItem = {
      item_id: newItem.item_id!,
      quantity: newItem.quantity!,
      unit_price: newItem.unit_price!,
      tax_percent: newItem.tax_percent || 0,
      discount_percent: newItem.discount_percent || 0,
      total_price: total,
      item: inventoryItems?.find(i => i.id === newItem.item_id),
    };
    
    onChange([...items, fullItem]);
    setNewItem({
      item_id: "",
      quantity: 1,
      unit_price: 0,
      tax_percent: 0,
      discount_percent: 0,
    });
  };

  const handleRemoveItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleItemSelect = (itemId: string) => {
    const item = inventoryItems?.find(i => i.id === itemId);
    setNewItem({
      ...newItem,
      item_id: itemId,
      unit_price: item?.standard_cost || 0,
    });
  };

  const subtotal = items.reduce((sum, item) => {
    const itemSubtotal = item.quantity * item.unit_price;
    const discount = itemSubtotal * (item.discount_percent / 100);
    return sum + (itemSubtotal - discount);
  }, 0);

  const totalTax = items.reduce((sum, item) => {
    const itemSubtotal = item.quantity * item.unit_price;
    const discount = itemSubtotal * (item.discount_percent / 100);
    const afterDiscount = itemSubtotal - discount;
    return sum + (afterDiscount * (item.tax_percent / 100));
  }, 0);

  const grandTotal = subtotal + totalTax;

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead className="w-24">Qty</TableHead>
            <TableHead className="w-28">Unit Price</TableHead>
            <TableHead className="w-24">Tax %</TableHead>
            <TableHead className="w-24">Disc %</TableHead>
            <TableHead className="w-28 text-right">Total</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={index}>
              <TableCell>
                <div>
                  <p className="font-medium">{item.item?.name || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.item?.item_code} • {item.item?.unit_of_measure}
                  </p>
                </div>
              </TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>Rs. {item.unit_price.toLocaleString()}</TableCell>
              <TableCell>{item.tax_percent}%</TableCell>
              <TableCell>{item.discount_percent}%</TableCell>
              <TableCell className="text-right font-medium">
                Rs. {item.total_price.toLocaleString()}
              </TableCell>
              <TableCell>
                {!disabled && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
          
          {!disabled && (
            <TableRow>
              <TableCell>
                <Select
                  value={newItem.item_id}
                  onValueChange={handleItemSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select item" />
                  </SelectTrigger>
                  <SelectContent>
                    {inventoryItems?.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} ({item.item_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min={1}
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={newItem.unit_price}
                  onChange={(e) => setNewItem({ ...newItem, unit_price: parseFloat(e.target.value) || 0 })}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={newItem.tax_percent}
                  onChange={(e) => setNewItem({ ...newItem, tax_percent: parseFloat(e.target.value) || 0 })}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={newItem.discount_percent}
                  onChange={(e) => setNewItem({ ...newItem, discount_percent: parseFloat(e.target.value) || 0 })}
                />
              </TableCell>
              <TableCell className="text-right font-medium">
                Rs. {calculateItemTotal(newItem).toLocaleString()}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleAddItem}
                  disabled={!newItem.item_id}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal:</span>
            <span>Rs. {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax:</span>
            <span>Rs. {totalTax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-medium border-t pt-2">
            <span>Grand Total:</span>
            <span>Rs. {grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
