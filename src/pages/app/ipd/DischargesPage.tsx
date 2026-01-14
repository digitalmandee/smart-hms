import { useState } from "react";
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
  AlertTriangle,
  FileText
} from "lucide-react";
import { usePendingDischarges } from "@/hooks/useDischarge";
import { useAdmissions } from "@/hooks/useAdmissions";
import { format, differenceInDays } from "date-fns";

export default function DischargesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  const { data: pendingDischarges, isLoading: loadingPending } = usePendingDischarges();
  const { data: recentDischarges, isLoading: loadingRecent } = useAdmissions("discharged");

  // Filter by search
  const filterBySearch = (list: any[]) => {
    if (!search) return list;
    const searchLower = search.toLowerCase();
    return list.filter((adm: any) => {
      const patientName = `${adm.patient?.first_name || ""} ${adm.patient?.last_name || ""}`.toLowerCase();
      return (
        patientName.includes(searchLower) ||
        adm.admission_number?.toLowerCase().includes(searchLower)
      );
    });
  };

  const filteredPending = filterBySearch(pendingDischarges || []);
  const filteredRecent = filterBySearch((recentDischarges || []).slice(0, 20));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Discharge Management"
        description="Manage patient discharges and discharge summaries"
      />

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by patient name or admission #..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Pending ({filteredPending.length})
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Recent Discharges
          </TabsTrigger>
        </TabsList>

        {/* Pending Tab */}
        <TabsContent value="pending" className="mt-4">
          {loadingPending ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredPending.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPending.map((adm: any) => {
                const daysOverdue = differenceInDays(
                  new Date(),
                  new Date(adm.expected_discharge_date)
                );

                return (
                  <Card key={adm.id} className="border-warning/50 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-warning" />
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
                        <Badge variant="outline" className="bg-warning/10 text-warning">
                          {daysOverdue > 0 ? `${daysOverdue}d overdue` : "Due today"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {adm.ward?.name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Bed className="h-4 w-4" />
                          Bed {adm.bed?.bed_number}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Admitted: {format(new Date(adm.admission_date), "dd MMM")}
                        </div>
                        <div className="flex items-center gap-1">
                          <LogOut className="h-4 w-4" />
                          Expected: {format(new Date(adm.expected_discharge_date), "dd MMM")}
                        </div>
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
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => navigate(`/app/ipd/discharge/${adm.id}`)}
                        >
                          <LogOut className="h-4 w-4 mr-1" />
                          Discharge
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <LogOut className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pending discharges</p>
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
