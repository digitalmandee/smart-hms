import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, MapPin, Languages, Briefcase, Users, Megaphone, Shield, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

type ConfigType = "cities" | "languages" | "occupations" | "relations" | "referral_sources" | "insurance_providers";

const CONFIG_TABS: { value: ConfigType; label: string; icon: React.ReactNode; table: string }[] = [
  { value: "cities", label: "Cities", icon: <MapPin className="h-4 w-4" />, table: "config_cities" },
  { value: "languages", label: "Languages", icon: <Languages className="h-4 w-4" />, table: "config_languages" },
  { value: "occupations", label: "Occupations", icon: <Briefcase className="h-4 w-4" />, table: "config_occupations" },
  { value: "relations", label: "Relations", icon: <Users className="h-4 w-4" />, table: "config_relations" },
  { value: "referral_sources", label: "Referral Sources", icon: <Megaphone className="h-4 w-4" />, table: "config_referral_sources" },
  { value: "insurance_providers", label: "Insurance", icon: <Shield className="h-4 w-4" />, table: "config_insurance_providers" },
];

interface ConfigItem {
  id: string;
  name: string;
  code?: string;
  province?: string;
  contact_number?: string;
  sort_order: number;
  is_active: boolean;
}

export default function PatientConfigPage() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ConfigType>("cities");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ConfigItem | null>(null);
  const [formData, setFormData] = useState({ name: "", code: "", province: "", contact_number: "" });

  const currentTab = CONFIG_TABS.find(t => t.value === activeTab)!;

  const { data: items, isLoading } = useQuery({
    queryKey: ["patient-config", activeTab, profile?.organization_id],
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
      queryClient.invalidateQueries({ queryKey: ["patient-config", activeTab] });
      toast({ title: "Item added successfully" });
      setDialogOpen(false);
      setFormData({ name: "", code: "", province: "", contact_number: "" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<ConfigItem> & { id: string }) => {
      const { error } = await supabase.from(currentTab.table as any).update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-config", activeTab] });
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
      queryClient.invalidateQueries({ queryKey: ["patient-config", activeTab] });
      toast({ title: "Item deleted" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const handleOpenDialog = (item?: ConfigItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({ 
        name: item.name, 
        code: item.code || "", 
        province: item.province || "",
        contact_number: item.contact_number || "",
      });
    } else {
      setEditingItem(null);
      setFormData({ name: "", code: "", province: "", contact_number: "" });
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    const data: Partial<ConfigItem> = { name: formData.name };
    if (activeTab === "languages") data.code = formData.code;
    if (activeTab === "cities") data.province = formData.province;
    if (activeTab === "insurance_providers") {
      data.code = formData.code;
      data.contact_number = formData.contact_number;
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
        title="Patient Demographics Configuration"
        description="Manage dropdown options for patient registration forms"
      />

      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ConfigType)}>
            <TabsList className="grid grid-cols-3 lg:grid-cols-6 mb-4">
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
                    <Plus className="h-4 w-4 mr-2" /> Add {tab.label.slice(0, -1)}
                  </Button>
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : !items?.length ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No {tab.label.toLowerCase()} configured. Click "Add" to create one.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        {tab.value === "languages" && <TableHead>Code</TableHead>}
                        {tab.value === "cities" && <TableHead>Province</TableHead>}
                        {tab.value === "insurance_providers" && <TableHead>Code</TableHead>}
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          {tab.value === "languages" && <TableCell>{item.code}</TableCell>}
                          {tab.value === "cities" && <TableCell>{item.province || "-"}</TableCell>}
                          {tab.value === "insurance_providers" && <TableCell>{item.code || "-"}</TableCell>}
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
            <DialogTitle>{editingItem ? "Edit" : "Add"} {currentTab.label.slice(0, -1)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter name"
              />
            </div>
            {activeTab === "languages" && (
              <div className="space-y-2">
                <Label>Code</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., en, ur, pa"
                />
              </div>
            )}
            {activeTab === "cities" && (
              <div className="space-y-2">
                <Label>Province</Label>
                <Input
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  placeholder="e.g., Punjab, Sindh"
                />
              </div>
            )}
            {activeTab === "insurance_providers" && (
              <>
                <div className="space-y-2">
                  <Label>Code</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Short code"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Number</Label>
                  <Input
                    value={formData.contact_number}
                    onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                    placeholder="Phone number"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!formData.name || createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingItem ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
