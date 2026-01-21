import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Banknote, CreditCard, Building2, Building } from "lucide-react";
import { cn } from "@/lib/utils";

export type PaymentMode = "cash" | "insurance" | "corporate" | "government";

interface PaymentModeSelectorProps {
  value: PaymentMode;
  onChange: (mode: PaymentMode) => void;
  insuranceFields?: {
    providerId?: string;
    policyNumber?: string;
    authorizationNumber?: string;
  };
  onInsuranceFieldsChange?: (fields: {
    providerId?: string;
    policyNumber?: string;
    authorizationNumber?: string;
  }) => void;
  corporateFields?: {
    corporateId?: string;
    employeeId?: string;
    creditLimit?: number;
  };
  onCorporateFieldsChange?: (fields: {
    corporateId?: string;
    employeeId?: string;
    creditLimit?: number;
  }) => void;
  className?: string;
}

const paymentModes = [
  { value: "cash" as PaymentMode, label: "Cash", icon: Banknote },
  { value: "insurance" as PaymentMode, label: "Insurance", icon: CreditCard },
  { value: "corporate" as PaymentMode, label: "Corporate", icon: Building2 },
  { value: "government" as PaymentMode, label: "Government", icon: Building },
];

export function PaymentModeSelector({
  value,
  onChange,
  insuranceFields,
  onInsuranceFieldsChange,
  corporateFields,
  onCorporateFieldsChange,
  className,
}: PaymentModeSelectorProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <Label>Payment Mode</Label>
      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as PaymentMode)}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {paymentModes.map((mode) => {
          const Icon = mode.icon;
          return (
            <Label
              key={mode.value}
              htmlFor={`payment-mode-${mode.value}`}
              className={cn(
                "flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors",
                value === mode.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <RadioGroupItem
                value={mode.value}
                id={`payment-mode-${mode.value}`}
                className="sr-only"
              />
              <Icon className={cn(
                "h-4 w-4",
                value === mode.value ? "text-primary" : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-sm font-medium",
                value === mode.value ? "text-primary" : ""
              )}>
                {mode.label}
              </span>
            </Label>
          );
        })}
      </RadioGroup>

      {/* Insurance Fields */}
      {value === "insurance" && onInsuranceFieldsChange && (
        <div className="grid gap-4 md:grid-cols-2 p-4 border rounded-lg bg-muted/30">
          <div className="space-y-2">
            <Label htmlFor="insurance-provider">Insurance Provider</Label>
            <Select
              value={insuranceFields?.providerId || ""}
              onValueChange={(v) =>
                onInsuranceFieldsChange({ ...insuranceFields, providerId: v })
              }
            >
              <SelectTrigger id="insurance-provider">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="state-life">State Life Insurance</SelectItem>
                <SelectItem value="jubilee">Jubilee Insurance</SelectItem>
                <SelectItem value="adamjee">Adamjee Insurance</SelectItem>
                <SelectItem value="efu">EFU Life</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="policy-number">Policy Number</Label>
            <Input
              id="policy-number"
              value={insuranceFields?.policyNumber || ""}
              onChange={(e) =>
                onInsuranceFieldsChange({ ...insuranceFields, policyNumber: e.target.value })
              }
              placeholder="Enter policy number"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="auth-number">Authorization Number (if approved)</Label>
            <Input
              id="auth-number"
              value={insuranceFields?.authorizationNumber || ""}
              onChange={(e) =>
                onInsuranceFieldsChange({ ...insuranceFields, authorizationNumber: e.target.value })
              }
              placeholder="Pre-authorization number"
            />
          </div>
        </div>
      )}

      {/* Corporate Fields */}
      {value === "corporate" && onCorporateFieldsChange && (
        <div className="grid gap-4 md:grid-cols-2 p-4 border rounded-lg bg-muted/30">
          <div className="space-y-2">
            <Label htmlFor="corporate">Corporate Panel</Label>
            <Select
              value={corporateFields?.corporateId || ""}
              onValueChange={(v) =>
                onCorporateFieldsChange({ ...corporateFields, corporateId: v })
              }
            >
              <SelectTrigger id="corporate">
                <SelectValue placeholder="Select corporate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ptcl">PTCL</SelectItem>
                <SelectItem value="pso">Pakistan State Oil</SelectItem>
                <SelectItem value="ogdcl">OGDCL</SelectItem>
                <SelectItem value="sui-gas">Sui Gas</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="employee-id">Employee ID</Label>
            <Input
              id="employee-id"
              value={corporateFields?.employeeId || ""}
              onChange={(e) =>
                onCorporateFieldsChange({ ...corporateFields, employeeId: e.target.value })
              }
              placeholder="Corporate employee ID"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="credit-limit">Credit Limit</Label>
            <Input
              id="credit-limit"
              type="number"
              value={corporateFields?.creditLimit || ""}
              onChange={(e) =>
                onCorporateFieldsChange({ 
                  ...corporateFields, 
                  creditLimit: parseFloat(e.target.value) || 0 
                })
              }
              placeholder="Approved credit limit"
            />
          </div>
        </div>
      )}

      {/* Government - just note */}
      {value === "government" && (
        <div className="p-4 border rounded-lg bg-muted/30">
          <p className="text-sm text-muted-foreground">
            Government panel patient. Ensure required documentation is collected 
            (CNIC, referral letter, etc.)
          </p>
        </div>
      )}
    </div>
  );
}
