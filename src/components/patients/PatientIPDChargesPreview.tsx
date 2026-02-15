import { Link } from "react-router-dom";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatientUnbilledCharges } from "@/hooks/usePatientIPDCharges";
import { format } from "date-fns";
import { Pill, Receipt, ExternalLink, AlertCircle } from "lucide-react";

interface PatientIPDChargesPreviewProps {
  patientId: string;
}

const chargeTypeIcons: Record<string, React.ReactNode> = {
  medication: <Pill className="h-4 w-4 text-green-600" />,
  room: <Receipt className="h-4 w-4 text-blue-600" />,
  service: <Receipt className="h-4 w-4 text-purple-600" />,
  procedure: <Receipt className="h-4 w-4 text-orange-600" />,
};

const chargeTypeColors: Record<string, string> = {
  medication: "bg-green-100 text-green-800",
  room: "bg-blue-100 text-blue-800",
  service: "bg-purple-100 text-purple-800",
  procedure: "bg-orange-100 text-orange-800",
};

export function PatientIPDChargesPreview({ patientId }: PatientIPDChargesPreviewProps) {
  const { data, isLoading } = usePatientUnbilledCharges(patientId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Pending Charges
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </CardContent>
      </Card>
    );
  }

  // Don't show if no active admission or no charges
  if (!data?.admissionId || data.charges.length === 0) {
    return null;
  }

  // Group charges by type
  const medicationCharges = data.charges.filter((c) => c.charge_type === "medication");
  const otherCharges = data.charges.filter((c) => c.charge_type !== "medication");

  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-base">Pending IPD Charges</CardTitle>
          </div>
          <Link to={`/app/ipd/admissions/${data.admissionId}`}>
            <Button variant="ghost" size="sm" className="text-amber-700 hover:text-amber-800">
              View Admission
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>
        <CardDescription className="text-amber-700 dark:text-amber-400">
          {data.charges.length} unbilled item(s) for {data.admissionNumber} • Will be billed at discharge
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Medication charges */}
        {medicationCharges.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Pill className="h-4 w-4" />
              Pharmacy / Medications ({medicationCharges.length})
            </div>
            <div className="space-y-2 pl-6">
              {medicationCharges.slice(0, 5).map((charge) => (
                <div
                  key={charge.id}
                  className="flex items-center justify-between text-sm bg-background rounded-md p-2 border"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {format(new Date(charge.charge_date), "MMM dd")}
                    </span>
                    <span className="font-medium">{charge.description}</span>
                    {charge.quantity && charge.quantity > 1 && (
                      <Badge variant="secondary" className="text-xs">
                        x{charge.quantity}
                      </Badge>
                    )}
                  </div>
                  <span className="font-medium">
                    {formatCurrency(charge.total_amount)}
                  </span>
                </div>
              ))}
              {medicationCharges.length > 5 && (
                <p className="text-xs text-muted-foreground pl-2">
                  +{medicationCharges.length - 5} more medication items
                </p>
              )}
            </div>
          </div>
        )}

        {/* Other charges */}
        {otherCharges.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Receipt className="h-4 w-4" />
              Other Charges ({otherCharges.length})
            </div>
            <div className="space-y-2 pl-6">
              {otherCharges.slice(0, 3).map((charge) => (
                <div
                  key={charge.id}
                  className="flex items-center justify-between text-sm bg-background rounded-md p-2 border"
                >
                  <div className="flex items-center gap-2">
                    <Badge className={chargeTypeColors[charge.charge_type] || "bg-gray-100"}>
                      {charge.charge_type}
                    </Badge>
                    <span>{charge.description}</span>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(charge.total_amount)}
                  </span>
                </div>
              ))}
              {otherCharges.length > 3 && (
                <p className="text-xs text-muted-foreground pl-2">
                  +{otherCharges.length - 3} more items
                </p>
              )}
            </div>
          </div>
        )}

        {/* Total */}
        <div className="flex items-center justify-between pt-3 border-t border-amber-200 dark:border-amber-800">
          <span className="font-medium">Total Pending</span>
          <span className="text-lg font-bold text-amber-700 dark:text-amber-400">
            {formatCurrency(data.total)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
