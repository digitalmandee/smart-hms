import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
import { useServiceTypes } from "@/hooks/useBilling";
import { Plus, Trash2 } from "lucide-react";
import { InvoiceItemInput } from "@/hooks/useBilling";
import { cn } from "@/lib/utils";

interface InvoiceItemsBuilderProps {
  items: InvoiceItemInput[];
  onChange: (items: InvoiceItemInput[]) => void;
  disabled?: boolean;
}

type CategoryFilter = "all" | "consultation" | "procedure" | "lab" | "room" | "other";

const categoryLabels: Record<CategoryFilter, string> = {
  all: "All",
  consultation: "Consultation",
  procedure: "Procedure",
  lab: "Lab",
  room: "Room",
  other: "Other",
};

export function InvoiceItemsBuilder({
  items,
  onChange,
  disabled,
}: InvoiceItemsBuilderProps) {
  const { data: serviceTypes } = useServiceTypes();
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [newItem, setNewItem] = useState<InvoiceItemInput>({
    description: "",
    quantity: 1,
    unit_price: 0,
    discount_percent: 0,
    service_type_id: null,
  });

  // Group services by category
  const groupedServices = useMemo(() => {
    if (!serviceTypes) return {};
    
    const filtered = categoryFilter === "all" 
      ? serviceTypes 
      : serviceTypes.filter(s => s.category === categoryFilter);
    
    return filtered.reduce((acc, service) => {
      const cat = service.category || "other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(service);
      return acc;
    }, {} as Record<string, typeof serviceTypes>);
  }, [serviceTypes, categoryFilter]);

  const handleAddItem = () => {
    if (!newItem.description || newItem.unit_price <= 0) return;
    onChange([...items, newItem]);
    setNewItem({
      description: "",
      quantity: 1,
      unit_price: 0,
      discount_percent: 0,
      service_type_id: null,
    });
  };

  const handleRemoveItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleServiceSelect = (serviceId: string) => {
    const service = serviceTypes?.find((s) => s.id === serviceId);
    if (service) {
      setNewItem({
        ...newItem,
        description: service.name,
        unit_price: service.default_price || 0,
        service_type_id: service.id,
      });
    }
  };

  const calculateItemTotal = (item: InvoiceItemInput) => {
    return item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100);
  };

  const categories: CategoryFilter[] = ["all", "consultation", "procedure", "lab", "room", "other"];

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Description</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Disc %</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.description}</TableCell>
              <TableCell className="text-right">{item.quantity}</TableCell>
              <TableCell className="text-right">Rs. {item.unit_price.toFixed(2)}</TableCell>
              <TableCell className="text-right">{item.discount_percent || 0}%</TableCell>
              <TableCell className="text-right font-medium">
                Rs. {calculateItemTotal(item).toFixed(2)}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveItem(index)}
                  disabled={disabled}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}

          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No items added yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {!disabled && (
        <div className="border rounded-lg p-4 bg-muted/30 space-y-4">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={categoryFilter === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  "capitalize",
                  categoryFilter === cat && "bg-primary text-primary-foreground"
                )}
              >
                {categoryLabels[cat]}
              </Button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-6">
            <div className="md:col-span-2">
              <Select onValueChange={handleServiceSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Quick add service..." />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {Object.entries(groupedServices).map(([category, services]) => (
                    <SelectGroup key={category}>
                      <SelectLabel className="capitalize font-semibold text-primary">
                        {categoryLabels[category as CategoryFilter] || category}
                      </SelectLabel>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} - Rs. {service.default_price?.toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-6">
            <div className="md:col-span-2">
              <Input
                placeholder="Description"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              />
            </div>
            <div>
              <Input
                type="number"
                min="1"
                placeholder="Qty"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Price"
                value={newItem.unit_price}
                onChange={(e) => setNewItem({ ...newItem, unit_price: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Input
                type="number"
                min="0"
                max="100"
                placeholder="Disc %"
                value={newItem.discount_percent}
                onChange={(e) => setNewItem({ ...newItem, discount_percent: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Button onClick={handleAddItem} className="w-full">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
