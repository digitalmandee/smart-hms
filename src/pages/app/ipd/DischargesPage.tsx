import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  LogOut, 
  User, 
  Calendar, 
  Building2, 
  Bed,
  FileText,
  Users,
  ClipboardCheck,
  Receipt,
  CheckCircle2,
  Stethoscope
} from "lucide-react";
import { useAdmittedPatientsForDischarge, useApprovedForBilling } from "@/hooks/useDischarge";
import { useAdmissions } from "@/hooks/useAdmissions";
import { useAuth } from "@/contexts/AuthContext";
import { format, differenceInDays } from "date-fns";

export default function DischargesPage() {
  const navigate = useNavigate();
  const { hasRole, hasPermission } = useAuth();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all-admitted");

  // Role-based access
  const isDoctor = hasRole("doctor");
  const canProcessBilling = hasPermission("billing.create") || hasPermission("ipd.charges.manage");

  const { data: admittedPatients, isLoading: loadingAdmitted } = useAdmittedPatientsForDischarge();
  const { data: recentDischarges, isLoading: loadingRecent } = useAdmissions("discharged");
  const { data: approvedForBilling, isLoading: loadingApproved } = useApprovedForBilling();

  // Client-side search filtering
  const filteredAdmitted = useMemo(() => {
    if (!admittedPatients) return [];
    if (!search.trim()) return admittedPatients;
    
    const searchLower = search.toLowerCase().trim();
    return admittedPatients.filter((adm: any) => {
      const patientName = `${adm.patient?.first_name || ""} ${adm.patient?.last_name || ""}`.toLowerCase();
      const patientNumber = adm.patient?.patient_number?.toLowerCase() || "";
      const admissionNumber = adm.admission_number?.toLowerCase() || "";
      return (
        patientName.includes(searchLower) ||
        patientNumber.includes(searchLower) ||
        admissionNumber.includes(searchLower)
      );
    });
  }, [admittedPatients, search]);

  const filteredRecent = useMemo(() => {
    const list = (recentDischarges || []).slice(0, 20);
    if (!search.trim()) return list;
    
    const searchLower = search.toLowerCase().trim();
    return list.filter((adm: any) => {
      const patientName = `${adm.patient?.first_name || ""} ${adm.patient?.last_name || ""}`.toLowerCase();
      return (
        patientName.includes(searchLower) ||
        adm.admission_number?.toLowerCase().includes(searchLower)
      );
    });
  }, [recentDischarges, search]);

  const filteredApproved = useMemo(() => {
    if (!approvedForBilling) return [];
    if (!search.trim()) return approvedForBilling;
    
    const searchLower = search.toLowerCase().trim();
    return approvedForBilling.filter((adm: any) => {
      const patientName = `${adm.patient?.first_name || ""} ${adm.patient?.last_name || ""}`.toLowerCase();
      const patientNumber = adm.patient?.patient_number?.toLowerCase() || "";
      const admissionNumber = adm.admission_number?.toLowerCase() || "";
      return (
        patientName.includes(searchLower) ||
        patientNumber.includes(searchLower) ||
        admissionNumber.includes(searchLower)
      );
    });
  }, [approvedForBilling, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Discharge Management"
        description="Initiate and manage patient discharges"
      />

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by patient name, number, or admission #..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all-admitted" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Admitted Patients ({filteredAdmitted.length})
          </TabsTrigger>
          <TabsTrigger value="ready-for-billing" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Ready for Billing ({filteredApproved.length})
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Recent Discharges
          </TabsTrigger>
        </TabsList>

        {/* All Admitted Tab */}
        <TabsContent value="all-admitted" className="mt-4">
          {loadingAdmitted ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredAdmitted.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAdmitted.map((adm: any) => {
                const daysAdmitted = differenceInDays(new Date(), new Date(adm.admission_date));
                const isOverdue = adm.expected_discharge_date && 
                  new Date(adm.expected_discharge_date) < new Date();

                return (
                  <Card key={adm.id} className={`hover:shadow-md transition-shadow ${isOverdue ? 'border-warning/50' : ''}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isOverdue ? 'bg-warning/10' : 'bg-primary/10'}`}>
                            <User className={`h-5 w-5 ${isOverdue ? 'text-warning' : 'text-primary'}`} />
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {adm.patient?.first_name} {adm.patient?.last_name}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {adm.patient?.patient_number}
                            </p>
                          </div>
                        </div>
                        <Badge variant={isOverdue ? "destructive" : "secondary"}>
                          {daysAdmitted} day{daysAdmitted !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-xs text-muted-foreground">
                        {adm.admission_number}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {adm.ward?.name || "No ward"}
                        </div>
                        <div className="flex items-center gap-1">
                          <Bed className="h-4 w-4" />
                          {adm.bed?.bed_number ? `Bed ${adm.bed.bed_number}` : "No bed"}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Admitted: {format(new Date(adm.admission_date), "dd MMM")}
                        </div>
                        {adm.expected_discharge_date && (
                          <div className="flex items-center gap-1">
                            <LogOut className="h-4 w-4" />
                            Expected: {format(new Date(adm.expected_discharge_date), "dd MMM")}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => navigate(`/app/ipd/admissions/${adm.id}`)}
                        >
                          View
                        </Button>
                        {/* Only doctors can create discharge summaries */}
                        {isDoctor && (
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => navigate(`/app/ipd/doctor-discharge/${adm.id}`)}
                          >
                            <Stethoscope className="h-4 w-4 mr-1" />
                            Create Summary
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{search ? "No patients match your search" : "No admitted patients"}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Ready for Billing Tab */}
        <TabsContent value="ready-for-billing" className="mt-4">
          {loadingApproved ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredApproved.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredApproved.map((adm: any) => {
                const dischargeSummary = adm.discharge_summary?.[0] || adm.discharge_summary;
                const approvedByName = dischargeSummary?.approved_by_profile?.full_name || "Doctor";
                const approvedAt = dischargeSummary?.approved_at;
                const daysAdmitted = differenceInDays(new Date(), new Date(adm.admission_date));

                return (
                  <Card key={adm.id} className="border-success/50 bg-success/5 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {adm.patient?.first_name} {adm.patient?.last_name}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {adm.patient?.patient_number}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-success text-success-foreground hover:bg-success/90">
                          Doctor Approved
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-xs text-muted-foreground">
                        {adm.admission_number}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {adm.ward?.name || "No ward"}
                        </div>
                        <div className="flex items-center gap-1">
                          <Bed className="h-4 w-4" />
                          {adm.bed?.bed_number ? `Bed ${adm.bed.bed_number}` : "No bed"}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {daysAdmitted} day{daysAdmitted !== 1 ? 's' : ''} admitted
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground border-t pt-2 mt-2">
                        <p className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Approved by: <span className="font-medium">{approvedByName}</span>
                        </p>
                        {approvedAt && (
                          <p className="mt-1">
                            on {format(new Date(approvedAt), "dd MMM yyyy 'at' h:mm a")}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => navigate(`/app/ipd/admissions/${adm.id}`)}
                        >
                          View Details
                        </Button>
                        {/* Only reception/billing staff can process billing */}
                        {canProcessBilling && (
                          <Button
                            size="sm"
                            className="flex-1 bg-success text-success-foreground hover:bg-success/90"
                            onClick={() => navigate(`/app/ipd/discharge/${adm.id}`)}
                          >
                            <Receipt className="h-4 w-4 mr-1" />
                            Process Billing
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{search ? "No patients match your search" : "No patients ready for billing"}</p>
                <p className="text-sm mt-2">Patients will appear here after doctors approve their discharge summary</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Recent Tab */}
        <TabsContent value="recent" className="mt-4">
          {loadingRecent ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredRecent.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredRecent.map((adm: any) => (
                <Card key={adm.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            {adm.patient?.first_name} {adm.patient?.last_name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {adm.admission_number}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">Discharged</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {adm.actual_discharge_date
                          ? format(new Date(adm.actual_discharge_date), "dd MMM yyyy")
                          : "N/A"}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => navigate(`/app/ipd/admissions/${adm.id}`)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      View Summary
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No recent discharges found
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
