import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, Info, CheckCircle, Lightbulb } from "lucide-react";
import { ScrubResult, hasErrors, hasWarnings } from "@/lib/claimScrubber";
import { useTranslation } from "@/lib/i18n";

interface ClaimScrubResultsProps {
  results: ScrubResult[];
  className?: string;
}

const severityConfig = {
  error: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10 border-destructive/30", label: "Error" },
  warning: { icon: AlertTriangle, color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-700", label: "Warning" },
  info: { icon: Info, color: "text-blue-600", bg: "bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-700", label: "Info" },
};

export function ClaimScrubResults({ results, className }: ClaimScrubResultsProps) {
  const { t } = useTranslation();

  if (results.length === 0) return null;

  const errors = results.filter((r) => r.severity === "error");
  const warnings = results.filter((r) => r.severity === "warning");
  const infos = results.filter((r) => r.severity === "info");

  const hasBlockingErrors = errors.length > 0;

  return (
    <div className={className}>
      {/* Summary */}
      <Alert variant={hasBlockingErrors ? "destructive" : "default"} className="mb-3">
        {hasBlockingErrors ? (
          <AlertCircle className="h-4 w-4" />
        ) : (
          <CheckCircle className="h-4 w-4" />
        )}
        <AlertTitle>
          {hasBlockingErrors
            ? t("scrub.validationFailed" as any, "Validation Failed")
            : t("scrub.validationPassed" as any, "Validation Passed with Warnings")}
        </AlertTitle>
        <AlertDescription>
          {hasBlockingErrors
            ? `${errors.length} error(s) must be fixed before submission.`
            : `${warnings.length} warning(s) found. You may proceed with caution.`}
          {warnings.length > 0 && !hasBlockingErrors && ` ${warnings.length} warning(s).`}
        </AlertDescription>
      </Alert>

      {/* Individual results */}
      <div className="space-y-2">
        {[...errors, ...warnings, ...infos].map((result, idx) => {
          const config = severityConfig[result.severity];
          const Icon = config.icon;
          return (
            <div key={idx} className={`flex items-start gap-3 p-3 rounded-md border ${config.bg}`}>
              <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${config.color}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {result.code}
                  </Badge>
                  <span className="text-sm font-medium">{result.message}</span>
                </div>
                {result.suggestion && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Lightbulb className="h-3 w-3" />
                    {result.suggestion}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
