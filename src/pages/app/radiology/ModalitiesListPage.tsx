import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
import { toast } from 'sonner';
import { Plus, Edit, Radio } from 'lucide-react';

interface Modality {
  id: string;
  name: string;
  code: string;
  department: string | null;
  preparation_instructions: string | null;
  default_duration_minutes: number | null;
  is_active: boolean;
}

export default function ModalitiesListPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModality, setEditingModality] = useState<Modality | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    department: '',
    preparation_instructions: '',
    default_duration_minutes: 30,
    is_active: true,
  });

  const { data: modalities, isLoading } = useQuery({
    queryKey: ['imaging-modalities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('imaging_modalities')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Modality[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      if (data.id) {
        const { error } = await supabase
          .from('imaging_modalities')
          .update(data)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('imaging_modalities')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imaging-modalities'] });
      toast.success(editingModality ? 'Modality updated' : 'Modality created');
      handleCloseDialog();
    },
    onError: () => {
      toast.error('Failed to save modality');
    },
  });

  const handleOpenDialog = (modality?: Modality) => {
    if (modality) {
      setEditingModality(modality);
      setFormData({
        name: modality.name,
        code: modality.code,
        department: modality.department || '',
        preparation_instructions: modality.preparation_instructions || '',
        default_duration_minutes: modality.default_duration_minutes || 30,
        is_active: modality.is_active,
      });
    } else {
      setEditingModality(null);
      setFormData({
        name: '',
        code: '',
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
    setEditingModality(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      ...formData,
      id: editingModality?.id,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Imaging Modalities"
        subtitle="Manage available imaging modalities and equipment"
      >
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Modality
        </Button>
      </PageHeader>

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
              {editingModality ? 'Edit Modality' : 'Add Modality'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  onChange={(e) => setFormData(prev => ({ ...prev, default_duration_minutes: parseInt(e.target.value) }))}
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
