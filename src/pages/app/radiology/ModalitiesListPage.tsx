import { useState } from 'react';
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
import { useImagingModalities, useCreateImagingModality, useUpdateImagingModality, IMAGING_MODALITIES, ImagingModality } from '@/hooks/useImaging';
import { toast } from 'sonner';
import { Plus, Edit, Radio } from 'lucide-react';

export default function ModalitiesListPage() {
  const { data: modalities, isLoading } = useImagingModalities();
  const { mutate: createModality, isPending: isCreating } = useCreateImagingModality();
  const { mutate: updateModality, isPending: isUpdating } = useUpdateImagingModality();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    modality_type: '' as ImagingModality | '',
    department: '',
    preparation_instructions: '',
    default_duration_minutes: 30,
    is_active: true,
  });

  const handleOpenDialog = (modality?: typeof modalities extends (infer T)[] | undefined ? T : never) => {
    if (modality) {
      setEditingId(modality.id);
      setFormData({
        name: modality.name,
        code: modality.code,
        modality_type: modality.modality_type,
        department: modality.department || '',
        preparation_instructions: modality.preparation_instructions || '',
        default_duration_minutes: modality.default_duration_minutes || 30,
        is_active: modality.is_active,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        code: '',
        modality_type: '',
        department: '',
        preparation_instructions: '',
        default_duration_minutes: 30,
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
      toast.error('Please select a modality type');
      return;
    }

    const data = {
      name: formData.name,
      code: formData.code,
      modality_type: formData.modality_type as ImagingModality,
      department: formData.department || undefined,
      preparation_instructions: formData.preparation_instructions || undefined,
      default_duration_minutes: formData.default_duration_minutes,
      is_active: formData.is_active,
    };

    if (editingId) {
      updateModality({ id: editingId, ...data }, {
        onSuccess: () => handleCloseDialog()
      });
    } else {
      createModality(data, {
        onSuccess: () => handleCloseDialog()
      });
    }
  };

  const isSaving = isCreating || isUpdating;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Imaging Modalities"
        description="Manage available imaging modalities and equipment"
        actions={
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Modality
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : modalities?.length === 0 ? (
            <div className="text-center py-12">
              <Radio className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No modalities configured</p>
              <Button variant="link" onClick={() => handleOpenDialog()}>
                Add your first modality
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modalities?.map((modality) => (
                  <TableRow key={modality.id}>
                    <TableCell className="font-medium">{modality.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{modality.code}</Badge>
                    </TableCell>
                    <TableCell>
                      {IMAGING_MODALITIES.find(m => m.value === modality.modality_type)?.label || modality.modality_type}
                    </TableCell>
                    <TableCell>{modality.department || '-'}</TableCell>
                    <TableCell>{modality.default_duration_minutes} min</TableCell>
                    <TableCell>
                      <Badge variant={modality.is_active ? 'default' : 'secondary'}>
                        {modality.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenDialog(modality)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Modality' : 'Add Modality'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="modality_type">Modality Type *</Label>
              <Select
                value={formData.modality_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, modality_type: value as ImagingModality }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
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
                <Label htmlFor="name">Name *</Label>
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
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Default Duration (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.default_duration_minutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, default_duration_minutes: parseInt(e.target.value) || 30 }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="preparation">Preparation Instructions</Label>
              <Textarea
                id="preparation"
                value={formData.preparation_instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, preparation_instructions: e.target.value }))}
                rows={3}
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
