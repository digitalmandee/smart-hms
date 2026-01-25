import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Calendar, 
  Clock, 
  Check, 
  X, 
  User, 
  AlertCircle,
  RefreshCw,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { 
  useRescheduleRequests, 
  useApproveRescheduleRequest,
  useRejectRescheduleRequest,
  type RescheduleRequest
} from "@/hooks/useSurgeryConfirmation";
import { cn } from "@/lib/utils";

interface RescheduleRequestsQueueProps {
  className?: string;
}

export function RescheduleRequestsQueue({ className }: RescheduleRequestsQueueProps) {
  const { data: requests, isLoading } = useRescheduleRequests('pending');
  const approveRequest = useApproveRescheduleRequest();
  const rejectRequest = useRejectRescheduleRequest();

  const [selectedRequest, setSelectedRequest] = useState<RescheduleRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [notes, setNotes] = useState('');

  const handleOpenApprove = (request: RescheduleRequest) => {
    setSelectedRequest(request);
    setActionType('approve');
    setNewDate(request.proposed_date || request.original_date);
    setNewTime(request.proposed_time || request.original_time);
    setNotes('');
  };

  const handleOpenReject = (request: RescheduleRequest) => {
    setSelectedRequest(request);
    setActionType('reject');
    setNotes('');
  };

  const handleClose = () => {
    setSelectedRequest(null);
    setActionType(null);
    setNewDate('');
    setNewTime('');
    setNotes('');
  };

  const handleApprove = async () => {
    if (!selectedRequest || !newDate || !newTime) return;
    
    await approveRequest.mutateAsync({
      requestId: selectedRequest.id,
      surgeryId: selectedRequest.surgery_id,
      newDate,
      newTime,
      notes: notes.trim() || undefined,
    });
    
    handleClose();
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    
    await rejectRequest.mutateAsync({
      requestId: selectedRequest.id,
      notes: notes.trim() || undefined,
    });
    
    handleClose();
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Reschedule Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              Reschedule Requests
            </CardTitle>
            {requests && requests.length > 0 && (
              <Badge variant="secondary">{requests.length} pending</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!requests || requests.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">No pending reschedule requests</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 border rounded-lg space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">
                          {request.surgery?.surgery_number || 'Unknown Surgery'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {request.surgery?.procedure_name}
                        </p>
                        {request.surgery?.patient && (
                          <p className="text-sm text-muted-foreground">
                            Patient: {request.surgery.patient.first_name} {request.surgery.patient.last_name}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        {request.requested_by_role}
                      </Badge>
                    </div>

                    {/* Request details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Original Date/Time</p>
                        <p className="font-medium">
                          {format(new Date(request.original_date), 'MMM d, yyyy')} at {request.original_time}
                        </p>
                      </div>
                      {request.proposed_date && (
                        <div>
                          <p className="text-muted-foreground">Proposed Date/Time</p>
                          <p className="font-medium text-primary">
                            {format(new Date(request.proposed_date), 'MMM d, yyyy')} 
                            {request.proposed_time && ` at ${request.proposed_time}`}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Reason */}
                    <div className="bg-muted/50 p-3 rounded-md">
                      <p className="text-sm">
                        <span className="font-medium">Reason:</span> {request.reason}
                      </p>
                    </div>

                    {/* Requester info */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>Requested by {request.requester?.full_name || 'Unknown'}</span>
                      <span>•</span>
                      <span>{format(new Date(request.created_at), 'MMM d, h:mm a')}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleOpenApprove(request)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleOpenReject(request)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={actionType === 'approve'} onOpenChange={() => handleClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Reschedule Request</DialogTitle>
            <DialogDescription>
              Set the new date and time for surgery {selectedRequest?.surgery?.surgery_number}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-date">New Date</Label>
                <Input
                  id="new-date"
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-time">New Time</Label>
                <Input
                  id="new-time"
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="approve-notes">Notes (Optional)</Label>
              <Textarea
                id="approve-notes"
                placeholder="Add any notes about this approval..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Team members will need to re-confirm after rescheduling</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleApprove}
              disabled={!newDate || !newTime || approveRequest.isPending}
            >
              {approveRequest.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Approve & Reschedule
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={actionType === 'reject'} onOpenChange={() => handleClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Reschedule Request</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this request
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reject-notes">Reason for Rejection</Label>
              <Textarea
                id="reject-notes"
                placeholder="Explain why this reschedule request cannot be approved..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleReject}
              disabled={rejectRequest.isPending}
            >
              {rejectRequest.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Reject Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
