import { useState } from "react";
import { format } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  useOTMedicationsPendingApproval, 
  useApproveOTMedicationCharge, 
  useRejectOTMedicationCharge,
  useBulkApproveOTMedicationCharges
} from "@/hooks/useOTMedicationBilling";
import { formatCurrency } from "@/lib/currency";
import { 
  Pill, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Scissors,
  AlertCircle,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";

interface GroupedMedications {
  surgeryId: string;
  surgeryNumber: string;
  patientName: string;
  patientNumber: string;
  admissionId: string | null;
  admissionNumber: string | null;
  procedureName: string;
  medications: any[];
  total: number;
}

export default function OTMedicationChargesPage() {
  const [selectedMeds, setSelectedMeds] = useState<Set<string>>(new Set());
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectMedId, setRejectMedId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [expandedSurgeries, setExpandedSurgeries] = useState<Set<string>>(new Set());
  const [tabValue, setTabValue] = useState("pending");

  const { data: pendingMeds, isLoading } = useOTMedicationsPendingApproval();
  const approveMutation = useApproveOTMedicationCharge();
  const rejectMutation = useRejectOTMedicationCharge();
  const bulkApproveMutation = useBulkApproveOTMedicationCharges();

  // Group medications by surgery
  const groupedBySurgery: GroupedMedications[] = (pendingMeds || []).reduce((acc: GroupedMedications[], med: any) => {
    const existing = acc.find(g => g.surgeryId === med.surgery_id);
    if (existing) {
      existing.medications.push(med);
      existing.total += med.unit_price || 0;
    } else {
      acc.push({
        surgeryId: med.surgery_id,
        surgeryNumber: med.surgery?.surgery_number || 'Unknown',
        patientName: `${med.surgery?.patient?.first_name || ''} ${med.surgery?.patient?.last_name || ''}`.trim() || 'Unknown',
        patientNumber: med.surgery?.patient?.patient_number || '',
        admissionId: med.surgery?.admission_id || null,
        admissionNumber: med.surgery?.admission?.admission_number || null,
        procedureName: med.surgery?.procedure_name || 'Unknown Procedure',
        medications: [med],
        total: med.unit_price || 0,
      });
    }
    return acc;
  }, []);

  const toggleSurgeryExpanded = (surgeryId: string) => {
    setExpandedSurgeries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(surgeryId)) {
        newSet.delete(surgeryId);
      } else {
        newSet.add(surgeryId);
      }
      return newSet;
    });
  };

  const toggleMedSelection = (medId: string) => {
    setSelectedMeds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(medId)) {
        newSet.delete(medId);
      } else {
        newSet.add(medId);
      }
      return newSet;
    });
  };

  const selectAllInSurgery = (surgeryId: string) => {
    const group = groupedBySurgery.find(g => g.surgeryId === surgeryId);
    if (!group) return;
    
    setSelectedMeds(prev => {
      const newSet = new Set(prev);
      group.medications.forEach(med => newSet.add(med.id));
      return newSet;
    });
  };

  const handleApprove = async (medicationId: string, surgeryId: string) => {
    approveMutation.mutate({ medicationId, surgeryId });
  };

  const handleBulkApprove = async () => {
    if (selectedMeds.size === 0) {
      toast.error("Please select medications to approve");
      return;
    }
    bulkApproveMutation.mutate(Array.from(selectedMeds), {
      onSuccess: () => setSelectedMeds(new Set())
    });
  };

  const handleReject = async () => {
    if (!rejectMedId || !rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    rejectMutation.mutate(
      { medicationId: rejectMedId, reason: rejectReason },
      {
        onSuccess: () => {
          setRejectDialogOpen(false);
          setRejectMedId(null);
          setRejectReason("");
        }
      }
    );
  };

  const openRejectDialog = (medId: string) => {
    setRejectMedId(medId);
    setRejectDialogOpen(true);
  };

  const totalPendingAmount = groupedBySurgery.reduce((sum, g) => sum + g.total, 0);
  const totalPendingCount = (pendingMeds || []).length;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="OT Medication Charges"
        description="Review and approve OT medication charges for patient billing"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
                <p className="text-xl font-bold">{totalPendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                <Pill className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-xl font-bold">{formatCurrency(totalPendingAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
                <Scissors className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Surgeries</p>
                <p className="text-xl font-bold">{groupedBySurgery.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      {selectedMeds.size > 0 && (
        <Card className="bg-primary/5 border-primary">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{selectedMeds.size} selected</Badge>
              <span className="text-sm text-muted-foreground">
                Total: {formatCurrency(
                  (pendingMeds || [])
                    .filter(m => selectedMeds.has(m.id))
                    .reduce((sum, m) => sum + (m.unit_price || 0), 0)
                )}
              </span>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedMeds(new Set())}
              >
                Clear Selection
              </Button>
              <Button 
                size="sm"
                onClick={handleBulkApprove}
                disabled={bulkApproveMutation.isPending}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Approve Selected
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medication Groups */}
      {groupedBySurgery.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-medium">All Clear!</h3>
            <p className="text-muted-foreground">
              No pending OT medication charges to approve.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {groupedBySurgery.map((group) => {
            const isExpanded = expandedSurgeries.has(group.surgeryId);
            
            return (
              <Card key={group.surgeryId}>
                <CardHeader 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleSurgeryExpanded(group.surgeryId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {group.patientName}
                          <span className="text-sm font-normal text-muted-foreground">
                            ({group.patientNumber})
                          </span>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Scissors className="h-3 w-3" />
                          {group.surgeryNumber} - {group.procedureName}
                          {group.admissionNumber && (
                            <Badge variant="outline" className="ml-2">
                              IPD: {group.admissionNumber}
                            </Badge>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">
                        {group.medications.length} items
                      </Badge>
                      <span className="font-semibold">
                        {formatCurrency(group.total)}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectAllInSurgery(group.surgeryId);
                        }}
                      >
                        Select All
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="border-t">
                    <div className="divide-y">
                      {group.medications.map((med) => (
                        <div 
                          key={med.id} 
                          className="py-3 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={selectedMeds.has(med.id)}
                              onCheckedChange={() => toggleMedSelection(med.id)}
                            />
                            <div>
                              <p className="font-medium">{med.medication_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {med.dosage} {med.route && `- ${med.route}`}
                                <span className="mx-2">•</span>
                                <Badge variant="outline" className="text-xs">
                                  {med.timing?.replace('_', '-')}
                                </Badge>
                                {med.batch_number && (
                                  <>
                                    <span className="mx-2">•</span>
                                    Batch: {med.batch_number}
                                  </>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-medium">
                              {formatCurrency(med.unit_price || 0)}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleApprove(med.id, med.surgery_id)}
                                disabled={approveMutation.isPending}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => openRejectDialog(med.id)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Medication Charge</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this charge. The charge will not be added to the patient's bill.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={rejectMutation.isPending || !rejectReason.trim()}
            >
              Reject Charge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
