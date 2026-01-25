import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, Package, Clock, User, Syringe, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useOTMedicationQueue, useCancelOTMedicationRequest, OTMedicationRequest } from "@/hooks/useOTPharmacy";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { CartItem } from "@/hooks/usePOS";
import { toast } from "sonner";

export default function OTMedicationQueuePage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: queue = [], isLoading } = useOTMedicationQueue();
  const cancelRequest = useCancelOTMedicationRequest();

  const [dispensingId, setDispensingId] = useState<string | null>(null);

  // Group requests by surgery
  const groupedBySurgery = queue.reduce((acc, item) => {
    const surgeryId = item.surgery_id;
    if (!acc[surgeryId]) {
      acc[surgeryId] = {
        surgery: item.surgery,
        medications: [],
      };
    }
    acc[surgeryId].medications.push(item);
    return acc;
  }, {} as Record<string, { surgery: OTMedicationRequest['surgery']; medications: OTMedicationRequest[] }>);

  const handleDispense = async (medication: OTMedicationRequest) => {
    if (!profile?.branch_id) {
      toast.error("Branch not configured");
      return;
    }

    setDispensingId(medication.id);

    try {
      // Search for matching inventory (FIFO - earliest expiry first)
      const { data: inventory, error } = await supabase
        .from('medicine_inventory')
        .select(`
          id,
          batch_number,
          quantity,
          unit_price,
          selling_price,
          expiry_date,
          medicine:medicines!medicine_inventory_medicine_id_fkey(id, name, generic_name)
        `)
        .eq('branch_id', profile.branch_id)
        .gt('quantity', 0)
        .gte('expiry_date', new Date().toISOString().split('T')[0])
        .order('expiry_date', { ascending: true })
        .limit(50);

      if (error) throw error;

      // Filter for matching medication name
      const medicationName = medication.medication_name.toLowerCase();
      const matches = (inventory || []).filter(item =>
        item.medicine?.name?.toLowerCase().includes(medicationName) ||
        item.medicine?.generic_name?.toLowerCase().includes(medicationName) ||
        medicationName.includes(item.medicine?.name?.toLowerCase() || '') ||
        medicationName.includes(item.medicine?.generic_name?.toLowerCase() || '')
      );

      if (matches.length === 0) {
        toast.error('No matching inventory found', {
          description: `Could not find "${medication.medication_name}" in stock. Please add it manually in POS.`
        });
        setDispensingId(null);
        return;
      }

      // Auto-select first batch (FIFO - earliest expiry)
      const selectedItem = matches[0];

      // Build cart item matching POS CartItem interface
      const cartItem: CartItem = {
        id: `ot-${medication.id}`,
        inventory_id: selectedItem.id,
        medicine_id: selectedItem.medicine?.id || null,
        medicine_name: selectedItem.medicine?.name || medication.medication_name,
        batch_number: selectedItem.batch_number || null,
        quantity: 1,
        unit_price: selectedItem.selling_price || selectedItem.unit_price || 0,
        selling_price: selectedItem.selling_price || selectedItem.unit_price || 0,
        available_quantity: selectedItem.quantity,
        discount_percent: 0,
        tax_percent: 0,
      };

      // Get patient info from surgery
      const patient = medication.surgery?.patient;

      // Navigate to POS with cart pre-loaded
      navigate("/app/pharmacy/pos", {
        state: {
          prescriptionCart: [cartItem],
          patient: patient ? {
            id: patient.id,
            patient_number: patient.patient_number,
            first_name: patient.first_name,
            last_name: patient.last_name,
          } : null,
          otMedicationId: medication.id,
          surgeryId: medication.surgery_id,
          otMedicationName: medication.medication_name,
        },
      });
    } catch (err) {
      console.error('Error searching inventory:', err);
      toast.error('Failed to search inventory');
      setDispensingId(null);
    }
  };

  const handleCancel = (medication: OTMedicationRequest) => {
    if (confirm(`Cancel pharmacy request for ${medication.medication_name}?`)) {
      cancelRequest.mutate({
        medicationId: medication.id,
        surgeryId: medication.surgery_id,
      });
    }
  };

  const getTimingBadge = (timing: string) => {
    const config = {
      pre_op: { label: 'Pre-Op', variant: 'default' as const },
      intra_op: { label: 'Intra-Op', variant: 'secondary' as const },
      post_op: { label: 'Post-Op', variant: 'outline' as const },
    };
    const { label, variant } = config[timing as keyof typeof config] || { label: timing, variant: 'outline' as const };
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">OT Medication Requests</h1>
            <p className="text-muted-foreground">Pending medication requests from Operation Theatre</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          <Clock className="h-4 w-4 mr-2" />
          {queue.length} Pending
        </Badge>
      </div>

      {/* Queue Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : queue.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold">All Caught Up!</h3>
            <p className="text-muted-foreground">No pending OT medication requests</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedBySurgery).map(([surgeryId, { surgery, medications }]) => (
            <Card key={surgeryId}>
              <CardHeader className="bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Syringe className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {surgery?.surgery_number || 'Surgery'}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {surgery?.procedure_name || 'Procedure'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4" />
                      <span className="font-medium">
                        {`${surgery?.patient?.first_name || ''} ${surgery?.patient?.last_name || ''}`.trim() || 'Unknown'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {surgery?.patient?.patient_number}
                    </p>
                    {surgery?.scheduled_date && (
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(surgery.scheduled_date), 'dd MMM yyyy')}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {medications.map((med) => (
                    <div 
                      key={med.id} 
                      className="flex items-center justify-between p-3 border rounded-lg bg-background hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Package className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{med.medication_name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {med.dosage && <span>{med.dosage}</span>}
                            {med.route && <span>• {med.route}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getTimingBadge(med.timing)}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancel(med)}
                            disabled={cancelRequest.isPending || dispensingId === med.id}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDispense(med)}
                            disabled={dispensingId === med.id}
                          >
                            {dispensingId === med.id ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                            )}
                            Dispense
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
