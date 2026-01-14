import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEmployee } from "@/hooks/useHR";
import { useDoctorByEmployeeId } from "@/hooks/useDoctors";
import { useNurseByEmployeeId, NURSE_SPECIALIZATIONS } from "@/hooks/useNurses";
import { useEmployeeLeaveBalance } from "@/hooks/useLeaves";
import { EmployeeDocumentsSection } from "@/components/hr/EmployeeDocumentsSection";
import { 
  Loader2, 
  Pencil, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Building, 
  Briefcase,
  Stethoscope,
  Heart,
  CreditCard,
  Clock,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { LeaveBalanceWidget } from "@/components/hr/LeaveBalanceWidget";

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: employee, isLoading } = useEmployee(id || "");
  const { data: doctorData, isLoading: loadingDoctor } = useDoctorByEmployeeId(id || "");
  const { data: nurseData, isLoading: loadingNurse } = useNurseByEmployeeId(id || "");
  const { data: leaveBalances } = useEmployeeLeaveBalance(id || "");

  if (isLoading || loadingDoctor || loadingNurse) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Employee not found</p>
        <Button onClick={() => navigate("/app/hr/employees")}>Back to Employees</Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "on_leave":
        return "bg-yellow-500";
      case "suspended":
        return "bg-orange-500";
      case "terminated":
      case "resigned":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Transform leave balances for the widget
  const transformedBalances = leaveBalances?.map((balance) => ({
    id: balance.id,
    entitled_days: balance.entitled || 0,
    used_days: balance.used || 0,
    carried_forward: balance.carried_forward || 0,
    leave_type: balance.leave_type ? {
      id: balance.leave_type.id,
      name: balance.leave_type.name,
      code: balance.leave_type.code,
      color: balance.leave_type.color,
      is_paid: balance.leave_type.is_paid,
    } : null,
  })) || [];

  const isDoctor = !!doctorData;
  const isNurse = !!nurseData;
  
  // Get nurse specialization label
  const nurseSpecLabel = nurseData?.specialization 
    ? NURSE_SPECIALIZATIONS.find(s => s.value === nurseData.specialization)?.label || nurseData.specialization
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${employee.first_name} ${employee.last_name || ""}`}
        description={`Employee ID: ${employee.employee_number}`}
        breadcrumbs={[
          { label: "HR", href: "/app/hr" },
          { label: "Employees", href: "/app/hr/employees" },
          { label: `${employee.first_name} ${employee.last_name || ""}` },
        ]}
        actions={
          <Button onClick={() => navigate(`/app/hr/employees/${id}/edit`)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit Employee
          </Button>
        }
      />

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="h-24 w-24">
              <AvatarImage src={employee.profile_photo_url || ""} />
              <AvatarFallback className="text-2xl">
                {employee.first_name[0]}
                {employee.last_name?.[0] || ""}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold">
                  {isDoctor && "Dr. "}{employee.first_name} {employee.last_name}
                </h2>
                <Badge className={getStatusColor(employee.employment_status || "active")}>
                  {employee.employment_status?.replace("_", " ") || "Active"}
                </Badge>
                {isDoctor && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Stethoscope className="h-3 w-3" />
                    Doctor
                  </Badge>
                )}
                {isNurse && (
                  <Badge variant="outline" className="flex items-center gap-1 text-pink-600 border-pink-300">
                    <Heart className="h-3 w-3" />
                    Nurse
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {employee.designation && (
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {employee.designation.name}
                  </div>
                )}
                {employee.department && (
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    {employee.department.name}
                  </div>
                )}
                {employee.join_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {format(new Date(employee.join_date), "MMM d, yyyy")}
                  </div>
                )}
                {isDoctor && doctorData.specialization && (
                  <div className="flex items-center gap-1">
                    <Stethoscope className="h-4 w-4" />
                    {doctorData.specialization}
                  </div>
                )}
                {isNurse && nurseSpecLabel && (
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {nurseSpecLabel}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                {employee.personal_phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {employee.personal_phone}
                  </div>
                )}
                {employee.personal_email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {employee.personal_email}
                  </div>
                )}
                {employee.current_address && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {employee.current_address}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
          {isDoctor && (
            <TabsTrigger value="clinical" className="flex items-center gap-1.5">
              <Stethoscope className="h-4 w-4" />
              Clinical
            </TabsTrigger>
          )}
          {isNurse && (
            <TabsTrigger value="nursing" className="flex items-center gap-1.5">
              <Heart className="h-4 w-4" />
              Nursing
            </TabsTrigger>
          )}
          <TabsTrigger value="leaves">Leaves</TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Gender" value={employee.gender || "-"} />
                <InfoRow
                  label="Date of Birth"
                  value={
                    employee.date_of_birth
                      ? format(new Date(employee.date_of_birth), "MMM d, yyyy")
                      : "-"
                  }
                />
                <InfoRow label="Blood Group" value={employee.blood_group || "-"} />
                <InfoRow label="Marital Status" value={employee.marital_status || "-"} />
                <InfoRow label="Nationality" value={employee.nationality || "-"} />
                <InfoRow label="Religion" value={employee.religion || "-"} />
                <InfoRow label="National ID" value={employee.national_id || "-"} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Name" value={employee.emergency_contact_name || "-"} />
                <InfoRow label="Phone" value={employee.emergency_contact_phone || "-"} />
                <InfoRow label="Relationship" value={employee.emergency_contact_relation || "-"} />
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Bank Details</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-4">
                <InfoRow label="Bank Name" value={employee.bank_name || "-"} />
                <InfoRow label="Account Title" value={employee.account_title || "-"} />
                <InfoRow label="Account Number" value={employee.account_number || "-"} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="employment">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Employment Details</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <InfoRow label="Employee Number" value={employee.employee_number} />
              <InfoRow label="Employee Type" value={employee.employee_type || "-"} />
              <InfoRow label="Department" value={employee.department?.name || "-"} />
              <InfoRow label="Designation" value={employee.designation?.name || "-"} />
              <InfoRow label="Category" value={employee.category?.name || "-"} />
              <InfoRow label="Shift" value="-" />
              <InfoRow
                label="Join Date"
                value={format(new Date(employee.join_date), "MMM d, yyyy")}
              />
              <InfoRow
                label="Confirmation Date"
                value={
                  employee.confirmation_date
                    ? format(new Date(employee.confirmation_date), "MMM d, yyyy")
                    : "-"
                }
              />
              <InfoRow label="Working Hours" value={`${employee.working_hours || 8} hrs/day`} />
            </CardContent>
          </Card>
        </TabsContent>

        {isDoctor && (
          <TabsContent value="clinical">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-primary" />
                    Medical Practice
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <InfoRow label="Specialization" value={doctorData.specialization || "-"} />
                  <InfoRow label="Qualification" value={doctorData.qualification || "-"} />
                  <InfoRow label="License Number" value={doctorData.license_number || "-"} />
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground text-sm">Availability</span>
                    <Badge variant={doctorData.is_available ? "default" : "secondary"}>
                      {doctorData.is_available ? "Available for OPD" : "Unavailable"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Consultation Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <InfoRow 
                    label="Consultation Fee" 
                    value={doctorData.consultation_fee ? `Rs. ${doctorData.consultation_fee.toLocaleString()}` : "-"} 
                  />
                  <InfoRow label="Branch" value={doctorData.branch?.name || "-"} />
                  <div className="pt-4 border-t">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/app/appointments/schedules?doctorId=${doctorData.id}`)}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      View OPD Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Practice Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-primary">--</p>
                      <p className="text-sm text-muted-foreground">Patients Today</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-primary">--</p>
                      <p className="text-sm text-muted-foreground">This Week</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-primary">--</p>
                      <p className="text-sm text-muted-foreground">This Month</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-primary">--</p>
                      <p className="text-sm text-muted-foreground">Total Patients</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {isNurse && (
          <TabsContent value="nursing">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Heart className="h-5 w-5 text-pink-500" />
                    Nursing Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <InfoRow label="Specialization" value={nurseSpecLabel || "-"} />
                  <InfoRow label="Qualification" value={nurseData.qualification || "-"} />
                  <InfoRow label="License Number" value={nurseData.license_number || "-"} />
                  <InfoRow 
                    label="License Expiry" 
                    value={nurseData.license_expiry ? format(new Date(nurseData.license_expiry), "MMM d, yyyy") : "-"} 
                  />
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground text-sm">Charge Nurse</span>
                    <Badge variant={nurseData.is_charge_nurse ? "default" : "secondary"}>
                      {nurseData.is_charge_nurse ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground text-sm">Availability</span>
                    <Badge variant={nurseData.is_available ? "default" : "secondary"}>
                      {nurseData.is_available ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" />
                    Assignment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <InfoRow label="Assigned Ward" value={nurseData.assigned_ward?.name || "Not Assigned"} />
                  <InfoRow label="Ward Type" value={nurseData.assigned_ward?.ward_type || "-"} />
                  <InfoRow label="Branch" value={nurseData.branch?.name || "-"} />
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Nursing Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-pink-600">--</p>
                      <p className="text-sm text-muted-foreground">Patients Assigned</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-pink-600">--</p>
                      <p className="text-sm text-muted-foreground">Tasks Today</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-pink-600">--</p>
                      <p className="text-sm text-muted-foreground">Vitals Recorded</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-pink-600">--</p>
                      <p className="text-sm text-muted-foreground">Meds Administered</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        <TabsContent value="leaves">
          {transformedBalances.length > 0 ? (
            <LeaveBalanceWidget balances={transformedBalances} />
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No leave balances found for this employee
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="documents">
          <EmployeeDocumentsSection employeeId={id || ""} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-sm font-medium capitalize">{value}</span>
    </div>
  );
}
