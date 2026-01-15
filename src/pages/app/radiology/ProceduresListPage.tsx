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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { IMAGING_MODALITIES, ImagingModality } from '@/hooks/useImaging';
import { ModalityBadge } from '@/components/radiology/ModalityBadge';
import { toast } from 'sonner';
import { Plus, Edit, Search, FileImage } from 'lucide-react';

interface Procedure {
  id: string;
  modality: ImagingModality;
  name: string;
  code: string;
  body_part: string | null;
  default_views: string | null;
  preparation: string | null;
  estimated_duration_minutes: number | null;
  base_price: number | null;
  is_active: boolean;
}

export default function ProceduresListPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalityFilter, setModalityFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    modality: '' as ImagingModality | '',
    name: '',
    code: '',
    body_part: '',
    default_views: '',
    preparation: '',
    estimated_duration_minutes: 30,
    base_price: 0,
    is_active: true,
  });

  const { data: procedures, isLoading } = useQuery({
    queryKey: ['imaging-procedures'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('imaging_procedures')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Procedure[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      if (data.id) {
        const { error } = await supabase
          .from('imaging_procedures')
          .update(data)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('imaging_procedures')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imaging-procedures'] });
      toast.success(editingProcedure ? 'Procedure updated' : 'Procedure created');
      handleCloseDialog();
    },
    onError: () => {
      toast.error('Failed to save procedure');
    },
  });

  const filteredProcedures = procedures?.filter(proc => {
    const matchesSearch = !searchQuery || 
      proc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proc.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModality = modalityFilter === 'all' || proc.modality === modalityFilter;
    return matchesSearch && matchesModality;
  });

  const handleOpenDialog = (procedure?: Procedure) => {
    if (procedure) {
      setEditingProcedure(procedure);
      setFormData({
        modality: procedure.modality,
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
      setEditingProcedure(null);
      setFormData({
        modality: '',
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
    setEditingProcedure(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.modality) {
      toast.error('Please select a modality');
      return;
    }
    saveMutation.mutate({
      ...formData,
      id: editingProcedure?.id,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Imaging Procedures"
        subtitle="Manage procedure catalog with pricing and preparation"
      >
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Procedure
        </Button>
      </PageHeader>

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
                      <ModalityBadge modality={procedure.modality} />
                    </TableCell>
                    <TableCell>{procedure.body_part || '-'}</TableCell>
                    <TableCell>{procedure.estimated_duration_minutes} min</TableCell>
                    <TableCell>
                      {procedure.base_price ? `₹${procedure.base_price}` : '-'}
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
              {editingProcedure ? 'Edit Procedure' : 'Add Procedure'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="modality">Modality *</Label>
              <Select
                value={formData.modality}
                onValueChange={(value) => setFormData(prev => ({ ...prev, modality: value as ImagingModality }))}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration_minutes: parseInt(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Base Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.base_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, base_price: parseFloat(e.target.value) }))}
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
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
