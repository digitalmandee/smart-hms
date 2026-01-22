import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Edit, Copy, Search, FileText } from 'lucide-react';
import { 
  useAllImagingReportTemplates, 
  useCreateImagingReportTemplate, 
  useUpdateImagingReportTemplate,
  useImagingProcedures,
  IMAGING_MODALITIES,
  ImagingModality,
  ImagingReportTemplate,
} from '@/hooks/useImaging';

interface TemplateFormData {
  name: string;
  modality: ImagingModality | '';
  procedure_id: string;
  technique: string;
  findings: string;
  impression: string;
  recommendations: string;
  is_active: boolean;
}

const defaultFormData: TemplateFormData = {
  name: '',
  modality: '',
  procedure_id: '',
  technique: '',
  findings: '',
  impression: '',
  recommendations: '',
  is_active: true,
};

export default function ImagingReportTemplatesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>(defaultFormData);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalityFilter, setModalityFilter] = useState<string>('all');

  const { data: templates, isLoading } = useAllImagingReportTemplates();
  const { data: procedures } = useImagingProcedures();
  const { mutate: createTemplate, isPending: isCreating } = useCreateImagingReportTemplate();
  const { mutate: updateTemplate, isPending: isUpdating } = useUpdateImagingReportTemplate();

  const filteredTemplates = templates?.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModality = modalityFilter === 'all' || t.modality === modalityFilter;
    return matchesSearch && matchesModality;
  });

  const handleOpenDialog = (template?: ImagingReportTemplate) => {
    if (template) {
      setEditingId(template.id);
      setFormData({
        name: template.name,
        modality: template.modality || '',
        procedure_id: template.procedure_id || '',
        technique: template.template_structure?.technique || '',
        findings: template.template_structure?.findings || '',
        impression: template.template_structure?.impression || '',
        recommendations: template.template_structure?.recommendations || '',
        is_active: template.is_active,
      });
    } else {
      setEditingId(null);
      setFormData(defaultFormData);
    }
    setIsDialogOpen(true);
  };

  const handleClone = (template: ImagingReportTemplate) => {
    setEditingId(null);
    setFormData({
      name: `${template.name} (Copy)`,
      modality: template.modality || '',
      procedure_id: template.procedure_id || '',
      technique: template.template_structure?.technique || '',
      findings: template.template_structure?.findings || '',
      impression: template.template_structure?.impression || '',
      recommendations: template.template_structure?.recommendations || '',
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Template name is required');
      return;
    }
    if (!formData.modality) {
      toast.error('Please select a modality');
      return;
    }

    const template_structure = {
      technique: formData.technique || '',
      findings: formData.findings || '',
      impression: formData.impression || '',
      recommendations: formData.recommendations || '',
    };

    if (editingId) {
      updateTemplate({ 
        id: editingId, 
        name: formData.name,
        modality: formData.modality as ImagingModality,
        procedure_id: formData.procedure_id || null,
        template_structure,
        is_active: formData.is_active,
      }, {
        onSuccess: () => {
          setIsDialogOpen(false);
          setEditingId(null);
          setFormData(defaultFormData);
        }
      });
    } else {
      createTemplate({
        name: formData.name,
        modality: formData.modality as ImagingModality,
        procedure_id: formData.procedure_id || null,
        template_structure,
        is_active: formData.is_active,
      }, {
        onSuccess: () => {
          setIsDialogOpen(false);
          setFormData(defaultFormData);
        }
      });
    }
  };

  const getModalityLabel = (modality: string) => {
    return IMAGING_MODALITIES.find(m => m.value === modality)?.label || modality;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Imaging Report Templates"
        description="Manage standardized report templates for radiology procedures"
        actions={
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Template
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
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
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredTemplates?.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground">No templates found</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => handleOpenDialog()}>
                Create your first template
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template Name</TableHead>
                  <TableHead>Modality</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates?.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>{getModalityLabel(template.modality)}</TableCell>
                    <TableCell>
                      <Badge variant={template.is_active ? 'default' : 'secondary'}>
                        {template.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleClone(template)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(template)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Template' : 'Create Template'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Normal Chest X-Ray"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="modality">Modality *</Label>
                <Select
                  value={formData.modality}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, modality: value as ImagingModality }))}
                >
                  <SelectTrigger id="modality">
                    <SelectValue placeholder="Select modality" />
                  </SelectTrigger>
                  <SelectContent>
                    {IMAGING_MODALITIES.map(m => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Tabs defaultValue="technique" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="technique">Technique</TabsTrigger>
                <TabsTrigger value="findings">Findings</TabsTrigger>
                <TabsTrigger value="impression">Impression</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              <TabsContent value="technique" className="mt-4">
                <Textarea
                  value={formData.technique}
                  onChange={(e) => setFormData(prev => ({ ...prev, technique: e.target.value }))}
                  placeholder="Describe the standard imaging technique..."
                  rows={6}
                  className="font-mono text-sm"
                />
              </TabsContent>

              <TabsContent value="findings" className="mt-4">
                <Textarea
                  value={formData.findings}
                  onChange={(e) => setFormData(prev => ({ ...prev, findings: e.target.value }))}
                  placeholder="Enter the standard normal findings template..."
                  rows={10}
                  className="font-mono text-sm"
                />
              </TabsContent>

              <TabsContent value="impression" className="mt-4">
                <Textarea
                  value={formData.impression}
                  onChange={(e) => setFormData(prev => ({ ...prev, impression: e.target.value }))}
                  placeholder="Enter the standard impression..."
                  rows={4}
                  className="font-mono text-sm"
                />
              </TabsContent>

              <TabsContent value="recommendations" className="mt-4">
                <Textarea
                  value={formData.recommendations}
                  onChange={(e) => setFormData(prev => ({ ...prev, recommendations: e.target.value }))}
                  placeholder="Enter standard recommendations if any..."
                  rows={4}
                  className="font-mono text-sm"
                />
              </TabsContent>
            </Tabs>

            <div className="flex items-center space-x-2 pt-4 border-t">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isCreating || isUpdating}>
              {isCreating || isUpdating ? 'Saving...' : editingId ? 'Update Template' : 'Create Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
