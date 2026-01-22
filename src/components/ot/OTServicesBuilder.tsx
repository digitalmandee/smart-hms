import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ChevronsUpDown, Check, Scissors } from "lucide-react";
import { useOTServices, OTServiceItem, calculateOTServicesTotal } from "@/hooks/useOTServices";
import { cn } from "@/lib/utils";

interface OTServicesBuilderProps {
  items: OTServiceItem[];
  onChange: (items: OTServiceItem[]) => void;
  disabled?: boolean;
}

export function OTServicesBuilder({
  items,
  onChange,
  disabled,
}: OTServicesBuilderProps) {
  const { data: otServices, isLoading } = useOTServices();
  const [servicePickerOpen, setServicePickerOpen] = useState(false);

  // Get IDs of services already added
  const addedServiceIds = useMemo(
    () => new Set(items.map((item) => item.service_type_id)),
    [items]
  );

  // Available services (not already added)
  const availableServices = useMemo(
    () => otServices?.filter((s) => !addedServiceIds.has(s.id)) || [],
    [otServices, addedServiceIds]
  );

  const handleAddService = (serviceId: string) => {
    const service = otServices?.find((s) => s.id === serviceId);
    if (!service) return;

    const newItem: OTServiceItem = {
      id: crypto.randomUUID(),
      service_type_id: service.id,
      name: service.name,
      quantity: 1,
      unit_price: service.default_price,
      total: service.default_price,
    };

    onChange([...items, newItem]);
    setServicePickerOpen(false);
  };

  const handleRemoveItem = (itemId: string) => {
    onChange(items.filter((item) => item.id !== itemId));
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    onChange(
      items.map((item) =>
        item.id === itemId
          ? { ...item, quantity, total: quantity * item.unit_price }
          : item
      )
    );
  };

  const handlePriceChange = (itemId: string, unit_price: number) => {
    onChange(
      items.map((item) =>
        item.id === itemId
          ? { ...item, unit_price, total: item.quantity * unit_price }
          : item
      )
    );
  };

  const total = calculateOTServicesTotal(items);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Items Table */}
      {items.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Service</TableHead>
                <TableHead className="w-[100px] text-center">Qty</TableHead>
                <TableHead className="w-[140px] text-right">Unit Price</TableHead>
                <TableHead className="w-[120px] text-right">Total</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Scissors className="h-4 w-4 text-primary" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(item.id, parseInt(e.target.value) || 1)
                      }
                      className="w-16 text-center h-8 mx-auto"
                      disabled={disabled}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      min={0}
                      value={item.unit_price}
                      onChange={(e) =>
                        handlePriceChange(item.id, parseFloat(e.target.value) || 0)
                      }
                      className="w-28 text-right h-8 ml-auto"
                      disabled={disabled}
                    />
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    Rs. {item.total.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={disabled}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {/* Total Row */}
              <TableRow className="bg-muted/30 font-semibold">
                <TableCell colSpan={3} className="text-right">
                  Total OT Charges:
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  Rs. {total.toLocaleString()}
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}

      {/* Empty State */}
      {items.length === 0 && (
        <div className="border border-dashed rounded-lg p-8 text-center text-muted-foreground">
          <Scissors className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No OT services added yet</p>
          <p className="text-sm">Add services to calculate surgery charges</p>
        </div>
      )}

      {/* Add Service Button */}
      {!disabled && (
        <Popover open={servicePickerOpen} onOpenChange={setServicePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={servicePickerOpen}
              className="w-full justify-between"
            >
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add OT Service
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search OT services..." />
              <CommandList>
                <CommandEmpty>No services found.</CommandEmpty>
                <CommandGroup heading="OT Services">
                  {availableServices.map((service) => (
                    <CommandItem
                      key={service.id}
                      value={service.name}
                      onSelect={() => handleAddService(service.id)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Scissors className="h-4 w-4 text-primary" />
                        <span>{service.name}</span>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        Rs. {service.default_price.toLocaleString()}
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}

      {/* Info about OT services */}
      {otServices?.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No OT services configured. Go to Services → OT Services to add them.
        </p>
      )}
    </div>
  );
}
