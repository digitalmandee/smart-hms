import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus, Shield, Syringe, Heart, AlertTriangle,
  FileWarning, Loader2, Calendar, CheckCircle
} from "lucide-react";
import {
  useMedicalFitnessRecords, useVaccinationRecords, useDisciplinaryActions, useIncidentReports,
  useCreateMedicalFitnessRecord, useCreateVaccinationRecord, useCreateDisciplinaryAction, useCreateIncidentReport,
  type IncidentReport
} from "@/hooks/useCompliance";
import { useEmployees } from "@/hooks/useHR";
import { format, differenceInDays } from "date-fns";

const FITNESS_STATUS = [
  { value: "fit", label: "Fit" },
  { value: "fit_with_restrictions", label: "Fit with Restrictions" },
  { value: "unfit", label: "Unfit" },
  { value: "pending", label: "Pending Review" },
];

const VACCINE_TYPES = [
  { value: "hepatitis_b", label: "Hepatitis B" },
  { value: "flu", label: "Influenza" },
  { value: "covid", label: "COVID-19" },
  { value: "typhoid", label: "Typhoid" },
  { value: "tetanus", label: "Tetanus" },
  { value: "mmr", label: "MMR" },
  { value: "other", label: "Other" },
];

const INCIDENT_SEVERITY = [
  { value: "minor", label: "Minor" },
  { value: "moderate", label: "Moderate" },
  { value: "major", label: "Major" },
  { value: "critical", label: "Critical" },
];

