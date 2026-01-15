import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBloodTransfusions, useBloodRequests } from "@/hooks/useBloodBank";
import { BloodGroupBadge } from "@/components/blood-bank/BloodGroupBadge";
import { format } from "date-fns";
import { Droplets, Calendar, ExternalLink, Clock, CheckCircle } from "lucide-react";

interface PatientBloodHistoryProps {
  patientId: string;
}

const transfusionStatusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  stopped: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

const requestStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  cross_matching: 'bg-purple-100 text-purple-800',
  ready: 'bg-green-100 text-green-800',
  issued: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function PatientBloodHistory({ patientId }: PatientBloodHistoryProps) {
  const { data: transfusions, isLoading: loadingTransfusions } = useBloodTransfusions({ patientId });
  const { data: requests, isLoading: loadingRequests } = useBloodRequests({ patientId });

  const isLoading = loadingTransfusions || loadingRequests;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Blood Bank</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const hasData = (transfusions && transfusions.length > 0) || (requests && requests.length > 0);

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Blood Bank</CardTitle>
              <CardDescription>Blood requests and transfusion history</CardDescription>
            </div>
            <Link to={`/app/blood-bank/requests/new?patientId=${patientId}`}>
              <Button size="sm">Request Blood</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Droplets className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No blood bank records</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Blood Bank</CardTitle>
            <CardDescription>
              {requests?.length || 0} request(s), {transfusions?.length || 0} transfusion(s)
            </CardDescription>
          </div>
          <Link to={`/app/blood-bank/requests/new?patientId=${patientId}`}>
            <Button size="sm">Request Blood</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Transfusions */}
        {transfusions && transfusions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Transfusions
            </h4>
            <div className="space-y-3">
              {transfusions.map((transfusion) => (
                <div
                  key={transfusion.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {transfusion.blood_unit && (
                      <BloodGroupBadge group={transfusion.blood_unit.blood_group} />
                    )}
                    <div>
                      <p className="font-medium text-sm">{transfusion.transfusion_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {transfusion.volume_transfused_ml ? `${transfusion.volume_transfused_ml} ml • ` : ''}
                        {transfusion.started_at && format(new Date(transfusion.started_at), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={transfusionStatusColors[transfusion.status]}>
                      {transfusion.status?.replace('_', ' ')}
                    </Badge>
                    <Link to={`/app/blood-bank/transfusions/${transfusion.id}`}>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Requests */}
        {requests && requests.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Blood Requests
            </h4>
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <BloodGroupBadge group={request.blood_group} />
                    <div>
                      <p className="font-medium text-sm">{request.request_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {request.units_requested} unit(s) • {format(new Date(request.requested_at), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={requestStatusColors[request.status]}>
                      {request.status?.replace('_', ' ')}
                    </Badge>
                    <Link to={`/app/blood-bank/requests/${request.id}`}>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
