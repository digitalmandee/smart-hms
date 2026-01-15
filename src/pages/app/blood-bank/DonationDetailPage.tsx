import { useParams, useNavigate, Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  User, 
  Droplets,
  Clock, 
  CheckCircle,
  XCircle,
  ExternalLink,
  Beaker
} from "lucide-react";
import { format } from "date-fns";
import { useBloodDonations, useUpdateDonation, type DonationStatus } from "@/hooks/useBloodBank";
import { BloodGroupBadge } from "@/components/blood-bank/BloodGroupBadge";
import { DonationStatusBadge } from "@/components/blood-bank/DonationStatusBadge";

const statusWorkflow: DonationStatus[] = ['registered', 'screening', 'collecting', 'collected', 'processing', 'completed'];

export default function DonationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: donations, isLoading } = useBloodDonations();
  const updateDonation = useUpdateDonation();
  
  const donation = donations?.find(d => d.id === id);

  const handleStatusUpdate = async (newStatus: DonationStatus) => {
    if (!id) return;
    await updateDonation.mutateAsync({ id, status: newStatus });
  };

  const handleReject = async () => {
    if (!id) return;
    await updateDonation.mutateAsync({ id, status: 'rejected' as DonationStatus });
  };

  const getNextStatus = (): DonationStatus | null => {
    if (!donation) return null;
    const currentIndex = statusWorkflow.indexOf(donation.status);
    if (currentIndex === -1 || currentIndex >= statusWorkflow.length - 1) return null;
    return statusWorkflow[currentIndex + 1];
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Donation Details" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="space-y-6">
        <PageHeader title="Donation Details" />
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Donation not found</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate('/app/blood-bank/donations')}>
              Back to Donations
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const donorName = donation.donor 
    ? `${donation.donor.first_name} ${donation.donor.last_name || ''}` 
    : 'Unknown Donor';
  const nextStatus = getNextStatus();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Donation ${donation.donation_number}`}
        description={`Blood donation from ${donorName}`}
        actions={
          <Button variant="outline" onClick={() => navigate('/app/blood-bank/donations')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Donation Details</CardTitle>
                <DonationStatusBadge status={donation.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Blood Group</p>
                  {donation.donor?.blood_group ? (
                    <BloodGroupBadge group={donation.donor.blood_group} size="lg" showIcon />
                  ) : (
                    <p className="font-medium">-</p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Donation Type</p>
                  <p className="font-medium capitalize">{donation.donation_type}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Donation Date</p>
                  <p className="font-medium">{format(new Date(donation.donation_date), "MMMM dd, yyyy")}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Donation Time</p>
                  <p className="font-medium">{donation.donation_time || '-'}</p>
                </div>
                {donation.hemoglobin_reading && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Hemoglobin</p>
                    <p className="font-medium">{donation.hemoglobin_reading} g/dL</p>
                  </div>
                )}
                {donation.bag_number && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Bag Number</p>
                    <p className="font-medium">{donation.bag_number}</p>
                  </div>
                )}
                {donation.volume_collected_ml && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Volume Collected</p>
                    <p className="font-medium">{donation.volume_collected_ml} ml</p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Screening Result</p>
                  <Badge variant={donation.screening_result === 'passed' ? 'default' : 'secondary'}>
                    {donation.screening_result === 'passed' ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <Clock className="h-3 w-3 mr-1" />
                    )}
                    {donation.screening_result || 'Pending'}
                  </Badge>
                </div>
              </div>

              <div className="pt-4 border-t text-xs text-muted-foreground">
                <p>Created: {format(new Date(donation.created_at), "MMM dd, yyyy HH:mm")}</p>
              </div>
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Beaker className="h-5 w-5" />
                Donation Workflow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                {statusWorkflow.map((status, index) => {
                  const currentIndex = statusWorkflow.indexOf(donation.status);
                  const isCompleted = index < currentIndex;
                  const isCurrent = status === donation.status;
                  
                  return (
                    <div key={status} className="flex items-center">
                      <div className={`flex flex-col items-center ${index > 0 ? 'ml-2' : ''}`}>
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium ${
                          isCompleted ? 'bg-primary text-primary-foreground' :
                          isCurrent ? 'bg-primary/20 text-primary border-2 border-primary' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {isCompleted ? <CheckCircle className="h-4 w-4" /> : index + 1}
                        </div>
                        <p className={`text-xs mt-1 capitalize ${isCurrent ? 'font-medium' : 'text-muted-foreground'}`}>
                          {status}
                        </p>
                      </div>
                      {index < statusWorkflow.length - 1 && (
                        <div className={`h-0.5 w-8 mx-1 ${isCompleted ? 'bg-primary' : 'bg-muted'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Donor Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Donor
              </CardTitle>
            </CardHeader>
            <CardContent>
              {donation.donor ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <BloodGroupBadge group={donation.donor.blood_group} size="lg" />
                    <div>
                      <p className="font-medium">{donorName}</p>
                      <p className="text-sm text-muted-foreground">{donation.donor.donor_number}</p>
                    </div>
                  </div>
                  <Link to={`/app/blood-bank/donors/${donation.donor_id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <ExternalLink className="h-3 w-3 mr-2" />
                      View Donor Profile
                    </Button>
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Donor info not available</p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {nextStatus && donation.status !== 'rejected' && (
                <Button 
                  className="w-full" 
                  onClick={() => handleStatusUpdate(nextStatus)}
                  disabled={updateDonation.isPending}
                >
                  <Droplets className="h-4 w-4 mr-2" />
                  Move to {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
                </Button>
              )}
              {donation.status !== 'completed' && donation.status !== 'rejected' && (
                <Button 
                  variant="destructive" 
                  className="w-full" 
                  onClick={handleReject}
                  disabled={updateDonation.isPending}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Donation
                </Button>
              )}
              {donation.status === 'completed' && (
                <Link to="/app/blood-bank/inventory" className="block">
                  <Button variant="outline" className="w-full">
                    <Droplets className="h-4 w-4 mr-2" />
                    View in Inventory
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
