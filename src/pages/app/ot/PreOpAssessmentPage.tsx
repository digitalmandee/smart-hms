import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PreOpAssessmentForm } from "@/components/ot/PreOpAssessmentForm";
import { OrderPreOpLabsModal } from "@/components/ot/OrderPreOpLabsModal";
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Scissors,
  FlaskConical,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { useSurgery, useCreatePreOpAssessment, useUpdatePreOpAssessment } from "@/hooks/useOT";
import { useLabOrders, useCreateLabOrder, LabOrderItemInput } from "@/hooks/useLabOrders";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { otLogger } from "@/lib/logger";

export default function PreOpAssessmentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const { data: surgery, isLoading } = useSurgery(id!);
  const { data: labOrders } = useLabOrders({ patientId: surgery?.patient_id });
  const createAssessment = useCreatePreOpAssessment();
  const updateAssessment = useUpdatePreOpAssessment();
  const createLabOrder = useCreateLabOrder();

  const [showLabModal, setShowLabModal] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!surgery) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
        <h2 className="text-lg font-medium">Surgery Not Found</h2>
        <Button onClick={() => navigate("/app/ot/schedule")} className="mt-4">
          Back to Schedule
        </Button>
      </div>
    );
  }

  const patientName = surgery.patient 
    ? `${surgery.patient.first_name} ${surgery.patient.last_name}`
    : 'Unknown Patient';

  const handleSaveAssessment = async (data: any) => {
    try {
      if (surgery.pre_op_assessment) {
        await updateAssessment.mutateAsync({
          id: surgery.pre_op_assessment.id,
          ...data,
        });
      } else {
        await createAssessment.mutateAsync({
          ...data,
          surgery_id: surgery.id,
          assessed_by: profile?.id || '',
        });
      }
      toast.success('Pre-op assessment saved');
    } catch (error) {
      toast.error('Failed to save assessment');
    }
  };

  const handleClearForSurgery = async () => {
    try {
      await updateAssessment.mutateAsync({
        id: surgery.pre_op_assessment!.id,
        surgeryId: surgery.id,
        is_cleared_for_surgery: true,
        cleared_by: profile?.id,
        cleared_at: new Date().toISOString(),
      });
      toast.success('Patient cleared for surgery');
    } catch (error) {
      toast.error('Failed to clear patient');
    }
  };

  const handleOrderLabs = async (tests: any[], priority: string, notes: string) => {
    if (!surgery?.patient_id || !surgery?.branch_id) {
      toast.error('Missing patient or branch information');
      return;
    }

    const items: LabOrderItemInput[] = tests.map(test => ({
      test_name: test.name || test.test_name,
      test_category: test.category || 'lab',
    }));

    try {
      otLogger.info('PreOpAssessmentPage: Ordering lab tests', {
        surgeryId: surgery.id,
        patientId: surgery.patient_id,
        testsCount: items.length,
        tests: items.map(i => i.test_name),
      });

      await createLabOrder.mutateAsync({
        labOrder: {
          patient_id: surgery.patient_id,
          branch_id: surgery.branch_id,
          priority: priority as 'routine' | 'urgent' | 'stat',
          clinical_notes: `Pre-operative workup for ${surgery.surgery_number}. ${notes}`.trim(),
          ordered_by: profile?.id,
        },
        items,
        createInvoice: false,
      });

      toast.success(`Ordered ${tests.length} lab tests`, {
        description: 'Tests will appear in the Lab module'
      });
    } catch (error: any) {
      otLogger.error('PreOpAssessmentPage: Failed to order lab tests', error);
      toast.error(error.message || 'Failed to order lab tests');
    }
  };

  // Filter lab orders for this surgery/patient
  const preOpLabOrders = labOrders?.filter(order => 
    order.clinical_notes?.toLowerCase().includes('pre-op') ||
    order.clinical_notes?.toLowerCase().includes('pre-operative')
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Pre-Operative Assessment</h1>
            <p className="text-muted-foreground">{surgery.surgery_number} - {surgery.procedure_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {surgery.pre_op_assessment?.is_cleared_for_surgery ? (
            <Badge className="bg-green-500 text-white">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Cleared for Surgery
            </Badge>
          ) : (
            <Badge variant="outline" className="text-amber-600 border-amber-600">
              <Clock className="h-4 w-4 mr-1" />
              Assessment Pending
            </Badge>
          )}
        </div>
      </div>

      {/* Patient & Surgery Info */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">{patientName}</p>
              <p className="text-sm text-muted-foreground">{surgery.patient?.patient_number}</p>
              {surgery.patient?.blood_group && (
                <Badge variant="outline" className="mt-1">
                  Blood: {surgery.patient.blood_group}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 rounded-lg bg-purple-100">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="font-medium">
                {format(new Date(surgery.scheduled_date), 'EEEE, MMM d, yyyy')}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(`2000-01-01T${surgery.scheduled_start_time}`), 'h:mm a')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 rounded-lg bg-orange-100">
              <Scissors className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="font-medium">{surgery.procedure_name}</p>
              <p className="text-sm text-muted-foreground">
                {surgery.lead_surgeon?.profile?.full_name || 'Surgeon TBD'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="assessment">
        <TabsList>
          <TabsTrigger value="assessment">Assessment Form</TabsTrigger>
          <TabsTrigger value="investigations">
            Investigations
            {preOpLabOrders.length > 0 && (
              <Badge variant="secondary" className="ml-2">{preOpLabOrders.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assessment" className="mt-4">
          <PreOpAssessmentForm
            surgeryId={surgery.id}
            assessment={surgery.pre_op_assessment}
            patientBloodGroup={surgery.patient?.blood_group}
            onSave={handleSaveAssessment}
            onClear={surgery.pre_op_assessment ? handleClearForSurgery : undefined}
            isLoading={createAssessment.isPending || updateAssessment.isPending}
          />
        </TabsContent>

        <TabsContent value="investigations" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FlaskConical className="h-5 w-5" />
                    Pre-Operative Investigations
                  </CardTitle>
                  <CardDescription>
                    Lab tests and imaging for pre-operative workup
                  </CardDescription>
                </div>
                <Button onClick={() => setShowLabModal(true)}>
                  <FlaskConical className="h-4 w-4 mr-2" />
                  Order Lab Tests
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {preOpLabOrders.length === 0 ? (
                <div className="text-center py-8">
                  <FlaskConical className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-4">No pre-operative investigations ordered</p>
                  <Button variant="outline" onClick={() => setShowLabModal(true)}>
                    Order Pre-Op Labs
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {preOpLabOrders.map(order => (
                    <div key={order.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{order.order_number}</span>
                        <Badge variant={
                          order.status === 'completed' ? 'default' :
                          order.status === 'processing' ? 'secondary' : 'outline'
                        }>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {order.items?.map(item => item.test_name).join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Order Labs Modal */}
      <OrderPreOpLabsModal
        open={showLabModal}
        onOpenChange={setShowLabModal}
        onOrder={handleOrderLabs}
        patientName={patientName}
      />
    </div>
  );
}
