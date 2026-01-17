import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, Save, Receipt, AlertTriangle, CreditCard, Building2 } from "lucide-react";
import { usePharmacySettings, useUpdatePharmacySettings, PharmacySettingsUpdate } from "@/hooks/usePharmacySettings";
import { Skeleton } from "@/components/ui/skeleton";

export default function PharmacySettingsPage() {
  const { data: settings, isLoading } = usePharmacySettings();
  const updateSettings = useUpdatePharmacySettings();

  const [formData, setFormData] = useState<PharmacySettingsUpdate>({
    default_tax_rate: 0,
    receipt_header: "",
    receipt_footer: "Thank you for your purchase!",
    low_stock_threshold: 10,
    expiry_alert_days: 30,
    require_customer_name: false,
    allow_held_transactions: true,
    auto_print_receipt: true,
    require_prescription_for_controlled: false,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        default_tax_rate: settings.default_tax_rate,
        receipt_header: settings.receipt_header || "",
        receipt_footer: settings.receipt_footer,
        low_stock_threshold: settings.low_stock_threshold,
        expiry_alert_days: settings.expiry_alert_days,
        require_customer_name: settings.require_customer_name,
        allow_held_transactions: settings.allow_held_transactions,
        auto_print_receipt: settings.auto_print_receipt,
        require_prescription_for_controlled: settings.require_prescription_for_controlled,
      });
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Pharmacy Settings
          </h1>
          <p className="text-muted-foreground">
            Configure pharmacy operations, POS behavior, and receipt settings
          </p>
        </div>
        <Button onClick={handleSave} disabled={updateSettings.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {updateSettings.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alerts & Thresholds
            </CardTitle>
            <CardDescription>
              Configure stock alerts and expiry notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tax-rate">Default Tax Rate (%)</Label>
              <Input
                id="tax-rate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.default_tax_rate}
                onChange={(e) =>
                  setFormData({ ...formData, default_tax_rate: parseFloat(e.target.value) || 0 })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="low-stock">Low Stock Alert Threshold (units)</Label>
              <Input
                id="low-stock"
                type="number"
                min="1"
                value={formData.low_stock_threshold}
                onChange={(e) =>
                  setFormData({ ...formData, low_stock_threshold: parseInt(e.target.value) || 10 })
                }
              />
              <p className="text-xs text-muted-foreground">
                Alert when stock falls below this quantity
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry-days">Expiry Alert Days</Label>
              <Input
                id="expiry-days"
                type="number"
                min="1"
                value={formData.expiry_alert_days}
                onChange={(e) =>
                  setFormData({ ...formData, expiry_alert_days: parseInt(e.target.value) || 30 })
                }
              />
              <p className="text-xs text-muted-foreground">
                Alert when medicines expire within this many days
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Receipt Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Receipt Settings
            </CardTitle>
            <CardDescription>
              Customize receipt header and footer text
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="receipt-header">Receipt Header</Label>
              <Textarea
                id="receipt-header"
                placeholder="Your pharmacy name and address..."
                value={formData.receipt_header || ""}
                onChange={(e) =>
                  setFormData({ ...formData, receipt_header: e.target.value })
                }
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Appears at the top of each receipt
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt-footer">Receipt Footer</Label>
              <Textarea
                id="receipt-footer"
                placeholder="Thank you message..."
                value={formData.receipt_footer}
                onChange={(e) =>
                  setFormData({ ...formData, receipt_footer: e.target.value })
                }
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                Appears at the bottom of each receipt
              </p>
            </div>
          </CardContent>
        </Card>

        {/* POS Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              POS Behavior
            </CardTitle>
            <CardDescription>
              Configure point-of-sale terminal options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Held Transactions</Label>
                <p className="text-xs text-muted-foreground">
                  Enable holding and recalling transactions
                </p>
              </div>
              <Switch
                checked={formData.allow_held_transactions}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, allow_held_transactions: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Print Receipt</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically print after each sale
                </p>
              </div>
              <Switch
                checked={formData.auto_print_receipt}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, auto_print_receipt: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Customer Name</Label>
                <p className="text-xs text-muted-foreground">
                  Mandate customer info for all sales
                </p>
              </div>
              <Switch
                checked={formData.require_customer_name}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, require_customer_name: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Prescription for Controlled</Label>
                <p className="text-xs text-muted-foreground">
                  Block sales of controlled drugs without Rx
                </p>
              </div>
              <Switch
                checked={formData.require_prescription_for_controlled}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, require_prescription_for_controlled: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Linked Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Linked Accounts
            </CardTitle>
            <CardDescription>
              Link pharmacy transactions to accounting ledgers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Account linking is configured automatically. Journal entries are created for:
            </p>
            <ul className="text-sm space-y-2 list-disc list-inside text-muted-foreground">
              <li>POS Sales → Revenue Account (Credit)</li>
              <li>POS Sales → COGS Account (Debit)</li>
              <li>GRN Verification → Inventory Asset (Debit)</li>
              <li>GRN Verification → Accounts Payable (Credit)</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-4">
              Default accounts are created automatically if they don't exist.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
