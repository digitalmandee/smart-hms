import { useNavigate } from "react-router-dom";
import { useTranslation } from '@/lib/i18n';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/DataTable";
import { OTStatusBadge } from "@/components/ot/OTStatusBadge";
import { PriorityBadge } from "@/components/ot/PriorityBadge";
import { 
  Plus, 
  Search,
  Filter,
  Eye,
  CalendarDays
} from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useSurgeries, type SurgeryStatus } from "@/hooks/useOT";
import { useAuth } from "@/contexts/AuthContext";
import { otLogger } from "@/lib/logger";
import { Badge } from "@/components/ui/badge";

export default function SurgeriesListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profile } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch all surgeries (no date filter to show upcoming)
  const { data: surgeries, isLoading } = useSurgeries({
    branchId: profile?.branch_id || undefined,
    status: statusFilter !== 'all' ? statusFilter as SurgeryStatus : undefined,
  });

  // Debug logging
  useEffect(() => {
    otLogger.info('SurgeriesListPage: Surgeries loaded', {
      count: surgeries?.length || 0,
      statusFilter,
      branchId: profile?.branch_id,
    });
    surgeries?.forEach(s => {
      otLogger.debug('SurgeriesListPage: Surgery', {
        id: s.id,
        surgeryNumber: s.surgery_number,
        scheduledDate: s.scheduled_date,
        status: s.status,
      });
    });
  }, [surgeries, statusFilter, profile?.branch_id]);

  // Separate upcoming (future) surgeries
  const today = format(new Date(), 'yyyy-MM-dd');
  const upcomingSurgeries = surgeries?.filter(s => s.scheduled_date > today) || [];

  const filteredSurgeries = surgeries?.filter(s => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const patientName = `${s.patient?.first_name} ${s.patient?.last_name}`.toLowerCase();
    return (
      patientName.includes(query) ||
      s.procedure_name.toLowerCase().includes(query) ||
      s.surgery_number.toLowerCase().includes(query)
    );
  });

  const columns = [
    {
      accessorKey: "surgery_number",
      header: "Surgery #",
      cell: ({ row }: any) => (
        <span className="font-mono text-sm">{row.original.surgery_number}</span>
      ),
    },
    {
      accessorKey: "patient",
      header: "Patient",
      cell: ({ row }: any) => {
        const patient = row.original.patient;
        return (
          <div>
            <p className="font-medium">
              {patient?.first_name} {patient?.last_name}
            </p>
            <p className="text-xs text-muted-foreground">{patient?.patient_number}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "procedure_name",
      header: "Procedure",
      cell: ({ row }: any) => (
        <p className="max-w-[200px] truncate">{row.original.procedure_name}</p>
      ),
    },
    {
      accessorKey: "scheduled_date",
      header: "Scheduled",
      cell: ({ row }: any) => (
        <div>
          <p>{format(new Date(row.original.scheduled_date), 'MMM d, yyyy')}</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(`2000-01-01T${row.original.scheduled_start_time}`), 'h:mm a')}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "lead_surgeon",
      header: "Surgeon",
      cell: ({ row }: any) => (
        <span>{row.original.lead_surgeon?.profile?.full_name || '-'}</span>
      ),
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }: any) => (
        <PriorityBadge priority={row.original.priority} showIcon={false} />
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => (
        <OTStatusBadge status={row.original.status} />
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }: any) => (
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate(`/app/ot/surgeries/${row.original.id}`)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title={t('ot.surgeries' as any)}
          description={t('ot.surgeriesDesc' as any)}
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/app/ot/schedule")}>
            <CalendarDays className="h-4 w-4 mr-2" />
            {t('ot.otSchedule' as any)}
          </Button>
          <Button onClick={() => navigate("/app/ot/surgeries/new")}>
            <Plus className="h-4 w-4 mr-2" />
            {t('ot.scheduleSurgery' as any)}
          </Button>
        </div>
      </div>

      {/* Upcoming Surgeries Alert */}
      {upcomingSurgeries.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Upcoming Surgeries ({upcomingSurgeries.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {upcomingSurgeries.slice(0, 5).map(s => (
                <Badge 
                  key={s.id} 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-secondary/80"
                  onClick={() => navigate(`/app/ot/surgeries/${s.id}`)}
                >
                  {format(new Date(s.scheduled_date), 'MMM d')} - {s.patient?.first_name} {s.patient?.last_name}
                </Badge>
              ))}
              {upcomingSurgeries.length > 5 && (
                <Badge variant="outline">+{upcomingSurgeries.length - 5} more</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patient, procedure, surgery #..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="pre_op">Pre-Op</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="postponed">Postponed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={filteredSurgeries || []}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
