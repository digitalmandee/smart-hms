import { useQuery } from "@tanstack/react-query";
import { CreditCard, Smartphone, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type GatewayProvider = "hyperpay" | "tap" | "stcpay";

const ICONS: Record<GatewayProvider, typeof CreditCard> = {
  hyperpay: CreditCard,
  tap: Wallet,
  stcpay: Smartphone,
};

export interface PaymentMethodPickerProps {
  value: GatewayProvider | null;
  onChange: (provider: GatewayProvider) => void;
  className?: string;
}

export function PaymentMethodPicker({ value, onChange, className }: PaymentMethodPickerProps) {
  const { profile } = useAuth();
  const { t } = useTranslation();

  const { data } = useQuery({
    queryKey: ["payment_gateway_settings_enabled", profile?.organization_id],
    enabled: !!profile?.organization_id,
    queryFn: async () => {
      const { data } = await supabase
        .from("payment_gateway_settings")
        .select("provider, enabled")
        .eq("organization_id", profile!.organization_id!)
        .eq("enabled", true);
      return (data ?? []) as { provider: GatewayProvider; enabled: boolean }[];
    },
  });

  const providers = (data ?? []).map((d) => d.provider);
  if (providers.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="text-sm font-medium">{t("payments.method.title")}</div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {providers.map((p) => {
          const Icon = ICONS[p];
          const active = value === p;
          return (
            <Button
              key={p}
              type="button"
              variant={active ? "default" : "outline"}
              className={cn("h-auto py-3 justify-start gap-2")}
              onClick={() => onChange(p)}
            >
              <Icon className="h-4 w-4" />
              <span className="text-xs">{t(`payments.method.${p}` as any)}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
