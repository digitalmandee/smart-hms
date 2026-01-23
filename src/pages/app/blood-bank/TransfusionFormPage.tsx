import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { BloodGroupBadge } from "@/components/blood-bank/BloodGroupBadge";
import { ArrowLeft, Loader2, Droplets, User, Package, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  useBloodRequests,
  useBloodInventory,
  useCrossMatchTests,
  useCreateTransfusion,
  type BloodRequest,
  type BloodInventory as BloodInventoryType,
} from "@/hooks/useBloodBank";

const componentLabels: Record<string, string> = {
  whole_blood: 'Whole Blood',
  packed_rbc: 'Packed RBC',
  fresh_frozen_plasma: 'FFP',
  platelet_concentrate: 'Platelets',
  cryoprecipitate: 'Cryoprecipitate',
  granulocytes: 'Granulocytes',
};

export default function TransfusionFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedRequestId = searchParams.get('requestId');

  const [selectedRequestId, setSelectedRequestId] = useState<string>(preselectedRequestId || '');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [selectedCrossMatchId, setSelectedCrossMatchId] = useState<string>('');
  const [notes, setNotes] = useState('');

  const { data: requests, isLoading: loadingRequests } = useBloodRequests({ status: 'ready' });
  const { data: allRequests } = useBloodRequests();
  const { data: inventory, isLoading: loadingInventory } = useBloodInventory({ status: 'available' });
  const { data: crossMatches } = useCrossMatchTests({ requestId: selectedRequestId });
  const createTransfusion = useCreateTransfusion();

  // Get selected request details
  const selectedRequest = [...(requests || []), ...(allRequests || [])].find(r => r.id === selectedRequestId);
  
  // Filter inventory for compatible units
  const compatibleUnits = inventory?.filter(unit => 
    selectedRequest && unit.blood_group === selectedRequest.blood_group &&
    unit.component_type === selectedRequest.component_type
  ) || [];

  // Get selected unit details
  const selectedUnit = inventory?.find(u => u.id === selectedUnitId);

  // Get compatible cross matches for selected unit
  const compatibleCrossMatches = crossMatches?.filter(cm => 
    cm.blood_unit_id === selectedUnitId && cm.overall_result === 'compatible'
  ) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRequest || !selectedUnitId) {
      return;
    }

    try {
      await createTransfusion.mutateAsync({
        request_id: selectedRequestId,
        blood_unit_id: selectedUnitId,
        cross_match_id: selectedCrossMatchId || null,
        patient_id: selectedRequest.patient_id,
        admission_id: selectedRequest.admission_id || null,
        status: 'scheduled',
      });
      navigate('/app/blood-bank/transfusions');
    } catch (error) {
      // Error handled in hook
    }
  };

  const isLoading = createTransfusion.isPending;
  const canSubmit = selectedRequestId && selectedUnitId;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Schedule Transfusion"
        description="Schedule a blood transfusion from an approved request"
        actions={
          <Button variant="outline" onClick={() => navigate('/app/blood-bank/transfusions')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Transfusions
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Select Blood Request */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Step 1: Select Blood Request
            </CardTitle>
            <CardDescription>
              Choose from approved blood requests ready for transfusion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Blood Request *</Label>
              <Select 
                value={selectedRequestId} 
                onValueChange={(v) => {
                  setSelectedRequestId(v);
                  setSelectedUnitId('');
                  setSelectedCrossMatchId('');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingRequests ? "Loading..." : "Select a blood request"} />
                </SelectTrigger>
                <SelectContent>
                  {requests?.map((request) => (
                    <SelectItem key={request.id} value={request.id}>
                      {request.request_number} - {request.patient?.first_name} {request.patient?.last_name} 
                      ({request.blood_group} {componentLabels[request.component_type] || request.component_type})
                    </SelectItem>
                  ))}
                  {(!requests || requests.length === 0) && (
                    <SelectItem value="none" disabled>
                      No ready requests available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedRequest && (
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex items-center gap-3">
                  <BloodGroupBadge group={selectedRequest.blood_group} />
                  <div>
                    <p className="font-medium">
                      {selectedRequest.patient?.first_name} {selectedRequest.patient?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedRequest.patient?.patient_number}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                  <div>
                    <span className="text-muted-foreground">Component:</span>{' '}
                    <span className="font-medium">{componentLabels[selectedRequest.component_type] || selectedRequest.component_type}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Units Requested:</span>{' '}
                    <span className="font-medium">{selectedRequest.units_requested}</span>
                  </div>
                  {selectedRequest.indication && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Indication:</span>{' '}
                      <span>{selectedRequest.indication}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Select Blood Unit */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Step 2: Select Blood Unit
            </CardTitle>
            <CardDescription>
              Choose a compatible blood unit from inventory
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedRequestId ? (
              <p className="text-muted-foreground text-center py-4">
                Please select a blood request first
              </p>
            ) : compatibleUnits.length === 0 ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No compatible blood units available for {selectedRequest?.blood_group} {componentLabels[selectedRequest?.component_type || '']}.
                  Please check inventory or add new units.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Blood Unit *</Label>
                  <Select 
                    value={selectedUnitId} 
                    onValueChange={(v) => {
                      setSelectedUnitId(v);
                      setSelectedCrossMatchId('');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingInventory ? "Loading..." : "Select a blood unit"} />
                    </SelectTrigger>
                    <SelectContent>
                      {compatibleUnits.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.unit_number} - {unit.blood_group} ({unit.volume_ml} ml) - Expires: {new Date(unit.expiry_date).toLocaleDateString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedUnit && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <BloodGroupBadge group={selectedUnit.blood_group} />
                      <div>
                        <p className="font-medium">{selectedUnit.unit_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {componentLabels[selectedUnit.component_type] || selectedUnit.component_type} • {selectedUnit.volume_ml} ml
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                      <div>
                        <span className="text-muted-foreground">Expiry Date:</span>{' '}
                        <span className="font-medium">{new Date(selectedUnit.expiry_date).toLocaleDateString()}</span>
                      </div>
                      {selectedUnit.storage_location && (
                        <div>
                          <span className="text-muted-foreground">Storage:</span>{' '}
                          <span>{selectedUnit.storage_location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Step 3: Link Cross Match (Optional) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5" />
              Step 3: Link Cross-Match (Optional)
            </CardTitle>
            <CardDescription>
              Link a compatible cross-match test if available
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedUnitId ? (
              <p className="text-muted-foreground text-center py-4">
                Please select a blood unit first
              </p>
            ) : compatibleCrossMatches.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No compatible cross-match found for this unit. You can still proceed without one.
              </p>
            ) : (
              <div className="space-y-2">
                <Label>Cross-Match Test</Label>
                <Select value={selectedCrossMatchId} onValueChange={setSelectedCrossMatchId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a cross-match (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {compatibleCrossMatches.map((cm) => (
                      <SelectItem key={cm.id} value={cm.id}>
                        {cm.test_number || 'Cross-Match'} - Compatible 
                        {cm.valid_until && ` (Valid until: ${new Date(cm.valid_until).toLocaleDateString()})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes for this transfusion..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/app/blood-bank/transfusions')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !canSubmit}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <Droplets className="h-4 w-4 mr-2" />
                Schedule Transfusion
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
