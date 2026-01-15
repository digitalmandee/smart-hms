import { useParams, useNavigate, Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  User, 
  Droplets,
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  TestTubes,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { useBloodRequests, useCrossMatchTests, useUpdateBloodRequest, type BloodRequestStatus } from "@/hooks/useBloodBank";
import { BloodGroupBadge } from "@/components/blood-bank/BloodGroupBadge";

const statusConfig: Record<BloodRequestStatus, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: Droplets },
  cross_matching: { label: 'Cross-Matching', color: 'bg-purple-100 text-purple-800', icon: TestTubes },
  ready: { label: 'Ready', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  issued: { label: 'Issued', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  routine: { label: 'Routine', color: 'bg-muted text-muted-foreground' },
  urgent: { label: 'Urgent', color: 'bg-orange-100 text-orange-800' },
  emergency: { label: 'Emergency', color: 'bg-destructive/10 text-destructive' },
};

const componentLabels: Record<string, string> = {
  whole_blood: 'Whole Blood',
  packed_rbc: 'Packed RBC',
  fresh_frozen_plasma: 'FFP',
  platelet_concentrate: 'Platelets',
  cryoprecipitate: 'Cryoprecipitate',
  granulocytes: 'Granulocytes',
};

export default function BloodRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: requests, isLoading } = useBloodRequests();
  const { data: crossMatches } = useCrossMatchTests({ requestId: id });
  const updateRequest = useUpdateBloodRequest();
  
  const request = requests?.find(r => r.id === id);

  const handleStatusUpdate = async (newStatus: BloodRequestStatus) => {
    if (!id) return;
    await updateRequest.mutateAsync({ id, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Blood Request" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="space-y-6">
        <PageHeader title="Blood Request" />
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Request not found</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate('/app/blood-bank/requests')}>
              Back to Requests
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const StatusIcon = statusConfig[request.status]?.icon || Clock;
  const patientName = request.patient 
    ? `${request.patient.first_name} ${request.patient.last_name || ''}` 
    : 'Unknown';

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Request ${request.request_number}`}
        description={`Blood request for ${patientName}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/app/blood-bank/requests')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Request Details</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={priorityConfig[request.priority]?.color}>
                    {priorityConfig[request.priority]?.label}
                  </Badge>
                  <Badge className={statusConfig[request.status]?.color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusConfig[request.status]?.label}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Blood Group</p>
                  <BloodGroupBadge group={request.blood_group} size="lg" showIcon />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Component Type</p>
                  <p className="font-medium">{componentLabels[request.component_type] || request.component_type}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Units Requested</p>
                  <p className="font-medium text-lg">{request.units_requested}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Units Issued</p>
                  <p className="font-medium text-lg">{request.units_issued || 0}</p>
                </div>
                {request.required_by && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Required By</p>
                    <p className="font-medium">{format(new Date(request.required_by), "MMM dd, yyyy HH:mm")}</p>
                  </div>
                )}
                {request.requesting_department && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p className="font-medium">{request.requesting_department}</p>
                  </div>
                )}
              </div>
              
              {request.indication && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-1">Clinical Indication</p>
                  <p className="text-sm">{request.indication}</p>
                </div>
              )}

              <div className="pt-4 border-t text-xs text-muted-foreground">
                <p>Requested: {format(new Date(request.requested_at), "MMM dd, yyyy HH:mm")}</p>
              </div>
            </CardContent>
          </Card>

          {/* Cross-Match Results */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TestTubes className="h-5 w-5" />
                  Cross-Match Tests
                </CardTitle>
                {request.status === 'processing' && (
                  <Link to={`/app/blood-bank/cross-match/new?requestId=${request.id}`}>
                    <Button size="sm">
                      New Cross-Match
                    </Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {crossMatches && crossMatches.length > 0 ? (
                <div className="space-y-3">
                  {crossMatches.map((test) => (
                    <div key={test.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <BloodGroupBadge group={test.donor_blood_group} />
                        <div>
                          <p className="font-medium text-sm">Unit: {test.blood_unit?.unit_number}</p>
                          <p className="text-xs text-muted-foreground">
                            Major: {test.major_cross_match} • Minor: {test.minor_cross_match}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant={test.overall_result === 'compatible' ? 'default' : 'destructive'}
                      >
                        {test.overall_result === 'compatible' ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : test.overall_result === 'incompatible' ? (
                          <XCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <Clock className="h-3 w-3 mr-1" />
                        )}
                        {test.overall_result}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No cross-match tests performed yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Patient Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Patient
              </CardTitle>
            </CardHeader>
            <CardContent>
              {request.patient ? (
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">{patientName}</p>
                    <p className="text-sm text-muted-foreground">{request.patient.patient_number}</p>
                  </div>
                  <Link to={`/app/patients/${request.patient.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <ExternalLink className="h-3 w-3 mr-2" />
                      View Profile
                    </Button>
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Patient info not available</p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {request.status === 'pending' && (
                <Button 
                  className="w-full" 
                  onClick={() => handleStatusUpdate('processing')}
                  disabled={updateRequest.isPending}
                >
                  Start Processing
                </Button>
              )}
              {request.status === 'processing' && (
                <Button 
                  className="w-full" 
                  onClick={() => handleStatusUpdate('cross_matching')}
                  disabled={updateRequest.isPending}
                >
                  Start Cross-Matching
                </Button>
              )}
              {request.status === 'cross_matching' && crossMatches?.some(t => t.overall_result === 'compatible') && (
                <Button 
                  className="w-full" 
                  onClick={() => handleStatusUpdate('ready')}
                  disabled={updateRequest.isPending}
                >
                  Mark as Ready
                </Button>
              )}
              {request.status === 'ready' && (
                <Button 
                  className="w-full" 
                  onClick={() => handleStatusUpdate('issued')}
                  disabled={updateRequest.isPending}
                >
                  Issue Blood
                </Button>
              )}
              {request.status !== 'cancelled' && request.status !== 'completed' && (
                <Button 
                  variant="destructive" 
                  className="w-full" 
                  onClick={() => handleStatusUpdate('cancelled')}
                  disabled={updateRequest.isPending}
                >
                  Cancel Request
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
