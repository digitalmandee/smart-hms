import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  useAllOPDDepartments,
  useDeleteOPDDepartment,
  useUpdateOPDDepartment,
  OPDDepartment,
} from "@/hooks/useOPDDepartments";
import { OPDDepartmentForm } from "@/components/opd/OPDDepartmentForm";
import { OPDDepartmentSpecializations } from "@/components/opd/OPDDepartmentSpecializations";
import {
  Plus,
  Pencil,
  Trash2,
  Building2,
  Stethoscope,
  ToggleLeft,
  ToggleRight,
  MapPin,
  Loader2,
} from "lucide-react";

export default function OPDDepartmentsPage() {
  const { data: departments, isLoading } = useAllOPDDepartments();
  const deleteDepartment = useDeleteOPDDepartment();
  const updateDepartment = useUpdateOPDDepartment();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<OPDDepartment | null>(null);
  const [deletingDepartment, setDeletingDepartment] = useState<OPDDepartment | null>(null);
  const [selectedTab, setSelectedTab] = useState("list");

  const handleDelete = async () => {
    if (deletingDepartment) {
      await deleteDepartment.mutateAsync(deletingDepartment.id);
      setDeletingDepartment(null);
    }
  };

  const handleToggleActive = async (dept: OPDDepartment) => {
    await updateDepartment.mutateAsync({
      id: dept.id,
      is_active: !dept.is_active,
    });
  };

  const activeDepartments = departments?.filter((d) => d.is_active) || [];
  const inactiveDepartments = departments?.filter((d) => !d.is_active) || [];

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            OPD Departments
          </h1>
          <p className="text-muted-foreground">
            Configure multiple OPD clinics with separate queues and token sequences
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create OPD Department</DialogTitle>
            </DialogHeader>
            <OPDDepartmentForm
              onSuccess={() => setIsCreateOpen(false)}
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="list">
            Departments ({activeDepartments.length})
          </TabsTrigger>
          <TabsTrigger value="specializations">
            Assign Specializations
          </TabsTrigger>
          {inactiveDepartments.length > 0 && (
            <TabsTrigger value="inactive">
              Inactive ({inactiveDepartments.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="list" className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : activeDepartments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No OPD Departments</h3>
                <p className="text-muted-foreground mb-4">
                  Create OPD departments to enable separate token queues per clinic
                </p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Department
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Specializations</TableHead>
                    <TableHead>Head Doctor</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeDepartments.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: dept.color || "#3b82f6" }}
                          />
                          <div>
                            <p className="font-medium">{dept.name}</p>
                            {dept.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {dept.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {dept.code}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {dept.location ? (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {dept.location}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {dept.specializations?.slice(0, 3).map((s) => (
                            <Badge key={s.id} variant="secondary" className="text-xs">
                              {s.specialization?.name}
                            </Badge>
                          ))}
                          {(dept.specializations?.length || 0) > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{(dept.specializations?.length || 0) - 3}
                            </Badge>
                          )}
                          {!dept.specializations?.length && (
                            <span className="text-muted-foreground text-sm">None assigned</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {dept.head_doctor ? (
                          <span className="text-sm">
                            Dr. {(dept.head_doctor as any).profile?.full_name}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingDepartment(dept)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActive(dept)}
                          >
                            <ToggleRight className="h-4 w-4 text-success" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingDepartment(dept)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="specializations" className="mt-4 space-y-4">
          {activeDepartments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Departments to Configure</h3>
                <p className="text-muted-foreground">
                  Create OPD departments first to assign specializations
                </p>
              </CardContent>
            </Card>
          ) : (
            activeDepartments.map((dept) => (
              <OPDDepartmentSpecializations key={dept.id} department={dept} />
            ))
          )}
        </TabsContent>

        {inactiveDepartments.length > 0 && (
          <TabsContent value="inactive" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Inactive Departments</CardTitle>
                <CardDescription>
                  These departments are hidden from the queue system
                </CardDescription>
              </CardHeader>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inactiveDepartments.map((dept) => (
                    <TableRow key={dept.id} className="opacity-60">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: dept.color || "#3b82f6" }}
                          />
                          <span>{dept.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {dept.code}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(dept)}
                        >
                          <ToggleLeft className="h-4 w-4 mr-2" />
                          Reactivate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editingDepartment} onOpenChange={() => setEditingDepartment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit OPD Department</DialogTitle>
          </DialogHeader>
          {editingDepartment && (
            <OPDDepartmentForm
              department={editingDepartment}
              onSuccess={() => setEditingDepartment(null)}
              onCancel={() => setEditingDepartment(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingDepartment} onOpenChange={() => setDeletingDepartment(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete OPD Department?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate the "{deletingDepartment?.name}" department. 
              Existing appointments will retain their department assignment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
