import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { 
  useBloodRequests,
  useBloodInventory,
  useCreateCrossMatch,
  type CrossMatchResult,
  type BloodGroupType,
} from "@/hooks/useBloodBank";
import { BloodGroupBadge } from "@/components/blood-bank/BloodGroupBadge";

const crossMatchResults: { value: CrossMatchResult; label: string }[] = [
  { value: 'compatible', label: 'Compatible' },
  { value: 'incompatible', label: 'Incompatible' },
  { value: 'pending', label: 'Pending' },
];

const componentLabels: Record<string, string> = {
  whole_blood: 'Whole Blood',
  packed_rbc: 'Packed RBC',
  fresh_frozen_plasma: 'FFP',
  platelet_concentrate: 'Platelets',
  cryoprecipitate: 'Cryoprecipitate',
  granulocytes: 'Granulocytes',
};

export default function CrossMatchFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedRequestId = searchParams.get('requestId');
  
  const [selectedRequestId, setSelectedRequestId] = useState<string>(preselectedRequestId || '');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  
  const { data: requests } = useBloodRequests({ status: 'processing' });
  const { data: pendingRequests } = useBloodRequests({ status: 'cross_matching' });
  const allRequests = [...(requests || []), ...(pendingRequests || [])];
  
  const selectedRequest = allRequests.find(r => r.id === selectedRequestId);
  
  const { data: inventory } = useBloodInventory({ 
    status: 'available', 
    bloodGroup: selectedRequest?.blood_group,
    componentType: selectedRequest?.component_type,
  });

  const createCrossMatch = useCreateCrossMatch();

  const [formData, setFormData] = useState({
    major_cross_match: 'pending' as CrossMatchResult,
    minor_cross_match: 'pending' as CrossMatchResult,
    overall_result: 'pending' as CrossMatchResult,
  });

  // Auto-calculate overall result
  useEffect(() => {
    if (formData.major_cross_match === 'pending' || formData.minor_cross_match === 'pending') {
      setFormData(prev => ({ ...prev, overall_result: 'pending' }));
    } else if (formData.major_cross_match === 'compatible' && formData.minor_cross_match === 'compatible') {
      setFormData(prev => ({ ...prev, overall_result: 'compatible' }));
    } else {
      setFormData(prev => ({ ...prev, overall_result: 'incompatible' }));
    }
  }, [formData.major_cross_match, formData.minor_cross_match]);

  const selectedUnit = inventory?.find(u => u.id === selectedUnitId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRequestId || !selectedUnitId || !selectedRequest) {
      return;
    }

    try {
      await createCrossMatch.mutateAsync({
        request_id: selectedRequestId,
        blood_unit_id: selectedUnitId,
        patient_id: selectedRequest.patient_id,
        patient_blood_group: selectedRequest.blood_group,
        donor_blood_group: selectedUnit?.blood_group as BloodGroupType,
        major_cross_match: formData.major_cross_match,
        minor_cross_match: formData.minor_cross_match,
        overall_result: formData.overall_result,
        valid_until: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(), // 72 hours validity
      });
      navigate('/app/blood-bank/cross-match');
    } catch (error) {
      // Error handled in hook
    }
  };

  const isLoading = createCrossMatch.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Cross-Match Test"
        description="Perform compatibility testing"
        actions={
          <Button variant="outline" onClick={() => navigate('/app/blood-bank/cross-match')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cross-Match
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Blood Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Blood Request *</Label>
              <Select value={selectedRequestId} onValueChange={(v) => {
                setSelectedRequestId(v);
                setSelectedUnitId(''); // Reset unit when request changes
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a blood request" />
                </SelectTrigger>
                <SelectContent>
                  {allRequests.map((request) => (
                    <SelectItem key={request.id} value={request.id}>
                      <div className="flex items-center gap-2">
                        <span>{request.request_number}</span>
                        <BloodGroupBadge group={request.blood_group} size="sm" />
                        <span className="text-muted-foreground">
                          - {request.patient?.first_name} {request.patient?.last_name}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedRequest && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="grid gap-2 md:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Patient</p>
                    <p className="font-medium">{selectedRequest.patient?.first_name} {selectedRequest.patient?.last_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Blood Group</p>
                    <BloodGroupBadge group={selectedRequest.blood_group} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Component</p>
                    <p className="font-medium">{componentLabels[selectedRequest.component_type]}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Select Blood Unit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Available Blood Unit *</Label>
              <Select 
                value={selectedUnitId} 
                onValueChange={setSelectedUnitId}
                disabled={!selectedRequest}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedRequest ? "Select a blood unit" : "Select a request first"} />
                </SelectTrigger>
                <SelectContent>
                  {inventory?.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      <div className="flex items-center gap-2">
                        <span>{unit.unit_number}</span>
                        <BloodGroupBadge group={unit.blood_group} size="sm" />
                        <span className="text-muted-foreground">
                          - {componentLabels[unit.component_type]} ({unit.volume_ml}ml)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedRequest && (!inventory || inventory.length === 0) && (
                <p className="text-sm text-destructive">
                  No compatible blood units available in inventory
                </p>
              )}
            </div>

            {selectedUnit && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="grid gap-2 md:grid-cols-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Unit Number</p>
                    <p className="font-medium">{selectedUnit.unit_number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Blood Group</p>
                    <BloodGroupBadge group={selectedUnit.blood_group} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Volume</p>
                    <p className="font-medium">{selectedUnit.volume_ml} ml</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Expiry</p>
                    <p className="font-medium">{new Date(selectedUnit.expiry_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cross-Match Results</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Major Cross-Match *</Label>
              <Select 
                value={formData.major_cross_match} 
                onValueChange={(v) => setFormData({ ...formData, major_cross_match: v as CrossMatchResult })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {crossMatchResults.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Patient serum + Donor cells</p>
            </div>
            <div className="space-y-2">
              <Label>Minor Cross-Match *</Label>
              <Select 
                value={formData.minor_cross_match} 
                onValueChange={(v) => setFormData({ ...formData, minor_cross_match: v as CrossMatchResult })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {crossMatchResults.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Donor serum + Patient cells</p>
            </div>
            <div className="space-y-2">
              <Label>Overall Result</Label>
              <div className={`p-3 rounded-lg text-center font-medium ${
                formData.overall_result === 'compatible' ? 'bg-green-100 text-green-800' :
                formData.overall_result === 'incompatible' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {formData.overall_result.charAt(0).toUpperCase() + formData.overall_result.slice(1)}
              </div>
              <p className="text-xs text-muted-foreground">Auto-calculated</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/app/blood-bank/cross-match')}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading || !selectedRequestId || !selectedUnitId}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Cross-Match
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
