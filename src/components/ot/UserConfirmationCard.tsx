import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAcceptSurgeryAssignment, useDeclineSurgeryAssignment } from "@/hooks/useSurgeryConfirmation";
import { format } from "date-fns";

interface UserConfirmationCardProps {
  surgeryId: string;
  onConfirmed?: () => void;
  className?: string;
}

type ConfirmationStatus = 'pending' | 'accepted' | 'declined' | 'reschedule_requested';

interface TeamMember {
  id: string;
  surgery_id: string;
  doctor_id: string | null;
  staff_id: string | null;
  role: string;
  confirmation_status: ConfirmationStatus;
  confirmed_at: string | null;
  declined_reason: string | null;
}

const roleLabels: Record<string, string> = {
  lead_surgeon: 'Lead Surgeon',
  assistant_surgeon: 'Assistant Surgeon',
  anesthetist: 'Anesthetist',
  scrub_nurse: 'Scrub Nurse',
  circulating_nurse: 'Circulating Nurse',
  technician: 'Technician',
};

export function UserConfirmationCard({ surgeryId, onConfirmed, className }: UserConfirmationCardProps) {
  const { profile } = useAuth();
  const acceptAssignment = useAcceptSurgeryAssignment();
  const declineAssignment = useDeclineSurgeryAssignment();
  
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  // Find if current user is a team member for this surgery
  const { data: userTeamMember, isLoading, refetch } = useQuery({
    queryKey: ['user-team-member', surgeryId, profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;

      // First, get the doctor record for this profile
      const { data: doctor } = await supabase
        .from('doctors')
        .select('id')
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (!doctor) return null;

      // Then check if this doctor is a team member
      const { data, error } = await supabase
        .from('surgery_team_members')
        .select('*')
        .eq('surgery_id', surgeryId)
        .eq('doctor_id', doctor.id)
        .maybeSingle();

      if (error) throw error;
      return data as TeamMember | null;
    },
    enabled: !!profile?.id && !!surgeryId,
  });

  const handleAccept = async () => {
    if (!userTeamMember) return;
    await acceptAssignment.mutateAsync({ 
      memberId: userTeamMember.id, 
      surgeryId 
    });
    refetch();
    onConfirmed?.();
  };

  const handleDecline = async () => {
    if (!userTeamMember || !declineReason.trim()) return;
    await declineAssignment.mutateAsync({ 
      memberId: userTeamMember.id, 
      surgeryId, 
      reason: declineReason 
    });
    setShowDeclineForm(false);
    setDeclineReason("");
    refetch();
  };

  // Don't render anything if user is not a team member
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="py-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userTeamMember) {
    return null;
  }

  const isPending = userTeamMember.confirmation_status === 'pending';
  const isAccepted = userTeamMember.confirmation_status === 'accepted';
  const isDeclined = userTeamMember.confirmation_status === 'declined';

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Your Assignment
          </CardTitle>
          {isAccepted && (
            <Badge className="bg-green-500 hover:bg-green-600">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Confirmed
            </Badge>
          )}
          {isPending && (
            <Badge variant="outline" className="text-amber-600 border-amber-300">
              <Clock className="h-3 w-3 mr-1" />
              Pending
            </Badge>
          )}
          {isDeclined && (
            <Badge variant="destructive">
              <XCircle className="h-3 w-3 mr-1" />
              Declined
            </Badge>
          )}
        </div>
        <CardDescription>
          You are assigned as {roleLabels[userTeamMember.role] || userTeamMember.role}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAccepted && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">You have confirmed this surgery</span>
            </div>
            {userTeamMember.confirmed_at && (
              <p className="text-xs text-green-600 mt-1">
                Confirmed at {format(new Date(userTeamMember.confirmed_at), 'MMM d, h:mm a')}
              </p>
            )}
          </div>
        )}

        {isDeclined && (
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 text-red-700">
              <XCircle className="h-4 w-4" />
              <span className="text-sm font-medium">You declined this assignment</span>
            </div>
            {userTeamMember.declined_reason && (
              <p className="text-xs text-red-600 mt-1">
                Reason: {userTeamMember.declined_reason}
              </p>
            )}
          </div>
        )}

        {isPending && !showDeclineForm && (
          <>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Please confirm or decline this surgery assignment</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                className="flex-1"
                onClick={handleAccept}
                disabled={acceptAssignment.isPending}
              >
                {acceptAssignment.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Accept
                  </>
                )}
              </Button>
              <Button 
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeclineForm(true)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Decline
              </Button>
            </div>
          </>
        )}

        {isPending && showDeclineForm && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="decline-reason">Reason for declining</Label>
              <Textarea
                id="decline-reason"
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Please provide a reason..."
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDecline}
                disabled={!declineReason.trim() || declineAssignment.isPending}
              >
                {declineAssignment.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Declining...
                  </>
                ) : (
                  'Confirm Decline'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeclineForm(false);
                  setDeclineReason("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
