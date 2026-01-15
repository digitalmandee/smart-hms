import { useState } from "react";
import { format } from "date-fns";
import { ClipboardCheck, Target } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAdmissions } from "@/hooks/useAdmissions";
import { CarePlanBuilder } from "@/components/ipd/CarePlanBuilder";
import { CarePlansList } from "@/components/ipd/CarePlansList";

const CarePlansPage = () => {
  const [selectedAdmission, setSelectedAdmission] = useState<string>("");

  const { data: admissions = [] } = useAdmissions();
  const activeAdmissions = admissions.filter((a) => a.status === "admitted");

  const selectedAdmissionData = admissions.find((a) => a.id === selectedAdmission);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Care Plans"
        description="Manage patient care plans and goals"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Patient</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedAdmission} onValueChange={setSelectedAdmission}>
            <SelectTrigger className="max-w-md">
              <SelectValue placeholder="Select admitted patient" />
            </SelectTrigger>
            <SelectContent>
              {activeAdmissions.map((admission) => (
                <SelectItem key={admission.id} value={admission.id}>
                  {admission.admission_number} - {admission.patient?.first_name}{" "}
                  {admission.patient?.last_name} ({admission.bed?.bed_number})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedAdmission && (
        <>
          <CarePlanBuilder admissionId={selectedAdmission} />
          
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Active Care Plans
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {selectedAdmissionData?.patient?.first_name}{" "}
                  {selectedAdmissionData?.patient?.last_name} - Bed{" "}
                  {selectedAdmissionData?.bed?.bed_number}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <CarePlansList admissionId={selectedAdmission} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default CarePlansPage;
