import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePendingSurgeryRequests } from "@/hooks/useSurgeryRequests";
import { useSurgeries } from "@/hooks/useOT";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Scissors, 
  Calendar, 
  UserPlus, 
  AlertCircle, 
  Clock,
  ChevronRight,
  User,
  CreditCard,
  FileText
} from "lucide-react";
import { format, parseISO, addDays } from "date-fns";

const priorityConfig = {
  elective: { label: "Elective", variant: "secondary" as const, icon: Clock },
  urgent: { label: "Urgent", variant: "outline" as const, icon: AlertCircle },
  emergency: { label: "Emergency", variant: "destructive" as const, icon: AlertCircle },
};

interface PendingSurgeryRequestsCardProps {
  maxItems?: number;
}

export function PendingSurgeryRequestsCard({ maxItems = 5 }: PendingSurgeryRequestsCardProps) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  // Fetch pending surgery requests (doctor recommendations)
  const { data: requests, isLoading: requestsLoading } = usePendingSurgeryRequests(profile?.branch_id || undefined);
  
  // Fetch scheduled surgeries that may need payment processing
  const today = format(new Date(), "yyyy-MM-dd");
  const thirtyDaysAhead = format(addDays(new Date(), 30), "yyyy-MM-dd");
  const { data: scheduledSurgeries, isLoading: surgeriesLoading } = useSurgeries({
    branchId: profile?.branch_id,
    dateFrom: today,
    dateTo: thirtyDaysAhead,
    status: ['scheduled', 'pre_op']
  });

  // Filter surgeries that need payment (billable but no invoice yet)
  const surgeriesToProcess = scheduledSurgeries?.filter(s => 
    s.is_billable && !s.invoice_id
  ) || [];

  const displayedRequests = requests?.slice(0, maxItems) || [];
  const displayedSurgeries = surgeriesToProcess.slice(0, maxItems);

  const isLoading = requestsLoading || surgeriesLoading;

  const handleCheckOT = (requestId: string) => {
    navigate(`/app/ot/schedule?surgeryRequestId=${requestId}`);
  };

  const handleAdmitPatient = (patientId: string, requestId: string) => {
    navigate(`/app/ipd/admissions/new?patientId=${patientId}&surgeryRequestId=${requestId}`);
  };

  const handleViewSurgery = (surgeryId: string) => {
    navigate(`/app/ot/surgeries/${surgeryId}`);
  };

  const handleCreateInvoice = (patientId: string, surgeryId: string) => {
    navigate(`/app/billing/invoices/new?patientId=${patientId}&surgeryId=${surgeryId}`);
  };

  const totalCount = (requests?.length || 0) + surgeriesToProcess.length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-2 rounded-lg bg-warning/10">
              <Scissors className="h-4 w-4 text-warning" />
            </div>
            Surgeries to Process
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-all hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-2 rounded-lg bg-warning/10">
              <Scissors className="h-4 w-4 text-warning" />
            </div>
            Surgeries to Process
            {totalCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {totalCount}
              </Badge>
            )}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/app/ot/surgeries")}
          >
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {totalCount === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8 px-4">
            No surgeries need processing
          </p>
        ) : (
          <Tabs defaultValue={surgeriesToProcess.length > 0 ? "scheduled" : "requests"} className="w-full">
            <TabsList className="w-full grid grid-cols-2 mx-4 mb-2" style={{ width: 'calc(100% - 2rem)' }}>
              <TabsTrigger value="scheduled" className="text-xs">
                Scheduled ({surgeriesToProcess.length})
              </TabsTrigger>
              <TabsTrigger value="requests" className="text-xs">
                Doctor Requests ({requests?.length || 0})
              </TabsTrigger>
            </TabsList>

            {/* Scheduled Surgeries Tab */}
            <TabsContent value="scheduled" className="mt-0">
              <ScrollArea className="h-[280px]">
                {surgeriesToProcess.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8 px-4">
                    No scheduled surgeries need payment
                  </p>
                ) : (
                  <div className="space-y-1 p-4 pt-0">
                    {displayedSurgeries.map((surgery) => {
                      const priorityInfo = priorityConfig[surgery.priority as keyof typeof priorityConfig];
                      const PriorityIcon = priorityInfo?.icon || Clock;
                      const patient = surgery.patient;

                      return (
                        <div
                          key={surgery.id}
                          className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                        >
                          {/* Header: Patient + Priority */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-full bg-primary/10">
                                <User className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  {patient?.first_name} {patient?.last_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {patient?.mr_number || surgery.surgery_number}
                                </p>
                              </div>
                            </div>
                            <Badge variant={priorityInfo?.variant || "secondary"} className="text-xs">
                              <PriorityIcon className="h-3 w-3 mr-1" />
                              {priorityInfo?.label || surgery.priority}
                            </Badge>
                          </div>

                          {/* Procedure */}
                          <div className="mb-2">
                            <p className="text-sm font-medium">{surgery.procedure_name}</p>
                            {surgery.diagnosis && (
                              <p className="text-xs text-muted-foreground">{surgery.diagnosis}</p>
                            )}
                          </div>

                          {/* Date & OT Room */}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(parseISO(surgery.scheduled_date), "MMM d, yyyy")}
                            </span>
                            {surgery.scheduled_start_time && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {surgery.scheduled_start_time.slice(0, 5)}
                              </span>
                            )}
                            {surgery.ot_room && (
                              <span>OT: {surgery.ot_room.room_number}</span>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleViewSurgery(surgery.id)}
                            >
                              <FileText className="h-3.5 w-3.5 mr-1" />
                              View Details
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => handleCreateInvoice(surgery.patient_id, surgery.id)}
                            >
                              <CreditCard className="h-3.5 w-3.5 mr-1" />
                              Create Invoice
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {/* Doctor Requests Tab */}
            <TabsContent value="requests" className="mt-0">
              <ScrollArea className="h-[280px]">
                {displayedRequests.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8 px-4">
                    No pending surgery requests from doctors
                  </p>
                ) : (
                  <div className="space-y-1 p-4 pt-0">
                    {displayedRequests.map((request) => {
                      const priorityInfo = priorityConfig[request.priority as keyof typeof priorityConfig];
                      const PriorityIcon = priorityInfo?.icon || Clock;
                      const patient = request.patient;
                      const doctor = request.doctor;

                      return (
                        <div
                          key={request.id}
                          className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                        >
                          {/* Header: Patient + Priority */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-full bg-primary/10">
                                <User className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  {patient?.first_name} {patient?.last_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {patient?.patient_number}
                                </p>
                              </div>
                            </div>
                            <Badge variant={priorityInfo?.variant || "secondary"} className="text-xs">
                              <PriorityIcon className="h-3 w-3 mr-1" />
                              {priorityInfo?.label || request.priority}
                            </Badge>
                          </div>

                          {/* Procedure */}
                          <div className="mb-2">
                            <p className="text-sm font-medium">{request.procedure_name}</p>
                            {request.diagnosis && (
                              <p className="text-xs text-muted-foreground">{request.diagnosis}</p>
                            )}
                          </div>

                          {/* Doctor & Date */}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                            {doctor && (
                              <span>
                                By: Dr. {doctor.profile?.full_name}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(parseISO(request.recommended_date), "MMM d, yyyy")}
                            </span>
                          </div>

                          {/* Preferred Date Range */}
                          {(request.preferred_date_from || request.preferred_date_to) && (
                            <p className="text-xs text-muted-foreground mb-3">
                              Preferred: {request.preferred_date_from && format(parseISO(request.preferred_date_from), "MMM d")}
                              {request.preferred_date_from && request.preferred_date_to && " - "}
                              {request.preferred_date_to && format(parseISO(request.preferred_date_to), "MMM d, yyyy")}
                            </p>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleCheckOT(request.id)}
                            >
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              Check OT
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => handleAdmitPatient(request.patient_id, request.id)}
                            >
                              <UserPlus className="h-3.5 w-3.5 mr-1" />
                              Admit Patient
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
