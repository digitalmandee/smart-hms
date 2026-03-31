import { useState } from "react";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Pill, Package } from "lucide-react";
import { useInventoryItems } from "@/hooks/useInventory";
import { useMedicines } from "@/hooks/useMedicines";
import type { PurchaseOrderItem, POItemType } from "@/hooks/usePurchaseOrders";

interface UnifiedPOItemsBuilderProps {
  items: PurchaseOrderItem[];
  onChange: (items: PurchaseOrderItem[]) => void;
  disabled?: boolean;
}

export function UnifiedPOItemsBuilder({ items, onChange, disabled }: UnifiedPOItemsBuilderProps) {
  const { formatCurrency: fc } = useCurrencyFormatter();
  const { data: inventoryItems } = useInventoryItems();
  const { data: medicines } = useMedicines();
  
  const [itemType, setItemType] = useState<POItemType>('inventory');
  const [newItem, setNewItem] = useState<Partial<PurchaseOrderItem>>({
    item_type: 'inventory',
    item_id: "",
    medicine_id: "",
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
    const isValid = itemType === 'medicine' 
      ? newItem.medicine_id && newItem.quantity && newItem.unit_price
      : newItem.item_id && newItem.quantity && newItem.unit_price;
    
    if (!isValid) return;
    
    const total = calculateItemTotal(newItem);
    
    const fullItem: PurchaseOrderItem = {
      item_type: itemType,
      item_id: itemType === 'inventory' ? newItem.item_id : undefined,
      medicine_id: itemType === 'medicine' ? newItem.medicine_id : undefined,
      quantity: newItem.quantity!,
      unit_price: newItem.unit_price!,
      tax_percent: newItem.tax_percent || 0,
      discount_percent: newItem.discount_percent || 0,
      total_price: total,
      item: itemType === 'inventory' 
        ? inventoryItems?.find(i => i.id === newItem.item_id)
        : undefined,
      medicine: itemType === 'medicine'
        ? medicines?.find(m => m.id === newItem.medicine_id)
        : undefined,
    };
    
    onChange([...items, fullItem]);
    setNewItem({
      item_type: itemType,
      item_id: "",
      medicine_id: "",
      quantity: 1,
      unit_price: 0,
      tax_percent: 0,
      discount_percent: 0,
    });
  };

  const handleRemoveItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: string, value: number) => {
    const updated = items.map((item, i) => {
      if (i !== index) return item;
      const newItem = { ...item, [field]: value };
      newItem.total_price = calculateItemTotal(newItem);
      return newItem;
    });
    onChange(updated);
  };

  const handleItemSelect = (id: string) => {
    if (itemType === 'medicine') {
      const medicine = medicines?.find(m => m.id === id);
      setNewItem({
        ...newItem,
        medicine_id: id,
        item_id: "",
        unit_price: 0, // Will be entered manually
      });
    } else {
      const item = inventoryItems?.find(i => i.id === id);
      setNewItem({
        ...newItem,
        item_id: id,
        medicine_id: "",
        unit_price: item?.standard_cost || 0,
      });
    }
  };

  const handleItemTypeChange = (type: POItemType) => {
    setItemType(type);
    setNewItem({
      item_type: type,
      item_id: "",
      medicine_id: "",
      quantity: 1,
      unit_price: 0,
      tax_percent: 0,
      discount_percent: 0,
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

  const getItemName = (item: PurchaseOrderItem) => {
    if (item.item_type === 'medicine') {
      if (item.medicine?.name) return item.medicine.name;
      // Fallback: look up from loaded medicines list
      const found = medicines?.find(m => m.id === item.medicine_id);
      return found?.name || "Unknown Medicine";
    }
    if (item.item?.name) return item.item.name;
    const found = inventoryItems?.find(i => i.id === item.item_id);
    return found?.name || "Unknown Item";
  };

  const getItemCode = (item: PurchaseOrderItem) => {
    if (item.item_type === 'medicine') {
      return item.medicine?.generic_name || "";
    }
    return item.item?.item_code || "";
  };

  const getItemUnit = (item: PurchaseOrderItem) => {
    if (item.item_type === 'medicine') {
      return item.medicine?.unit || "";
    }
    return item.item?.unit_of_measure || "";
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
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
                <Badge variant={item.item_type === 'medicine' ? 'default' : 'secondary'}>
                  {item.item_type === 'medicine' ? (
                    <><Pill className="h-3 w-3 mr-1" /> Medicine</>
                  ) : (
                    <><Package className="h-3 w-3 mr-1" /> Inventory</>
                  )}
                </Badge>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{getItemName(item)}</p>
                  <p className="text-xs text-muted-foreground">
                    {getItemCode(item)} • {getItemUnit(item)}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                {!disabled ? (
                  <Input
                    type="number"
                    min={1}
                    className="w-20"
                    value={item.quantity}
                    onChange={(e) => handleUpdateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                  />
                ) : item.quantity}
              </TableCell>
              <TableCell>
                {!disabled ? (
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    className="w-24"
                    value={item.unit_price}
                    onChange={(e) => handleUpdateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                  />
                ) : fc(item.unit_price)}
              </TableCell>
              <TableCell>
                {!disabled ? (
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    className="w-20"
                    value={item.tax_percent}
                    onChange={(e) => handleUpdateItem(index, 'tax_percent', parseFloat(e.target.value) || 0)}
                  />
                ) : `${item.tax_percent}%`}
              </TableCell>
              <TableCell>
                {!disabled ? (
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    className="w-20"
                    value={item.discount_percent}
                    onChange={(e) => handleUpdateItem(index, 'discount_percent', parseFloat(e.target.value) || 0)}
                  />
                ) : `${item.discount_percent}%`}
              </TableCell>
              <TableCell className="text-right font-medium">
                {fc(item.total_price)}
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
                  value={itemType}
                  onValueChange={(v) => handleItemTypeChange(v as POItemType)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inventory">
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3" /> Inventory
                      </div>
                    </SelectItem>
                    <SelectItem value="medicine">
                      <div className="flex items-center gap-1">
                        <Pill className="h-3 w-3" /> Medicine
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Select
                  value={itemType === 'medicine' ? newItem.medicine_id : newItem.item_id}
                  onValueChange={handleItemSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${itemType === 'medicine' ? 'medicine' : 'item'}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {itemType === 'medicine' ? (
                      medicines?.map((medicine) => (
                        <SelectItem key={medicine.id} value={medicine.id}>
                          {medicine.name} ({medicine.generic_name || 'N/A'})
                        </SelectItem>
                      ))
                    ) : (
                      inventoryItems?.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} ({item.item_code})
                        </SelectItem>
                      ))
                    )}
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
                {fc(calculateItemTotal(newItem))}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleAddItem}
                  disabled={
                    itemType === 'medicine' 
                      ? !newItem.medicine_id 
                      : !newItem.item_id
                  }
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
            <span>{fc(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax:</span>
            <span>{fc(totalTax)}</span>
          </div>
          <div className="flex justify-between font-medium border-t pt-2">
            <span>Grand Total:</span>
            <span>{fc(grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}