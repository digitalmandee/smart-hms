import { useState } from 'react';
import { Plus, Trash2, Edit } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useDoctorSchedules,
  useCreateDoctorSchedule,
  useUpdateDoctorSchedule,
  useDeleteDoctorSchedule,
  DAY_NAMES,
} from '@/hooks/useDoctorSchedules';
import { useDoctors } from '@/hooks/useDoctors';
import { useToast } from '@/hooks/use-toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface ScheduleFormData {
  doctor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  max_patients_per_slot: number;
  is_active: boolean;
}

const defaultFormData: ScheduleFormData = {
  doctor_id: '',
  day_of_week: 1,
  start_time: '09:00',
  end_time: '17:00',
  slot_duration_minutes: 15,
  max_patients_per_slot: 1,
  is_active: true,
};

export default function DoctorSchedulePage() {
  const { toast } = useToast();
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ScheduleFormData>(defaultFormData);

  const { data: schedules, isLoading } = useDoctorSchedules(
    selectedDoctor !== 'all' ? selectedDoctor : undefined
  );
  const { data: doctors } = useDoctors();

  const createSchedule = useCreateDoctorSchedule();
  const updateSchedule = useUpdateDoctorSchedule();
  const deleteSchedule = useDeleteDoctorSchedule();

  const handleOpenDialog = (schedule?: any) => {
    if (schedule) {
      setEditingId(schedule.id);
      setFormData({
        doctor_id: schedule.doctor_id,
        day_of_week: schedule.day_of_week,
        start_time: schedule.start_time.substring(0, 5),
        end_time: schedule.end_time.substring(0, 5),
        slot_duration_minutes: schedule.slot_duration_minutes || 15,
        max_patients_per_slot: schedule.max_patients_per_slot || 1,
        is_active: schedule.is_active ?? true,
      });
    } else {
      setEditingId(null);
      setFormData(defaultFormData);
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await updateSchedule.mutateAsync({
          id: editingId,
          ...formData,
        });
        toast({ title: 'Schedule updated successfully' });
      } else {
        await createSchedule.mutateAsync(formData);
        toast({ title: 'Schedule created successfully' });
      }
      setDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteSchedule.mutateAsync(deleteId);
      toast({ title: 'Schedule deleted successfully' });
      setDeleteId(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Group schedules by doctor
  const schedulesByDoctor = schedules?.reduce((acc, schedule) => {
    const doctorId = schedule.doctor_id;
    if (!acc[doctorId]) {
      acc[doctorId] = {
        doctor: schedule.doctor,
        schedules: [],
      };
    }
    acc[doctorId].schedules.push(schedule);
    return acc;
  }, {} as Record<string, { doctor: any; schedules: typeof schedules }>) || {};

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Doctor Schedules"
        description="Manage doctor availability and time slots"
        breadcrumbs={[
          { label: 'Dashboard', href: '/app' },
          { label: 'Appointments', href: '/app/appointments' },
          { label: 'Schedules' },
        ]}
        actions={
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Schedule
          </Button>
        }
      />

      {/* Doctor Filter */}
      <div className="flex items-center gap-4">
        <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="All Doctors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Doctors</SelectItem>
            {doctors?.map((doctor) => (
              <SelectItem key={doctor.id} value={doctor.id}>
                Dr. {doctor.profile?.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Schedules Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : Object.keys(schedulesByDoctor).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No schedules configured</p>
            <Button className="mt-4" onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Schedule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {Object.entries(schedulesByDoctor).map(([doctorId, { doctor, schedules: doctorSchedules }]) => (
            <Card key={doctorId}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div>
                    <span>Dr. {doctor?.profile?.full_name}</span>
                    {doctor?.specialization && (
                      <p className="text-sm font-normal text-muted-foreground">
                        {doctor.specialization}
                      </p>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {doctorSchedules?.sort((a, b) => a.day_of_week - b.day_of_week).map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{DAY_NAMES[schedule.day_of_week]}</span>
                          {!schedule.is_active && (
                            <Badge variant="outline" className="text-xs">Inactive</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {schedule.slot_duration_minutes} min slots • Max {schedule.max_patients_per_slot} per slot
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(schedule)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(schedule.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Schedule' : 'Add Schedule'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Doctor</Label>
              <Select
                value={formData.doctor_id}
                onValueChange={(v) => setFormData({ ...formData, doctor_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors?.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      Dr. {doctor.profile?.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Day of Week</Label>
              <Select
                value={formData.day_of_week.toString()}
                onValueChange={(v) => setFormData({ ...formData, day_of_week: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAY_NAMES.map((day, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Slot Duration (minutes)</Label>
                <Select
                  value={formData.slot_duration_minutes.toString()}
                  onValueChange={(v) => setFormData({ ...formData, slot_duration_minutes: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 min</SelectItem>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="20">20 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">60 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Max Patients per Slot</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={formData.max_patients_per_slot}
                  onChange={(e) => setFormData({ ...formData, max_patients_per_slot: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.doctor_id || createSchedule.isPending || updateSchedule.isPending}
            >
              {editingId ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Schedule"
        description="Are you sure you want to delete this schedule?"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
