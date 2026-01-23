import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAdmissionDetails } from "@/hooks/useAdmissionDetails";
import { format } from "date-fns";
import { 
  Pill, 
  FlaskConical, 
  Receipt, 
  FileCheck, 
  ChevronDown, 
  ChevronRight,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

interface AdmissionDetailsSummaryProps {
  admissionId: string;
  defaultOpen?: boolean;
}

const chargeTypeLabels: Record<string, string> = {
  room: "Room",
  medication: "Medication",
  procedure: "Procedure",
  consultation: "Consultation",
  laboratory: "Laboratory",
  radiology: "Radiology",
  surgery: "Surgery",
  supplies: "Supplies",
  other: "Other",
};

const statusIcons: Record<string, React.ReactNode> = {
  completed: <CheckCircle className="h-3 w-3 text-green-600" />,
  approved: <CheckCircle className="h-3 w-3 text-green-600" />,
  pending: <Clock className="h-3 w-3 text-amber-600" />,
  draft: <Clock className="h-3 w-3 text-muted-foreground" />,
  ordered: <Clock className="h-3 w-3 text-blue-600" />,
  processing: <AlertCircle className="h-3 w-3 text-amber-600" />,
};

export function AdmissionDetailsSummary({ admissionId, defaultOpen = false }: AdmissionDetailsSummaryProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { data, isLoading } = useAdmissionDetails(admissionId);

  if (isLoading) {
    return (
      <div className="mt-3 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!data || (data.totals.medications === 0 && data.totals.labOrders === 0 && data.totals.charges === 0)) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-3">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2 gap-1 text-xs text-muted-foreground hover:text-foreground">
          {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          View Details
          <div className="flex gap-1 ml-2">
            {data.totals.medications > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                <Pill className="h-3 w-3 mr-1" />
                {data.totals.medications}
              </Badge>
            )}
            {data.totals.labOrders > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                <FlaskConical className="h-3 w-3 mr-1" />
                {data.totals.labOrders}
              </Badge>
            )}
            {data.totals.charges > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                <Receipt className="h-3 w-3 mr-1" />
                {data.totals.charges}
              </Badge>
            )}
          </div>
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2 space-y-3">
        {/* Medications Section */}
        {data.medications.length > 0 && (
          <div className="pl-4 border-l-2 border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Pill className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Medications ({data.medications.length})</span>
            </div>
            <div className="space-y-1.5">
              {data.medications.slice(0, 5).map((med) => (
                <div key={med.id} className="flex items-center gap-2 text-xs">
                  <span className={med.is_active ? "text-foreground" : "text-muted-foreground line-through"}>
                    {med.medicine?.name || med.medicine_name}
                  </span>
                  <span className="text-muted-foreground">
                    {med.dosage} • {med.frequency}
                  </span>
                  {!med.is_active && (
                    <Badge variant="outline" className="h-4 text-[10px]">Stopped</Badge>
                  )}
                </div>
              ))}
              {data.medications.length > 5 && (
                <p className="text-xs text-muted-foreground">+{data.medications.length - 5} more...</p>
              )}
            </div>
          </div>
        )}

        {/* Lab Orders Section */}
        {data.labOrders.length > 0 && (
          <div className="pl-4 border-l-2 border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <FlaskConical className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Lab Orders ({data.labOrders.length})</span>
            </div>
            <div className="space-y-1.5">
              {data.labOrders.slice(0, 4).map((order) => (
                <div key={order.id} className="flex items-center gap-2 text-xs">
                  {statusIcons[order.status] || statusIcons.pending}
                  <span className="font-medium">{order.order_number}</span>
                  <span className="text-muted-foreground">
                    {order.items?.length || 0} test(s) • {format(new Date(order.created_at), "MMM d")}
                  </span>
                  <Badge variant="outline" className="h-4 text-[10px] capitalize">{order.status}</Badge>
                </div>
              ))}
              {data.labOrders.length > 4 && (
                <p className="text-xs text-muted-foreground">+{data.labOrders.length - 4} more...</p>
              )}
            </div>
          </div>
        )}

        {/* Charges Summary */}
        {data.charges.length > 0 && (
          <div className="pl-4 border-l-2 border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Receipt className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium">Charges Summary</span>
              <span className="text-sm text-muted-foreground">
                Rs. {data.totals.chargesAmount.toLocaleString()}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(
                data.charges.reduce((acc, charge) => {
                  const type = charge.charge_type || "other";
                  acc[type] = (acc[type] || 0) + (charge.total_amount || 0);
                  return acc;
                }, {} as Record<string, number>)
              )
                .sort((a, b) => b[1] - a[1])
                .slice(0, 4)
                .map(([type, amount]) => (
                  <div key={type} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{chargeTypeLabels[type] || type}</span>
                    <span>Rs. {amount.toLocaleString()}</span>
                  </div>
                ))}
            </div>
            {data.charges.some((c) => !c.is_billed) && (
              <p className="text-xs text-amber-600 mt-1">
                {data.charges.filter((c) => !c.is_billed).length} unbilled charge(s)
              </p>
            )}
          </div>
        )}

        {/* Discharge Summary */}
        {data.dischargeSummary && (
          <div className="pl-4 border-l-2 border-green-500/20">
            <div className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Discharge Summary</span>
              <Badge 
                variant={data.dischargeSummary.status === "approved" ? "default" : "secondary"}
                className="h-5 text-xs capitalize"
              >
                {data.dischargeSummary.status}
              </Badge>
            </div>
            {data.dischargeSummary.approved_at && data.dischargeSummary.approved_by_profile && (
              <p className="text-xs text-muted-foreground mt-1">
                Approved by {data.dischargeSummary.approved_by_profile.full_name} on{" "}
                {format(new Date(data.dischargeSummary.approved_at), "MMM d, yyyy")}
              </p>
            )}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
