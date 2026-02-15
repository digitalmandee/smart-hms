import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Stethoscope, 
  Syringe, 
  Users, 
  Building2, 
  Package, 
  HeartPulse,
  Calculator 
} from "lucide-react";
import { SurgeryCharges, calculateSurgeryChargesTotal } from "@/hooks/useSurgeonFeeTemplates";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";

interface SurgeryPricingBreakdownProps {
  charges: SurgeryCharges;
  onChange: (charges: SurgeryCharges) => void;
  disabled?: boolean;
  showTotal?: boolean;
}

export function SurgeryPricingBreakdown({
  charges,
  onChange,
  disabled = false,
  showTotal = true,
}: SurgeryPricingBreakdownProps) {
  const { formatCurrency, currencySymbol } = useCurrencyFormatter();
  const handleChange = (field: keyof Omit<SurgeryCharges, "total">, value: number) => {
    const newCharges = { ...charges, [field]: value };
    newCharges.total = calculateSurgeryChargesTotal(newCharges);
    onChange(newCharges);
  };

  const total = calculateSurgeryChargesTotal(charges);

  const chargeFields: {
    key: keyof Omit<SurgeryCharges, "total">;
    label: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      key: "surgeon_fee",
      label: "Surgeon Fee",
      icon: <Stethoscope className="h-4 w-4" />,
      color: "text-blue-600",
    },
    {
      key: "anesthesia_fee",
      label: "Anesthesia Fee",
      icon: <Syringe className="h-4 w-4" />,
      color: "text-purple-600",
    },
    {
      key: "nursing_fee",
      label: "Nursing Charges",
      icon: <Users className="h-4 w-4" />,
      color: "text-green-600",
    },
    {
      key: "ot_room_fee",
      label: "OT Room Charges",
      icon: <Building2 className="h-4 w-4" />,
      color: "text-orange-600",
    },
    {
      key: "consumables_fee",
      label: "Consumables",
      icon: <Package className="h-4 w-4" />,
      color: "text-cyan-600",
    },
    {
      key: "recovery_fee",
      label: "Recovery/PACU",
      icon: <HeartPulse className="h-4 w-4" />,
      color: "text-rose-600",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Surgery Charges Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {chargeFields.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1.5">
                <span className={field.color}>{field.icon}</span>
                {field.label}
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  {currencySymbol}
                </span>
                <Input
                  type="number"
                  min={0}
                  value={charges[field.key] || 0}
                  onChange={(e) =>
                    handleChange(field.key, parseFloat(e.target.value) || 0)
                  }
                  disabled={disabled}
                  className="pl-10 text-right h-9"
                />
              </div>
            </div>
          ))}
        </div>

        {showTotal && (
          <>
            <Separator className="my-3" />
            <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
              <span className="font-medium">Total Surgery Cost</span>
              <Badge variant="default" className="text-lg px-3 py-1">
                {formatCurrency(total)}
              </Badge>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
