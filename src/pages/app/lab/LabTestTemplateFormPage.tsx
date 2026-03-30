import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, GripVertical, Save, ArrowLeft } from "lucide-react";
import { 
  useLabTestTemplate, 
  useCreateLabTestTemplate, 
  useUpdateLabTestTemplate,
  useLabTestCategories,
  type TemplateField 
} from "@/hooks/useLabTemplateManagement";
import { Skeleton } from "@/components/ui/skeleton";

const DEFAULT_CATEGORIES = ["Blood", "Urine", "Stool", "CSF", "Serology", "Biochemistry", "Hematology", "Microbiology"];

export default function LabTestTemplateFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const duplicateId = searchParams.get("duplicate");
  
  const isEdit = !!id;
  const isDuplicate = !!duplicateId;
  
  const { data: template, isLoading } = useLabTestTemplate(id || duplicateId || undefined);
  const { data: categories } = useLabTestCategories();
  const createTemplate = useCreateLabTestTemplate();
  const updateTemplate = useUpdateLabTestTemplate();
  
  const [testName, setTestName] = useState("");
  const [testCategory, setTestCategory] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [fields, setFields] = useState<TemplateField[]>([]);

  useEffect(() => {
    if (template) {
      setTestName(isDuplicate ? `${template.test_name} (Copy)` : template.test_name);
      setTestCategory(template.test_category);
      setIsActive(template.is_active);
      setFields(template.fields || []);
    }
  }, [template, isDuplicate]);

  const addField = () => {
    setFields([
      ...fields,
      { name: "", unit: "", normal_min: null, normal_max: null, critical_min: null, critical_max: null, type: "number" },
    ]);
  };

  const updateField = (index: number, updates: Partial<TemplateField>) => {
    setFields(fields.map((f, i) => (i === index ? { ...f, ...updates } : f)));
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!testName || !testCategory) return;

    const data = {
      test_name: testName,
      test_category: testCategory,
      fields,
    };

    if (isEdit) {
      await updateTemplate.mutateAsync({ id, ...data, is_active: isActive });
    } else {
      await createTemplate.mutateAsync(data);
    }
    
    navigate("/app/lab/templates");
  };

  const allCategories = [
    ...DEFAULT_CATEGORIES,
    ...(categories?.map(c => c.name) || []),
  ].filter((v, i, a) => a.indexOf(v) === i);

  if (isLoading && (isEdit || isDuplicate)) {
    return (
      <div>
        <PageHeader
          title="Loading..."
          breadcrumbs={[
            { label: t('nav.lab' as any), href: "/app/lab" },
            { label: "Test Templates", href: "/app/lab/templates" },
            { label: "Loading..." },
          ]}
        />
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={isEdit ? "Edit Test Template" : "New Test Template"}
        description={isEdit ? "Modify test parameters and fields" : "Define test parameters and normal ranges"}
        breadcrumbs={[
          { label: t('nav.lab' as any), href: "/app/lab" },
          { label: "Test Templates", href: "/app/lab/templates" },
          { label: isEdit ? "Edit" : "New" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/app/lab/templates")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!testName || !testCategory || createTemplate.isPending || updateTemplate.isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              {isEdit ? "Save Changes" : "Create Template"}
            </Button>
          </div>
        }
      />

      <div className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter the test name and category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="test_name">Test Name *</Label>
                <Input
                  id="test_name"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="e.g., Complete Blood Count"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="test_category">Category *</Label>
                <Select value={testCategory} onValueChange={setTestCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {isEdit && (
              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Fields */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Test Parameters</CardTitle>
                <CardDescription>Define the fields/parameters for this test</CardDescription>
              </div>
              <Button onClick={addField} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Field
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {fields.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No fields added yet. Click "Add Field" to start.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Header */}
                <div className="grid gap-4 grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr_1fr_auto] items-center text-sm font-medium text-muted-foreground px-2">
                  <div className="w-6"></div>
                  <div>Field Name</div>
                  <div>Unit</div>
                  <div>Type</div>
                  <div>Normal Min</div>
                  <div>Normal Max</div>
                  <div>Critical Min</div>
                  <div>Critical Max</div>
                  <div className="w-10"></div>
                </div>
                
                {/* Fields */}
                {fields.map((field, index) => (
                  <div
                    key={index}
                    className="grid gap-4 grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_auto] items-center p-2 bg-muted/50 rounded-lg"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                    <Input
                      value={field.name}
                      onChange={(e) => updateField(index, { name: e.target.value })}
                      placeholder="e.g., Hemoglobin"
                    />
                    <Input
                      value={field.unit}
                      onChange={(e) => updateField(index, { unit: e.target.value })}
                      placeholder="e.g., g/dL"
                    />
                    <Select
                      value={field.type || "number"}
                      onValueChange={(value) => updateField(index, { type: value as "text" | "number" })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      value={field.normal_min ?? ""}
                      onChange={(e) => updateField(index, { normal_min: e.target.value ? Number(e.target.value) : null })}
                      placeholder="Min"
                      disabled={field.type === "text"}
                    />
                    <Input
                      type="number"
                      value={field.normal_max ?? ""}
                      onChange={(e) => updateField(index, { normal_max: e.target.value ? Number(e.target.value) : null })}
                      placeholder="Max"
                      disabled={field.type === "text"}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeField(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
