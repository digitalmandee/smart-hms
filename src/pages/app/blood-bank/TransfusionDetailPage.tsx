import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { TransfusionReactionForm } from "./TransfusionReactionForm";
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
  Play,
  Square,
  ExternalLink,
  AlertTriangle
} from "lucide-react";
import { format, differenceInMinutes } from "date-fns";
import { useBloodTransfusions, useUpdateTransfusion, type TransfusionStatus } from "@/hooks/useBloodBank";
import { BloodGroupBadge } from "@/components/blood-bank/BloodGroupBadge";

const statusConfig: Record<TransfusionStatus, { label: string; color: string; icon: any }> = {
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800', icon: Play },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  stopped: { label: 'Stopped', color: 'bg-red-100 text-red-800', icon: Square },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800', icon: XCircle },
};

const componentLabels: Record<string, string> = {
  whole_blood: 'Whole Blood',
  packed_rbc: 'Packed RBC',
  fresh_frozen_plasma: 'FFP',
  platelet_concentrate: 'Platelets',
  cryoprecipitate: 'Cryoprecipitate',
  granulocytes: 'Granulocytes',
};

export default function TransfusionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showReactionForm, setShowReactionForm] = useState(false);
  
  const { data: transfusions, isLoading } = useBloodTransfusions();
  const updateTransfusion = useUpdateTransfusion();
  
  const transfusion = transfusions?.find(t => t.id === id);

  const handleStart = async () => {
    if (!id) return;
    await updateTransfusion.mutateAsync({ 
      id, 
      status: 'in_progress' as TransfusionStatus,
      started_at: new Date().toISOString()
    });
  };

  const handleComplete = async () => {
    if (!id) return;
    await updateTransfusion.mutateAsync({ 
      id, 
      status: 'completed' as TransfusionStatus,
      completed_at: new Date().toISOString()
    });
  };

  const handleStop = () => {
    if (!id) return;
    setShowReactionForm(true);
  };

  const handleCancel = async () => {
    if (!id) return;
    await updateTransfusion.mutateAsync({ 
      id, 
      status: 'cancelled' as TransfusionStatus
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Transfusion Details" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!transfusion) {
    return (
      <div className="space-y-6">
        <PageHeader title="Transfusion Details" />
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Transfusion not found</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate('/app/blood-bank/transfusions')}>
              Back to Transfusions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const StatusIcon = statusConfig[transfusion.status]?.icon || Clock;
  const patientName = transfusion.patient 
    ? `${transfusion.patient.first_name} ${transfusion.patient.last_name || ''}` 
    : 'Unknown';

  const duration = transfusion.started_at && transfusion.completed_at
    ? differenceInMinutes(new Date(transfusion.completed_at), new Date(transfusion.started_at))
    : transfusion.started_at
    ? differenceInMinutes(new Date(), new Date(transfusion.started_at))
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Transfusion ${transfusion.transfusion_number}`}
        description={`Blood transfusion for ${patientName}`}
        actions={
          <Button variant="outline" onClick={() => navigate('/app/blood-bank/transfusions')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        }
      />

      {/* In Progress Alert */}
      {transfusion.status === 'in_progress' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Play className="h-5 w-5 text-yellow-700" />
              </div>
              <div>
                <p className="font-medium text-yellow-800">Transfusion in Progress</p>
                <p className="text-sm text-yellow-700">
                  Duration: {duration} minutes • Monitor for adverse reactions
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleStop}
                disabled={updateTransfusion.isPending}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Stop (Reaction)
              </Button>
              <Button 
                onClick={handleComplete}
                disabled={updateTransfusion.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Transfusion Details</CardTitle>
                <Badge className={statusConfig[transfusion.status]?.color}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig[transfusion.status]?.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {transfusion.blood_unit && (
                  <>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Blood Group</p>
                      <BloodGroupBadge group={transfusion.blood_unit.blood_group} size="lg" showIcon />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Component Type</p>
                      <p className="font-medium">
                        {componentLabels[transfusion.blood_unit.component_type] || transfusion.blood_unit.component_type}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Unit Number</p>
                      <p className="font-medium">{transfusion.blood_unit.unit_number}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Volume</p>
                      <p className="font-medium">{transfusion.blood_unit.volume_ml} ml</p>
                    </div>
                  </>
                )}
                {transfusion.volume_transfused_ml && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Volume Transfused</p>
                    <p className="font-medium">{transfusion.volume_transfused_ml} ml</p>
                  </div>
                )}
                {transfusion.started_at && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Started At</p>
                    <p className="font-medium">{format(new Date(transfusion.started_at), "MMM dd, yyyy HH:mm")}</p>
                  </div>
                )}
                {transfusion.completed_at && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Completed At</p>
                    <p className="font-medium">{format(new Date(transfusion.completed_at), "MMM dd, yyyy HH:mm")}</p>
                  </div>
                )}
                {duration !== null && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">{duration} minutes</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t text-xs text-muted-foreground">
                <p>Created: {format(new Date(transfusion.created_at), "MMM dd, yyyy HH:mm")}</p>
              </div>
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
              {transfusion.patient ? (
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">{patientName}</p>
                    <p className="text-sm text-muted-foreground">
                      {(transfusion.patient as any).patient_number}
                    </p>
                  </div>
                  <Link to={`/app/patients/${transfusion.patient.id}`}>
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
              {transfusion.status === 'scheduled' && (
                <>
                  <Button 
                    className="w-full" 
                    onClick={handleStart}
                    disabled={updateTransfusion.isPending}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Transfusion
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="w-full" 
                    onClick={handleCancel}
                    disabled={updateTransfusion.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
              {transfusion.request_id && (
                <Link to={`/app/blood-bank/requests/${transfusion.request_id}`} className="block">
                  <Button variant="outline" className="w-full">
                    <Droplets className="h-4 w-4 mr-2" />
                    View Request
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
