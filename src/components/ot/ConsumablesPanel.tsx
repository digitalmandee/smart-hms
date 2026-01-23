import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import {
  useSurgeryConsumables,
  useCreateConsumable,
  useUpdateConsumable,
  useDeleteConsumable,
  useConsumablesTotalCost,
  CONSUMABLE_CATEGORIES,
  type SurgeryConsumable,
} from '@/hooks/useSurgeryConsumables';
import { format } from 'date-fns';
import {
  Plus,
  Package,
  Trash2,
  Edit2,
  AlertTriangle,
  Heart,
  DollarSign,
} from 'lucide-react';

interface ConsumablesPanelProps {
  surgeryId: string;
}

interface ConsumableFormData {
  item_name: string;
  item_category: string;
  quantity: number;
  unit: string;
  unit_price: number;
  lot_number: string;
  batch_number: string;
  serial_number: string;
  expiry_date: string;
  is_implant: boolean;
  implant_location: string;
  implant_size: string;
  manufacturer: string;
  is_billable: boolean;
}

const INITIAL_FORM: ConsumableFormData = {
  item_name: '',
  item_category: 'disposable',
  quantity: 1,
  unit: 'pcs',
  unit_price: 0,
  lot_number: '',
  batch_number: '',
  serial_number: '',
  expiry_date: '',
  is_implant: false,
  implant_location: '',
  implant_size: '',
  manufacturer: '',
  is_billable: true,
};

const UNIT_OPTIONS = ['pcs', 'box', 'pack', 'set', 'ml', 'g', 'cm'];

