import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  Pill,
  Package,
  FileText,
  Utensils,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface PreOpReadinessCardProps {
  surgeryId: string;
  surgeryStatus: string;
  medicationsOrdered?: boolean;
  suppliesReady?: boolean;
  consentSigned?: boolean;
  preOpAssessmentCompleted?: boolean;
  readyAt?: string | null;
  onMarkReady?: () => void;
}

export function PreOpReadinessCard({
  surgeryId,
  surgeryStatus,
  medicationsOrdered = false,
  suppliesReady = false,
  consentSigned = false,
  preOpAssessmentCompleted = false,
  readyAt,
  onMarkReady,
}: PreOpReadinessCardProps) {
  const { profile, hasRole } = useAuth();
  const queryClient = useQueryClient();
  
  const [localMeds, setLocalMeds] = useState(medicationsOrdered);
  const [localSupplies, setLocalSupplies] = useState(suppliesReady);

  const isNurse = hasRole('ot_nurse') || hasRole('nurse') || hasRole('opd_nurse');
  const isReady = surgeryStatus === 'ready' || !!readyAt;
  const canEdit = !isReady && isNurse && ['pre_op', 'confirmed', 'booked'].includes(surgeryStatus);

  // Mutation to update readiness items
  const updateReadiness = useMutation({
    mutationFn: async (updates: { pre_op_medications_ordered?: boolean; pre_op_supplies_ready?: boolean }) => {
      const { error } = await supabase
        .from('surgeries')
        .update(updates)
        .eq('id', surgeryId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surgery', surgeryId] });
    },
  });

  // Mutation to mark ready
  const markReady = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('surgeries')
        .update({
          status: 'ready' as any,
          ready_at: new Date().toISOString(),
          ready_by: profile?.id,
        } as any)
        .eq('id', surgeryId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Surgery marked as ready');
      queryClient.invalidateQueries({ queryKey: ['surgery', surgeryId] });
      queryClient.invalidateQueries({ queryKey: ['surgeries'] });
      onMarkReady?.();
    },
    onError: (error: Error) => {
      toast.error('Failed to mark ready: ' + error.message);
    },
  });

  const handleMedsChange = (checked: boolean) => {
    setLocalMeds(checked);
    updateReadiness.mutate({ pre_op_medications_ordered: checked });
  };

  const handleSuppliesChange = (checked: boolean) => {
    setLocalSupplies(checked);
    updateReadiness.mutate({ pre_op_supplies_ready: checked });
  };

  const allComplete = localMeds && localSupplies && consentSigned && preOpAssessmentCompleted;

  const readinessItems = [
    {
      id: 'medications',
      label: 'Pre-op medications ordered/dispensed',
      icon: Pill,
      checked: localMeds,
      onChange: handleMedsChange,
      editable: canEdit,
    },
    {
      id: 'supplies',
      label: 'Surgical supplies confirmed',
      icon: Package,
      checked: localSupplies,
      onChange: handleSuppliesChange,
      editable: canEdit,
    },
    {
      id: 'consent',
      label: 'Consent forms signed',
      icon: FileText,
      checked: consentSigned,
      onChange: () => {},
      editable: false,
    },
    {
      id: 'assessment',
      label: 'Pre-op assessment completed',
      icon: CheckCircle2,
      checked: preOpAssessmentCompleted,
      onChange: () => {},
      editable: false,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Pre-Op Readiness</CardTitle>
          {isReady ? (
            <Badge className="bg-green-500 hover:bg-green-600">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Ready
            </Badge>
          ) : (
            <Badge variant="outline" className="text-amber-600 border-amber-300">
              <Clock className="h-3 w-3 mr-1" />
              Preparing
            </Badge>
          )}
        </div>
        <CardDescription>
          {isReady 
            ? 'Surgery is ready to begin' 
            : 'Complete all items before marking ready'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {readinessItems.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <Checkbox
              id={item.id}
              checked={item.checked}
              onCheckedChange={(checked) => item.onChange(checked as boolean)}
              disabled={!item.editable || isReady}
            />
            <div className="flex items-center gap-2 flex-1">
              <item.icon className={`h-4 w-4 ${item.checked ? 'text-green-500' : 'text-muted-foreground'}`} />
              <Label 
                htmlFor={item.id} 
                className={`text-sm ${item.checked ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                {item.label}
              </Label>
            </div>
            {item.checked ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <Clock className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        ))}

        {!isReady && isNurse && (
          <>
            {!allComplete && (
              <div className="flex items-center gap-2 text-amber-600 text-sm mt-4 p-2 bg-amber-50 rounded-lg">
                <AlertTriangle className="h-4 w-4" />
                <span>Complete all items before marking ready</span>
              </div>
            )}
            <Button
              className="w-full mt-4"
              disabled={!allComplete || markReady.isPending}
              onClick={() => markReady.mutate()}
            >
              {markReady.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Marking Ready...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark Ready for Surgery
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
