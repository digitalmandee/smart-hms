import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Stethoscope, Pill, Clock, FileText, TestTube } from "lucide-react";

type ConfigType = "symptoms" | "frequencies" | "durations" | "instructions" | "lab_panels";

interface ConfigItem {
  id: string;
  name?: string;
  code?: string;
  label?: string;
  value?: string;
  text?: string;
  sort_order: number;
  is_active: boolean;
}

const CONFIG_TABS: { value: ConfigType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "symptoms", label: "Symptoms", icon: Stethoscope },
  { value: "frequencies", label: "Dosage Frequencies", icon: Clock },
  { value: "durations", label: "Duration Options", icon: Clock },
  { value: "instructions", label: "Instructions", icon: FileText },
  { value: "lab_panels", label: "Lab Panels", icon: TestTube },
];

const TABLE_MAP: Record<ConfigType, string> = {
  symptoms: "config_symptoms",
  frequencies: "config_dosage_frequencies",
  durations: "config_duration_options",
  instructions: "config_instructions",
  lab_panels: "config_lab_panels",
};

export default function ClinicalConfigPage() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ConfigType>("symptoms");
  const [editItem, setEditItem] = useState<ConfigItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  // Fetch config data
  const { data: configData = [], isLoading } = useQuery({
    queryKey: ["clinical-config", activeTab, profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await (supabase as any)
        .from(TABLE_MAP[activeTab])
        .select("*")
        .eq("organization_id", profile.organization_id)
        .order("sort_order");

      if (error) throw error;
      return data as ConfigItem[];
    },
    enabled: !!profile?.organization_id,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const { error } = await (supabase as any)
        .from(TABLE_MAP[activeTab])
        .insert({
          ...data,
          organization_id: profile?.organization_id,
          sort_order: configData.length + 1,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinical-config", activeTab] });
      toast.success("Item created successfully");
      setIsDialogOpen(false);
      setFormData({});
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create item");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, any> }) => {
      const { error } = await (supabase as any)
        .from(TABLE_MAP[activeTab])
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinical-config", activeTab] });
      toast.success("Item updated successfully");
      setIsDialogOpen(false);
      setEditItem(null);
      setFormData({});
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update item");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from(TABLE_MAP[activeTab])
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinical-config", activeTab] });
      toast.success("Item deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete item");
    },
  });

  // Toggle active status
  const toggleActive = async (item: ConfigItem) => {
    await updateMutation.mutateAsync({
      id: item.id,
      data: { is_active: !item.is_active },
    });
  };

  const handleOpenDialog = (item?: ConfigItem) => {
    if (item) {
      setEditItem(item);
      setFormData({
        name: item.name || "",
        code: item.code || "",
        label: item.label || "",
        value: item.value || "",
        text: item.text || "",
      });
    } else {
      setEditItem(null);
      setFormData({});
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    const data: Record<string, any> = {};
    
    switch (activeTab) {
      case "symptoms":
        data.name = formData.name;
        break;
      case "frequencies":
        data.code = formData.code;
        data.label = formData.label;
        break;
      case "durations":
        data.value = formData.value;
        data.label = formData.label;
        break;
      case "instructions":
        data.text = formData.text;
        break;
      case "lab_panels":
        data.name = formData.name;
        data.tests = formData.tests ? JSON.parse(formData.tests) : [];
        break;
    }

    if (editItem) {
      updateMutation.mutate({ id: editItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getDisplayValue = (item: ConfigItem): string => {
    switch (activeTab) {
      case "symptoms":
      case "lab_panels":
        return item.name || "";
      case "frequencies":
        return `${item.code} - ${item.label}`;
      case "durations":
        return `${item.value} (${item.label})`;
      case "instructions":
        return item.text || "";
      default:
        return "";
    }
  };

  const renderFormFields = () => {
    switch (activeTab) {
      case "symptoms":
        return (
          <div className="space-y-4">
            <div>
              <Label>Symptom Name</Label>
              <Input
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Fever, Headache"
              />
            </div>
          </div>
        );
      case "frequencies":
        return (
          <div className="space-y-4">
            <div>
              <Label>Code</Label>
              <Input
                value={formData.code || ""}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g., 1-0-1, TDS"
              />
            </div>
            <div>
              <Label>Label</Label>
              <Input
                value={formData.label || ""}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="e.g., Twice daily (BD)"
              />
            </div>
          </div>
        );
      case "durations":
        return (
          <div className="space-y-4">
            <div>
              <Label>Value</Label>
              <Input
                value={formData.value || ""}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="e.g., 5 days, 1 month"
              />
            </div>
            <div>
              <Label>Label</Label>
              <Input
                value={formData.label || ""}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="e.g., 5 Days"
              />
            </div>
          </div>
        );
      case "instructions":
        return (
          <div className="space-y-4">
            <div>
              <Label>Instruction Text</Label>
              <Input
                value={formData.text || ""}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                placeholder="e.g., Take with food"
              />
            </div>
          </div>
        );
      case "lab_panels":
        return (
          <div className="space-y-4">
            <div>
              <Label>Panel Name</Label>
              <Input
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., CBC, LFT"
              />
            </div>
            <div>
              <Label>Tests (JSON array)</Label>
              <Input
                value={formData.tests || ""}
                onChange={(e) => setFormData({ ...formData, tests: e.target.value })}
                placeholder='[{"test_name": "CBC", "test_category": "blood"}]'
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clinical Configuration"
        description="Manage symptoms, prescription options, and lab panels"
      />

      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ConfigType)}>
            <div className="flex items-center justify-between mb-6">
              <TabsList>
                {CONFIG_TABS.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </Button>
            </div>

            {CONFIG_TABS.map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : configData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <tab.icon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No items configured yet</p>
                    <Button variant="outline" className="mt-4" onClick={() => handleOpenDialog()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Item
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Value</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Order</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {configData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {getDisplayValue(item)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={item.is_active}
                                onCheckedChange={() => toggleActive(item)}
                              />
                              <Badge variant={item.is_active ? "default" : "secondary"}>
                                {item.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>{item.sort_order}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDialog(item)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => deleteMutation.mutate(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editItem ? "Edit Item" : "Add New Item"}
            </DialogTitle>
            <DialogDescription>
              {editItem ? "Update the configuration item" : "Create a new configuration item"}
            </DialogDescription>
          </DialogHeader>
          {renderFormFields()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editItem ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
