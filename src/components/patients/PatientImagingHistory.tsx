import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatientImagingHistory } from "@/hooks/useImaging";
import { format } from "date-fns";
import { Scan, Calendar, ExternalLink, FileCheck2 } from "lucide-react";

interface PatientImagingHistoryProps {
  patientId: string;
}

const statusColors: Record<string, string> = {
  ordered: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  completed: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  reported: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  verified: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const modalityIcons: Record<string, string> = {
  'xray': '🩻',
  'ultrasound': '📡',
  'ct_scan': '🔬',
  'mri': '🧲',
  'ecg': '💓',
  'echo': '❤️',
  'mammography': '🩻',
  'fluoroscopy': '🎥',
  'dexa': '🦴',
  'pet_ct': '☢️',
};

export function PatientImagingHistory({ patientId }: PatientImagingHistoryProps) {
  const { data: imagingOrders, isLoading } = usePatientImagingHistory(patientId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Imaging History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!imagingOrders || imagingOrders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Imaging History</CardTitle>
          <CardDescription>Radiology and imaging test records</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Scan className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No imaging orders yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Imaging History</CardTitle>
        <CardDescription>{imagingOrders.length} imaging order(s) on record</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {imagingOrders.map((order) => (
          <div
            key={order.id}
            className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                {modalityIcons[order.modality] || <Scan className="h-5 w-5 text-primary" />}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{order.order_number}</p>
                  <Badge className={statusColors[order.status] || 'bg-muted'}>
                    {order.status?.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(order.created_at), "MMM dd, yyyy")}
                </div>
                <p className="text-sm">
                  <span className="font-medium capitalize">{order.modality?.replace('_', ' ')}:</span>{' '}
                  {order.procedure?.name || 'General imaging'}
                </p>
                {order.clinical_indication && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {order.clinical_indication}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  {order.priority === 'urgent' || order.priority === 'stat' ? (
                    <Badge variant="destructive" className="text-xs">
                      {order.priority.toUpperCase()}
                    </Badge>
                  ) : null}
                  {order.status === 'verified' && (
                    <Badge variant="outline" className="text-xs gap-1">
                      <FileCheck2 className="h-3 w-3" />
                      Report Ready
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Link to={`/app/radiology/orders/${order.id}`}>
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
