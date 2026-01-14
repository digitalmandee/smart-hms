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
import { 
  Building2, 
  Users, 
  Pill, 
  ClipboardList, 
  Heart,
  AlertTriangle,
  User,
  Bed
} from "lucide-react";
import { useWards } from "@/hooks/useIPD";
import { useAdmissions } from "@/hooks/useAdmissions";
import { format } from "date-fns";

export default function NursingStationPage() {
  const navigate = useNavigate();
  const [selectedWardId, setSelectedWardId] = useState<string>("");
  const [activeTab, setActiveTab] = useState("patients");

  const { data: wards, isLoading: loadingWards } = useWards();
  const { data: admissions, isLoading: loadingAdmissions } = useAdmissions("admitted");

  const selectedWard = wards?.find((w: any) => w.id === selectedWardId);

  // Filter admissions by ward
  const wardPatients = selectedWardId
    ? (admissions || []).filter((adm: any) => adm.ward?.id === selectedWardId)
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nursing Station"
        description="Manage patient care, medications, and nursing documentation"
      />

      {/* Ward Selector */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Select Ward:</span>
        </div>
        <Select value={selectedWardId} onValueChange={setSelectedWardId}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Choose a ward" />
          </SelectTrigger>
          <SelectContent>
            {loadingWards ? (
              <SelectItem value="loading" disabled>Loading...</SelectItem>
            ) : (
              (wards || []).map((ward: any) => (
                <SelectItem key={ward.id} value={ward.id}>
                  {ward.name} ({ward.code})
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        {selectedWardId && (
          <Badge variant="outline" className="ml-auto">
            <Users className="h-3 w-3 mr-1" />
            {wardPatients.length} Patients
          </Badge>
        )}
      </div>

      {/* Content */}
      {selectedWardId ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="patients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Patients
            </TabsTrigger>
            <TabsTrigger value="medications" className="flex items-center gap-2">
              <Pill className="h-4 w-4" />
              Medications
            </TabsTrigger>
            <TabsTrigger value="vitals" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Vitals
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Notes
            </TabsTrigger>
          </TabsList>

          {/* Patients Tab */}
          <TabsContent value="patients" className="mt-4">
            {loadingAdmissions ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : wardPatients.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {wardPatients.map((adm: any) => (
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
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Bed className="h-3 w-3" />
                              Bed {adm.bed?.bed_number}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">{adm.admission_number}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        Admitted: {format(new Date(adm.admission_date), "dd MMM yyyy")}
                      </div>
                      {adm.chief_complaint && (
                        <div className="text-sm line-clamp-2">
                          <span className="text-muted-foreground">CC: </span>
                          {adm.chief_complaint}
                        </div>
                      )}
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
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {/* TODO: Add vitals */}}
                        >
                          <Heart className="h-4 w-4 mr-1" />
                          Vitals
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No patients in this ward
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Medications Tab */}
          <TabsContent value="medications" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Medication Administration
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8 text-muted-foreground">
                <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Medication schedule coming soon</p>
                <p className="text-sm">Track and administer medications for patients</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vitals Tab */}
          <TabsContent value="vitals" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Vitals Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8 text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Vitals monitoring coming soon</p>
                <p className="text-sm">Record and track patient vitals</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Nursing Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8 text-muted-foreground">
                <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nursing documentation coming soon</p>
                <p className="text-sm">Create and view nursing notes and care plans</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select a ward to view nursing station</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
