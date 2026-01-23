import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ReturnableItem {
  id: string;
  medicine_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  batch_number?: string;
}

export interface SelectedReturnItem {
  id: string;
  medicine_name: string;
  original_quantity: number;
  return_quantity: number;
  unit_price: number;
  line_total: number;
  batch_number?: string;
}

interface ReturnItemSelectorProps {
  items: ReturnableItem[];
  selectedItems: SelectedReturnItem[];
  onSelectionChange: (items: SelectedReturnItem[]) => void;
}

export function ReturnItemSelector({ items, selectedItems, onSelectionChange }: ReturnItemSelectorProps) {
  const isSelected = (itemId: string) => selectedItems.some((s) => s.id === itemId);
  const getSelectedItem = (itemId: string) => selectedItems.find((s) => s.id === itemId);

  const toggleItem = (item: ReturnableItem) => {
    if (isSelected(item.id)) {
      onSelectionChange(selectedItems.filter((s) => s.id !== item.id));
    } else {
      onSelectionChange([
        ...selectedItems,
        {
          id: item.id,
          medicine_name: item.medicine_name,
          original_quantity: item.quantity,
          return_quantity: item.quantity, // Default to full quantity
          unit_price: item.unit_price,
          line_total: item.unit_price * item.quantity,
          batch_number: item.batch_number,
        },
      ]);
    }
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const validQty = Math.max(1, Math.min(newQuantity, item.quantity));

    onSelectionChange(
      selectedItems.map((s) =>
        s.id === itemId
          ? { ...s, return_quantity: validQty, line_total: s.unit_price * validQty }
          : s
      )
    );
  };

  const totalRefund = selectedItems.reduce((sum, item) => sum + item.line_total, 0);

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">Select items to return:</div>
      
      <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
        {items.map((item) => {
          const selected = isSelected(item.id);
          const selectedItem = getSelectedItem(item.id);

          return (
            <div
              key={item.id}
              className={`p-3 transition-colors ${selected ? "bg-primary/5" : "hover:bg-muted/50"}`}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  id={`item-${item.id}`}
                  checked={selected}
                  onCheckedChange={() => toggleItem(item)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <Label
                    htmlFor={`item-${item.id}`}
                    className="font-medium cursor-pointer block"
                  >
                    {item.medicine_name}
                  </Label>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>Qty: {item.quantity}</span>
                    <span>×</span>
                    <span>Rs. {item.unit_price.toLocaleString()}</span>
                    {item.batch_number && (
                      <Badge variant="outline" className="text-[10px] h-4">
                        {item.batch_number}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">Rs. {item.total_price.toLocaleString()}</div>
                </div>
              </div>

              {/* Quantity selector when selected */}
              {selected && selectedItem && (
                <div className="mt-3 ml-7 flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Return qty:</span>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.id, selectedItem.return_quantity - 1)}
                      disabled={selectedItem.return_quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      min={1}
                      max={item.quantity}
                      value={selectedItem.return_quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                      className="w-16 h-7 text-center"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.id, selectedItem.return_quantity + 1)}
                      disabled={selectedItem.return_quantity >= item.quantity}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">of {item.quantity}</span>
                  <span className="ml-auto font-medium text-primary">
                    Rs. {selectedItem.line_total.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedItems.length > 0 && (
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-sm text-muted-foreground">
            {selectedItems.length} item(s) selected
          </span>
          <span className="font-semibold text-lg">
            Total Refund: Rs. {totalRefund.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}
