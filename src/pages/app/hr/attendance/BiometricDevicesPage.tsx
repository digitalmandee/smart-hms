import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Fingerprint,
  Plus,
  RefreshCw,
  Wifi,
  WifiOff,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Trash2,
  Edit,
  Loader2,
  History,
  UserPlus,
} from "lucide-react";
import {
  useBiometricDevices,
  useCreateBiometricDevice,
  useUpdateBiometricDevice,
  useDeleteBiometricDevice,
} from "@/hooks/useAttendance";
import { useBiometricSyncLogs, useSyncDevice } from "@/hooks/useBiometricSync";
import { useMarkAttendance } from "@/hooks/useAttendance";
import { useEmployees } from "@/hooks/useHR";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface DeviceFormData {
  device_name: string;
  serial_number: string;
  device_type: string;
  ip_address: string;
  port: number;
  location: string;
}

const initialFormData: DeviceFormData = {
  device_name: "",
  serial_number: "",
  device_type: "zkteco",
  ip_address: "",
  port: 4370,
  location: "",
};

export default function BiometricDevicesPage() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("devices");
  const [showDeviceDialog, setShowDeviceDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showManualEntryDialog, setShowManualEntryDialog] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [formData, setFormData] = useState<DeviceFormData>(initialFormData);
  const [isEditing, setIsEditing] = useState(false);

  // Manual entry state
  const [manualEntry, setManualEntry] = useState({
    employee_id: "",
    attendance_date: format(new Date(), "yyyy-MM-dd"),
    check_in: "",
    check_out: "",
    reason: "",
  });

  const { data: devices, isLoading: devicesLoading } = useBiometricDevices();
  const { data: syncLogs, isLoading: logsLoading } = useBiometricSyncLogs();
  const { data: employees } = useEmployees();
  const createDevice = useCreateBiometricDevice();
  const updateDevice = useUpdateBiometricDevice();
  const deleteDevice = useDeleteBiometricDevice();
  const syncDevice = useSyncDevice();
  const markAttendance = useMarkAttendance();

  const handleSaveDevice = async () => {
    try {
      if (isEditing && selectedDevice) {
        await updateDevice.mutateAsync({
          id: selectedDevice,
          ...formData,
        });
        toast.success("Device updated successfully");
      } else {
        await createDevice.mutateAsync({
          ...formData,
          organization_id: profile!.organization_id,
          branch_id: profile!.branch_id!,
          is_active: true,
        });
        toast.success("Device added successfully");
      }
      setShowDeviceDialog(false);
      setFormData(initialFormData);
      setIsEditing(false);
      setSelectedDevice(null);
    } catch (error) {
      toast.error("Failed to save device");
    }
  };

  const handleEditDevice = (device: any) => {
    setFormData({
      device_name: device.device_name,
      serial_number: device.serial_number || "",
      device_type: device.device_type || "zkteco",
      ip_address: device.ip_address || "",
      port: device.port || 4370,
      location: device.location || "",
    });
    setSelectedDevice(device.id);
    setIsEditing(true);
    setShowDeviceDialog(true);
  };

  const handleDeleteDevice = async () => {
    if (selectedDevice) {
      try {
        await deleteDevice.mutateAsync(selectedDevice);
        toast.success("Device deleted successfully");
      } catch (error) {
        toast.error("Failed to delete device");
      }
    }
    setShowDeleteDialog(false);
    setSelectedDevice(null);
  };

  const handleSync = async (deviceId: string) => {
    await syncDevice.mutateAsync(deviceId);
  };

  const handleManualEntry = async () => {
    if (!manualEntry.employee_id || !manualEntry.attendance_date) {
      toast.error("Please select employee and date");
      return;
    }

    try {
      await markAttendance.mutateAsync({
        employee_id: manualEntry.employee_id,
        attendance_date: manualEntry.attendance_date,
        check_in: manualEntry.check_in || null,
        check_out: manualEntry.check_out || null,
        status: "present",
        check_in_source: "manual",
        adjustment_reason: manualEntry.reason || "Manual entry override",
        organization_id: profile!.organization_id,
        branch_id: profile!.branch_id!,
      });
      toast.success("Manual attendance entry added");
      setShowManualEntryDialog(false);
      setManualEntry({
        employee_id: "",
        attendance_date: format(new Date(), "yyyy-MM-dd"),
        check_in: "",
        check_out: "",
        reason: "",
      });
    } catch (error) {
      toast.error("Failed to add manual entry");
    }
  };

  const getDeviceStatus = (device: any) => {
    if (!device.is_active) return { label: "Disabled", variant: "secondary" as const, icon: WifiOff };
    if (!device.last_sync_at) return { label: "Never Synced", variant: "outline" as const, icon: AlertTriangle };
    
    const lastSync = new Date(device.last_sync_at);
    const hoursSinceSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceSync < 1) return { label: "Online", variant: "default" as const, icon: Wifi };
    if (hoursSinceSync < 24) return { label: "Idle", variant: "secondary" as const, icon: Clock };
    return { label: "Offline", variant: "destructive" as const, icon: WifiOff };
  };

  const getSyncStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Success</Badge>;
      case "failed":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case "partial":
        return <Badge variant="secondary"><AlertTriangle className="h-3 w-3 mr-1" />Partial</Badge>;
      case "in_progress":
        return <Badge variant="outline"><Loader2 className="h-3 w-3 mr-1 animate-spin" />In Progress</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Biometric Integration</h1>
          <p className="text-muted-foreground">
            Manage biometric devices, sync attendance data, and handle manual overrides
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowManualEntryDialog(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Manual Entry
          </Button>
          <Button onClick={() => {
            setFormData(initialFormData);
            setIsEditing(false);
            setShowDeviceDialog(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Device
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="devices">
            <Fingerprint className="h-4 w-4 mr-2" />
            Devices
          </TabsTrigger>
          <TabsTrigger value="sync-logs">
            <History className="h-4 w-4 mr-2" />
            Sync Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registered Devices</CardTitle>
              <CardDescription>
                Configure and manage biometric attendance devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              {devicesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : devices && devices.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Device Name</TableHead>
                      <TableHead>Serial Number</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Sync</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {devices.map((device) => {
                      const status = getDeviceStatus(device);
                      const StatusIcon = status.icon;
                      return (
                        <TableRow key={device.id}>
                          <TableCell className="font-medium">{device.device_name}</TableCell>
                          <TableCell>{device.device_serial || "-"}</TableCell>
                          <TableCell className="capitalize">{device.device_type || "ZKTeco"}</TableCell>
                          <TableCell>{device.ip_address || "-"}:{device.port || 4370}</TableCell>
                          <TableCell>{device.location || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={status.variant}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {device.last_sync_at
                              ? format(new Date(device.last_sync_at), "dd MMM yyyy HH:mm")
                              : "Never"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSync(device.id)}
                                disabled={syncDevice.isPending}
                              >
                                {syncDevice.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <RefreshCw className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditDevice(device)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedDevice(device.id);
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Fingerprint className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No biometric devices configured</p>
                  <p className="text-sm">Add your first device to start syncing attendance</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync-logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync History</CardTitle>
              <CardDescription>
                View synchronization logs and troubleshoot issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : syncLogs && syncLogs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Device</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Records Synced</TableHead>
                      <TableHead>Failed</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {syncLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">
                          {log.device?.device_name || "Unknown Device"}
                        </TableCell>
                        <TableCell className="capitalize">{log.sync_type}</TableCell>
                        <TableCell>{getSyncStatusBadge(log.status)}</TableCell>
                        <TableCell>{log.records_synced}</TableCell>
                        <TableCell>{log.records_failed}</TableCell>
                        <TableCell>
                          {format(new Date(log.started_at), "dd MMM HH:mm")}
                        </TableCell>
                        <TableCell>
                          {log.completed_at
                            ? format(new Date(log.completed_at), "dd MMM HH:mm")
                            : "-"}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-destructive">
                          {log.error_message || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No sync logs yet</p>
                  <p className="text-sm">Sync a device to see history here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Device Dialog */}
      <Dialog open={showDeviceDialog} onOpenChange={setShowDeviceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Device" : "Add Biometric Device"}</DialogTitle>
            <DialogDescription>
              Configure the connection settings for your biometric device
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="device_name">Device Name</Label>
              <Input
                id="device_name"
                value={formData.device_name}
                onChange={(e) => setFormData({ ...formData, device_name: e.target.value })}
                placeholder="Main Entrance Device"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="serial_number">Serial Number</Label>
                <Input
                  id="serial_number"
                  value={formData.serial_number}
                  onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                  placeholder="ZK-12345"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="device_type">Device Type</Label>
                <Select
                  value={formData.device_type}
                  onValueChange={(value) => setFormData({ ...formData, device_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zkteco">ZKTeco</SelectItem>
                    <SelectItem value="suprema">Suprema</SelectItem>
                    <SelectItem value="hikvision">Hikvision</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="ip_address">IP Address</Label>
                <Input
                  id="ip_address"
                  value={formData.ip_address}
                  onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                  placeholder="192.168.1.100"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  type="number"
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || 4370 })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Main Building - Ground Floor"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeviceDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveDevice} disabled={createDevice.isPending || updateDevice.isPending}>
              {(createDevice.isPending || updateDevice.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {isEditing ? "Update" : "Add"} Device
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Entry Dialog */}
      <Dialog open={showManualEntryDialog} onOpenChange={setShowManualEntryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manual Attendance Entry</DialogTitle>
            <DialogDescription>
              Add or override attendance for an employee manually
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Employee</Label>
              <Select
                value={manualEntry.employee_id}
                onValueChange={(value) => setManualEntry({ ...manualEntry, employee_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees?.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="attendance_date">Date</Label>
              <Input
                id="attendance_date"
                type="date"
                value={manualEntry.attendance_date}
                onChange={(e) => setManualEntry({ ...manualEntry, attendance_date: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="check_in">Check In Time</Label>
                <Input
                  id="check_in"
                  type="time"
                  value={manualEntry.check_in}
                  onChange={(e) => setManualEntry({ ...manualEntry, check_in: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="check_out">Check Out Time</Label>
                <Input
                  id="check_out"
                  type="time"
                  value={manualEntry.check_out}
                  onChange={(e) => setManualEntry({ ...manualEntry, check_out: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason for Manual Entry</Label>
              <Input
                id="reason"
                value={manualEntry.reason}
                onChange={(e) => setManualEntry({ ...manualEntry, reason: e.target.value })}
                placeholder="Device malfunction, forgot to punch, etc."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManualEntryDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleManualEntry} disabled={markAttendance.isPending}>
              {markAttendance.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Device?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the device from the system. Sync logs will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDevice}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
