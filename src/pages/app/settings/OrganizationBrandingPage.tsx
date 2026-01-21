import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOrganizationBranding, useUpdateOrganizationBranding, BrandingUpdatePayload } from "@/hooks/useOrganizationBranding";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Palette, Image, FileText, Receipt, Ticket, Save, Loader2 } from "lucide-react";

export default function OrganizationBrandingPage() {
  const navigate = useNavigate();
  const { data: branding, isLoading } = useOrganizationBranding();
  const updateBranding = useUpdateOrganizationBranding();

  // Form state
  const [formData, setFormData] = useState<BrandingUpdatePayload>({
    logo_url: "",
    primary_color: "#0d9488",
    secondary_color: "#64748b",
    registration_number: "",
    tax_id: "",
    invoice_terms: "",
    invoice_payment_instructions: "",
    receipt_header: "",
    receipt_footer: "",
    thank_you_message: "",
    token_slip_message: "",
    token_slip_footer: "",
    show_qr_on_token: true,
    show_payment_on_token: true,
  });

  // Populate form when branding loads
  useEffect(() => {
    if (branding) {
      setFormData({
        logo_url: branding.logo_url || "",
        primary_color: branding.primary_color,
        secondary_color: branding.secondary_color,
        registration_number: branding.registration_number || "",
        tax_id: branding.tax_id || "",
        invoice_terms: branding.invoice_terms || "",
        invoice_payment_instructions: branding.invoice_payment_instructions || "",
        receipt_header: branding.receipt_header || "",
        receipt_footer: branding.receipt_footer || "",
        thank_you_message: branding.thank_you_message,
        token_slip_message: branding.token_slip_message,
        token_slip_footer: branding.token_slip_footer,
        show_qr_on_token: branding.show_qr_on_token,
        show_payment_on_token: branding.show_payment_on_token,
      });
    }
  }, [branding]);

  const handleChange = (field: keyof BrandingUpdatePayload, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateBranding.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Organization Branding</h1>
            <p className="text-muted-foreground">
              Customize your organization's visual identity and document settings
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={updateBranding.isPending}>
          {updateBranding.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save All Changes
        </Button>
      </div>

      <Tabs defaultValue="identity" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="identity" className="gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Visual Identity</span>
          </TabsTrigger>
          <TabsTrigger value="invoice" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Invoice</span>
          </TabsTrigger>
          <TabsTrigger value="receipt" className="gap-2">
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">Receipt</span>
          </TabsTrigger>
          <TabsTrigger value="token" className="gap-2">
            <Ticket className="h-4 w-4" />
            <span className="hidden sm:inline">Token Slip</span>
          </TabsTrigger>
        </TabsList>

        {/* Visual Identity Tab */}
        <TabsContent value="identity" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Logo
                </CardTitle>
                <CardDescription>Your organization's logo for all documents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logo-url">Logo URL</Label>
                  <Input
                    id="logo-url"
                    placeholder="https://example.com/logo.png"
                    value={formData.logo_url}
                    onChange={(e) => handleChange("logo_url", e.target.value)}
                  />
                </div>
                {formData.logo_url && (
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                    <img
                      src={formData.logo_url}
                      alt="Logo preview"
                      className="max-h-16 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Brand Colors
                </CardTitle>
                <CardDescription>Colors used for accents and highlights</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => handleChange("primary_color", e.target.value)}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={formData.primary_color}
                      onChange={(e) => handleChange("primary_color", e.target.value)}
                      className="flex-1 font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.secondary_color}
                      onChange={(e) => handleChange("secondary_color", e.target.value)}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={formData.secondary_color}
                      onChange={(e) => handleChange("secondary_color", e.target.value)}
                      className="flex-1 font-mono"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Business Registration</CardTitle>
                <CardDescription>Legal identifiers shown on invoices</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="registration">Registration / License Number</Label>
                  <Input
                    id="registration"
                    placeholder="REG-12345"
                    value={formData.registration_number}
                    onChange={(e) => handleChange("registration_number", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax-id">Tax ID / NTN Number</Label>
                  <Input
                    id="tax-id"
                    placeholder="NTN-9876543"
                    value={formData.tax_id}
                    onChange={(e) => handleChange("tax_id", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Invoice Tab */}
        <TabsContent value="invoice" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Settings</CardTitle>
              <CardDescription>Customize the content that appears on printed invoices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invoice-terms">Terms & Conditions</Label>
                <Textarea
                  id="invoice-terms"
                  placeholder="Payment is due upon receipt. Thank you for choosing our services."
                  value={formData.invoice_terms}
                  onChange={(e) => handleChange("invoice_terms", e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  This text appears at the bottom of all invoices
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-instructions">Payment Instructions</Label>
                <Textarea
                  id="payment-instructions"
                  placeholder="Bank: ABC Bank&#10;Account: 1234567890&#10;IBAN: PK00ABCD1234567890"
                  value={formData.invoice_payment_instructions}
                  onChange={(e) => handleChange("invoice_payment_instructions", e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Bank details or payment methods (optional)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 bg-white text-black max-w-md">
                <div className="text-center border-b pb-4 mb-4">
                  {formData.logo_url && (
                    <img src={formData.logo_url} alt="Logo" className="h-10 mx-auto mb-2" />
                  )}
                  <h3 className="font-bold">{branding?.name || "Your Organization"}</h3>
                </div>
                <div className="text-xs text-gray-600 border-t pt-4 mt-4 space-y-2">
                  <p className="font-medium">Terms & Conditions:</p>
                  <p className="whitespace-pre-wrap">{formData.invoice_terms || "Not set"}</p>
                  {formData.invoice_payment_instructions && (
                    <>
                      <p className="font-medium mt-2">Payment Instructions:</p>
                      <p className="whitespace-pre-wrap">{formData.invoice_payment_instructions}</p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Receipt Tab */}
        <TabsContent value="receipt" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Receipt Settings</CardTitle>
              <CardDescription>Customize headers and footers for payment receipts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="receipt-header">Receipt Header</Label>
                <Textarea
                  id="receipt-header"
                  placeholder="Additional text to appear below organization name"
                  value={formData.receipt_header}
                  onChange={(e) => handleChange("receipt_header", e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receipt-footer">Receipt Footer</Label>
                <Textarea
                  id="receipt-footer"
                  placeholder="Additional notes or legal text"
                  value={formData.receipt_footer}
                  onChange={(e) => handleChange("receipt_footer", e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thank-you">Thank You Message</Label>
                <Input
                  id="thank-you"
                  placeholder="Thank you for your payment!"
                  value={formData.thank_you_message}
                  onChange={(e) => handleChange("thank_you_message", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Receipt Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-white text-black max-w-xs mx-auto font-mono text-xs">
                <div className="text-center border-b border-dashed pb-2 mb-2">
                  <p className="font-bold">{branding?.name || "Your Organization"}</p>
                  {formData.receipt_header && (
                    <p className="text-gray-600 whitespace-pre-wrap">{formData.receipt_header}</p>
                  )}
                </div>
                <div className="py-4 text-center text-gray-400">[Receipt Content]</div>
                <div className="text-center border-t border-dashed pt-2 mt-2 space-y-1">
                  <p className="font-medium">{formData.thank_you_message}</p>
                  {formData.receipt_footer && (
                    <p className="text-gray-500 whitespace-pre-wrap">{formData.receipt_footer}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Token Slip Tab */}
        <TabsContent value="token" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Token Slip Settings</CardTitle>
              <CardDescription>Customize OPD token slips given to patients</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token-message">Token Message</Label>
                <Input
                  id="token-message"
                  placeholder="Please wait for your number to be called"
                  value={formData.token_slip_message}
                  onChange={(e) => handleChange("token_slip_message", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Message shown below the token number
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="token-footer">Token Footer</Label>
                <Input
                  id="token-footer"
                  placeholder="Keep this slip for reference"
                  value={formData.token_slip_footer}
                  onChange={(e) => handleChange("token_slip_footer", e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label>Show QR Code</Label>
                  <p className="text-xs text-muted-foreground">Display verification QR on token</p>
                </div>
                <Switch
                  checked={formData.show_qr_on_token}
                  onCheckedChange={(checked) => handleChange("show_qr_on_token", checked)}
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label>Show Payment Info</Label>
                  <p className="text-xs text-muted-foreground">Display payment details on token</p>
                </div>
                <Switch
                  checked={formData.show_payment_on_token}
                  onCheckedChange={(checked) => handleChange("show_payment_on_token", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Token Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-white text-black max-w-xs mx-auto">
                <div className="text-center border-b-2 border-dashed pb-3 mb-3">
                  {formData.logo_url && (
                    <img src={formData.logo_url} alt="Logo" className="h-8 mx-auto mb-2" />
                  )}
                  <p className="font-bold">{branding?.name || "Your Organization"}</p>
                </div>
                <div className="text-center mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wide">OPD Token</p>
                </div>
                <div className="text-center my-4">
                  <div className="text-5xl font-bold font-mono">#42</div>
                </div>
                <div className="text-center text-xs text-gray-600 border-t border-dashed pt-3">
                  <p>{formData.token_slip_message}</p>
                </div>
                {formData.show_qr_on_token && (
                  <div className="text-center my-3 border-t border-dashed pt-3">
                    <div className="w-16 h-16 bg-gray-200 mx-auto flex items-center justify-center text-xs text-gray-400">
                      [QR Code]
                    </div>
                  </div>
                )}
                <div className="text-center text-xs text-gray-500 mt-3 pt-2 border-t border-dashed">
                  <p>{formData.token_slip_footer}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
