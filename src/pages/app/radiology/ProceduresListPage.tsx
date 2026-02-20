import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useImagingProcedures, useCreateImagingProcedure, useUpdateImagingProcedure, IMAGING_MODALITIES, ImagingModality } from '@/hooks/useImaging';
import { ModalityBadge } from '@/components/radiology/ModalityBadge';
import { toast } from 'sonner';
import { Plus, Edit, Search, FileImage } from 'lucide-react';

export default function ProceduresListPage() {
  const { t } = useTranslation();
  const { data: procedures, isLoading } = useImagingProcedures();
  const { mutate: createProcedure, isPending: isCreating } = useCreateImagingProcedure();
  const { mutate: updateProcedure, isPending: isUpdating } = useUpdateImagingProcedure();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalityFilter, setModalityFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    modality_type: '' as ImagingModality | '',
    name: '',
    code: '',
    body_part: '',
    default_views: '',
    preparation: '',
    estimated_duration_minutes: 30,
    base_price: 0,
    is_active: true,
  });

  const filteredProcedures = procedures?.filter(proc => {
    const matchesSearch = !searchQuery || 
      proc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proc.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModality = modalityFilter === 'all' || proc.modality_type === modalityFilter;
    return matchesSearch && matchesModality;
  });

  const handleOpenDialog = (procedure?: typeof procedures extends (infer T)[] | undefined ? T : never) => {
    if (procedure) {
      setEditingId(procedure.id);
      setFormData({
        modality_type: procedure.modality_type,
        name: procedure.name,
        code: procedure.code,
        body_part: procedure.body_part || '',
        default_views: procedure.default_views || '',
        preparation: procedure.preparation || '',
        estimated_duration_minutes: procedure.estimated_duration_minutes || 30,
        base_price: procedure.base_price || 0,
        is_active: procedure.is_active,
      });
    } else {
      setEditingId(null);
      setFormData({
        modality_type: '',
        name: '',
        code: '',
        body_part: '',
        default_views: '',
        preparation: '',
        estimated_duration_minutes: 30,
        base_price: 0,
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.modality_type) {
      toast.error('Please select a modality');
      return;
    }

    const data = {
      modality_type: formData.modality_type as ImagingModality,
      name: formData.name,
      code: formData.code,
      body_part: formData.body_part || undefined,
      default_views: formData.default_views || undefined,
      preparation: formData.preparation || undefined,
      estimated_duration_minutes: formData.estimated_duration_minutes,
      base_price: formData.base_price,
      is_active: formData.is_active,
    };

    if (editingId) {
      updateProcedure({ id: editingId, ...data }, {
        onSuccess: () => handleCloseDialog()
      });
    } else {
      createProcedure(data, {
        onSuccess: () => handleCloseDialog()
      });
    }
  };

  const isSaving = isCreating || isUpdating;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('radiology.imagingProcedures' as any)}
        description={t('radiology.imagingProceduresDesc' as any)}
        actions={
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Procedure
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search procedures..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={modalityFilter} onValueChange={setModalityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Modalities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modalities</SelectItem>
            {IMAGING_MODALITIES.map(m => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredProcedures?.length === 0 ? (
            <div className="text-center py-12">
              <FileImage className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No procedures found</p>
              <Button variant="link" onClick={() => handleOpenDialog()}>
                Add your first procedure
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Procedure</TableHead>
                  <TableHead>Modality</TableHead>
                  <TableHead>Body Part</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProcedures?.map((procedure) => (
                  <TableRow key={procedure.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{procedure.name}</p>
                        <p className="text-xs text-muted-foreground">{procedure.code}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <ModalityBadge modality={procedure.modality_type} />
                    </TableCell>
                    <TableCell>{procedure.body_part || '-'}</TableCell>
                    <TableCell>{procedure.estimated_duration_minutes} min</TableCell>
                    <TableCell>
                      {procedure.base_price ? `Rs. ${procedure.base_price.toLocaleString('en-PK')}` : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={procedure.is_active ? 'default' : 'secondary'}>
                        {procedure.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenDialog(procedure)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Procedure' : 'Add Procedure'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="modality_type">Modality *</Label>
              <Select
                value={formData.modality_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, modality_type: value as ImagingModality }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select modality" />
                </SelectTrigger>
                <SelectContent>
                  {IMAGING_MODALITIES.map(m => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Procedure Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="body_part">Body Part</Label>
                <Input
                  id="body_part"
                  value={formData.body_part}
                  onChange={(e) => setFormData(prev => ({ ...prev, body_part: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default_views">Default Views</Label>
                <Input
                  id="default_views"
                  value={formData.default_views}
                  onChange={(e) => setFormData(prev => ({ ...prev, default_views: e.target.value }))}
                  placeholder="e.g., AP, Lateral"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.estimated_duration_minutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration_minutes: parseInt(e.target.value) || 30 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Base Price (Rs.)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.base_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, base_price: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="preparation">Patient Preparation</Label>
              <Textarea
                id="preparation"
                value={formData.preparation}
                onChange={(e) => setFormData(prev => ({ ...prev, preparation: e.target.value }))}
                rows={2}
                placeholder="Any preparation instructions for the patient..."
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
