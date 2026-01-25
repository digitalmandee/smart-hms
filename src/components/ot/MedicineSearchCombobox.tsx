import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, Loader2, AlertTriangle, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchMedicineInventory } from "@/hooks/useOTPharmacy";
import { format, differenceInDays } from "date-fns";
import { otLogger } from "@/lib/logger";

interface InventoryItem {
  id: string;
  batch_number: string;
  quantity: number;
  unit_price: number;
  selling_price: number;
  expiry_date: string;
  medicine: {
    id: string;
    name: string;
    generic_name: string | null;
  } | null;
}

interface MedicineSearchComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  onMedicineSelect?: (item: InventoryItem) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MedicineSearchCombobox({
  value,
  onValueChange,
  onMedicineSelect,
  placeholder = "Search medicines...",
  disabled,
}: MedicineSearchComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(value);

  const { data: inventoryItems = [], isLoading } = useSearchMedicineInventory(searchQuery);

  const handleSelect = (item: InventoryItem) => {
    const medicineName = item.medicine?.name || '';
    otLogger.info('MedicineSearchCombobox: Medicine selected', {
      medicineId: item.medicine?.id,
      medicineName,
      batchNumber: item.batch_number,
      quantity: item.quantity,
    });
    
    onValueChange(medicineName);
    setSearchQuery(medicineName);
    onMedicineSelect?.(item);
    setOpen(false);
  };

  const getExpiryStatus = (expiryDate: string) => {
    const daysUntilExpiry = differenceInDays(new Date(expiryDate), new Date());
    if (daysUntilExpiry <= 30) return 'expiring-soon';
    if (daysUntilExpiry <= 90) return 'expiring';
    return 'ok';
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          disabled={disabled}
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Type to search medicines..."
            value={searchQuery}
            onValueChange={(val) => {
              setSearchQuery(val);
              onValueChange(val);
            }}
          />
          <CommandList>
            {isLoading ? (
              <div className="p-4 text-center">
                <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Searching pharmacy inventory...</p>
              </div>
            ) : searchQuery.length < 2 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Type at least 2 characters to search
              </div>
            ) : inventoryItems.length === 0 ? (
              <CommandEmpty>
                <div className="text-center py-4">
                  <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm">No medicines found in inventory</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You can still add "{searchQuery}" as a custom medication
                  </p>
                </div>
              </CommandEmpty>
            ) : (
              <CommandGroup heading="Available in Pharmacy">
                {inventoryItems.map((item: InventoryItem) => {
                  const expiryStatus = getExpiryStatus(item.expiry_date);
                  return (
                    <CommandItem
                      key={item.id}
                      value={item.medicine?.name || ''}
                      onSelect={() => handleSelect(item)}
                      className="flex items-start gap-2 py-3"
                    >
                      <Check
                        className={cn(
                          "h-4 w-4 mt-0.5 shrink-0",
                          value === item.medicine?.name ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">
                            {item.medicine?.name}
                          </span>
                          {item.quantity <= 10 && (
                            <Badge variant="destructive" className="text-xs shrink-0">
                              Low Stock
                            </Badge>
                          )}
                        </div>
                        {item.medicine?.generic_name && (
                          <p className="text-xs text-muted-foreground truncate">
                            {item.medicine.generic_name}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>Batch: {item.batch_number}</span>
                          <span>Qty: {item.quantity}</span>
                          <span className={cn(
                            expiryStatus === 'expiring-soon' && 'text-destructive',
                            expiryStatus === 'expiring' && 'text-warning'
                          )}>
                            {expiryStatus === 'expiring-soon' && (
                              <AlertTriangle className="h-3 w-3 inline mr-1" />
                            )}
                            Exp: {format(new Date(item.expiry_date), 'MMM yyyy')}
                          </span>
                        </div>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
