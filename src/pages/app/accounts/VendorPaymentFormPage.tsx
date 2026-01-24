import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, Banknote, Building2, CreditCard } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useVendors, useVendor } from "@/hooks/useVendors";
import { useCreateVendorPayment, useVendorOutstandingBalance } from "@/hooks/useVendorPayments";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function VendorPaymentFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile } = useAuth();
  
  const preSelectedVendorId = searchParams.get("vendorId") || "";
  const preSelectedGrnId = searchParams.get("grnId") || "";
  
  const [vendorId, setVendorId] = useState(preSelectedVendorId);
  const [grnId, setGrnId] = useState(preSelectedGrnId);
  const [paymentDate, setPaymentDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [amount, setAmount] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [bankAccountId, setBankAccountId] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  
  const { data: vendors, isLoading: vendorsLoading } = useVendors();
  const { data: selectedVendor } = useVendor(vendorId);
  const { data: outstandingData, isLoading: outstandingLoading } = useVendorOutstandingBalance(vendorId);
  const createPayment = useCreateVendorPayment();
  
  // Fetch payment methods
  const { data: paymentMethods } = useQuery({
    queryKey: ["payment-methods", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });
  
  // Fetch bank accounts
  const { data: bankAccounts } = useQuery({
    queryKey: ["bank-accounts", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("is_active", true)
        .order("bank_name");
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });
  
  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString('en-PK', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  // Set amount when GRN is selected
  useEffect(() => {
    if (grnId && outstandingData?.outstandingItems) {
      const selectedGrn = outstandingData.outstandingItems.find(item => item.id === grnId);
      if (selectedGrn) {
        setAmount(selectedGrn.outstanding.toString());
      }
    }
  }, [grnId, outstandingData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vendorId || !amount || !paymentDate) {
      return;
    }
    
    await createPayment.mutateAsync({
      vendor_id: vendorId,
      grn_id: grnId || null,
      payment_date: paymentDate,
      amount: parseFloat(amount),
      payment_method_id: paymentMethodId || null,
      bank_account_id: bankAccountId || null,
      reference_number: referenceNumber || null,
      notes: notes || null,
    });
    
    navigate("/app/accounts/vendor-payments");
  };

  const isFormValid = vendorId && amount && parseFloat(amount) > 0 && paymentDate;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Record Vendor Payment"
        description="Record a payment to a vendor"
        breadcrumbs={[
          { label: "Accounts", href: "/app/accounts" },
          { label: "Vendor Payments", href: "/app/accounts/vendor-payments" },
          { label: "New Payment" },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Payment Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Vendor Selection */}
                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendor *</Label>
                  <Select value={vendorId} onValueChange={setVendorId}>
                    <SelectTrigger id="vendor">
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors?.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.name} ({vendor.vendor_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Outstanding Invoices */}
                {vendorId && (
                  <div className="space-y-2">
                    <Label htmlFor="grn">Apply to Invoice (Optional)</Label>
                    {outstandingLoading ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <Select value={grnId} onValueChange={setGrnId}>
                        <SelectTrigger id="grn">
                          <SelectValue placeholder="Select invoice to pay" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">General Payment</SelectItem>
                          {outstandingData?.outstandingItems?.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.grn_number} - {item.invoice_number || "No Invoice"} 
                              ({formatCurrency(item.outstanding)} outstanding)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Payment Date */}
                  <div className="space-y-2">
                    <Label htmlFor="date">Payment Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      required
                    />
                  </div>
                  
                  {/* Amount */}
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (Rs.) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Payment Method */}
                  <div className="space-y-2">
                    <Label htmlFor="method">Payment Method</Label>
                    <Select value={paymentMethodId} onValueChange={setPaymentMethodId}>
                      <SelectTrigger id="method">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods?.map((method) => (
                          <SelectItem key={method.id} value={method.id}>
                            {method.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Bank Account */}
                  <div className="space-y-2">
                    <Label htmlFor="bank">Bank Account</Label>
                    <Select value={bankAccountId} onValueChange={setBankAccountId}>
                      <SelectTrigger id="bank">
                        <SelectValue placeholder="Select bank account" />
                      </SelectTrigger>
                      <SelectContent>
                        {bankAccounts?.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.bank_name} - {account.account_number}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Reference Number */}
                <div className="space-y-2">
                  <Label htmlFor="reference">Reference / Cheque Number</Label>
                  <Input
                    id="reference"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="e.g., CHQ-12345"
                  />
                </div>
                
                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column - Vendor Summary */}
          <div className="space-y-6">
            {/* Vendor Info */}
            {selectedVendor && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Vendor Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-medium">{selectedVendor.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedVendor.vendor_code}</p>
                  </div>
                  {selectedVendor.contact_person && (
                    <div>
                      <p className="text-sm text-muted-foreground">Contact</p>
                      <p className="font-medium">{selectedVendor.contact_person}</p>
                    </div>
                  )}
                  {selectedVendor.phone && (
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p>{selectedVendor.phone}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Outstanding Balance */}
            {vendorId && outstandingData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Banknote className="h-5 w-5" />
                    Outstanding Balance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Payable</span>
                    <span className="font-medium">{formatCurrency(outstandingData.totalPayable)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Paid</span>
                    <span className="font-medium text-green-600">{formatCurrency(outstandingData.totalPaid)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Outstanding</span>
                    <span className="font-bold text-lg text-red-600">
                      {formatCurrency(outstandingData.outstanding)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={!isFormValid || createPayment.isPending}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {createPayment.isPending ? "Recording..." : "Record Payment"}
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              Payment will be created as "Pending" and require approval to post to the ledger.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
