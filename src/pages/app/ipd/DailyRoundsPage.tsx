import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClipboardList, User, Bed, Building2, Play, Check } from "lucide-react";
import { useWards } from "@/hooks/useIPD";
import { useAdmissions } from "@/hooks/useAdmissions";
import { usePendingRounds, useDailyRounds } from "@/hooks/useDailyRounds";
import { format } from "date-fns";

export default function DailyRoundsPage() {
  const navigate = useNavigate();
  const [selectedWardId, setSelectedWardId] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("pending");

  const { data: wards } = useWards();
  const { data: pendingRounds, isLoading: loadingPending } = usePendingRounds();
  const { data: admissions, isLoading: loadingAdmissions } = useAdmissions("admitted");

  // Filter by ward
  const filteredPending = (pendingRounds || []).filter((adm: any) => {
    if (selectedWardId === "all") return true;
    return adm.ward?.id === selectedWardId;
  });

  const filteredAdmissions = (admissions || []).filter((adm: any) => {
    if (selectedWardId === "all") return true;
    return adm.ward?.id === selectedWardId;
  });

  const completedToday = filteredAdmissions.filter(
    (adm: any) => !filteredPending.find((p: any) => p.id === adm.id)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Rounds"
        description="Manage and document daily patient rounds"
      />

      {/* Ward Filter */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Ward:</span>
        </div>
        <Select value={selectedWardId} onValueChange={setSelectedWardId}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="All Wards" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Wards</SelectItem>
            {(wards || []).map((ward: any) => (
              <SelectItem key={ward.id} value={ward.id}>
                {ward.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto flex gap-2">
          <Badge variant="outline" className="bg-warning/10 text-warning">
            {filteredPending.length} Pending
          </Badge>
          <Badge variant="outline" className="bg-success/10 text-success">
            {completedToday.length} Completed
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Pending ({filteredPending.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            Completed ({completedToday.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          {loadingPending ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredPending.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPending.map((adm: any) => (
                <Card key={adm.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
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
                        Pending
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {adm.ward?.name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        Bed {adm.bed?.bed_number}
                      </div>
                    </div>
                    {adm.attending_doctor?.profile && (
                      <div className="text-sm text-muted-foreground">
                        Attending: Dr. {adm.attending_doctor.profile.full_name}
                      </div>
                    )}
                    <Button
                      className="w-full"
                      onClick={() => navigate(`/app/ipd/rounds/${adm.id}`)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Round
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Check className="h-12 w-12 mx-auto mb-4 text-success opacity-50" />
                <p>All rounds completed for today!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          {completedToday.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedToday.map((adm: any) => (
                <Card key={adm.id} className="opacity-75">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                          <Check className="h-5 w-5 text-success" />
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
                      <Badge variant="outline" className="bg-success/10 text-success">
                        Done
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {adm.ward?.name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        Bed {adm.bed?.bed_number}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-3"
                      onClick={() => navigate(`/app/ipd/admissions/${adm.id}`)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No completed rounds yet today
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
