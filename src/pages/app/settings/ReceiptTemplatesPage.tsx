import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, FileText, Save, Loader2, Eye } from "lucide-react";

export default function ReceiptTemplatesPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [receiptHeader, setReceiptHeader] = useState("");
  const [receiptFooter, setReceiptFooter] = useState("");
  const [termsConditions, setTermsConditions] = useState("");
  const [thankYouMessage, setThankYouMessage] = useState("Thank you for choosing our services!");

  // Fetch organization settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["receipt-settings", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return null;
      const { data, error } = await supabase
        .from("organization_settings")
        .select("setting_key, setting_value")
        .eq("organization_id", profile.organization_id)
        .in("setting_key", [
          "receipt_header",
          "receipt_footer",
          "receipt_terms",
          "receipt_thank_you",
        ]);
      if (error) throw error;

      const settingsMap = Object.fromEntries(
        data.map((s) => [s.setting_key, s.setting_value])
      );

      setReceiptHeader(settingsMap.receipt_header || "");
      setReceiptFooter(settingsMap.receipt_footer || "");
      setTermsConditions(settingsMap.receipt_terms || "");
      setThankYouMessage(
        settingsMap.receipt_thank_you || "Thank you for choosing our services!"
      );

      return settingsMap;
    },
    enabled: !!profile?.organization_id,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.organization_id) throw new Error("Organization not found");

      const settingsToSave = [
        { key: "receipt_header", value: receiptHeader },
        { key: "receipt_footer", value: receiptFooter },
        { key: "receipt_terms", value: termsConditions },
        { key: "receipt_thank_you", value: thankYouMessage },
      ];

      for (const setting of settingsToSave) {
        const { error } = await supabase
          .from("organization_settings")
          .upsert(
            {
              organization_id: profile.organization_id,
              setting_key: setting.key,
              setting_value: setting.value,
            },
            {
              onConflict: "organization_id,setting_key",
            }
          );
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receipt-settings"] });
      toast({
        title: "Settings Saved",
        description: "Receipt templates have been updated successfully.",
      });
    },
    onError: (error) => {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save receipt settings.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Receipt Templates</h1>
          <p className="text-muted-foreground">
            Customize the content on your receipts and invoices
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Header Content
              </CardTitle>
              <CardDescription>
                Additional text that appears at the top of receipts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="header">Header Text</Label>
                <Textarea
                  id="header"
                  placeholder="Enter header text (e.g., address, contact info)"
                  value={receiptHeader}
                  onChange={(e) => setReceiptHeader(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Footer Content</CardTitle>
              <CardDescription>
                Text that appears at the bottom of receipts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="footer">Footer Text</Label>
                <Textarea
                  id="footer"
                  placeholder="Enter footer text"
                  value={receiptFooter}
                  onChange={(e) => setReceiptFooter(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thank-you">Thank You Message</Label>
                <Input
                  id="thank-you"
                  placeholder="Thank you for choosing our services!"
                  value={thankYouMessage}
                  onChange={(e) => setThankYouMessage(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Terms & Conditions</CardTitle>
              <CardDescription>
                Terms printed on receipts and invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter terms and conditions..."
                value={termsConditions}
                onChange={(e) => setTermsConditions(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Templates
            </Button>
          </div>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview
            </CardTitle>
            <CardDescription>
              How your receipt will look
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-6 bg-white text-black font-mono text-sm space-y-4">
              <div className="text-center border-b pb-4">
                <div className="font-bold text-lg">RECEIPT</div>
                {receiptHeader && (
                  <div className="text-xs mt-2 whitespace-pre-wrap">
                    {receiptHeader}
                  </div>
                )}
              </div>

              <div className="space-y-2 py-4 border-b">
                <div className="flex justify-between">
                  <span>Service Item 1</span>
                  <span>Rs. 1,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Item 2</span>
                  <span>Rs. 500</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>Rs. 1,500</span>
                </div>
              </div>

              {termsConditions && (
                <div className="text-xs text-gray-600 border-b pb-4">
                  <div className="font-semibold mb-1">Terms & Conditions:</div>
                  <div className="whitespace-pre-wrap">{termsConditions}</div>
                </div>
              )}

              <div className="text-center pt-2">
                <div className="text-sm">{thankYouMessage}</div>
                {receiptFooter && (
                  <div className="text-xs mt-2 text-gray-600 whitespace-pre-wrap">
                    {receiptFooter}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
