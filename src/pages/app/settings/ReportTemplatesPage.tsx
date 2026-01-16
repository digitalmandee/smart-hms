import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReportTemplates, useCreateReportTemplate, useUpdateReportTemplate } from "@/hooks/useReportTemplates";
import { Plus, FileText, Search, Edit, Star } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

interface TemplateFormData {
  report_type: string;
  name: string;
  template_content: string;
  header_content: string;
  footer_content: string;
  is_default: boolean;
  is_active: boolean;
}

const reportTypes = [
  { value: 'lab', label: 'Lab Report' },
  { value: 'radiology', label: 'Radiology Report' },
  { value: 'discharge', label: 'Discharge Summary' },
  { value: 'prescription', label: 'Prescription' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'receipt', label: 'Receipt' },
];

export default function ReportTemplatesPage() {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<string>("all");

  const { data: templates, isLoading } = useReportTemplates();
  const createTemplate = useCreateReportTemplate();
  const updateTemplate = useUpdateReportTemplate();

  const { register, handleSubmit, reset, setValue, watch } = useForm<TemplateFormData>({
    defaultValues: {
      is_active: true,
      is_default: false,
      template_content: '',
      header_content: '',
      footer_content: '',
    }
  });

  const filteredTemplates = templates?.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'all' || template.report_type === selectedType;
    return matchesSearch && matchesType;
  });

  const onSubmit = async (data: TemplateFormData) => {
    try {
      if (editingTemplate) {
        await updateTemplate.mutateAsync({ id: editingTemplate.id, ...data } as any);
        toast.success("Template updated successfully");
      } else {
        await createTemplate.mutateAsync(data as any);
        toast.success("Template created successfully");
      }
      setIsDialogOpen(false);
      setEditingTemplate(null);
      reset();
    } catch (error) {
      toast.error("Failed to save template");
    }
  };

  const openEditDialog = (template: any) => {
    setEditingTemplate(template);
    setValue("report_type", template.report_type);
    setValue("name", template.name);
    setValue("template_content", template.template_content || '');
    setValue("header_content", template.header_content || '');
    setValue("footer_content", template.footer_content || '');
    setValue("is_default", template.is_default);
    setValue("is_active", template.is_active);
    setIsDialogOpen(true);
  };

  const columns = [
    {
      accessorKey: "name",
      header: "Template Name",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.original.name}</span>
          {row.original.is_default && (
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          )}
        </div>
      ),
    },
    {
      accessorKey: "report_type",
      header: "Type",
      cell: ({ row }: any) => (
        <Badge variant="outline" className="capitalize">
          {row.original.report_type}
        </Badge>
      ),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }: any) => (
        <Badge variant={row.original.is_active ? "default" : "secondary"}>
          {row.original.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }: any) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openEditDialog(row.original)}
        >
          <Edit className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Report Templates"
        description="Manage report templates for various document types"
        actions={
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingTemplate(null);
              reset();
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? "Edit Template" : "Add Template"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Report Type</Label>
                    <Select
                      value={watch("report_type")}
                      onValueChange={(value) => setValue("report_type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {reportTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Template Name</Label>
                    <Input {...register("name", { required: true })} placeholder="e.g., Standard Lab Report" />
                  </div>
                </div>

                <Tabs defaultValue="content" className="w-full">
                  <TabsList>
                    <TabsTrigger value="content">Main Content</TabsTrigger>
                    <TabsTrigger value="header">Header</TabsTrigger>
                    <TabsTrigger value="footer">Footer</TabsTrigger>
                  </TabsList>
                  <TabsContent value="content" className="space-y-2">
                    <Label>Template Content (HTML/Markdown)</Label>
                    <Textarea
                      {...register("template_content")}
                      placeholder="Enter template content..."
                      rows={10}
                      className="font-mono text-sm"
                    />
                  </TabsContent>
                  <TabsContent value="header" className="space-y-2">
                    <Label>Header Content</Label>
                    <Textarea
                      {...register("header_content")}
                      placeholder="Enter header content..."
                      rows={5}
                      className="font-mono text-sm"
                    />
                  </TabsContent>
                  <TabsContent value="footer" className="space-y-2">
                    <Label>Footer Content</Label>
                    <Textarea
                      {...register("footer_content")}
                      placeholder="Enter footer content..."
                      rows={5}
                      className="font-mono text-sm"
                    />
                  </TabsContent>
                </Tabs>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={watch("is_default")}
                      onCheckedChange={(checked) => setValue("is_default", checked)}
                    />
                    <Label>Set as Default</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={watch("is_active")}
                      onCheckedChange={(checked) => setValue("is_active", checked)}
                    />
                    <Label>Active</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createTemplate.isPending || updateTemplate.isPending}>
                    {editingTemplate ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredTemplates || []}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
