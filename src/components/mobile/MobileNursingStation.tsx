import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Building2, 
  Users, 
  Pill, 
  ClipboardList, 
  Heart,
  User,
  Bed,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  AlertTriangle,
  DollarSign,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWards } from "@/hooks/useIPD";
import { useAdmissions, usePendingAdmissions } from "@/hooks/useAdmissions";
import { AdmissionConfirmationDialog } from "@/components/ipd/AdmissionConfirmationDialog";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { useHaptics } from "@/hooks/useHaptics";

type TabType = "pending" | "patients" | "medications" | "vitals" | "notes";

export function MobileNursingStation() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const haptics = useHaptics();
  const { profile, isLoading: authLoading } = useAuth();
  const [selectedWardId, setSelectedWardId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [selectedAdmission, setSelectedAdmission] = useState<any>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const { data: wards, isLoading: loadingWards } = useWards();
  const { data: admissions, isLoading: loadingAdmissions, refetch: refetchAdmissions } = useAdmissions("admitted");
  const { data: pendingAdmissions = [], isLoading: loadingPending, refetch: refetchPending } = usePendingAdmissions(selectedWardId || undefined);

  // Auto-select first ward
  useEffect(() => {
    if (wards && wards.length > 0 && !selectedWardId) {
      setSelectedWardId(wards[0].id);
    }
  }, [wards, selectedWardId]);

  // Real-time subscription
  useEffect(() => {
    if (!profile?.organization_id) return;

    const channel = supabase
      .channel('pending-admissions-alerts-mobile')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admissions',
          filter: `organization_id=eq.${profile.organization_id}`,
        },
        (payload) => {
          if (payload.new && (payload.new as any).status === 'pending') {
            haptics.medium();
            toast({
              title: "🔔 New Admission Pending",
              description: "A new patient admission requires confirmation",
            });
            refetchPending();
            queryClient.invalidateQueries({ queryKey: ["admissions"] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.organization_id, refetchPending, queryClient, haptics]);

  const selectedWard = wards?.find((w: any) => w.id === selectedWardId);
  const wardPatients = selectedWardId
    ? (admissions || []).filter((adm: any) => adm.ward?.id === selectedWardId)
    : [];

  const handleRefresh = async () => {
    haptics.light();
    await Promise.all([refetchAdmissions(), refetchPending()]);
    toast({ title: "Refreshed" });
  };

  const tabs: { value: TabType; label: string; icon: React.ReactNode; count?: number }[] = [
    { value: "pending", label: "Pending", icon: <Clock className="h-4 w-4" />, count: pendingAdmissions.length },
    { value: "patients", label: "Patients", icon: <Users className="h-4 w-4" />, count: wardPatients.length },
    { value: "medications", label: "Meds", icon: <Pill className="h-4 w-4" /> },
    { value: "vitals", label: "Vitals", icon: <Heart className="h-4 w-4" /> },
    { value: "notes", label: "Notes", icon: <ClipboardList className="h-4 w-4" /> },
  ];

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile?.organization_id) {
    return (
      <div className="px-4 py-4">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <p className="text-destructive font-medium">No organization associated.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!loadingWards && (!wards || wards.length === 0)) {
    return (
      <div className="px-4 py-4">
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="font-medium">No wards created yet.</p>
            <Button 
              onClick={() => navigate("/app/ipd/wards")} 
              className="mt-4"
            >
              Create Ward
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="px-4 py-4 space-y-4 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Nursing Station</h1>
            <p className="text-sm text-muted-foreground">Patient care & documentation</p>
          </div>
          <Button size="icon" variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Ward Selector */}
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
          <Select value={selectedWardId} onValueChange={setSelectedWardId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select Ward" />
            </SelectTrigger>
            <SelectContent>
              {(wards || []).map((ward: any) => (
                <SelectItem key={ward.id} value={ward.id}>
                  {ward.name} ({ward.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tab Selector - Horizontal Scroll */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {tabs.map((tab) => (
            <Button
              key={tab.value}
              variant={activeTab === tab.value ? "default" : "outline"}
              size="sm"
              className="shrink-0 gap-1"
              onClick={() => { haptics.light(); setActiveTab(tab.value); }}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {tab.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        {selectedWardId && (
          <>
            {/* Pending Tab */}
            {activeTab === "pending" && (
              <div className="space-y-3">
                {loadingPending ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </div>
                ) : pendingAdmissions.length > 0 ? (
                  pendingAdmissions.map((adm: any) => {
                    const isPaid = adm.payment_status === "paid";
                    const isPayLater = adm.payment_status === "pay_later";
                    const depositAmount = adm.deposit_amount || 0;

                    return (
                      <Card 
                        key={adm.id} 
                        className={cn(
                          "transition-all active:scale-[0.99]",
                          isPaid ? "border-success/50" : isPayLater ? "border-warning/50" : ""
                        )}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "h-10 w-10 rounded-full flex items-center justify-center",
                                isPaid ? "bg-success/10" : isPayLater ? "bg-warning/10" : "bg-muted"
                              )}>
                                {isPaid ? (
                                  <CheckCircle2 className="h-5 w-5 text-success" />
                                ) : isPayLater ? (
                                  <AlertTriangle className="h-5 w-5 text-warning" />
                                ) : (
                                  <Clock className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">
                                  {adm.patient?.first_name} {adm.patient?.last_name}
                                </p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Bed className="h-3 w-3" />
                                  Bed {adm.bed?.bed_number}
                                </p>
                              </div>
                            </div>
                            {isPaid ? (
                              <Badge className="bg-success text-success-foreground">Paid</Badge>
                            ) : isPayLater ? (
                              <Badge variant="outline" className="border-warning text-warning">Pay Later</Badge>
                            ) : (
                              <Badge variant="outline" className="border-destructive text-destructive">Unpaid</Badge>
                            )}
                          </div>
                          
                          {depositAmount > 0 && (
                            <p className="text-sm mb-2">
                              <span className="text-muted-foreground">Deposit: </span>
                              <span className={isPaid ? "text-success font-medium" : ""}>
                                {formatCurrency(depositAmount)}
                              </span>
                            </p>
                          )}
                          
                          {isPayLater && (
                            <div className="p-2 bg-warning/10 rounded-md text-sm text-warning flex items-center gap-2 mb-2">
                              <AlertTriangle className="h-4 w-4 shrink-0" />
                              Deposit of {formatCurrency(depositAmount)} pending
                            </div>
                          )}

                          <Button
                            className="w-full"
                            onClick={() => {
                              haptics.medium();
                              setSelectedAdmission(adm);
                              setConfirmDialogOpen(true);
                            }}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Admit to Bed
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No pending admissions</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Patients Tab */}
            {activeTab === "patients" && (
              <div className="space-y-3">
                {loadingAdmissions ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </div>
                ) : wardPatients.length > 0 ? (
                  wardPatients.map((adm: any) => (
                    <Card 
                      key={adm.id} 
                      className="cursor-pointer transition-all active:scale-[0.99]"
                      onClick={() => { haptics.light(); navigate(`/app/ipd/admissions/${adm.id}`); }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {adm.patient?.first_name} {adm.patient?.last_name}
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Bed className="h-3 w-3" />
                                Bed {adm.bed?.bed_number}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              haptics.light();
                              navigate(`/app/ipd/vitals?admission=${adm.id}`);
                            }}
                          >
                            <Heart className="h-4 w-4 mr-1" />
                            Vitals
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              haptics.light();
                              navigate(`/app/ipd/nursing-notes?admission=${adm.id}`);
                            }}
                          >
                            <ClipboardList className="h-4 w-4 mr-1" />
                            Notes
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No patients in this ward</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Medications Tab */}
            {activeTab === "medications" && (
              <Card 
                className="cursor-pointer transition-all active:scale-[0.99]"
                onClick={() => { haptics.light(); navigate("/app/ipd/medication-chart"); }}
              >
                <CardContent className="py-8 text-center">
                  <Pill className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <p className="font-medium">Open Medication Chart</p>
                  <p className="text-sm text-muted-foreground mt-1">View and administer medications</p>
                  <Button className="mt-4">
                    Open Chart <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Vitals Tab */}
            {activeTab === "vitals" && (
              <Card 
                className="cursor-pointer transition-all active:scale-[0.99]"
                onClick={() => { haptics.light(); navigate("/app/ipd/vitals"); }}
              >
                <CardContent className="py-8 text-center">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-destructive" />
                  <p className="font-medium">Record Vitals</p>
                  <p className="text-sm text-muted-foreground mt-1">Enter patient vital signs</p>
                  <Button className="mt-4">
                    Open Vitals <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Notes Tab */}
            {activeTab === "notes" && (
              <Card 
                className="cursor-pointer transition-all active:scale-[0.99]"
                onClick={() => { haptics.light(); navigate("/app/ipd/nursing-notes"); }}
              >
                <CardContent className="py-8 text-center">
                  <ClipboardList className="h-12 w-12 mx-auto mb-4 text-info" />
                  <p className="font-medium">Nursing Notes</p>
                  <p className="text-sm text-muted-foreground mt-1">View and add nursing documentation</p>
                  <Button className="mt-4">
                    Open Notes <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Admission Confirmation Dialog */}
        {selectedAdmission && (
          <AdmissionConfirmationDialog
            open={confirmDialogOpen}
            onOpenChange={(open) => {
              setConfirmDialogOpen(open);
              if (!open) {
                refetchPending();
                refetchAdmissions();
                queryClient.invalidateQueries({ queryKey: ["admissions"] });
              }
            }}
            admission={selectedAdmission}
          />
        )}
      </div>
    </PullToRefresh>
  );
}