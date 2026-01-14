import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBedTransfers } from "@/hooks/useBedManagement";
import { ArrowRight, MapPin, Clock, User, FileText } from "lucide-react";
import { format } from "date-fns";

interface BedTransferHistoryProps {
  admissionId: string;
  className?: string;
}

export const BedTransferHistory = ({
  admissionId,
  className,
}: BedTransferHistoryProps) => {
  const { data: transfers, isLoading } = useBedTransfers(admissionId);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading transfer history...
        </CardContent>
      </Card>
    );
  }

  if (!transfers || transfers.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Transfer History
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-6">
          No bed transfers recorded for this admission
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Transfer History
          <Badge variant="secondary" className="ml-auto">
            {transfers.length} transfer{transfers.length > 1 ? "s" : ""}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-96">
          <div className="space-y-4">
            {transfers.map((transfer: {
              id: string;
              transferred_at: string;
              transfer_reason?: string;
              notes?: string;
              from_ward?: { name: string; code: string };
              from_bed?: { bed_number: string };
              to_ward: { name: string; code: string };
              to_bed: { bed_number: string };
              ordered_by_profile?: { full_name: string };
              transferred_by_profile?: { full_name: string };
            }, index: number) => (
              <div key={transfer.id}>
                <div className="flex items-start gap-3">
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                    {index < transfers.length - 1 && (
                      <div className="w-0.5 h-full bg-border mt-1 min-h-[40px]" />
                    )}
                  </div>

                  {/* Transfer details */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {transfer.transferred_at
                          ? format(new Date(transfer.transferred_at), "dd MMM yyyy, HH:mm")
                          : "Unknown time"}
                      </span>
                    </div>

                    {/* From -> To */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="bg-muted rounded px-2 py-1">
                        <p className="text-xs text-muted-foreground">From</p>
                        <p className="text-sm font-medium">
                          {transfer.from_ward?.name || "Initial"}{" "}
                          {transfer.from_bed && `- ${transfer.from_bed.bed_number}`}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-primary" />
                      <div className="bg-primary/10 rounded px-2 py-1">
                        <p className="text-xs text-muted-foreground">To</p>
                        <p className="text-sm font-medium">
                          {transfer.to_ward.name} - {transfer.to_bed.bed_number}
                        </p>
                      </div>
                    </div>

                    {/* Reason */}
                    {transfer.transfer_reason && (
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline">{transfer.transfer_reason}</Badge>
                      </div>
                    )}

                    {/* Notes */}
                    {transfer.notes && (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{transfer.notes}</span>
                      </div>
                    )}

                    {/* Staff info */}
                    {(transfer.ordered_by_profile || transfer.transferred_by_profile) && (
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {transfer.ordered_by_profile && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Ordered by: {transfer.ordered_by_profile.full_name}
                          </span>
                        )}
                        {transfer.transferred_by_profile && 
                         transfer.transferred_by_profile.full_name !== transfer.ordered_by_profile?.full_name && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Transferred by: {transfer.transferred_by_profile.full_name}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {index < transfers.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
