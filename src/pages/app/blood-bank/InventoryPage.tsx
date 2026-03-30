import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Package, Plus, AlertTriangle, Calendar, Droplets, Trash2, Loader2
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format, parseISO, differenceInDays } from "date-fns";
import { 
  useBloodInventory, 
  useDiscardBloodUnit,
  type BloodGroupType, 
  type BloodUnitStatus,
  type BloodComponentType 
} from "@/hooks/useBloodBank";
import { BloodGroupBadge } from "@/components/blood-bank/BloodGroupBadge";
import { BloodStockWidget } from "@/components/blood-bank/BloodStockWidget";
import { ListFilterBar } from "@/components/inventory/ListFilterBar";
import { useTranslation } from "@/lib/i18n";

const bloodGroups: BloodGroupType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const componentTypes: { value: BloodComponentType; label: string }[] = [
  { value: 'whole_blood', label: 'Whole Blood' },
  { value: 'packed_rbc', label: 'Packed RBC' },
  { value: 'fresh_frozen_plasma', label: 'Fresh Frozen Plasma' },
  { value: 'platelet_concentrate', label: 'Platelet Concentrate' },
  { value: 'cryoprecipitate', label: 'Cryoprecipitate' },
  { value: 'granulocytes', label: 'Granulocytes' },
];

const statusConfig: Record<BloodUnitStatus, { label: string; color: string }> = {
  quarantine: { label: 'Quarantine', color: 'bg-yellow-100 text-yellow-700' },
  available: { label: 'Available', color: 'bg-green-100 text-green-700' },
  reserved: { label: 'Reserved', color: 'bg-blue-100 text-blue-700' },
  cross_matched: { label: 'Cross-Matched', color: 'bg-purple-100 text-purple-700' },
  issued: { label: 'Issued', color: 'bg-teal-100 text-teal-700' },
  transfused: { label: 'Transfused', color: 'bg-gray-100 text-gray-700' },
  expired: { label: 'Expired', color: 'bg-red-100 text-red-700' },
  discarded: { label: 'Discarded', color: 'bg-red-200 text-red-800' },
};

export default function InventoryPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const showExpiring = searchParams.get('expiring') === 'true';

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BloodUnitStatus | "all">(showExpiring ? "available" : "available");
  const [bloodGroupFilter, setBloodGroupFilter] = useState<BloodGroupType | "all">("all");
  const [componentFilter, setComponentFilter] = useState<BloodComponentType | "all">("all");

  // Discard dialog state
  const [discardUnit, setDiscardUnit] = useState<any | null>(null);
  const [discardReason, setDiscardReason] = useState("");
  const [discardNotes, setDiscardNotes] = useState("");
  const discardMutation = useDiscardBloodUnit();

  const { data: inventory, isLoading } = useBloodInventory({
    status: statusFilter === "all" ? undefined : statusFilter,
    bloodGroup: bloodGroupFilter === "all" ? undefined : bloodGroupFilter,
    componentType: componentFilter === "all" ? undefined : componentFilter,
    expiringWithinDays: showExpiring ? 7 : undefined,
    search: search || undefined,
  });

  const getExpiryStatus = (expiryDate: string) => {
    const daysUntilExpiry = differenceInDays(parseISO(expiryDate), new Date());
    if (daysUntilExpiry < 0) return { label: 'Expired', color: 'text-destructive' };
    if (daysUntilExpiry <= 3) return { label: `${daysUntilExpiry}d left`, color: 'text-destructive' };
    if (daysUntilExpiry <= 7) return { label: `${daysUntilExpiry}d left`, color: 'text-warning' };
    return { label: `${daysUntilExpiry}d left`, color: 'text-muted-foreground' };
  };

  const getComponentLabel = (type: BloodComponentType) => {
    return componentTypes.find(c => c.value === type)?.label || type;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blood Inventory"
        description="Manage blood units and components"
        actions={
          <Button onClick={() => navigate('/app/blood-bank/inventory/add')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Blood Unit
          </Button>
        }
      />

      {/* Stock Overview */}
      <BloodStockWidget />

      {/* Filters */}
      <ListFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("bb.searchUnits")}
      >
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as BloodUnitStatus | "all")}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(statusConfig).map(([value, config]) => (
              <SelectItem key={value} value={value}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={bloodGroupFilter} onValueChange={(v) => setBloodGroupFilter(v as BloodGroupType | "all")}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Blood Group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Groups</SelectItem>
            {bloodGroups.map((group) => (
              <SelectItem key={group} value={group}>{group}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={componentFilter} onValueChange={(v) => setComponentFilter(v as BloodComponentType | "all")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Component" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Components</SelectItem>
            {componentTypes.map((comp) => (
              <SelectItem key={comp.value} value={comp.value}>{comp.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {showExpiring && (
          <Badge variant="destructive" className="h-10 flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            Showing units expiring within 7 days
          </Badge>
        )}
      </ListFilterBar>

      {/* Inventory Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : inventory && inventory.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 text-sm font-medium">Unit #</th>
                    <th className="text-left p-3 text-sm font-medium">Blood Group</th>
                    <th className="text-left p-3 text-sm font-medium">Component</th>
                    <th className="text-left p-3 text-sm font-medium">Volume</th>
                    <th className="text-left p-3 text-sm font-medium">Collected</th>
                    <th className="text-left p-3 text-sm font-medium">Expiry</th>
                     <th className="text-left p-3 text-sm font-medium">Status</th>
                     <th className="text-left p-3 text-sm font-medium">Location</th>
                     <th className="text-left p-3 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((unit) => {
                    const expiryStatus = getExpiryStatus(unit.expiry_date);
                    const statusInfo = statusConfig[unit.status];
                    return (
                      <tr 
                        key={unit.id} 
                        className="border-b hover:bg-muted/50 cursor-pointer"
                        onClick={() => navigate(`/app/blood-bank/inventory/${unit.id}`)}
                      >
                        <td className="p-3 font-mono text-sm">{unit.unit_number}</td>
                        <td className="p-3">
                          <BloodGroupBadge group={unit.blood_group} size="sm" />
                        </td>
                        <td className="p-3 text-sm">{getComponentLabel(unit.component_type)}</td>
                        <td className="p-3 text-sm">{unit.volume_ml} ml</td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {format(parseISO(unit.collection_date), "MMM d, yyyy")}
                        </td>
                        <td className="p-3">
                          <div className={`flex items-center gap-1 text-sm ${expiryStatus.color}`}>
                            <Calendar className="h-3.5 w-3.5" />
                            {format(parseISO(unit.expiry_date), "MMM d")}
                            <span className="text-xs">({expiryStatus.label})</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {unit.storage_location || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No blood units found</h3>
          <p className="text-muted-foreground mb-4">
            {statusFilter !== "all" || bloodGroupFilter !== "all" || componentFilter !== "all"
              ? "Try adjusting your filters"
              : "Add blood units from donations to build inventory"}
          </p>
          <Button onClick={() => navigate('/app/blood-bank/donations')}>
            <Droplets className="h-4 w-4 mr-2" />
            Process Donations
          </Button>
        </div>
      )}
    </div>
  );
}
