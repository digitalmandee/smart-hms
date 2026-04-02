import { useState, useMemo } from "react";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useServiceTypes, ServiceTypeWithCategory } from "@/hooks/useBilling";
import { useServiceCategories } from "@/hooks/useServiceCategories";
import { useBeds, useWards } from "@/hooks/useIPD";
import { BedPickerDialog, BedBookingData } from "@/components/billing/BedPickerDialog";
import { ConsultationDoctorSelector } from "@/components/billing/ConsultationDoctorSelector";
import { Plus, Trash2, Bed, Calendar, ChevronsUpDown, Check, Stethoscope } from "lucide-react";
import { InvoiceItemInput } from "@/hooks/useBilling";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ServiceCategoryBadge } from "./ServiceCategoryBadge";

interface InvoiceItemsBuilderProps {
  items: InvoiceItemInput[];
  onChange: (items: InvoiceItemInput[]) => void;
  disabled?: boolean;
}

export function InvoiceItemsBuilder({
  items,
  onChange,
  disabled,
}: InvoiceItemsBuilderProps) {
  const { formatCurrency: fc } = useCurrencyFormatter();
  const { profile } = useAuth();
  const { data: serviceTypes } = useServiceTypes();
  const { data: categories } = useServiceCategories();
  const { data: beds } = useBeds();
  const { data: wards } = useWards();

  // Fetch billing tax slabs
  const { data: taxSlabs } = useQuery({
    queryKey: ["billing-tax-slabs", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from("billing_tax_slabs")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .eq("is_active", true)
        .order("created_at");
      if (error) throw error;
      return data as { id: string; name: string; tax_rate: number; is_default: boolean; applies_to: string }[];
    },
    enabled: !!profile?.organization_id,
  });

  const defaultTaxSlab = taxSlabs?.find(s => s.is_default);
  
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [servicePickerOpen, setServicePickerOpen] = useState(false);
  const [newItem, setNewItem] = useState<InvoiceItemInput>({
    description: "",
    quantity: 1,
    unit_price: 0,
    discount_percent: 0,
    service_type_id: null,
  });

  // State for bed picker dialog
  const [showBedPicker, setShowBedPicker] = useState(false);
  const [pendingRoomService, setPendingRoomService] = useState<ServiceTypeWithCategory | null>(null);

  // State for consultation doctor picker
  const [showDoctorPicker, setShowDoctorPicker] = useState(false);
  const [pendingConsultationService, setPendingConsultationService] = useState<ServiceTypeWithCategory | null>(null);

  // Group services by category_info.code (from joined data)
  const groupedServices = useMemo(() => {
    if (!serviceTypes) return {};
    
    const filtered = categoryFilter === "all" 
      ? serviceTypes 
      : serviceTypes.filter(s => s.category_info?.code === categoryFilter || s.category === categoryFilter);
    
    return filtered.reduce((acc, service) => {
      const catCode = service.category_info?.code || service.category || "other";
      const catName = service.category_info?.name || catCode.charAt(0).toUpperCase() + catCode.slice(1);
      if (!acc[catCode]) acc[catCode] = { name: catName, services: [] };
      acc[catCode].services.push(service);
      return acc;
    }, {} as Record<string, { name: string; services: ServiceTypeWithCategory[] }>);
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
      const categoryCode = service.category_info?.code || service.category;
      
      // Check if it's a room category service - open bed picker
      if (categoryCode === "room") {
        setPendingRoomService(service);
        setShowBedPicker(true);
        setServicePickerOpen(false);
        return;
      }

      // Check if it's a consultation service - open doctor picker
      if (categoryCode === "consultation") {
        setPendingConsultationService(service);
        setShowDoctorPicker(true);
        setServicePickerOpen(false);
        return;
      }

      // For other services, add to the form as before
      setNewItem({
        ...newItem,
        description: service.name,
        unit_price: service.default_price || 0,
        service_type_id: service.id,
      });
      setServicePickerOpen(false);
    }
  };

  // Handle doctor selection for consultation
  const handleDoctorConfirm = (doctorId: string, doctorName: string, consultationFee: number) => {
    if (!pendingConsultationService) return;

    const newConsultationItem: InvoiceItemInput = {
      description: `${pendingConsultationService.name} - Dr. ${doctorName}`,
      quantity: 1,
      unit_price: consultationFee,
      discount_percent: 0,
      service_type_id: pendingConsultationService.id,
      doctor_id: doctorId,
      category: "consultation",
    };

    onChange([...items, newConsultationItem]);
    setShowDoctorPicker(false);
    setPendingConsultationService(null);
  };

  // Handle bed selection confirmation
  const handleBedConfirm = (bedData: BedBookingData) => {
    if (!pendingRoomService) return;

    // Get bed and ward details for the description
    const bed = beds?.find((b: any) => b.id === bedData.bedId);
    const ward = wards?.find((w: any) => w.id === bedData.wardId);

    const bedNumber = bed?.bed_number || "Bed";
    const wardName = ward?.name || "Ward";

    // Create descriptive item with bed and date info
    const description = `${pendingRoomService.name} - ${wardName}, ${bedNumber} (${format(bedData.startDate, "MMM dd")} - ${format(bedData.endDate, "MMM dd")}, ${bedData.nights} night${bedData.nights > 1 ? "s" : ""})`;

    const newRoomItem: InvoiceItemInput = {
      description,
      quantity: bedData.nights, // Use nights as quantity
      unit_price: pendingRoomService.default_price || 0,
      discount_percent: 0,
      service_type_id: pendingRoomService.id,
      bed_id: bedData.bedId,
      booking_start_date: format(bedData.startDate, "yyyy-MM-dd"),
      booking_end_date: format(bedData.endDate, "yyyy-MM-dd"),
      category: "room",
    };

    onChange([...items, newRoomItem]);
    setShowBedPicker(false);
    setPendingRoomService(null);
  };

  const calculateItemTotal = (item: InvoiceItemInput) => {
    return item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100);
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[35%]">Description</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Disc %</TableHead>
            <TableHead className="text-right">Tax %</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => {
            const service = serviceTypes?.find(s => s.id === item.service_type_id);
            const categoryCode = item.category || service?.category_info?.code || service?.category;
            const isRoomItem = categoryCode === "room" && item.bed_id;
            const isConsultationItem = categoryCode === "consultation" && item.doctor_id;
            
            return (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      {categoryCode && (
                        <ServiceCategoryBadge category={categoryCode as any} />
                      )}
                      <span className={isRoomItem || isConsultationItem ? "font-medium" : ""}>{item.description}</span>
                    </div>
                    {/* Show booking dates for room items */}
                    {isRoomItem && item.booking_start_date && item.booking_end_date && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground ml-6">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {format(new Date(item.booking_start_date), "MMM dd")} → {format(new Date(item.booking_end_date), "MMM dd")}
                        </span>
                      </div>
                    )}
                    {/* Show doctor indicator for consultation items */}
                    {isConsultationItem && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground ml-6">
                        <Stethoscope className="h-3 w-3" />
                        <span>Doctor earnings will be credited</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">{fc(item.unit_price)}</TableCell>
                <TableCell className="text-right">{item.discount_percent || 0}%</TableCell>
                <TableCell className="text-right">
                  {!disabled && taxSlabs && taxSlabs.length > 0 ? (
                    <select
                      className="w-20 text-right bg-transparent border rounded px-1 py-0.5 text-sm"
                      value={item.tax_percent || 0}
                      onChange={(e) => {
                        const updated = [...items];
                        updated[index] = { ...updated[index], tax_percent: parseFloat(e.target.value) || 0 };
                        onChange(updated);
                      }}
                    >
                      <option value="0">0%</option>
                      {taxSlabs.map(slab => (
                        <option key={slab.id} value={slab.tax_rate}>{slab.tax_rate}%</option>
                      ))}
                    </select>
                  ) : (
                    <span>{item.tax_percent || 0}%</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {fc(calculateItemTotal(item) * (1 + (item.tax_percent || 0) / 100))}
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
            );
          })}

          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                No items added yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {!disabled && (
        <div className="border rounded-lg p-4 bg-muted/30 space-y-4">
          {/* Dynamic Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={categoryFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter("all")}
            >
              All
            </Button>
            {categories?.map((cat) => (
              <Button
                key={cat.id}
                variant={categoryFilter === cat.code ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter(cat.code)}
              >
                {cat.name}
              </Button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-6">
            <div className="md:col-span-2">
              {/* Searchable Service Selector */}
              <Popover open={servicePickerOpen} onOpenChange={setServicePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={servicePickerOpen}
                    className="w-full justify-between"
                  >
                    <span className="truncate">
                      {newItem.service_type_id
                        ? serviceTypes?.find(s => s.id === newItem.service_type_id)?.name || "Select service..."
                        : "Select service..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search services..." />
                    <CommandList>
                      <CommandEmpty>No services found.</CommandEmpty>
                      {Object.entries(groupedServices).map(([code, { name, services }]) => (
                        <CommandGroup key={code} heading={name}>
                          {services.map((service) => (
                            <CommandItem
                              key={service.id}
                              value={`${service.name} ${name}`}
                              onSelect={() => handleServiceSelect(service.id)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  newItem.service_type_id === service.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex-1 flex justify-between items-center">
                                <span>{service.name}</span>
                                <span className="text-muted-foreground text-sm">
                                  {fc(service.default_price)}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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

      {/* Bed Picker Dialog for Room Services */}
      <BedPickerDialog
        open={showBedPicker}
        onOpenChange={(open) => {
          setShowBedPicker(open);
          if (!open) setPendingRoomService(null);
        }}
        onConfirm={handleBedConfirm}
        title={`Select Bed for ${pendingRoomService?.name || "Room Booking"}`}
      />

      {/* Doctor Picker Dialog for Consultation Services */}
      <ConsultationDoctorSelector
        open={showDoctorPicker}
        onOpenChange={(open) => {
          setShowDoctorPicker(open);
          if (!open) setPendingConsultationService(null);
        }}
        serviceName={pendingConsultationService?.name || "Consultation"}
        serviceDefaultPrice={pendingConsultationService?.default_price || 0}
        onConfirm={handleDoctorConfirm}
      />
    </div>
  );
}
