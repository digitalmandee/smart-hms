import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Stethoscope, Syringe, FlaskConical, Pill, Building, MoreHorizontal, Scan, History } from "lucide-react";
import { UnifiedService, ServiceCategory, useServicePriceHistory } from "@/hooks/useUnifiedServices";
import { formatDistanceToNow } from "date-fns";

interface ServiceEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: UnifiedService | null;
  onSave: (values: {
    id?: string;
    name: string;
    category: ServiceCategory;
    default_price: number;
    is_active: boolean;
    price_change_reason?: string;
  }) => Promise<void>;
  isPending?: boolean;
}

const categoryOptions = [
  { value: "consultation", label: "Consultation", icon: Stethoscope },
  { value: "procedure", label: "Procedure / OT", icon: Syringe },
  { value: "lab", label: "Lab Test", icon: FlaskConical },
  { value: "radiology", label: "Radiology", icon: Scan },
  { value: "pharmacy", label: "Pharmacy", icon: Pill },
  { value: "room", label: "Room / Bed", icon: Building },
  { value: "other", label: "Other", icon: MoreHorizontal },
];

export function ServiceEditDialog({
  open,
  onOpenChange,
  service,
  onSave,
  isPending,
}: ServiceEditDialogProps) {
  const isEditing = !!service;
  
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ServiceCategory>("consultation");
  const [price, setPrice] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [priceChangeReason, setPriceChangeReason] = useState("");
  const [showPriceReason, setShowPriceReason] = useState(false);

  const { data: priceHistory, isLoading: historyLoading } = useServicePriceHistory(service?.id);

  useEffect(() => {
    if (service) {
      setName(service.name);
      setCategory(service.category);
      setPrice(String(service.default_price || 0));
      setIsActive(service.is_active);
      setPriceChangeReason("");
      setShowPriceReason(false);
    } else {
      setName("");
      setCategory("consultation");
      setPrice("0");
      setIsActive(true);
      setPriceChangeReason("");
      setShowPriceReason(false);
    }
  }, [service, open]);

  // Check if price changed
  useEffect(() => {
    if (service && parseFloat(price) !== (service.default_price || 0)) {
      setShowPriceReason(true);
    } else {
      setShowPriceReason(false);
    }
  }, [price, service]);

  const handleSubmit = async () => {
    await onSave({
      id: service?.id,
      name,
      category,
      default_price: parseFloat(price) || 0,
      is_active: isActive,
      price_change_reason: priceChangeReason || undefined,
    });
  };

  const getLinkedInfo = () => {
    if (!service) return null;
    
    if (service.linked_imaging_procedure) {
      const ip = service.linked_imaging_procedure;
      return (
        <div className="space-y-2 rounded-lg border p-3 bg-muted/30">
          <div className="text-sm font-medium">Linked Radiology Procedure</div>
          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div>Modality: <span className="text-foreground">{ip.modality_type}</span></div>
            <div>Body Part: <span className="text-foreground">{ip.body_part || "N/A"}</span></div>
            <div>Code: <span className="text-foreground">{ip.code || "N/A"}</span></div>
            <div>Duration: <span className="text-foreground">{ip.estimated_duration_minutes || "N/A"} min</span></div>
          </div>
          {ip.preparation && (
            <div className="text-sm">
              <span className="text-muted-foreground">Preparation: </span>
              <span>{ip.preparation}</span>
            </div>
          )}
        </div>
      );
    }

    if (service.linked_bed_type) {
      const bt = service.linked_bed_type;
      return (
        <div className="space-y-2 rounded-lg border p-3 bg-muted/30">
          <div className="text-sm font-medium">Linked Bed Type</div>
          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div>Code: <span className="text-foreground">{bt.code || "N/A"}</span></div>
            <div>Sort Order: <span className="text-foreground">{bt.sort_order}</span></div>
          </div>
          {bt.description && (
            <div className="text-sm text-muted-foreground">{bt.description}</div>
          )}
        </div>
      );
    }

    if (service.linked_lab_template) {
      const lt = service.linked_lab_template;
      const fieldCount = Array.isArray(lt.fields) ? lt.fields.length : 0;
      return (
        <div className="space-y-2 rounded-lg border p-3 bg-muted/30">
          <div className="text-sm font-medium">Linked Lab Test Template</div>
          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div>Category: <span className="text-foreground">{lt.test_category || "N/A"}</span></div>
            <div>Parameters: <span className="text-foreground">{fieldCount}</span></div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Service" : "Add New Service"}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            {isEditing && <TabsTrigger value="history">Price History</TabsTrigger>}
          </TabsList>

          <TabsContent value="details" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Service Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., General Consultation"
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as ServiceCategory)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="h-4 w-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Default Price (Rs.)</Label>
              <Input
                id="price"
                type="number"
                min={0}
                step={0.01}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            {showPriceReason && (
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Price Change (Optional)</Label>
                <Textarea
                  id="reason"
                  value={priceChangeReason}
                  onChange={(e) => setPriceChangeReason(e.target.value)}
                  placeholder="e.g., Annual rate revision, Equipment cost increase..."
                  rows={2}
                />
              </div>
            )}

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <div className="font-medium">Active</div>
                <div className="text-sm text-muted-foreground">
                  Inactive services won't appear in billing forms
                </div>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>

            {/* Linked specialized data */}
            {getLinkedInfo()}
          </TabsContent>

          {isEditing && (
            <TabsContent value="history" className="pt-4">
              <div className="space-y-3">
                {historyLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : priceHistory && priceHistory.length > 0 ? (
                  priceHistory.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-3 rounded-lg border p-3">
                      <History className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono">
                            Rs. {entry.old_price?.toLocaleString() || "0"}
                          </Badge>
                          <span className="text-muted-foreground">→</span>
                          <Badge variant="secondary" className="font-mono">
                            Rs. {entry.new_price.toLocaleString()}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(entry.changed_at), { addSuffix: true })}
                          {entry.changed_by_profile && ` by ${entry.changed_by_profile.full_name}`}
                        </div>
                        {entry.reason && (
                          <div className="text-sm">{entry.reason}</div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No price changes recorded
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !name.trim()}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Update Service" : "Create Service"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
