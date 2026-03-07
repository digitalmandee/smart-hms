import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatientInsurance, useCreateInsuranceClaim } from "@/hooks/useInsurance";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";
import { MedicalCodeSearch } from "@/components/insurance/MedicalCodeSearch";

interface ClaimFormData {
  patient_insurance_id: string;
  invoice_id: string;
  claim_date: string;
  pre_auth_number: string;
  pre_auth_date: string;
  drg_code: string;
  notes: string;
}

interface ClaimItem {
  description: string;
  service_code: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
}

export default function ClaimFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const invoiceId = searchParams.get('invoice');
  const patientId = searchParams.get('patient');
  const preAuthFromUrl = searchParams.get('preauth');
  const icdCodesFromUrl = searchParams.get('icd_codes');
  const admissionIdFromUrl = searchParams.get('admission_id');
  
  const [invoice, setInvoice] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [claimItems, setClaimItems] = useState<ClaimItem[]>([]);
  const [icdCodes, setIcdCodes] = useState<string[]>(icdCodesFromUrl ? icdCodesFromUrl.split(',').map(c => c.trim()).filter(Boolean) : []);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);

  const { data: patientInsurances } = usePatientInsurance(patientId || undefined);
  const createClaim = useCreateInsuranceClaim();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ClaimFormData>({
    defaultValues: {
      claim_date: format(new Date(), 'yyyy-MM-dd'),
      pre_auth_number: preAuthFromUrl || '',
    }
  });

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice(invoiceId);
    }
  }, [invoiceId]);

  // Auto-select primary insurance when patient insurances load
  useEffect(() => {
    if (patientInsurances?.length && !watch('patient_insurance_id')) {
      const primary = patientInsurances.find(ins => ins.is_primary) || patientInsurances[0];
      if (primary) {
        setValue('patient_insurance_id', primary.id);
      }
    }
  }, [patientInsurances]);

  const fetchInvoice = async (id: string) => {
    setIsLoadingInvoice(true);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          patient:patients(id, first_name, last_name, mr_number),
          invoice_items(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      setInvoice(data);
      setPatient(data.patient);

      // Convert invoice items to claim items
      if (data.invoice_items) {
        setClaimItems(data.invoice_items.map((item: any) => ({
          description: item.description,
          service_code: item.service_code || '',
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_amount: item.total_amount,
        })));
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
      toast.error('Failed to load invoice');
    } finally {
      setIsLoadingInvoice(false);
    }
  };


  const totalClaimAmount = claimItems.reduce((sum, item) => sum + item.total_amount, 0);

  const selectedInsurance = patientInsurances?.find(
    (ins) => ins.id === watch('patient_insurance_id')
  );

  const estimatedCoverage = selectedInsurance?.insurance_plan
    ? (totalClaimAmount * (selectedInsurance.insurance_plan.coverage_percentage || 0)) / 100
    : 0;

  const onSubmit = async (data: ClaimFormData) => {
    try {
      const icdCodesArray = icdCodes;

      await createClaim.mutateAsync({
        patient_insurance_id: data.patient_insurance_id,
        invoice_id: invoiceId || undefined,
        total_amount: totalClaimAmount,
        notes: data.notes,
        pre_auth_number: data.pre_auth_number || undefined,
        pre_auth_date: data.pre_auth_date || undefined,
        drg_code: data.drg_code || undefined,
        icd_codes: icdCodesArray,
        items: claimItems.map(item => ({
          description: item.description,
          service_code: item.service_code,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_amount: item.total_amount,
        })),
      } as any);

      toast.success('Claim created successfully');
      navigate('/app/billing/claims');
    } catch (error) {
      toast.error('Failed to create claim');
    }
  };

  const addItem = () => {
    setClaimItems([
      ...claimItems,
      { description: '', service_code: '', quantity: 1, unit_price: 0, total_amount: 0 }
    ]);
  };

  const removeItem = (index: number) => {
    setClaimItems(claimItems.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ClaimItem, value: any) => {
    const updated = [...claimItems];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'quantity' || field === 'unit_price') {
      updated[index].total_amount = updated[index].quantity * updated[index].unit_price;
    }
    
    setClaimItems(updated);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={id ? "Edit Claim" : "New Insurance Claim"}
        description="Create an insurance claim from invoice"
        actions={
          <Button variant="outline" onClick={() => navigate('/app/billing/claims')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Claims
          </Button>
        }
      />

      {isLoadingInvoice ? (
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Patient & Invoice Info */}
          {patient && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Patient Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Patient</Label>
                    <p className="font-medium">{patient.first_name} {patient.last_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">MR Number</Label>
                    <p className="font-medium">{patient.mr_number}</p>
                  </div>
                  {invoice && (
                    <>
                      <div>
                        <Label className="text-muted-foreground">Invoice</Label>
                        <p className="font-medium">{invoice.invoice_number}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Invoice Amount</Label>
                        <p className="font-medium">{formatCurrency(invoice.total_amount)}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Insurance Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Insurance Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Patient Insurance *</Label>
                  <Select
                    value={watch('patient_insurance_id')}
                    onValueChange={(value) => setValue('patient_insurance_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select insurance" />
                    </SelectTrigger>
                    <SelectContent>
                      {patientInsurances?.map((ins) => (
                        <SelectItem key={ins.id} value={ins.id}>
                          {ins.insurance_plan?.insurance_company?.name} - {ins.insurance_plan?.name}
                          {ins.is_primary && " (Primary)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Claim Date *</Label>
                  <Input type="date" {...register('claim_date', { required: true })} />
                </div>
              </div>

              {/* KSA Compliance Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pre-Auth Number</Label>
                  <Input
                    {...register('pre_auth_number')}
                    placeholder="Authorization number from insurer"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pre-Auth Date</Label>
                  <Input type="date" {...register('pre_auth_date')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <Label>ICD-10 Diagnosis Codes</Label>
                   <MedicalCodeSearch
                     codeType="icd10"
                     selectedCodes={icdCodes}
                     onCodesChange={setIcdCodes}
                   />
                   <p className="text-xs text-muted-foreground">Required for KSA insurance claims</p>
                 </div>
                <div className="space-y-2">
                  <Label>DRG Code</Label>
                  <Input
                    {...register('drg_code')}
                    placeholder="Diagnosis Related Group code"
                  />
                </div>
              </div>

              {selectedInsurance && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Policy #</span>
                      <p className="font-medium">{selectedInsurance.policy_number}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Coverage</span>
                      <p className="font-medium">{selectedInsurance.insurance_plan?.coverage_percentage}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Max Coverage</span>
                      <p className="font-medium">
                        {formatCurrency(selectedInsurance.insurance_plan?.max_coverage_amount || 0)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Copay</span>
                      <p className="font-medium">
                        {formatCurrency(selectedInsurance.insurance_plan?.copay_amount || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>


          {/* Claim Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Claim Items</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {claimItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <Input
                      className="col-span-4"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                    />
                    <div className="col-span-2">
                      <MedicalCodeSearch
                        codeType="cpt"
                        selectedCodes={item.service_code ? [item.service_code] : []}
                        onCodesChange={(codes) => updateItem(index, 'service_code', codes[codes.length - 1] || '')}
                        placeholder="CPT Code"
                      />
                    </div>
                    <Input
                      className="col-span-1"
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    />
                    <Input
                      className="col-span-2"
                      type="number"
                      min={0}
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                    />
                    <div className="col-span-2 text-right font-medium">
                      {formatCurrency(item.total_amount)}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="col-span-1"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t space-y-2">
                <div className="flex justify-between">
                  <span>Total Claim Amount</span>
                  <span className="font-bold text-lg">{formatCurrency(totalClaimAmount)}</span>
                </div>
                {selectedInsurance && (
                  <>
                    <div className="flex justify-between text-green-600">
                      <span>Estimated Coverage ({selectedInsurance.insurance_plan?.coverage_percentage}%)</span>
                      <span className="font-medium">{formatCurrency(estimatedCoverage)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Patient Responsibility (Est.)</span>
                      <span>{formatCurrency(totalClaimAmount - estimatedCoverage)}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                {...register('notes')}
                placeholder="Any additional notes for the claim..."
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/app/billing/claims')}>
              Cancel
            </Button>
            <Button type="submit" disabled={createClaim.isPending}>
              {createClaim.isPending ? "Creating..." : "Create Claim"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
