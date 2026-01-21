import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, AlertCircle, RefreshCw } from "lucide-react";
import { useAdmissions } from "@/hooks/useAdmissions";
import { useAuth } from "@/contexts/AuthContext";
import { AdmissionCard } from "@/components/ipd/AdmissionCard";

export default function AdmissionsListPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("admitted");

  const { data: admissions, isLoading, error, refetch } = useAdmissions(
    statusFilter === "all" ? undefined : (statusFilter as any)
  );

  // Show error if no organization
  if (!profile?.organization_id) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Admissions"
          description="Manage patient admissions and inpatient records"
        />
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <p className="text-destructive font-medium">Your profile is not associated with an organization.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Please contact your administrator to set up your organization.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => navigate("/app/ipd/admissions/new")}>
              <Plus className="h-4 w-4 mr-2" />
              New Admission
            </Button>
          </div>
        }
      />

      {/* Search with count */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by patient name, admission # or MRN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        {!isLoading && (
          <Badge variant="outline" className="text-muted-foreground">
            {filteredAdmissions.length} admission(s) found
          </Badge>
        )}
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="py-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Failed to load admissions</p>
                <p className="text-sm">{(error as Error).message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
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
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                {search ? (
                  <>
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No admissions match your search</p>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No {statusFilter === "all" ? "" : statusFilter} admissions found</p>
                    {statusFilter === "admitted" && (
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => navigate("/app/ipd/admissions/new")}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Admission
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
