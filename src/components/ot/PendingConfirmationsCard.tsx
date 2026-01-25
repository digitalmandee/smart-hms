import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  Clock, 
  Check, 
  X, 
  Calendar,
  User,
  Scissors,
  AlertCircle,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { 
  usePendingConfirmations,
  useAcceptSurgeryAssignment,
  useDeclineSurgeryAssignment,
  useRequestReschedule
} from "@/hooks/useSurgeryConfirmation";
import { cn } from "@/lib/utils";

interface PendingConfirmationsCardProps {
  userRole: 'surgeon' | 'anesthetist';
  className?: string;
}

export function PendingConfirmationsCard({ 
  userRole,
  className 
}: PendingConfirmationsCardProps) {
  const navigate = useNavigate();
  const { data: pendingItems, isLoading } = usePendingConfirmations();
  const acceptAssignment = useAcceptSurgeryAssignment();
  const declineAssignment = useDeclineSurgeryAssignment();
  const requestReschedule = useRequestReschedule();

  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [actionType, setActionType] = useState<'decline' | 'reschedule' | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [proposedDate, setProposedDate] = useState('');
  const [proposedTime, setProposedTime] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');

  const handleAccept = async (memberId: string, surgeryId: string) => {
    await acceptAssignment.mutateAsync({ memberId, surgeryId });
  };

  const handleOpenDecline = (item: any) => {
    setSelectedItem(item);
    setActionType('decline');
    setDeclineReason('');
  };

  const handleOpenReschedule = (item: any) => {
    setSelectedItem(item);
    setActionType('reschedule');
    setProposedDate('');
    setProposedTime('');
    setRescheduleReason('');
  };

  const handleClose = () => {
    setSelectedItem(null);
    setActionType(null);
  };

  const handleDecline = async () => {
    if (!selectedItem || !declineReason.trim()) return;
    
    await declineAssignment.mutateAsync({
      memberId: selectedItem.id,
      surgeryId: selectedItem.surgery_id,
      reason: declineReason.trim(),
    });
    
    handleClose();
  };

  const handleReschedule = async () => {
    if (!selectedItem || !rescheduleReason.trim()) return;
    
    await requestReschedule.mutateAsync({
      surgeryId: selectedItem.surgery_id,
      originalDate: selectedItem.surgery.scheduled_date,
      originalTime: selectedItem.surgery.scheduled_start_time,
      proposedDate: proposedDate || undefined,
      proposedTime: proposedTime || undefined,
      reason: rescheduleReason.trim(),
      role: userRole,
    });
    
    handleClose();
  };

  // Filter items based on user's role
  const filteredItems = pendingItems?.filter((item: any) => {
    if (userRole === 'surgeon') {
      return item.role === 'lead_surgeon' || item.role === 'assistant_surgeon';
    }
    return item.role === 'anesthetist';
  }) || [];

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Confirmations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-yellow-500" />
              Pending Confirmations
            </CardTitle>
            {filteredItems.length > 0 && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                {filteredItems.length} pending
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <Check className="h-12 w-12 mx-auto mb-3 text-green-500" />
              <p className="text-muted-foreground">No pending confirmations</p>
              <p className="text-sm text-muted-foreground mt-1">
                You're all caught up!
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[350px] pr-4">
              <div className="space-y-4">
                {filteredItems.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-4 border rounded-lg space-y-3 hover:border-primary/50 transition-colors"
                  >
                    {/* Surgery Info */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Scissors className="h-4 w-4 text-primary" />
                          <span className="font-medium">
                            {item.surgery?.surgery_number}
                          </span>
                          <Badge 
                            variant={
                              item.surgery?.priority === 'emergency' ? 'destructive' :
                              item.surgery?.priority === 'urgent' ? 'default' : 'secondary'
                            }
                            className="text-xs"
                          >
                            {item.surgery?.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.surgery?.procedure_name}
                        </p>
                      </div>
                      <Badge variant="outline" className="capitalize shrink-0">
                        {item.role.replace('_', ' ')}
                      </Badge>
                    </div>

                    {/* Patient & Schedule */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {item.surgery?.patient?.first_name} {item.surgery?.patient?.last_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(new Date(item.surgery?.scheduled_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{item.surgery?.scheduled_start_time}</span>
                      </div>
                      {item.surgery?.ot_room?.name && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Room:</span>
                          <span>{item.surgery.ot_room.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleAccept(item.id, item.surgery_id)}
                        disabled={acceptAssignment.isPending}
                      >
                        {acceptAssignment.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Accept
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDecline(item)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenReschedule(item)}
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Reschedule
                      </Button>
                    </div>

                    {/* View Details */}
                    <Button
                      variant="link"
                      size="sm"
                      className="w-full"
                      onClick={() => navigate(`/app/ot/surgeries/${item.surgery_id}`)}
                    >
                      View Surgery Details
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Decline Dialog */}
      <Dialog open={actionType === 'decline'} onOpenChange={() => handleClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Surgery Assignment</DialogTitle>
            <DialogDescription>
              Please provide a reason for declining this assignment.
              The surgery will need to be reassigned to another {userRole}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="decline-reason">Reason for Declining *</Label>
              <Textarea
                id="decline-reason"
                placeholder="e.g., Schedule conflict, on leave, etc."
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Reception will be notified to reassign this surgery</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDecline}
              disabled={!declineReason.trim() || declineAssignment.isPending}
            >
              {declineAssignment.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Declining...
                </>
              ) : (
                'Decline Assignment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Request Dialog */}
      <Dialog open={actionType === 'reschedule'} onOpenChange={() => handleClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Reschedule</DialogTitle>
            <DialogDescription>
              Request to reschedule this surgery to a different time.
              Reception will review and approve the request.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="proposed-date">Proposed Date (Optional)</Label>
                <Input
                  id="proposed-date"
                  type="date"
                  value={proposedDate}
                  onChange={(e) => setProposedDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proposed-time">Proposed Time (Optional)</Label>
                <Input
                  id="proposed-time"
                  type="time"
                  value={proposedTime}
                  onChange={(e) => setProposedTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reschedule-reason">Reason for Reschedule *</Label>
              <Textarea
                id="reschedule-reason"
                placeholder="Please explain why you need to reschedule..."
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleReschedule}
              disabled={!rescheduleReason.trim() || requestReschedule.isPending}
            >
              {requestReschedule.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