export default function ComplianceDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isVaccineDialogOpen, setIsVaccineDialogOpen] = useState(false);
  const [isFitnessDialogOpen, setIsFitnessDialogOpen] = useState(false);
  const [isIncidentDialogOpen, setIsIncidentDialogOpen] = useState(false);

  const { data: fitnessRecords, isLoading: loadingFitness } = useMedicalFitnessRecords();
  const { data: vaccinations, isLoading: loadingVax } = useVaccinationRecords();
  const { data: disciplinary, isLoading: loadingDisc } = useDisciplinaryActions();
  const { data: incidents, isLoading: loadingInc } = useIncidentReports();
  const { data: employees } = useEmployees();

  const createFitness = useCreateMedicalFitnessRecord();
  const createVaccine = useCreateVaccinationRecord();
  const createIncident = useCreateIncidentReport();

  // Stats calculations
  const upcomingFitnessExams = fitnessRecords?.filter((f) => {
    if (!f.next_examination_date) return false;
    const days = differenceInDays(new Date(f.next_examination_date), new Date());
    return days >= 0 && days <= 30;
  }).length || 0;

  const overdueVaccines = vaccinations?.filter((v) => {
    if (!v.next_due_date) return false;
    return new Date(v.next_due_date) < new Date();
  }).length || 0;

  const openIncidents = incidents?.filter((i) => i.investigation_status !== "closed").length || 0;

  // Form states
  const [fitnessForm, setFitnessForm] = useState<{
    employee_id: string;
    examination_date: string;
    examiner: string;
    fitness_status: "fit" | "fit_with_restrictions" | "temporarily_unfit" | "permanently_unfit";
    restrictions: string;
    next_examination_date: string;
  }>({
    employee_id: "",
    examination_date: new Date().toISOString().split("T")[0],
    examiner: "",
    fitness_status: "fit",
    restrictions: "",
    next_examination_date: "",
  });

  const [vaccineForm, setVaccineForm] = useState({
    employee_id: "",
    vaccine_name: "hepatitis_b",
    dose_number: 1,
    administered_date: new Date().toISOString().split("T")[0],
    next_due_date: "",
    administered_by: "",
    batch_number: "",
  });

  const [incidentForm, setIncidentForm] = useState<{
    incident_date: string;
    location: string;
    description: string;
    severity: "minor" | "moderate" | "major" | "critical";
    involved_employee_ids: string[];
  }>({
    incident_date: new Date().toISOString(),
    location: "",
    description: "",
    severity: "minor",
    involved_employee_ids: [] as string[],
  });

  const handleCreateFitness = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createFitness.mutateAsync(fitnessForm);
      setIsFitnessDialogOpen(false);
    } catch (error) {}
  };

  const handleCreateVaccine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createVaccine.mutateAsync(vaccineForm);
      setIsVaccineDialogOpen(false);
    } catch (error) {}
  };

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createIncident.mutateAsync(incidentForm);
      setIsIncidentDialogOpen(false);
    } catch (error) {}
  };

  const getEmployeeName = (id: string) => {
    const emp = employees?.find((e) => e.id === id);
    return emp ? `${emp.first_name} ${emp.last_name || ""}` : "Unknown";
  };

  const getFitnessStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      fit: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      fit_with_restrictions: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      unfit: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      pending: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    };
    return <Badge className={colors[status] || ""}>{status.replace("_", " ")}</Badge>;
  };

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      minor: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      moderate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      major: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return <Badge className={colors[severity] || ""}>{severity}</Badge>;
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Compliance & Documents"
        description="Track medical fitness, vaccinations, and incidents"
        breadcrumbs={[
          { label: "HR", href: "/app/hr" },
          { label: "Compliance" },
        ]}
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fitness Records</p>
                <p className="text-2xl font-bold">{fitnessRecords?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Syringe className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vaccinations</p>
                <p className="text-2xl font-bold">{vaccinations?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue Vaccines</p>
                <p className="text-2xl font-bold">{overdueVaccines}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <FileWarning className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Open Incidents</p>
                <p className="text-2xl font-bold">{openIncidents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fitness">Medical Fitness</TabsTrigger>
          <TabsTrigger value="vaccinations">Vaccinations</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Upcoming Fitness Exams */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Upcoming Medical Exams</CardTitle>
                  <CardDescription>Due within 30 days</CardDescription>
                </div>
                <Dialog open={isFitnessDialogOpen} onOpenChange={setIsFitnessDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Record Medical Fitness</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateFitness} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Employee</Label>
                        <Select value={fitnessForm.employee_id} onValueChange={(v) => setFitnessForm({ ...fitnessForm, employee_id: v })}>
                          <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                          <SelectContent>
                            {employees?.map((emp) => (
                              <SelectItem key={emp.id} value={emp.id}>
                                {emp.first_name} {emp.last_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Examination Date</Label>
                          <Input type="date" value={fitnessForm.examination_date} onChange={(e) => setFitnessForm({ ...fitnessForm, examination_date: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Next Exam Date</Label>
                          <Input type="date" value={fitnessForm.next_examination_date} onChange={(e) => setFitnessForm({ ...fitnessForm, next_examination_date: e.target.value })} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Examiner</Label>
                          <Input value={fitnessForm.examiner} onChange={(e) => setFitnessForm({ ...fitnessForm, examiner: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select value={fitnessForm.fitness_status} onValueChange={(v: "fit" | "fit_with_restrictions" | "temporarily_unfit" | "permanently_unfit") => setFitnessForm({ ...fitnessForm, fitness_status: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {FITNESS_STATUS.map((s) => (
                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Restrictions</Label>
                        <Textarea value={fitnessForm.restrictions} onChange={(e) => setFitnessForm({ ...fitnessForm, restrictions: e.target.value })} />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsFitnessDialogOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={createFitness.isPending}>
                          {createFitness.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Save
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {loadingFitness ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
                ) : (
                  <div className="space-y-2">
                    {fitnessRecords?.filter((f) => {
                      if (!f.next_examination_date) return false;
                      const days = differenceInDays(new Date(f.next_examination_date), new Date());
                      return days >= 0 && days <= 30;
                    }).slice(0, 5).map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium">{getEmployeeName(record.employee_id)}</p>
                          <p className="text-sm text-muted-foreground">
                            Due: {format(new Date(record.next_examination_date!), "MMM d, yyyy")}
                          </p>
                        </div>
                        {getFitnessStatusBadge(record.fitness_status)}
                      </div>
                    )) || <p className="text-muted-foreground text-center py-4">No upcoming exams</p>}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Open Incidents */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Open Incidents</CardTitle>
                  <CardDescription>Requiring investigation</CardDescription>
                </div>
                <Dialog open={isIncidentDialogOpen} onOpenChange={setIsIncidentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Report
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Report Incident</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateIncident} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Date & Time</Label>
                          <Input type="datetime-local" value={incidentForm.incident_date.slice(0, 16)} onChange={(e) => setIncidentForm({ ...incidentForm, incident_date: new Date(e.target.value).toISOString() })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Severity</Label>
                          <Select value={incidentForm.severity} onValueChange={(v: "minor" | "moderate" | "major" | "critical") => setIncidentForm({ ...incidentForm, severity: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {INCIDENT_SEVERITY.map((s) => (
                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input value={incidentForm.location} onChange={(e) => setIncidentForm({ ...incidentForm, location: e.target.value })} placeholder="e.g., Emergency Ward, 2nd Floor" />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea value={incidentForm.description} onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })} rows={3} />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsIncidentDialogOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={createIncident.isPending}>
                          {createIncident.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Report
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {loadingInc ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
                ) : (
                  <div className="space-y-2">
                    {incidents?.filter((i) => i.investigation_status !== "closed").slice(0, 5).map((incident) => (
                      <div key={incident.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium">{incident.location || "Unknown Location"}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(incident.incident_date), "MMM d, yyyy")}
                          </p>
                        </div>
                        {getSeverityBadge(incident.severity)}
                      </div>
                    )) || <p className="text-muted-foreground text-center py-4">No open incidents</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fitness">
          <Card>
            <CardHeader>
              <CardTitle>Medical Fitness Records</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Examination Date</TableHead>
                    <TableHead>Examiner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Exam</TableHead>
                    <TableHead>Restrictions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingFitness ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                  ) : fitnessRecords && fitnessRecords.length > 0 ? (
                    fitnessRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{getEmployeeName(record.employee_id)}</TableCell>
                        <TableCell>{format(new Date(record.examination_date), "MMM d, yyyy")}</TableCell>
                        <TableCell>{record.examiner_name || "-"}</TableCell>
                        <TableCell>{getFitnessStatusBadge(record.fitness_status)}</TableCell>
                        <TableCell>{record.next_examination_date ? format(new Date(record.next_examination_date), "MMM d, yyyy") : "-"}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{record.restrictions || "-"}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No records found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vaccinations">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Vaccination Records</CardTitle>
              <Dialog open={isVaccineDialogOpen} onOpenChange={setIsVaccineDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Vaccination</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Record Vaccination</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateVaccine} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Employee</Label>
                      <Select value={vaccineForm.employee_id} onValueChange={(v) => setVaccineForm({ ...vaccineForm, employee_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                        <SelectContent>
                          {employees?.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Vaccine</Label>
                        <Select value={vaccineForm.vaccine_name} onValueChange={(v) => setVaccineForm({ ...vaccineForm, vaccine_name: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {VACCINE_TYPES.map((v) => (
                              <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Dose #</Label>
                        <Input type="number" min={1} value={vaccineForm.dose_number} onChange={(e) => setVaccineForm({ ...vaccineForm, dose_number: Number(e.target.value) })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date Administered</Label>
                        <Input type="date" value={vaccineForm.administered_date} onChange={(e) => setVaccineForm({ ...vaccineForm, administered_date: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Next Due Date</Label>
                        <Input type="date" value={vaccineForm.next_due_date} onChange={(e) => setVaccineForm({ ...vaccineForm, next_due_date: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Administered By</Label>
                        <Input value={vaccineForm.administered_by} onChange={(e) => setVaccineForm({ ...vaccineForm, administered_by: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Batch Number</Label>
                        <Input value={vaccineForm.batch_number} onChange={(e) => setVaccineForm({ ...vaccineForm, batch_number: e.target.value })} />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsVaccineDialogOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={createVaccine.isPending}>
                        {createVaccine.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Save
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Vaccine</TableHead>
                    <TableHead>Dose</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Next Due</TableHead>
                    <TableHead>Administered By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingVax ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                  ) : vaccinations && vaccinations.length > 0 ? (
                    vaccinations.map((vax) => (
                      <TableRow key={vax.id}>
                        <TableCell className="font-medium">{getEmployeeName(vax.employee_id)}</TableCell>
                        <TableCell className="capitalize">{vax.vaccine_name.replace("_", " ")}</TableCell>
                        <TableCell>Dose {vax.dose_number}</TableCell>
                        <TableCell>{format(new Date(vax.administered_date), "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          {vax.next_due_date ? (
                            <span className={new Date(vax.next_due_date) < new Date() ? "text-red-600" : ""}>
                              {format(new Date(vax.next_due_date), "MMM d, yyyy")}
                            </span>
                          ) : "-"}
                        </TableCell>
                        <TableCell>{vax.administered_by || "-"}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No records found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents">
          <Card>
            <CardHeader>
              <CardTitle>Incident Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingInc ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                  ) : incidents && incidents.length > 0 ? (
                    incidents.map((incident) => (
                      <TableRow key={incident.id}>
                        <TableCell>{format(new Date(incident.incident_date), "MMM d, yyyy HH:mm")}</TableCell>
                        <TableCell>{incident.location || "-"}</TableCell>
                        <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                        <TableCell className="max-w-[300px] truncate">{incident.description}</TableCell>
                        <TableCell>
                          <Badge variant={incident.investigation_status === "closed" ? "default" : "secondary"}>
                            {incident.investigation_status || "open"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No incidents reported</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