export function ConsumablesPanel({ surgeryId }: ConsumablesPanelProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SurgeryConsumable | null>(null);
  const [formData, setFormData] = useState<ConsumableFormData>(INITIAL_FORM);

  const { data: consumables, isLoading } = useSurgeryConsumables(surgeryId);
  const costs = useConsumablesTotalCost(surgeryId);
  const createConsumable = useCreateConsumable();
  const updateConsumable = useUpdateConsumable();
  const deleteConsumable = useDeleteConsumable();

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setEditingItem(null);
  };

  const openAddDialog = (isImplant = false) => {
    resetForm();
    setFormData({
      ...INITIAL_FORM,
      is_implant: isImplant,
      item_category: isImplant ? 'implant' : 'disposable',
    });
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (item: SurgeryConsumable) => {
    setEditingItem(item);
    setFormData({
      item_name: item.item_name,
      item_category: item.item_category || 'disposable',
      quantity: item.quantity,
      unit: item.unit || 'pcs',
      unit_price: item.unit_price || 0,
      lot_number: item.lot_number || '',
      batch_number: item.batch_number || '',
      serial_number: item.serial_number || '',
      expiry_date: item.expiry_date ? format(new Date(item.expiry_date), 'yyyy-MM-dd') : '',
      is_implant: item.is_implant,
      implant_location: item.implant_location || '',
      implant_size: item.implant_size || '',
      manufacturer: item.manufacturer || '',
      is_billable: item.is_billable,
    });
    setIsAddDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.item_name.trim()) return;

    if (editingItem) {
      await updateConsumable.mutateAsync({
        id: editingItem.id,
        surgeryId: surgeryId,
        item_name: formData.item_name,
        item_category: formData.item_category,
        quantity: formData.quantity,
        unit: formData.unit,
        unit_price: formData.unit_price,
        total_price: formData.quantity * formData.unit_price,
        lot_number: formData.lot_number || null,
        batch_number: formData.batch_number || null,
        serial_number: formData.serial_number || null,
        expiry_date: formData.expiry_date || null,
        is_implant: formData.is_implant,
        implant_location: formData.implant_location || null,
        implant_size: formData.implant_size || null,
        manufacturer: formData.manufacturer || null,
        is_billable: formData.is_billable,
      });
    } else {
      await createConsumable.mutateAsync({
        surgery_id: surgeryId,
        item_name: formData.item_name,
        item_category: formData.item_category,
        quantity: formData.quantity,
        unit: formData.unit,
        unit_price: formData.unit_price,
        lot_number: formData.lot_number || undefined,
        batch_number: formData.batch_number || undefined,
        serial_number: formData.serial_number || undefined,
        expiry_date: formData.expiry_date || undefined,
        is_implant: formData.is_implant,
        implant_location: formData.implant_location || undefined,
        implant_size: formData.implant_size || undefined,
        manufacturer: formData.manufacturer || undefined,
        is_billable: formData.is_billable,
      });
    }

    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleDelete = async (item: SurgeryConsumable) => {
    await deleteConsumable.mutateAsync({
      consumableId: item.id,
      surgeryId: surgeryId,
    });
  };

  const implants = consumables?.filter((c) => c.is_implant) || [];
  const supplies = consumables?.filter((c) => !c.is_implant) || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header with Cost Summary */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Package className="h-5 w-5" />
            Consumables & Implants
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Track all surgical supplies, sutures, and implants used
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => openAddDialog(true)} className="gap-1">
            <Heart className="h-4 w-4" />
            Add Implant
          </Button>
          <Button size="sm" onClick={() => openAddDialog(false)} className="gap-1">
            <Plus className="h-4 w-4" />
            Add Supply
          </Button>
        </div>
      </div>

      {/* Cost Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Total Cost</div>
            <div className="text-2xl font-bold">{formatCurrency(costs.total)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Billable
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(costs.billable)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Heart className="h-3 w-3" />
              Implants
            </div>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(costs.implants)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Implants Section */}
      {implants.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2 text-primary">
            <Heart className="h-4 w-4" />
            Implants ({implants.length})
          </h4>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Serial/Lot #</TableHead>
                  <TableHead>Size/Location</TableHead>
                  <TableHead>Manufacturer</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {implants.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.item_name}
                      {item.expiry_date && new Date(item.expiry_date) < new Date() && (
                        <Badge variant="destructive" className="ml-2 text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Expired
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {item.serial_number && <div>SN: {item.serial_number}</div>}
                        {item.lot_number && <div className="text-muted-foreground">Lot: {item.lot_number}</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {item.implant_size && <div>{item.implant_size}</div>}
                        {item.implant_location && (
                          <div className="text-muted-foreground">{item.implant_location}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{item.manufacturer || '-'}</TableCell>
                    <TableCell className="text-right">
                      {item.total_price ? formatCurrency(item.total_price) : '-'}
                      {!item.is_billable && (
                        <Badge variant="outline" className="ml-1 text-xs">
                          Non-billable
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(item)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Implant</AlertDialogTitle>
                              <AlertDialogDescription>
                                Remove "{item.item_name}" from the surgery record?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(item)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Supplies Section */}
      <div className="space-y-2">
        <h4 className="font-medium">Supplies & Consumables ({supplies.length})</h4>
        {isLoading ? (
          <p className="text-muted-foreground text-sm p-4">Loading consumables...</p>
        ) : supplies.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-muted-foreground">
              <Package className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>No supplies recorded yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Lot/Batch</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supplies.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.item_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs capitalize">
                        {item.item_category?.replace('_', ' ') || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.quantity} {item.unit}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.lot_number || item.batch_number || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.total_price ? formatCurrency(item.total_price) : '-'}
                      {!item.is_billable && (
                        <Badge variant="outline" className="ml-1 text-xs">
                          Non-billable
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(item)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Item</AlertDialogTitle>
                              <AlertDialogDescription>
                                Remove "{item.item_name}" from the surgery record?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(item)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingItem
                ? `Edit ${formData.is_implant ? 'Implant' : 'Supply'}`
                : `Add ${formData.is_implant ? 'Implant' : 'Supply'}`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label>Item Name *</Label>
                <Input
                  value={formData.item_name}
                  onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                  placeholder="e.g., Vicryl 2-0 Suture"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={formData.item_category}
                  onValueChange={(v) => setFormData({ ...formData, item_category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONSUMABLE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Manufacturer</Label>
                <Input
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  placeholder="e.g., Ethicon"
                />
              </div>
            </div>

            {/* Quantity & Price */}
            <div className="grid grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Unit</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(v) => setFormData({ ...formData, unit: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIT_OPTIONS.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Unit Price (₹)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.unit_price}
                  onChange={(e) =>
                    setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            {/* Tracking Numbers */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Lot Number</Label>
                <Input
                  value={formData.lot_number}
                  onChange={(e) => setFormData({ ...formData, lot_number: e.target.value })}
                  placeholder="Lot #"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Batch Number</Label>
                <Input
                  value={formData.batch_number}
                  onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                  placeholder="Batch #"
                />
              </div>
              {formData.is_implant && (
                <div className="col-span-2 space-y-1.5">
                  <Label>Serial Number</Label>
                  <Input
                    value={formData.serial_number}
                    onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                    placeholder="Device serial number"
                  />
                </div>
              )}
              <div className="col-span-2 space-y-1.5">
                <Label>Expiry Date</Label>
                <Input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                />
              </div>
            </div>

            {/* Implant-specific fields */}
            {formData.is_implant && (
              <>
                <Separator />
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Implant Size</Label>
                    <Input
                      value={formData.implant_size}
                      onChange={(e) => setFormData({ ...formData, implant_size: e.target.value })}
                      placeholder="e.g., 10mm x 5mm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Implant Location</Label>
                    <Input
                      value={formData.implant_location}
                      onChange={(e) =>
                        setFormData({ ...formData, implant_location: e.target.value })
                      }
                      placeholder="e.g., Right hip"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Billable Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="billable"
                checked={formData.is_billable}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_billable: checked as boolean })
                }
              />
              <Label htmlFor="billable" className="text-sm font-normal">
                Billable to patient
              </Label>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsAddDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  !formData.item_name.trim() ||
                  createConsumable.isPending ||
                  updateConsumable.isPending
                }
              >
                {editingItem ? 'Update' : 'Add'} {formData.is_implant ? 'Implant' : 'Supply'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
