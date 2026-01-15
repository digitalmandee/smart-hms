import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { History, Eye, FileText } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdmissions } from "@/hooks/useAdmissions";

const AdmissionHistoryPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: admissions = [], isLoading } = useAdmissions();
  
  // Filter for discharged admissions only
  const dischargedAdmissions = admissions.filter(
    (admission) => admission.status === "discharged"
  );

  const filteredAdmissions = dischargedAdmissions.filter(
    (admission) =>
      admission.admission_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admission.patient?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admission.patient?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDischargeTypeBadge = (type: string | null) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      normal: "default",
      lama: "secondary",
      absconded: "destructive",
      referred: "outline",
      expired: "destructive",
    };
    return variants[type || "normal"] || "default";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admission History"
        description="View past patient admissions and discharge records"
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Discharged Patients</CardTitle>
            <Input
              placeholder="Search by name or admission #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading admission history...
            </div>
          ) : filteredAdmissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No discharge records found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admission #</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Admitted</TableHead>
                  <TableHead>Discharged</TableHead>
                  <TableHead>Ward / Bed</TableHead>
                  <TableHead>Discharge Type</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdmissions.map((admission) => (
                  <TableRow key={admission.id}>
                    <TableCell className="font-medium">
                      {admission.admission_number}
                    </TableCell>
                    <TableCell>
                      {admission.patient?.first_name} {admission.patient?.last_name}
                    </TableCell>
                    <TableCell>
                      {format(new Date(admission.admission_date), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      {admission.actual_discharge_date
                        ? format(new Date(admission.actual_discharge_date), "dd MMM yyyy")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {admission.ward?.name || "-"} / {admission.bed?.bed_number || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getDischargeTypeBadge(admission.discharge_type)}>
                        {admission.discharge_type || "Normal"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/app/ipd/admissions/${admission.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/app/ipd/admissions/${admission.id}/summary`)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdmissionHistoryPage;
