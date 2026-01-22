import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, DollarSign, Receipt, TrendingUp, CheckCircle, Loader2, Download } from "lucide-react";
import { useDoctorEarnings, useCreateDoctorEarning, useMarkEarningsAsPaid } from "@/hooks/useDoctorCompensation";
import { useDoctors } from "@/hooks/useDoctors";
import { format } from "date-fns";
import { exportToCSV, formatCurrency } from "@/lib/exportUtils";

const SOURCE_TYPES = [
  { value: "consultation", label: "Consultation" },
  { value: "procedure", label: "Procedure" },
  { value: "surgery", label: "Surgery" },
  { value: "lab_referral", label: "Lab Referral" },
  { value: "radiology_referral", label: "Radiology Referral" },
  { value: "pharmacy_referral", label: "Pharmacy Referral" },
  { value: "ipd_visit", label: "IPD Visit" },
  { value: "other", label: "Other" },
];

export default function DoctorEarningsPage() {
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [isPaidFilter, setIsPaidFilter] = useState<string>("");
  const [sourceFilter, setSourceFilter] = useState<string>("");
  const [selectedEarnings, setSelectedEarnings] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    doctor_id: "",
    earning_date: new Date().toISOString().split("T")[0],
    source_type: "consultation" as const,
    source_reference: "",
    gross_amount: 0,
    doctor_share_percent: 0,
  });

  const { data: earnings, isLoading } = useDoctorEarnings({
    doctorId: selectedDoctor || undefined,
    isPaid: isPaidFilter === "" ? undefined : isPaidFilter === "true",
    sourceType: sourceFilter || undefined,
  });
  const { data: doctors } = useDoctors();
  const createEarning = useCreateDoctorEarning();
  const markAsPaid = useMarkEarningsAsPaid();

  const totalEarnings = earnings?.reduce((sum, e) => sum + Number(e.doctor_share_amount), 0) || 0;
  const unpaidEarnings = earnings?.filter((e) => !e.is_paid).reduce((sum, e) => sum + Number(e.doctor_share_amount), 0) || 0;
  const paidEarnings = earnings?.filter((e) => e.is_paid).reduce((sum, e) => sum + Number(e.doctor_share_amount), 0) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const doctorShareAmount = (formData.gross_amount * formData.doctor_share_percent) / 100;
    const hospitalShareAmount = formData.gross_amount - doctorShareAmount;

    try {
      await createEarning.mutateAsync({
        doctor_id: formData.doctor_id,
        earning_date: formData.earning_date,
        source_type: formData.source_type,
        source_reference: formData.source_reference,
        gross_amount: formData.gross_amount,
        doctor_share_percent: formData.doctor_share_percent,
        doctor_share_amount: doctorShareAmount,
        hospital_share_amount: hospitalShareAmount,
      });
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error handled by hook
    }
  };

  const resetForm = () => {
    setFormData({
      doctor_id: "",
      earning_date: new Date().toISOString().split("T")[0],
      source_type: "consultation",
      source_reference: "",
      gross_amount: 0,
      doctor_share_percent: 0,
    });
  };

  const handleMarkAsPaid = async () => {
    if (selectedEarnings.length === 0) return;
    try {
      await markAsPaid.mutateAsync(selectedEarnings);
      setSelectedEarnings([]);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleExport = () => {
    if (!earnings?.length) return;
    exportToCSV(
      earnings,
      "doctor-earnings",
      [
        { key: "earning_date", header: "Date", format: (v) => format(new Date(v), "yyyy-MM-dd") },
        { key: "source_type", header: "Source" },
        { key: "source_reference", header: "Reference" },
        { key: "gross_amount", header: "Gross Amount", format: formatCurrency },
        { key: "doctor_share_percent", header: "Share %" },
        { key: "doctor_share_amount", header: "Doctor Share", format: formatCurrency },
        { key: "hospital_share_amount", header: "Hospital Share", format: formatCurrency },
        { key: "is_paid", header: "Status", format: (v) => (v ? "Paid" : "Unpaid") },
      ]
    );
  };

  const toggleEarningSelection = (id: string) => {
    setSelectedEarnings((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const selectAllUnpaid = () => {
    const unpaidIds = earnings?.filter((e) => !e.is_paid).map((e) => e.id) || [];
    setSelectedEarnings(unpaidIds);
  };

  const getSourceBadge = (type: string) => {
    const colors: Record<string, string> = {
      consultation: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      procedure: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      surgery: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      lab_referral: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      radiology_referral: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
      pharmacy_referral: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      ipd_visit: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
      other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    };
    return <Badge className={colors[type] || ""}>{type.replace("_", " ")}</Badge>;
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors?.find((d) => d.id === doctorId);
    return doctor?.employee ? `${doctor.employee.first_name} ${doctor.employee.last_name || ""}` : "Unknown";
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Doctor Earnings"
        description="Track and manage doctor revenue share earnings"
        breadcrumbs={[
          { label: "HR", href: "/app/hr" },
          { label: "Payroll", href: "/app/hr/payroll" },
          { label: "Doctor Earnings" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} disabled={!earnings?.length}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Record Earning
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Doctor Earning</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Doctor</Label>
                    <Select value={formData.doctor_id} onValueChange={(v) => setFormData({ ...formData, doctor_id: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors?.map((doc) => (
                          <SelectItem key={doc.id} value={doc.id}>
                            {doc.employee?.first_name} {doc.employee?.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={formData.earning_date}
                        onChange={(e) => setFormData({ ...formData, earning_date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Source Type</Label>
                      <Select value={formData.source_type} onValueChange={(v: any) => setFormData({ ...formData, source_type: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SOURCE_TYPES.map((st) => (
                            <SelectItem key={st.value} value={st.value}>
                              {st.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Reference (Invoice/ID)</Label>
                    <Input
                      value={formData.source_reference}
                      onChange={(e) => setFormData({ ...formData, source_reference: e.target.value })}
                      placeholder="e.g., INV-001 or Patient Name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Gross Amount (Rs.)</Label>
                      <Input
                        type="number"
                        value={formData.gross_amount}
                        onChange={(e) => setFormData({ ...formData, gross_amount: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Doctor Share %</Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={formData.doctor_share_percent}
                        onChange={(e) => setFormData({ ...formData, doctor_share_percent: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  {formData.gross_amount > 0 && formData.doctor_share_percent > 0 && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Doctor Share: <strong>Rs. {((formData.gross_amount * formData.doctor_share_percent) / 100).toLocaleString()}</strong>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Hospital Share: <strong>Rs. {(formData.gross_amount - (formData.gross_amount * formData.doctor_share_percent) / 100).toLocaleString()}</strong>
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createEarning.isPending}>
                      {createEarning.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Record Earning
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold">{earnings?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">Rs. {totalEarnings.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unpaid</p>
                <p className="text-2xl font-bold">Rs. {unpaidEarnings.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-2xl font-bold">Rs. {paidEarnings.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger>
                  <SelectValue placeholder="All Doctors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Doctors</SelectItem>
                  {doctors?.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.employee?.first_name} {doc.employee?.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Select value={isPaidFilter} onValueChange={setIsPaidFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="false">Unpaid</SelectItem>
                <SelectItem value="true">Paid</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Sources</SelectItem>
                {SOURCE_TYPES.map((st) => (
                  <SelectItem key={st.value} value={st.value}>
                    {st.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedEarnings.length > 0 && (
              <Button onClick={handleMarkAsPaid} disabled={markAsPaid.isPending}>
                {markAsPaid.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Mark {selectedEarnings.length} as Paid
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={selectAllUnpaid}>
              Select All Unpaid
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Earnings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="text-right">Gross</TableHead>
                <TableHead className="text-right">Share %</TableHead>
                <TableHead className="text-right">Doctor Share</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : earnings && earnings.length > 0 ? (
                earnings.map((earning) => (
                  <TableRow key={earning.id}>
                    <TableCell>
                      {!earning.is_paid && (
                        <Checkbox
                          checked={selectedEarnings.includes(earning.id)}
                          onCheckedChange={() => toggleEarningSelection(earning.id)}
                        />
                      )}
                    </TableCell>
                    <TableCell>{format(new Date(earning.earning_date), "MMM d, yyyy")}</TableCell>
                    <TableCell className="font-medium">{getDoctorName(earning.doctor_id)}</TableCell>
                    <TableCell>{getSourceBadge(earning.source_type)}</TableCell>
                    <TableCell>{earning.source_reference || "-"}</TableCell>
                    <TableCell className="text-right">Rs. {Number(earning.gross_amount).toLocaleString()}</TableCell>
                    <TableCell className="text-right">{earning.doctor_share_percent}%</TableCell>
                    <TableCell className="text-right font-medium">Rs. {Number(earning.doctor_share_amount).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={earning.is_paid ? "default" : "secondary"}>
                        {earning.is_paid ? "Paid" : "Unpaid"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No earnings records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
