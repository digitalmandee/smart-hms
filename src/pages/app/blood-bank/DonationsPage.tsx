import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Plus, Calendar } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { 
  useBloodDonations, 
  useTodaysDonations,
  type DonationStatus 
} from "@/hooks/useBloodBank";
import { BloodGroupBadge } from "@/components/blood-bank/BloodGroupBadge";
import { DonationStatusBadge } from "@/components/blood-bank/DonationStatusBadge";
import { ListFilterBar } from "@/components/inventory/ListFilterBar";
import { useTranslation } from "@/lib/i18n";

const donationStatuses: { value: DonationStatus; label: string }[] = [
  { value: 'registered', label: 'Registered' },
  { value: 'screening', label: 'Screening' },
  { value: 'collecting', label: 'Collecting' },
  { value: 'collected', label: 'Collected' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
];

export default function DonationsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const preSelectedDonorId = searchParams.get('donorId');

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DonationStatus | "all">("all");
  const [dateFilter, setDateFilter] = useState<string>(new Date().toISOString().split('T')[0]);

  const { data: donationsRaw, isLoading } = useBloodDonations({
    status: statusFilter === "all" ? undefined : statusFilter,
    date: dateFilter || undefined,
  });

  const { data: todaysDonations } = useTodaysDonations();

  // Client-side text search
  const donations = useMemo(() => {
    if (!donationsRaw || !search) return donationsRaw;
    const q = search.toLowerCase();
    return donationsRaw.filter((d) =>
      d.donation_number?.toLowerCase().includes(q) ||
      (d.donor as any)?.first_name?.toLowerCase().includes(q) ||
      (d.donor as any)?.last_name?.toLowerCase().includes(q) ||
      (d.donor as any)?.donor_number?.toLowerCase().includes(q)
    );
  }, [donationsRaw, search]);

  // Count by status for today
  const statusCounts = todaysDonations?.reduce((acc, d) => {
    acc[d.status] = (acc[d.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blood Donations"
        description="Manage blood donation queue and processing"
        actions={
          <Button onClick={() => navigate('/app/blood-bank/donations/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Start Donation
          </Button>
        }
      />

      {/* Today's Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{statusCounts['registered'] || 0}</div>
            <p className="text-xs text-muted-foreground">Registered</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{statusCounts['screening'] || 0}</div>
            <p className="text-xs text-muted-foreground">In Screening</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{statusCounts['collecting'] || 0}</div>
            <p className="text-xs text-muted-foreground">Collecting</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-success">{statusCounts['completed'] || 0}</div>
            <p className="text-xs text-muted-foreground">Completed Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <ListFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("bb.searchDonations")}
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as DonationStatus | "all")}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {donationStatuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </ListFilterBar>

      {/* Donations List */}
      {isLoading ? (
        <div className="space-y-2">
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : donations && donations.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {donations.map((donation) => (
                <div 
                  key={donation.id}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/app/blood-bank/donations/${donation.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <BloodGroupBadge 
                      group={(donation.donor as any)?.blood_group || 'O+'} 
                      size="lg" 
                    />
                    <div>
                      <p className="font-medium">
                        {(donation.donor as any)?.first_name} {(donation.donor as any)?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {donation.donation_number} • {(donation.donor as any)?.donor_number}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <DonationStatusBadge status={donation.status} />
                      <p className="text-xs text-muted-foreground mt-1">
                        {donation.donation_time || format(parseISO(donation.donation_date), "MMM d, yyyy")}
                      </p>
                    </div>
                    {donation.volume_collected_ml && (
                      <div className="text-right">
                        <p className="font-medium">{donation.volume_collected_ml} ml</p>
                        <p className="text-xs text-muted-foreground">Collected</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-12">
          <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No donations found</h3>
          <p className="text-muted-foreground mb-4">
            {statusFilter !== "all"
              ? "Try adjusting your filters"
              : "Start by registering a new donation"}
          </p>
          <Button onClick={() => navigate('/app/blood-bank/donations/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Start Donation
          </Button>
        </div>
      )}
    </div>
  );
}
