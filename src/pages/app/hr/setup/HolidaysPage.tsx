import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  useHolidays,
  useCreateHoliday,
  useUpdateHoliday,
  useDeleteHoliday,
} from "@/hooks/useHR";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Loader2, Pencil, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { format } from "date-fns";

export default function HolidaysPage() {
  const { profile } = useAuth();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const { data: holidays, isLoading } = useHolidays(selectedYear);
  const createHoliday = useCreateHoliday();
  const updateHoliday = useUpdateHoliday();
  const deleteHoliday = useDeleteHoliday();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    holiday_date: new Date(),
    is_optional: false,
    is_restricted: false,
    applies_to_all: true,
  });

  const handleOpenDialog = (holiday?: any) => {
    if (holiday) {
      setEditingHoliday(holiday);
      setFormData({
        name: holiday.name,
        holiday_date: new Date(holiday.holiday_date),
        is_optional: holiday.is_optional ?? false,
        is_restricted: holiday.is_restricted ?? false,
        applies_to_all: holiday.applies_to_all ?? true,
      });
    } else {
      setEditingHoliday(null);
      setFormData({
        name: "",
        holiday_date: new Date(),
        is_optional: false,
        is_restricted: false,
        applies_to_all: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const data = {
      ...formData,
      holiday_date: format(formData.holiday_date, "yyyy-MM-dd"),
      organization_id: profile?.organization_id!,
    };

    if (editingHoliday) {
      await updateHoliday.mutateAsync({ id: editingHoliday.id, ...data });
    } else {
      await createHoliday.mutateAsync(data);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteHoliday.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  // Create holiday dates set for calendar highlighting
  const holidayDates = new Set(
    holidays?.map((h) => format(new Date(h.holiday_date), "yyyy-MM-dd")) || []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Holidays"
        description="Manage organization holidays and off days"
      >
        <div className="flex items-center gap-2">
          <Select
            value={selectedYear.toString()}
            onValueChange={(v) => setSelectedYear(parseInt(v))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[currentYear - 1, currentYear, currentYear + 1].map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Holiday
          </Button>
        </div>
      </PageHeader>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {selectedYear} Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="multiple"
              selected={holidays?.map((h) => new Date(h.holiday_date)) || []}
              className="rounded-md border"
              modifiers={{
                holiday: holidays?.map((h) => new Date(h.holiday_date)) || [],
              }}
              modifiersStyles={{
                holiday: { backgroundColor: "hsl(var(--primary))", color: "white", borderRadius: "50%" },
              }}
            />
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 rounded-full bg-primary" />
              <span>Holiday</span>
            </div>
          </CardContent>
        </Card>

        {/* Holidays List */}
        <div className="lg:col-span-2 border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Holiday Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Applies To</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : holidays?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No holidays for {selectedYear}. Add your first holiday.
                  </TableCell>
                </TableRow>
              ) : (
                holidays?.map((holiday) => (
                  <TableRow key={holiday.id}>
                    <TableCell className="font-medium">
                      {format(new Date(holiday.holiday_date), "EEE, MMM d")}
                    </TableCell>
                    <TableCell>{holiday.name}</TableCell>
                    <TableCell>
                      {holiday.is_optional ? (
                        <Badge variant="secondary">Optional</Badge>
                      ) : holiday.is_restricted ? (
                        <Badge variant="outline">Restricted</Badge>
                      ) : (
                        <Badge>Public</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={holiday.applies_to_all ? "default" : "secondary"}>
                        {holiday.applies_to_all ? "All Staff" : "Selected"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(holiday)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(holiday.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingHoliday ? "Edit Holiday" : "Add Holiday"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Holiday Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., New Year's Day"
              />
            </div>

            <div className="space-y-2">
              <Label>Date *</Label>
              <Calendar
                mode="single"
                selected={formData.holiday_date}
                onSelect={(date) => date && setFormData({ ...formData, holiday_date: date })}
                className="rounded-md border"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="optional"
                  checked={formData.is_optional}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_optional: !!checked, is_restricted: false })
                  }
                />
                <Label htmlFor="optional">Optional Holiday</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="restricted"
                  checked={formData.is_restricted}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_restricted: !!checked, is_optional: false })
                  }
                />
                <Label htmlFor="restricted">Restricted Holiday</Label>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Label>Applies to All Staff</Label>
                <Switch
                  checked={formData.applies_to_all}
                  onCheckedChange={(checked) => setFormData({ ...formData, applies_to_all: checked })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.name || createHoliday.isPending || updateHoliday.isPending}
            >
              {(createHoliday.isPending || updateHoliday.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingHoliday ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Holiday"
        description="Are you sure you want to delete this holiday?"
        onConfirm={handleDelete}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
