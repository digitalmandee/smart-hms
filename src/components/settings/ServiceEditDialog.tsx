import { useState, useEffect } from "react";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Stethoscope, Syringe, FlaskConical, Pill, Building, MoreHorizontal, Scan, History, Circle, Heart, Activity, Thermometer, Microscope, Scissors, Bandage } from "lucide-react";
import { UnifiedService, useServicePriceHistory } from "@/hooks/useUnifiedServices";
import { useServiceCategories } from "@/hooks/useServiceCategories";
import { formatDistanceToNow } from "date-fns";

// Icon mapping for dynamic categories
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  stethoscope: Stethoscope,
  syringe: Syringe,
  "flask-conical": FlaskConical,
  scan: Scan,
  pill: Pill,
  building: Building,
  "more-horizontal": MoreHorizontal,
  circle: Circle,
  heart: Heart,
  activity: Activity,
  thermometer: Thermometer,
  microscope: Microscope,
  scissors: Scissors,
  bandage: Bandage,
};

interface ServiceEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: UnifiedService | null;
  onSave: (values: {
    id?: string;
    name: string;
    category_id: string;
    default_price: number;
    cost_price: number;
    is_active: boolean;
    price_change_reason?: string;
  }) => Promise<void>;
  isPending?: boolean;
}

export function ServiceEditDialog({
  open,
  onOpenChange,
  service,
  onSave,
  isPending,
}: ServiceEditDialogProps) {
  const { formatCurrency } = useCurrencyFormatter();
  const isEditing = !!service;
  
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [priceChangeReason, setPriceChangeReason] = useState("");
  const [showPriceReason, setShowPriceReason] = useState(false);

  const { data: categories } = useServiceCategories();
  const { data: priceHistory, isLoading: historyLoading } = useServicePriceHistory(service?.id);

  useEffect(() => {
    if (service) {
      setName(service.name);
      setCategoryId(service.category_id || "");
      setPrice(String(service.default_price || 0));
      setIsActive(service.is_active);
      setPriceChangeReason("");
      setShowPriceReason(false);
    } else {
      setName("");
      setCategoryId(categories?.[0]?.id || "");
      setPrice("0");
      setIsActive(true);
      setPriceChangeReason("");
      setShowPriceReason(false);
    }
  }, [service, open, categories]);

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
      category_id: categoryId,
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
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => {
                    const IconComp = iconMap[cat.icon] || Circle;
                    return (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <IconComp className="h-4 w-4" />
                          {cat.name}
                        </div>
                      </SelectItem>
                    );
                  })}
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
                            {formatCurrency(entry.old_price || 0)}
                          </Badge>
                          <span className="text-muted-foreground">→</span>
                          <Badge variant="secondary" className="font-mono">
                            {formatCurrency(entry.new_price)}
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
          <Button onClick={handleSubmit} disabled={isPending || !name.trim() || !categoryId}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Update Service" : "Create Service"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
