import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface PasswordStrengthIndicatorProps {
  password: string;
}

const getRequirements = (password: string, t: (key: string) => string) => [
  { label: t("password.req_length"), met: password.length >= 12 },
  { label: t("password.req_uppercase"), met: /[A-Z]/.test(password) },
  { label: t("password.req_lowercase"), met: /[a-z]/.test(password) },
  { label: t("password.req_number"), met: /\d/.test(password) },
  { label: t("password.req_special"), met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) },
];

function getStrengthLevel(metCount: number): { label: string; color: string; key: string } {
  if (metCount <= 1) return { label: "Weak", color: "bg-destructive", key: "password.strength_weak" };
  if (metCount <= 3) return { label: "Fair", color: "bg-warning", key: "password.strength_fair" };
  if (metCount <= 4) return { label: "Strong", color: "bg-success", key: "password.strength_strong" };
  return { label: "Excellent", color: "bg-primary", key: "password.strength_excellent" };
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const { t } = useTranslation();
  
  if (!password) return null;

  const requirements = getRequirements(password, t);
  const metCount = requirements.filter(r => r.met).length;
  const strength = getStrengthLevel(metCount);
  const percentage = (metCount / requirements.length) * 100;

  return (
    <div className="space-y-2 mt-2">
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-300", strength.color)}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className={cn("text-xs font-medium", 
          metCount <= 1 ? "text-destructive" : 
          metCount <= 3 ? "text-warning" : "text-success"
        )}>
          {t(strength.key as any)}
        </span>
      </div>

      {/* Requirements checklist */}
      <div className="space-y-0.5">
        {requirements.map((req, i) => (
          <div key={i} className={cn("flex items-center gap-1.5 text-xs", 
            req.met ? "text-success" : "text-muted-foreground"
          )}>
            {req.met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            {req.label}
          </div>
        ))}
      </div>
    </div>
  );
}
