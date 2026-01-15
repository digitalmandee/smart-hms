import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Phone, Calendar, Droplets, Eye } from "lucide-react";
import { format, parseISO, differenceInYears } from "date-fns";
import { BloodGroupBadge } from "./BloodGroupBadge";
import type { BloodDonor, DonorStatus } from "@/hooks/useBloodBank";

interface DonorCardProps {
  donor: BloodDonor;
  onView?: () => void;
  onStartDonation?: () => void;
  compact?: boolean;
}

const statusConfig: Record<DonorStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Active", variant: "default" },
  deferred: { label: "Deferred", variant: "secondary" },
  permanently_deferred: { label: "Perm. Deferred", variant: "destructive" },
  inactive: { label: "Inactive", variant: "outline" },
};

export function DonorCard({ donor, onView, onStartDonation, compact = false }: DonorCardProps) {
  const fullName = `${donor.first_name} ${donor.last_name || ''}`.trim();
  const age = differenceInYears(new Date(), parseISO(donor.date_of_birth));
  const statusInfo = statusConfig[donor.status];

  if (compact) {
    return (
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={onView}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BloodGroupBadge group={donor.blood_group} size="lg" />
              <div>
                <p className="font-medium">{fullName}</p>
                <p className="text-xs text-muted-foreground">{donor.donor_number}</p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              <p className="text-xs text-muted-foreground mt-1">
                {donor.total_donations} donations
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">{fullName}</h3>
              <p className="text-sm text-muted-foreground">{donor.donor_number}</p>
            </div>
          </div>
          <BloodGroupBadge group={donor.blood_group} size="lg" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>{age} years, {donor.gender}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-3.5 w-3.5" />
            <span>{donor.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Droplets className="h-3.5 w-3.5" />
            <span>{donor.total_donations} donations</span>
          </div>
          {donor.last_donation_date && (
            <div className="text-muted-foreground">
              Last: {format(parseISO(donor.last_donation_date), "MMM d, yyyy")}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          <div className="flex gap-2">
            {onView && (
              <Button variant="ghost" size="sm" onClick={onView}>
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
            )}
            {onStartDonation && donor.status === 'active' && (
              <Button size="sm" onClick={onStartDonation}>
                Start Donation
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
