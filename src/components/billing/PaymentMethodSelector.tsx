import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePaymentMethods } from "@/hooks/useBilling";
import { Banknote, CreditCard, Smartphone, Building2 } from "lucide-react";

interface PaymentMethodSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

const iconMap: Record<string, React.ReactNode> = {
  cash: <Banknote className="h-4 w-4" />,
  card: <CreditCard className="h-4 w-4" />,
  upi: <Smartphone className="h-4 w-4" />,
  bank: <Building2 className="h-4 w-4" />,
};

export function PaymentMethodSelector({
  value,
  onValueChange,
  disabled,
}: PaymentMethodSelectorProps) {
  const { data: methods, isLoading } = usePaymentMethods();

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled || isLoading}>
      <SelectTrigger>
        <SelectValue placeholder="Select payment method" />
      </SelectTrigger>
      <SelectContent>
        {methods?.map((method) => (
          <SelectItem key={method.id} value={method.id}>
            <div className="flex items-center gap-2">
              {iconMap[method.code.toLowerCase()] || <Banknote className="h-4 w-4" />}
              <span>{method.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
