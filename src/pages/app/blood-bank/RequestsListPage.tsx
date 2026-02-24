import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  useBloodRequests, 
  type BloodRequestStatus, 
  type BloodRequestPriority 
} from "@/hooks/useBloodBank";
import { RequestCard } from "@/components/blood-bank/RequestCard";
import { ListFilterBar } from "@/components/inventory/ListFilterBar";
import { useTranslation } from "@/lib/i18n";

const requestStatuses: { value: BloodRequestStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'cross_matching', label: 'Cross-Matching' },
  { value: 'ready', label: 'Ready' },
  { value: 'issued', label: 'Issued' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const priorities: { value: BloodRequestPriority; label: string }[] = [
  { value: 'routine', label: 'Routine' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'emergency', label: 'Emergency' },
];

export default function RequestsListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BloodRequestStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<BloodRequestPriority | "all">("all");

  const { data: requestsRaw, isLoading } = useBloodRequests({
    status: statusFilter === "all" ? undefined : statusFilter,
    priority: priorityFilter === "all" ? undefined : priorityFilter,
  });

  const requests = useMemo(() => {
    if (!requestsRaw || !search) return requestsRaw;
    const q = search.toLowerCase();
    return requestsRaw.filter((r) =>
      r.request_number?.toLowerCase().includes(q) ||
      (r.patient as any)?.first_name?.toLowerCase().includes(q) ||
      (r.patient as any)?.last_name?.toLowerCase().includes(q)
    );
  }, [requestsRaw, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blood Requests"
        description="Manage blood transfusion requests from departments"
        actions={
          <Button onClick={() => navigate('/app/blood-bank/requests/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        }
      />

      {/* Filters */}
      <ListFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("bb.searchRequests")}
      >
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as BloodRequestStatus | "all")}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {requestStatuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as BloodRequestPriority | "all")}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {priorities.map((priority) => (
              <SelectItem key={priority.value} value={priority.value}>{priority.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </ListFilterBar>

      {/* Requests Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : requests && requests.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {requests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onView={() => navigate(`/app/blood-bank/requests/${request.id}`)}
              onProcess={() => navigate(`/app/blood-bank/requests/${request.id}/process`)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No requests found</h3>
          <p className="text-muted-foreground mb-4">
            {statusFilter !== "all" || priorityFilter !== "all"
              ? "Try adjusting your filters"
              : "No blood requests have been submitted yet"}
          </p>
          <Button onClick={() => navigate('/app/blood-bank/requests/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
      )}
    </div>
  );
}
