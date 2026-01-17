import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useMLCRecords } from "@/hooks/useMLCRecords";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, FileText, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function MLCRecordsPage() {
  const { profile } = useAuth();
  const [search, setSearch] = useState("");
  const [caseTypeFilter, setCaseTypeFilter] = useState<string>("all");
  const { data: mlcRecords, isLoading } = useMLCRecords(profile?.branch_id);

  const filteredRecords = mlcRecords?.filter((record: any) => {
    const matchesSearch = !search || 
      record.mlc_number?.toLowerCase().includes(search.toLowerCase()) ||
      record.patient?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      record.patient?.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      record.patient?.patient_number?.toLowerCase().includes(search.toLowerCase());
    
    const matchesCaseType = caseTypeFilter === "all" || record.case_type === caseTypeFilter;
    
    return matchesSearch && matchesCaseType;
  });

  const getCaseTypeBadge = (caseType: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
      accident: "default",
      assault: "destructive",
      poisoning: "secondary",
      sexual_assault: "destructive",
      burn: "secondary",
      drowning: "secondary",
      industrial: "default",
      suicide_attempt: "destructive",
      unknown: "outline",
    };
    return <Badge variant={variants[caseType] || "outline"}>{caseType?.replace('_', ' ')}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
      pending: "outline",
      examined: "secondary",
      reported: "default",
      handed_over: "default",
    };
    return <Badge variant={variants[status] || "outline"}>{status?.replace('_', ' ')}</Badge>;
  };

  return (
    <div>
      <PageHeader
        title="Medico-Legal Cases"
        description="Manage MLC examinations and reports"
        breadcrumbs={[
          { label: "Emergency", href: "/app/emergency" },
          { label: "MLC Records" },
        ]}
        actions={
          <Link to="/app/emergency/mlc/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New MLC
            </Button>
          </Link>
        }
      />

      <Card>
        <CardContent className="p-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by MLC#, patient name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={caseTypeFilter} onValueChange={setCaseTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Case Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="accident">Accident</SelectItem>
                <SelectItem value="assault">Assault</SelectItem>
                <SelectItem value="poisoning">Poisoning</SelectItem>
                <SelectItem value="sexual_assault">Sexual Assault</SelectItem>
                <SelectItem value="burn">Burn</SelectItem>
                <SelectItem value="drowning">Drowning</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
                <SelectItem value="suicide_attempt">Suicide Attempt</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !filteredRecords?.length ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No MLC records found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>MLC Number</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Case Type</TableHead>
                  <TableHead>Date/Time</TableHead>
                  <TableHead>Police Station</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record: any) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.mlc_number}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {record.patient?.first_name} {record.patient?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {record.patient?.patient_number}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getCaseTypeBadge(record.case_type)}</TableCell>
                    <TableCell>
                      <div>
                        <p>{format(new Date(record.incident_date), 'MMM dd, yyyy')}</p>
                        <p className="text-sm text-muted-foreground">{record.incident_time}</p>
                      </div>
                    </TableCell>
                    <TableCell>{record.police_station || '-'}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/app/emergency/mlc/${record.id}`}>
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
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
}
