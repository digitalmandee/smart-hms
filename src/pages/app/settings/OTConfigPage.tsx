import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, Pencil, Trash2, Loader2, Syringe, Wind, Users, 
  ClipboardCheck, Scissors, UserCog, AlertTriangle, Database
} from "lucide-react";
import {
  useConfigSurgeryPriorities,
  useCreateConfigSurgeryPriority,
  useUpdateConfigSurgeryPriority,
  useDeleteConfigSurgeryPriority,
  useConfigAnesthesiaTypes,
  useCreateConfigAnesthesiaType,
  useUpdateConfigAnesthesiaType,
  useDeleteConfigAnesthesiaType,
  useConfigAirwayDevices,
  useCreateConfigAirwayDevice,
  useUpdateConfigAirwayDevice,
  useDeleteConfigAirwayDevice,
  useConfigOTTeamRoles,
  useCreateConfigOTTeamRole,
  useUpdateConfigOTTeamRole,
  useDeleteConfigOTTeamRole,
  useConfigSurgicalPositions,
  useCreateConfigSurgicalPosition,
  useUpdateConfigSurgicalPosition,
  useDeleteConfigSurgicalPosition,
  useConfigASAClasses,
  useCreateConfigASAClass,
  useUpdateConfigASAClass,
  useDeleteConfigASAClass,
  useSeedOTConfigData,
} from "@/hooks/useOTConfig";

