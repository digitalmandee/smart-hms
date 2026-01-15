import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBloodDonors, type BloodGroupType, type DonorStatus } from "@/hooks/useBloodBank";
import { DonorCard } from "@/components/blood-bank/DonorCard";

const bloodGroups: BloodGroupType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const donorStatuses: { value: DonorStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'deferred', label: 'Deferred' },
  { value: 'permanently_deferred', label: 'Permanently Deferred' },
  { value: 'inactive', label: 'Inactive' },
];

export default function DonorsListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DonorStatus | "all">("all");
  const [bloodGroupFilter, setBloodGroupFilter] = useState<BloodGroupType | "all">("all");

  const { data: donors, isLoading } = useBloodDonors({
    search: search || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    bloodGroup: bloodGroupFilter === "all" ? undefined : bloodGroupFilter,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blood Donors"
        description="Manage registered blood donors"
        actions={
          <Button onClick={() => navigate('/app/blood-bank/donors/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Register Donor
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or donor number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={bloodGroupFilter} onValueChange={(v) => setBloodGroupFilter(v as BloodGroupType | "all")}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Blood Group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Groups</SelectItem>
            {bloodGroups.map((group) => (
              <SelectItem key={group} value={group}>{group}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as DonorStatus | "all")}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {donorStatuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Donors Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : donors && donors.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {donors.map((donor) => (
            <DonorCard
              key={donor.id}
              donor={donor}
              onView={() => navigate(`/app/blood-bank/donors/${donor.id}`)}
              onStartDonation={() => navigate(`/app/blood-bank/donations?donorId=${donor.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No donors found</h3>
          <p className="text-muted-foreground mb-4">
            {search || statusFilter !== "all" || bloodGroupFilter !== "all"
              ? "Try adjusting your filters"
              : "Get started by registering your first blood donor"}
          </p>
          <Button onClick={() => navigate('/app/blood-bank/donors/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Register Donor
          </Button>
        </div>
      )}
    </div>
  );
}
