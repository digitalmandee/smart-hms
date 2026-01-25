import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, isToday, isThisWeek, subDays } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useSurgeries } from "@/hooks/useOT";
import { useAuth } from "@/contexts/AuthContext";
import { 
  FileText, 
  Search, 
  Clock, 
  User, 
  Scissors, 
  MapPin,
  CheckCircle2,
  AlertCircle,
  ChevronRight
} from "lucide-react";
import { OTStatusBadge } from "@/components/ot/OTStatusBadge";

export default function OTNursingNotesPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "all">("today");

  // Fetch surgeries that are in_progress, completed (recent), or pre_op
  const { data: surgeries, isLoading } = useSurgeries({
    branchId: profile?.branch_id,
  });

  // Filter surgeries based on tab and search
  const filteredSurgeries = (surgeries || []).filter(surgery => {
    // Only show surgeries that need nursing documentation
    const relevantStatuses = ['pre_op', 'in_progress', 'completed'];
    if (!relevantStatuses.includes(surgery.status)) return false;

    // Date filter
    const surgeryDate = new Date(surgery.scheduled_date);
    if (dateFilter === "today" && !isToday(surgeryDate)) return false;
    if (dateFilter === "week" && !isThisWeek(surgeryDate)) return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const patientName = `${surgery.patient?.first_name || ''} ${surgery.patient?.last_name || ''}`.toLowerCase();
      const procedureName = surgery.procedure_name?.toLowerCase() || '';
      const surgeryNumber = surgery.surgery_number?.toLowerCase() || '';
      
      return patientName.includes(query) || 
             procedureName.includes(query) || 
             surgeryNumber.includes(query);
    }

    return true;
  });

  // Sort: in_progress first, then pre_op, then completed
  const sortedSurgeries = [...filteredSurgeries].sort((a, b) => {
    const statusOrder = { in_progress: 0, pre_op: 1, completed: 2 };
    return (statusOrder[a.status as keyof typeof statusOrder] || 3) - 
           (statusOrder[b.status as keyof typeof statusOrder] || 3);
  });

  const hasNotes = (surgery: any) => {
    return surgery.intra_op_notes !== null && surgery.intra_op_notes !== undefined;
  };

  const handleOpenNotes = (surgeryId: string) => {
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
        title="Intra-Operative Nursing Notes"
        description="Document procedure details and nursing observations for surgeries"
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <Tabs value={dateFilter} onValueChange={(v) => setDateFilter(v as any)} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="all">All Active</TabsTrigger>
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
                  {sortedSurgeries.filter(s => s.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pre-Op</p>
                <p className="text-xl font-bold">
                  {sortedSurgeries.filter(s => s.status === 'pre_op').length}
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
                <p className="text-sm text-muted-foreground">Documented</p>
                <p className="text-xl font-bold">
                  {sortedSurgeries.filter(s => hasNotes(s)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Notes</p>
                <p className="text-xl font-bold">
                  {sortedSurgeries.filter(s => !hasNotes(s) && s.status !== 'pre_op').length}
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
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No surgeries found</h3>
            <p className="text-muted-foreground">
              {dateFilter === "today" 
                ? "No surgeries scheduled for today that need documentation."
                : "No surgeries matching your filters."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sortedSurgeries.map((surgery) => (
            <Card 
              key={surgery.id} 
              className={`hover:shadow-md transition-shadow cursor-pointer ${
                surgery.status === 'in_progress' ? 'border-l-4 border-l-yellow-500' : ''
              }`}
              onClick={() => handleOpenNotes(surgery.id)}
            >
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-medium">{surgery.surgery_number}</span>
                      <OTStatusBadge status={surgery.status} />
                      {hasNotes(surgery) ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Notes Documented
                        </Badge>
                      ) : surgery.status !== 'pre_op' ? (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Notes Pending
                        </Badge>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {surgery.patient?.first_name} {surgery.patient?.last_name}
                        </span>
                        <span className="text-muted-foreground">
                          ({surgery.patient?.patient_number})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Scissors className="h-4 w-4" />
                        {surgery.procedure_name}
                      </div>
                      {surgery.ot_room && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {surgery.ot_room.name || surgery.ot_room.room_number}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {format(new Date(surgery.scheduled_date), 'MMM d')} at {surgery.scheduled_start_time}
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" className="shrink-0">
                    {hasNotes(surgery) ? 'View/Edit Notes' : 'Open Notes'}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
