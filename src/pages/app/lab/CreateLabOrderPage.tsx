import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LabOrderBuilder } from "@/components/consultation/LabOrderBuilder";
import { LabPaymentDialog } from "@/components/lab/LabPaymentDialog";
import { usePatients } from "@/hooks/usePatients";
import { useCreateLabOrder, type LabOrderItemInput } from "@/hooks/useLabOrders";
import { useLabSettings } from "@/hooks/useClinicConfig";
import { useServiceTypes } from "@/hooks/useBilling";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Search, User, ArrowLeft, Loader2, Receipt, CreditCard, CheckCircle } from "lucide-react";

type OrderCreationStep = "details" | "review" | "payment" | "complete";

interface CreatedOrder {
  order: {
    id: string;
    order_number: string;
  };
  invoice?: {
    id: string;
    invoice_number: string;
    total_amount: number;
  } | null;
}

export default function CreateLabOrderPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<{
    id: string;
    first_name: string;
    last_name: string;
    patient_number: string;
    phone?: string | null;
    date_of_birth?: string | null;
    gender?: string | null;
  } | null>(null);
  const [openPatientSearch, setOpenPatientSearch] = useState(false);
  
  const [labItems, setLabItems] = useState<LabOrderItemInput[]>([]);
  const [priority, setPriority] = useState<"routine" | "urgent" | "stat">("routine");
  const [clinicalNotes, setClinicalNotes] = useState("");
  
  const [step, setStep] = useState<OrderCreationStep>("details");
  const [createdOrder, setCreatedOrder] = useState<CreatedOrder | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const { data: patients = [], isLoading: patientsLoading } = usePatients(patientSearch);
  const { data: labSettings } = useLabSettings(profile?.branch_id);
  const { data: serviceTypes = [] } = useServiceTypes();
  const createLabOrder = useCreateLabOrder();

  // Get test prices from service_types
  const getItemsWithPrices = (): LabOrderItemInput[] => {
    return labItems.map(item => {
      if (item.service_type_id) {
        const serviceType = serviceTypes.find(st => st.id === item.service_type_id);
        return { ...item, price: serviceType?.default_price || 0 };
      }
      return { ...item, price: 0 };
    });
  };

  const calculateTotal = () => {
    const itemsWithPrices = getItemsWithPrices();
    return itemsWithPrices.reduce((sum, item) => sum + (item.price || 0), 0);
  };

  const handleReview = () => {
    if (!selectedPatient) {
      toast.error("Please select a patient");
      return;
    }
    if (labItems.length === 0) {
      toast.error("Please add at least one lab test");
      return;
    }
    setStep("review");
  };

  const handleSubmit = async () => {
    if (!selectedPatient || !profile?.branch_id) return;

    const shouldCreateInvoice = labSettings?.auto_generate_invoice ?? true;
    const itemsWithPrices = getItemsWithPrices();

    try {
      const result = await createLabOrder.mutateAsync({
        labOrder: {
          patient_id: selectedPatient.id,
          branch_id: profile.branch_id,
          priority,
          clinical_notes: clinicalNotes || undefined,
          ordered_by: profile.id,
        },
        items: itemsWithPrices,
        createInvoice: shouldCreateInvoice,
        organizationId: profile.organization_id,
      });

      setCreatedOrder(result);

      // Check if lab can collect payment directly
      const canCollectPayment = labSettings?.allow_direct_lab_payment || 
                                labSettings?.lab_payment_location === "lab" ||
                                labSettings?.lab_payment_location === "both";

      if (result.invoice && canCollectPayment) {
        setStep("payment");
      } else if (result.invoice) {
        // Redirect to reception for payment
        setStep("complete");
        toast.success("Lab order created. Patient should pay at reception.");
      } else {
        setStep("complete");
        toast.success("Lab order created successfully");
      }
    } catch (error) {
      console.error("Error creating lab order:", error);
      toast.error("Failed to create lab order");
    }
  };

  const calculateAge = (dob: string | null | undefined) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age}y`;
  };

  // Render Order Details Step
  const renderDetailsStep = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Patient Selection & Notes */}
      <div className="space-y-6">
        {/* Patient Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Select Patient
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedPatient ? (
              <div className="border rounded-lg p-4 bg-muted/30">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">
                      {selectedPatient.first_name} {selectedPatient.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedPatient.patient_number}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {calculateAge(selectedPatient.date_of_birth)} • {selectedPatient.gender || "N/A"}
                    </p>
                    {selectedPatient.phone && (
                      <p className="text-sm text-muted-foreground">
                        {selectedPatient.phone}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPatient(null)}
                  >
                    Change
                  </Button>
                </div>
              </div>
            ) : (
              <Popover open={openPatientSearch} onOpenChange={setOpenPatientSearch}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-start"
                  >
                    <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                    Search patient...
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[350px] p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Search by name, phone, patient number..."
                      value={patientSearch}
                      onValueChange={setPatientSearch}
                    />
                    <CommandList>
                      {patientsLoading ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : (
                        <>
                          <CommandEmpty>No patient found</CommandEmpty>
                          <CommandGroup>
                            {patients.slice(0, 10).map((patient) => (
                              <CommandItem
                                key={patient.id}
                                value={`${patient.first_name} ${patient.last_name} ${patient.patient_number}`}
                                onSelect={() => {
                                  setSelectedPatient(patient);
                                  setOpenPatientSearch(false);
                                  setPatientSearch("");
                                }}
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {patient.first_name} {patient.last_name}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {patient.patient_number} • {patient.phone}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}

            <Button
              variant="link"
              className="px-0"
              onClick={() => navigate("/app/patients/new")}
            >
              + Register New Patient
            </Button>
          </CardContent>
        </Card>

        {/* Clinical Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Clinical Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Clinical Notes (Optional)</Label>
              <Textarea
                placeholder="Any relevant clinical information for the lab..."
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Lab Settings Info */}
        {labSettings && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Payment Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Auto Invoice</span>
                <Badge variant={labSettings.auto_generate_invoice ? "default" : "secondary"}>
                  {labSettings.auto_generate_invoice ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Payment Location</span>
                <Badge variant="outline" className="capitalize">
                  {labSettings.lab_payment_location}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right: Lab Order Builder */}
      <div className="lg:col-span-2 space-y-6">
        <LabOrderBuilder
          items={labItems}
          onChange={setLabItems}
          priority={priority}
          onPriorityChange={setPriority}
          notes={clinicalNotes}
          onNotesChange={setClinicalNotes}
        />

        {/* Total & Submit Button */}
        <div className="flex items-center justify-between border-t pt-4">
          <div>
            {labItems.length > 0 && (
              <p className="text-lg font-semibold">
                Estimated Total: Rs. {calculateTotal().toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button
              onClick={handleReview}
              disabled={!selectedPatient || labItems.length === 0}
            >
              Review Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Review Step
  const renderReviewStep = () => {
    const itemsWithPrices = getItemsWithPrices();
    const total = calculateTotal();

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Order Summary
            </CardTitle>
            <CardDescription>Review before submitting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Patient Info */}
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Patient</p>
              <p className="font-medium text-lg">
                {selectedPatient?.first_name} {selectedPatient?.last_name}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedPatient?.patient_number} • {selectedPatient?.phone}
              </p>
            </div>

            <Separator />

            {/* Tests */}
            <div className="space-y-3">
              <h4 className="font-medium">Lab Tests</h4>
              {itemsWithPrices.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{item.test_name}</p>
                    <p className="text-sm text-muted-foreground">{item.test_category}</p>
                  </div>
                  <p className="font-medium">Rs. {(item.price || 0).toLocaleString()}</p>
                </div>
              ))}
            </div>

            <Separator />

            {/* Priority */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Priority</span>
              <Badge 
                className={
                  priority === "stat" ? "bg-red-100 text-red-800" :
                  priority === "urgent" ? "bg-orange-100 text-orange-800" :
                  "bg-blue-100 text-blue-800"
                }
              >
                {priority.toUpperCase()}
              </Badge>
            </div>

            {/* Clinical Notes */}
            {clinicalNotes && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Clinical Notes</p>
                <p className="text-sm">{clinicalNotes}</p>
              </div>
            )}

            <Separator />

            {/* Total */}
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total Amount</span>
              <span className="text-primary">Rs. {total.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep("details")}>
            Back to Edit
          </Button>
          <Button onClick={handleSubmit} disabled={createLabOrder.isPending}>
            {createLabOrder.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Lab Order"
            )}
          </Button>
        </div>
      </div>
    );
  };

  // Render Payment Step
  const renderPaymentStep = () => {
    if (!createdOrder?.invoice || !selectedPatient) return null;

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>Lab Order Created</CardTitle>
            <CardDescription>
              Order #{createdOrder.order.order_number}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Amount Due</p>
              <p className="text-3xl font-bold text-primary">
                Rs. {createdOrder.invoice.total_amount.toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate("/app/lab/queue")}
                className="w-full"
              >
                Pay Later
              </Button>
              <Button 
                onClick={() => setShowPaymentDialog(true)}
                className="w-full"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Collect Payment
              </Button>
            </div>
          </CardContent>
        </Card>

        {showPaymentDialog && createdOrder.invoice && (
          <LabPaymentDialog
            open={showPaymentDialog}
            onOpenChange={setShowPaymentDialog}
            orderId={createdOrder.order.id}
            orderNumber={createdOrder.order.order_number}
            invoiceId={createdOrder.invoice.id}
            totalAmount={createdOrder.invoice.total_amount}
            paidAmount={0}
            patientName={`${selectedPatient.first_name} ${selectedPatient.last_name}`}
            testNames={labItems.map(i => i.test_name)}
            onSuccess={() => {
              setStep("complete");
              toast.success("Payment collected successfully!");
            }}
          />
        )}
      </div>
    );
  };

  // Render Complete Step
  const renderCompleteStep = () => (
    <div className="max-w-md mx-auto text-center space-y-6">
      <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>
      <div>
        <h2 className="text-2xl font-bold">Order Complete!</h2>
        <p className="text-muted-foreground mt-2">
          Lab order {createdOrder?.order.order_number} has been created and is ready for processing.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <Button onClick={() => navigate("/app/lab/queue")}>
          Go to Lab Queue
        </Button>
        <Button variant="outline" onClick={() => {
          setStep("details");
          setSelectedPatient(null);
          setLabItems([]);
          setClinicalNotes("");
          setCreatedOrder(null);
        }}>
          Create Another Order
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Lab Order"
        description={
          step === "details" ? "Order lab tests directly without consultation" :
          step === "review" ? "Review your lab order" :
          step === "payment" ? "Collect payment for lab tests" :
          "Order complete"
        }
        actions={
          step === "details" && (
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )
        }
      />

      {step === "details" && renderDetailsStep()}
      {step === "review" && renderReviewStep()}
      {step === "payment" && renderPaymentStep()}
      {step === "complete" && renderCompleteStep()}
    </div>
  );
}