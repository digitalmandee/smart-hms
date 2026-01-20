import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Heart, FileText, FolderOpen, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

type ConfigType = "nurse_specializations" | "document_categories" | "document_types";

const CONFIG_TABS: { value: ConfigType; label: string; icon: React.ReactNode; table: string }[] = [
  { value: "nurse_specializations", label: "Nurse Specializations", icon: <Heart className="h-4 w-4" />, table: "config_nurse_specializations" },
  { value: "document_categories", label: "Document Categories", icon: <FolderOpen className="h-4 w-4" />, table: "config_document_categories" },
  { value: "document_types", label: "Document Types", icon: <FileText className="h-4 w-4" />, table: "config_document_types" },
];

interface ConfigItem {
  id: string;
  name: string;
  code: string;
  description?: string;
  category_id?: string;
  requires_expiry?: boolean;
  sort_order: number;
  is_active: boolean;
}

interface Category {
  id: string;
  name: string;
  code: string;
}

export default function HRConfigPage() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ConfigType>("nurse_specializations");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ConfigItem | null>(null);
  const [formData, setFormData] = useState({ 
    name: "", 
    code: "", 
    description: "", 
    category_id: "",
    requires_expiry: false 
  });

  const currentTab = CONFIG_TABS.find(t => t.value === activeTab)!;

  const { data: items, isLoading } = useQuery({
    queryKey: ["hr-config", activeTab, profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from(currentTab.table)
        .select("*")
        .eq("organization_id", profile.organization_id)
        .order("sort_order");
      if (error) throw error;
      return (data || []) as unknown as ConfigItem[];
    },
    enabled: !!profile?.organization_id,
  });

  const { data: categories } = useQuery({
    queryKey: ["document-categories", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from("config_document_categories")
        .select("id, name, code")
        .eq("organization_id", profile.organization_id)
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as Category[];
    },
    enabled: !!profile?.organization_id && activeTab === "document_types",
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<ConfigItem>) => {
      const { error } = await supabase.from(currentTab.table as any).insert({
        ...data,
        organization_id: profile?.organization_id,
        sort_order: (items?.length || 0) + 1,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr-config", activeTab] });
      toast({ title: "Item added successfully" });
      setDialogOpen(false);
      resetForm();
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<ConfigItem> & { id: string }) => {
      const { error } = await supabase.from(currentTab.table as any).update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr-config", activeTab] });
      toast({ title: "Item updated" });
      setDialogOpen(false);
      setEditingItem(null);
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(currentTab.table as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr-config", activeTab] });
      toast({ title: "Item deleted" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const resetForm = () => {
    setFormData({ name: "", code: "", description: "", category_id: "", requires_expiry: false });
  };

  const handleOpenDialog = (item?: ConfigItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({ 
        name: item.name, 
        code: item.code || "", 
        description: item.description || "",
        category_id: item.category_id || "",
        requires_expiry: item.requires_expiry || false,
      });
    } else {
      setEditingItem(null);
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    const data: Partial<ConfigItem> = { 
      name: formData.name, 
      code: formData.code,
    };
    
    if (activeTab === "nurse_specializations") {
      data.description = formData.description;
    }
    if (activeTab === "document_types") {
      data.category_id = formData.category_id || undefined;
      data.requires_expiry = formData.requires_expiry;
    }

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const toggleActive = (item: ConfigItem) => {
    updateMutation.mutate({ id: item.id, is_active: !item.is_active });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="HR Configuration"
        description="Manage nurse specializations and document types for HR module"
      />

      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ConfigType)}>
            <TabsList className="grid grid-cols-3 mb-4">
              {CONFIG_TABS.map(tab => (
                <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {CONFIG_TABS.map(tab => (
              <TabsContent key={tab.value} value={tab.value}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">{tab.label}</h3>
                  <Button onClick={() => handleOpenDialog()} size="sm">
                    <Plus className="h-4 w-4 mr-2" /> Add
                  </Button>
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : !items?.length ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No items configured. Click "Add" to create one.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        {tab.value === "document_types" && <TableHead>Category</TableHead>}
                        {tab.value === "document_types" && <TableHead>Expiry Required</TableHead>}
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-sm">{item.code}</TableCell>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          {tab.value === "document_types" && (
                            <TableCell>
                              {categories?.find(c => c.id === item.category_id)?.name || "-"}
                            </TableCell>
                          )}
                          {tab.value === "document_types" && (
                            <TableCell>
                              {item.requires_expiry ? "Yes" : "No"}
                            </TableCell>
                          )}
                          <TableCell>
                            <Badge variant={item.is_active ? "default" : "secondary"}>
                              {item.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => toggleActive(item)}>
                              <Switch checked={item.is_active} />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(item.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit" : "Add"} Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Code</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g., icu, general"
              />
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Display name"
              />
            </div>
            {activeTab === "nurse_specializations" && (
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description"
                />
              </div>
            )}
            {activeTab === "document_types" && (
              <>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select 
                    value={formData.category_id} 
                    onValueChange={(v) => setFormData({ ...formData, category_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.requires_expiry}
                    onCheckedChange={(v) => setFormData({ ...formData, requires_expiry: v })}
                  />
                  <Label>Requires Expiry Date</Label>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSave} 
              disabled={!formData.name || !formData.code || createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingItem ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
