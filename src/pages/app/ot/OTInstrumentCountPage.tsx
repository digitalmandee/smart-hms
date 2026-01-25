import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, isToday } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { useSurgeries } from "@/hooks/useOT";
import { useAuth } from "@/contexts/AuthContext";
import { 
  ClipboardCheck, 
  Search, 
  Clock, 
  User, 
  Scissors, 
  MapPin,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  AlertTriangle
} from "lucide-react";
import { OTStatusBadge } from "@/components/ot/OTStatusBadge";

interface CountStatus {
  spongeCount: boolean;
  instrumentCount: boolean;
  needleCount: boolean;
  hasDiscrepancy: boolean;
}

export default function OTInstrumentCountPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"active" | "pending" | "completed">("active");

  // Fetch surgeries that are in_progress or completed (today)
  const { data: surgeries, isLoading } = useSurgeries({
    branchId: profile?.branch_id,
  });

  // Extract count status from intra_op_notes
  const getCountStatus = (surgery: any): CountStatus => {
    const notes = surgery.intra_op_notes;
    if (!notes) {
      return {
        spongeCount: false,
        instrumentCount: false,
        needleCount: false,
        hasDiscrepancy: false
      };
    }

    const spongeCorrect = notes.sponge_count_before === notes.sponge_count_after && 
                          notes.sponge_count_before !== undefined;
    const instrumentCorrect = notes.instrument_count_before === notes.instrument_count_after && 
                              notes.instrument_count_before !== undefined;
    const needleCorrect = notes.needle_count_before === notes.needle_count_after && 
                          notes.needle_count_before !== undefined;

    const hasDiscrepancy = notes.count_discrepancy || 
      (notes.sponge_count_before !== notes.sponge_count_after) ||
      (notes.instrument_count_before !== notes.instrument_count_after) ||
      (notes.needle_count_before !== notes.needle_count_after);

    return {
      spongeCount: spongeCorrect,
      instrumentCount: instrumentCorrect,
      needleCount: needleCorrect,
      hasDiscrepancy: Boolean(hasDiscrepancy)
    };
  };

  // Filter surgeries
  const filteredSurgeries = (surgeries || []).filter(surgery => {
    const surgeryDate = new Date(surgery.scheduled_date);
    
    // Only show today's surgeries or in_progress
    if (!isToday(surgeryDate) && surgery.status !== 'in_progress') return false;

    // Status filter
    const countStatus = getCountStatus(surgery);
    const allCountsComplete = countStatus.spongeCount && countStatus.instrumentCount && countStatus.needleCount;
    
    if (statusFilter === "active") {
      return surgery.status === 'in_progress';
    }
    if (statusFilter === "pending") {
      return (surgery.status === 'in_progress' || surgery.status === 'completed') && !allCountsComplete;
    }
    if (statusFilter === "completed") {
      return surgery.status === 'completed' && allCountsComplete;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const patientName = `${surgery.patient?.first_name || ''} ${surgery.patient?.last_name || ''}`.toLowerCase();
      const procedureName = surgery.procedure_name?.toLowerCase() || '';
      
      return patientName.includes(query) || procedureName.includes(query);
    }

    return true;
  });

  // Sort: in_progress first, then by discrepancy
  const sortedSurgeries = [...filteredSurgeries].sort((a, b) => {
    if (a.status === 'in_progress' && b.status !== 'in_progress') return -1;
    if (b.status === 'in_progress' && a.status !== 'in_progress') return 1;
    
    const aHasDiscrepancy = getCountStatus(a).hasDiscrepancy;
    const bHasDiscrepancy = getCountStatus(b).hasDiscrepancy;
    if (aHasDiscrepancy && !bHasDiscrepancy) return -1;
    if (bHasDiscrepancy && !aHasDiscrepancy) return 1;
    
    return 0;
  });

  const handleOpenCounts = (surgeryId: string) => {
    // Navigate to op-notes page which contains count fields
    navigate(`/app/ot/surgeries/${surgeryId}/op-notes`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Surgical Instrument Counts"
        description="Verify sponge, instrument, and needle counts for patient safety"
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="active">Active Surgeries</TabsTrigger>
            <TabsTrigger value="pending">Counts Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patient or procedure..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-xl font-bold">
                  {(surgeries || []).filter(s => s.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900">
                <AlertCircle className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Counts Pending</p>
                <p className="text-xl font-bold">
                  {(surgeries || []).filter(s => {
                    const status = getCountStatus(s);
                    return (s.status === 'in_progress' || s.status === 'completed') &&
                           !(status.spongeCount && status.instrumentCount && status.needleCount);
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Discrepancies</p>
                <p className="text-xl font-bold">
                  {(surgeries || []).filter(s => getCountStatus(s).hasDiscrepancy).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">All Verified</p>
                <p className="text-xl font-bold">
                  {(surgeries || []).filter(s => {
                    const status = getCountStatus(s);
                    return status.spongeCount && status.instrumentCount && status.needleCount && !status.hasDiscrepancy;
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Surgery List */}
      {sortedSurgeries.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No surgeries found</h3>
            <p className="text-muted-foreground">
              No surgeries matching the selected filter.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sortedSurgeries.map((surgery) => {
            const countStatus = getCountStatus(surgery);
            const allComplete = countStatus.spongeCount && countStatus.instrumentCount && countStatus.needleCount;

            return (
              <Card 
                key={surgery.id} 
                className={`hover:shadow-md transition-shadow ${
                  countStatus.hasDiscrepancy ? 'border-l-4 border-l-red-500' :
                  surgery.status === 'in_progress' ? 'border-l-4 border-l-yellow-500' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-medium">{surgery.surgery_number}</span>
                        <OTStatusBadge status={surgery.status} />
                        {countStatus.hasDiscrepancy && (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Count Discrepancy
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {surgery.patient?.first_name} {surgery.patient?.last_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Scissors className="h-4 w-4" />
                          {surgery.procedure_name}
                        </div>
                        {surgery.ot_room && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {surgery.ot_room.name || surgery.ot_room.room_number}
                          </div>
                        )}
                      </div>

                      {/* Count Status Indicators */}
                      <div className="flex items-center gap-4 pt-2">
                        <div className="flex items-center gap-2">
                          <Checkbox checked={countStatus.spongeCount} disabled />
                          <span className={`text-sm ${countStatus.spongeCount ? 'text-green-600' : 'text-muted-foreground'}`}>
                            Sponge Count
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox checked={countStatus.instrumentCount} disabled />
                          <span className={`text-sm ${countStatus.instrumentCount ? 'text-green-600' : 'text-muted-foreground'}`}>
                            Instrument Count
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox checked={countStatus.needleCount} disabled />
                          <span className={`text-sm ${countStatus.needleCount ? 'text-green-600' : 'text-muted-foreground'}`}>
                            Needle Count
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button 
                      variant={allComplete ? "outline" : "default"}
                      className="shrink-0"
                      onClick={() => handleOpenCounts(surgery.id)}
                    >
                      {allComplete ? 'View Counts' : 'Complete Counts'}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