export default function OTConfigPage() {
  const [activeTab, setActiveTab] = useState("priorities");
  const seedData = useSeedOTConfigData();

  const handleSeedData = () => {
    if (confirm("This will populate default OT configuration data. Continue?")) {
      seedData.mutate();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="OT Configuration"
        description="Configure Operation Theatre settings and options"
        breadcrumbs={[
          { label: "Settings", href: "/app/settings" },
          { label: "OT Configuration" },
        ]}
        actions={
          <Button variant="outline" onClick={handleSeedData} disabled={seedData.isPending}>
            {seedData.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
            Seed Default Data
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
          <TabsTrigger value="priorities" className="gap-1">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Priorities</span>
          </TabsTrigger>
          <TabsTrigger value="anesthesia" className="gap-1">
            <Syringe className="h-4 w-4" />
            <span className="hidden sm:inline">Anesthesia</span>
          </TabsTrigger>
          <TabsTrigger value="airway" className="gap-1">
            <Wind className="h-4 w-4" />
            <span className="hidden sm:inline">Airway</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-1">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Team Roles</span>
          </TabsTrigger>
          <TabsTrigger value="positions" className="gap-1">
            <UserCog className="h-4 w-4" />
            <span className="hidden sm:inline">Positions</span>
          </TabsTrigger>
          <TabsTrigger value="asa" className="gap-1">
            <ClipboardCheck className="h-4 w-4" />
            <span className="hidden sm:inline">ASA Classes</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="priorities">
          <SurgeryPrioritiesTab />
        </TabsContent>
        <TabsContent value="anesthesia">
          <AnesthesiaTypesTab />
        </TabsContent>
        <TabsContent value="airway">
          <AirwayDevicesTab />
        </TabsContent>
        <TabsContent value="roles">
          <OTTeamRolesTab />
        </TabsContent>
        <TabsContent value="positions">
          <SurgicalPositionsTab />
        </TabsContent>
        <TabsContent value="asa">
          <ASAClassesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// =====================================================
// SURGERY PRIORITIES TAB
// =====================================================

function SurgeryPrioritiesTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    color: "#6B7280",
    requires_immediate_attention: false,
    max_wait_hours: null as number | null,
    sort_order: 0,
  });

  const { data, isLoading } = useConfigSurgeryPriorities();
  const createMutation = useCreateConfigSurgeryPriority();
  const updateMutation = useUpdateConfigSurgeryPriority();
  const deleteMutation = useDeleteConfigSurgeryPriority();

  const handleOpenDialog = (item?: any) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        code: item.code,
        name: item.name,
        description: item.description || "",
        color: item.color || "#6B7280",
        requires_immediate_attention: item.requires_immediate_attention || false,
        max_wait_hours: item.max_wait_hours,
        sort_order: item.sort_order || 0,
      });
    } else {
      setEditingId(null);
      setFormData({
        code: "",
        name: "",
        description: "",
        color: "#6B7280",
        requires_immediate_attention: false,
        max_wait_hours: null,
        sort_order: (data?.length || 0) + 1,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, ...formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Remove this priority?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Surgery Priorities
          </CardTitle>
          <CardDescription>Define surgery urgency levels</CardDescription>
        </div>
        <Button size="sm" onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Add Priority
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Priority</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Max Wait</TableHead>
                <TableHead>Immediate</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color || '#6B7280' }} />
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.code}</TableCell>
                  <TableCell>{item.max_wait_hours ? `${item.max_wait_hours}h` : '-'}</TableCell>
                  <TableCell>
                    {item.requires_immediate_attention && <Badge variant="destructive">Yes</Badge>}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!data?.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No priorities configured. Click "Seed Default Data" to populate.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Priority" : "Add Priority"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase() })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Color</Label>
                <Input type="color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Max Wait Hours</Label>
                <Input type="number" value={formData.max_wait_hours || ''} onChange={(e) => setFormData({ ...formData, max_wait_hours: e.target.value ? parseInt(e.target.value) : null })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formData.requires_immediate_attention} onCheckedChange={(checked) => setFormData({ ...formData, requires_immediate_attention: checked })} />
              <Label>Requires Immediate Attention</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!formData.name || !formData.code}>
              {editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// =====================================================
// ANESTHESIA TYPES TAB
// =====================================================

function AnesthesiaTypesTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    requires_intubation: false,
    typical_duration_minutes: null as number | null,
    monitoring_level: "standard",
    sort_order: 0,
  });

  const { data, isLoading } = useConfigAnesthesiaTypes();
  const createMutation = useCreateConfigAnesthesiaType();
  const updateMutation = useUpdateConfigAnesthesiaType();
  const deleteMutation = useDeleteConfigAnesthesiaType();

  const handleOpenDialog = (item?: any) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        code: item.code,
        name: item.name,
        description: item.description || "",
        requires_intubation: item.requires_intubation || false,
        typical_duration_minutes: item.typical_duration_minutes,
        monitoring_level: item.monitoring_level || "standard",
        sort_order: item.sort_order || 0,
      });
    } else {
      setEditingId(null);
      setFormData({
        code: "",
        name: "",
        description: "",
        requires_intubation: false,
        typical_duration_minutes: null,
        monitoring_level: "standard",
        sort_order: (data?.length || 0) + 1,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, ...formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Remove this anesthesia type?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Syringe className="h-5 w-5 text-primary" />
            Anesthesia Types
          </CardTitle>
          <CardDescription>Configure available anesthesia options</CardDescription>
        </div>
        <Button size="sm" onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Add Type
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Intubation</TableHead>
                <TableHead>Monitoring</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">{item.code}</TableCell>
                  <TableCell>
                    {item.requires_intubation ? <Badge>Required</Badge> : <span className="text-muted-foreground">No</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.monitoring_level || 'standard'}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!data?.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No anesthesia types configured
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Anesthesia Type" : "Add Anesthesia Type"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase() })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Monitoring Level</Label>
                <Select value={formData.monitoring_level} onValueChange={(value) => setFormData({ ...formData, monitoring_level: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="full">Full</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Typical Duration (min)</Label>
                <Input type="number" value={formData.typical_duration_minutes || ''} onChange={(e) => setFormData({ ...formData, typical_duration_minutes: e.target.value ? parseInt(e.target.value) : null })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formData.requires_intubation} onCheckedChange={(checked) => setFormData({ ...formData, requires_intubation: checked })} />
              <Label>Requires Intubation</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!formData.name || !formData.code}>
              {editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// =====================================================
// AIRWAY DEVICES TAB
// =====================================================

function AirwayDevicesTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    sizes_available: [] as string[],
    is_invasive: false,
    sort_order: 0,
  });
  const [sizesInput, setSizesInput] = useState("");

  const { data, isLoading } = useConfigAirwayDevices();
  const createMutation = useCreateConfigAirwayDevice();
  const updateMutation = useUpdateConfigAirwayDevice();
  const deleteMutation = useDeleteConfigAirwayDevice();

  const handleOpenDialog = (item?: any) => {
    if (item) {
      setEditingId(item.id);
      const sizes = item.sizes_available || [];
      setFormData({
        code: item.code,
        name: item.name,
        sizes_available: sizes,
        is_invasive: item.is_invasive || false,
        sort_order: item.sort_order || 0,
      });
      setSizesInput(Array.isArray(sizes) ? sizes.join(', ') : '');
    } else {
      setEditingId(null);
      setFormData({
        code: "",
        name: "",
        sizes_available: [],
        is_invasive: false,
        sort_order: (data?.length || 0) + 1,
      });
      setSizesInput("");
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const sizes = sizesInput.split(',').map(s => s.trim()).filter(Boolean);
    const submitData = { ...formData, sizes_available: sizes };
    
    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, ...submitData });
    } else {
      await createMutation.mutateAsync(submitData);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Remove this airway device?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Wind className="h-5 w-5 text-primary" />
            Airway Devices
          </CardTitle>
          <CardDescription>Configure available airway management devices</CardDescription>
        </div>
        <Button size="sm" onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Add Device
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Sizes</TableHead>
                <TableHead>Invasive</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">{item.code}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(item.sizes_available as string[] || []).slice(0, 3).map((size, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{size}</Badge>
                      ))}
                      {(item.sizes_available as string[] || []).length > 3 && (
                        <Badge variant="outline" className="text-xs">+{(item.sizes_available as string[]).length - 3}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.is_invasive ? <Badge variant="destructive">Yes</Badge> : <span className="text-muted-foreground">No</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!data?.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No airway devices configured
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Airway Device" : "Add Airway Device"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase() })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Available Sizes (comma-separated)</Label>
              <Input 
                value={sizesInput} 
                onChange={(e) => setSizesInput(e.target.value)} 
                placeholder="e.g. 6.0, 6.5, 7.0, 7.5, 8.0"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formData.is_invasive} onCheckedChange={(checked) => setFormData({ ...formData, is_invasive: checked })} />
              <Label>Invasive Device</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!formData.name || !formData.code}>
              {editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// =====================================================
// OT TEAM ROLES TAB
// =====================================================

function OTTeamRolesTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category: "nursing" as 'surgeon' | 'anesthesia' | 'nursing' | 'technician' | 'support',
    is_required: false,
    sort_order: 0,
  });

  const { data, isLoading } = useConfigOTTeamRoles();
  const createMutation = useCreateConfigOTTeamRole();
  const updateMutation = useUpdateConfigOTTeamRole();
  const deleteMutation = useDeleteConfigOTTeamRole();

  const handleOpenDialog = (item?: any) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        code: item.code,
        name: item.name,
        category: item.category || "nursing",
        is_required: item.is_required || false,
        sort_order: item.sort_order || 0,
      });
    } else {
      setEditingId(null);
      setFormData({
        code: "",
        name: "",
        category: "nursing",
        is_required: false,
        sort_order: (data?.length || 0) + 1,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, ...formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Remove this team role?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'surgeon': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'anesthesia': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'nursing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'technician': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            OT Team Roles
          </CardTitle>
          <CardDescription>Define roles for surgery team members</CardDescription>
        </div>
        <Button size="sm" onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Add Role
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Required</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">{item.code}</TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor(item.category || '')}>{item.category}</Badge>
                  </TableCell>
                  <TableCell>
                    {item.is_required ? <Badge>Required</Badge> : <span className="text-muted-foreground">Optional</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!data?.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No team roles configured
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Team Role" : "Add Team Role"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role Name *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase() })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={formData.category} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="surgeon">Surgeon</SelectItem>
                  <SelectItem value="anesthesia">Anesthesia</SelectItem>
                  <SelectItem value="nursing">Nursing</SelectItem>
                  <SelectItem value="technician">Technician</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formData.is_required} onCheckedChange={(checked) => setFormData({ ...formData, is_required: checked })} />
              <Label>Required for Surgery</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!formData.name || !formData.code}>
              {editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// =====================================================
// SURGICAL POSITIONS TAB
// =====================================================

function SurgicalPositionsTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    precautions: "",
    sort_order: 0,
  });

  const { data, isLoading } = useConfigSurgicalPositions();
  const createMutation = useCreateConfigSurgicalPosition();
  const updateMutation = useUpdateConfigSurgicalPosition();
  const deleteMutation = useDeleteConfigSurgicalPosition();

  const handleOpenDialog = (item?: any) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        code: item.code,
        name: item.name,
        description: item.description || "",
        precautions: item.precautions || "",
        sort_order: item.sort_order || 0,
      });
    } else {
      setEditingId(null);
      setFormData({
        code: "",
        name: "",
        description: "",
        precautions: "",
        sort_order: (data?.length || 0) + 1,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, ...formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Remove this position?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-primary" />
            Surgical Positions
          </CardTitle>
          <CardDescription>Patient positioning options for surgery</CardDescription>
        </div>
        <Button size="sm" onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Add Position
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Position</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Precautions</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">{item.code}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{item.description || '-'}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-amber-600">{item.precautions || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!data?.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No positions configured
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Position" : "Add Position"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase() })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Patient positioning description" />
            </div>
            <div className="space-y-2">
              <Label>Precautions</Label>
              <Textarea value={formData.precautions} onChange={(e) => setFormData({ ...formData, precautions: e.target.value })} placeholder="Safety precautions for this position" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!formData.name || !formData.code}>
              {editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// =====================================================
// ASA CLASSES TAB
// =====================================================

function ASAClassesTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    class_level: "",
    name: "",
    description: "",
    risk_level: "low",
    sort_order: 0,
  });

  const { data, isLoading } = useConfigASAClasses();
  const createMutation = useCreateConfigASAClass();
  const updateMutation = useUpdateConfigASAClass();
  const deleteMutation = useDeleteConfigASAClass();

  const handleOpenDialog = (item?: any) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        class_level: item.class_level,
        name: item.name,
        description: item.description || "",
        risk_level: item.risk_level || "low",
        sort_order: item.sort_order || 0,
      });
    } else {
      setEditingId(null);
      setFormData({
        class_level: "",
        name: "",
        description: "",
        risk_level: "low",
        sort_order: (data?.length || 0) + 1,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, ...formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Remove this ASA class?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'minimal': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'moderate': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            ASA Physical Status Classification
          </CardTitle>
          <CardDescription>American Society of Anesthesiologists classification</CardDescription>
        </div>
        <Button size="sm" onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Add Class
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Badge variant="outline" className="font-bold">{item.class_level}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="max-w-[300px] truncate">{item.description}</TableCell>
                  <TableCell>
                    <Badge className={getRiskColor(item.risk_level || '')}>{item.risk_level}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!data?.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No ASA classes configured
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit ASA Class" : "Add ASA Class"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Class Level *</Label>
                <Input value={formData.class_level} onChange={(e) => setFormData({ ...formData, class_level: e.target.value })} placeholder="e.g. I, II, III" />
              </div>
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. ASA I" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Patient description for this classification" />
            </div>
            <div className="space-y-2">
              <Label>Risk Level</Label>
              <Select value={formData.risk_level} onValueChange={(value) => setFormData({ ...formData, risk_level: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="n/a">N/A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!formData.class_level || !formData.name || !formData.description}>
              {editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
