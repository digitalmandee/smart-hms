import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search } from "lucide-react";
import { useAdmissions, ADMISSION_STATUSES } from "@/hooks/useAdmissions";
import { AdmissionCard } from "@/components/ipd/AdmissionCard";

export default function AdmissionsListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("admitted");

  const { data: admissions, isLoading } = useAdmissions(
    statusFilter === "all" ? undefined : (statusFilter as any)
  );

  const filteredAdmissions = (admissions || []).filter((adm: any) => {
    const patientName = `${adm.patient?.first_name || ""} ${adm.patient?.last_name || ""}`.toLowerCase();
    const searchLower = search.toLowerCase();
    return (
      patientName.includes(searchLower) ||
      adm.admission_number?.toLowerCase().includes(searchLower) ||
      adm.patient?.patient_number?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admissions"
        description="Manage patient admissions and inpatient records"
        actions={
          <Button onClick={() => navigate("/app/ipd/admissions/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Admission
          </Button>
        }
      />

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by patient name, admission # or MRN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="admitted">Active</TabsTrigger>
          <TabsTrigger value="discharged">Discharged</TabsTrigger>
          <TabsTrigger value="transferred">Transferred</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading admissions...</div>
          ) : filteredAdmissions.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAdmissions.map((admission: any) => (
                <AdmissionCard
                  key={admission.id}
                  admission={admission}
                  onView={(id) => navigate(`/app/ipd/admissions/${id}`)}
                  onRounds={(id) => navigate(`/app/ipd/rounds/${id}`)}
                  onDischarge={(id) => navigate(`/app/ipd/discharge/${id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              {search ? "No admissions match your search" : "No admissions found"}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
