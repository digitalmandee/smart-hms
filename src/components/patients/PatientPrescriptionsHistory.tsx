import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatientPrescriptions } from "@/hooks/usePrescriptions";
import { format } from "date-fns";
import { Pill, Calendar, Printer, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface PatientPrescriptionsHistoryProps {
  patientId: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  dispensed: 'bg-green-100 text-green-800',
  partially_dispensed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function PatientPrescriptionsHistory({ patientId }: PatientPrescriptionsHistoryProps) {
  const { data: prescriptions, isLoading } = usePatientPrescriptions(patientId, 20);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prescriptions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!prescriptions || prescriptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prescriptions</CardTitle>
          <CardDescription>Prescribed medications and treatments</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Pill className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No prescriptions yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prescriptions</CardTitle>
        <CardDescription>{prescriptions.length} prescription(s) on record</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {prescriptions.map((prescription) => (
          <Collapsible
            key={prescription.id}
            open={expandedId === prescription.id}
            onOpenChange={(open) => setExpandedId(open ? prescription.id : null)}
          >
            <div className="border rounded-lg">
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Pill className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{prescription.prescription_number}</p>
                        <Badge className={statusColors[prescription.status] || 'bg-muted'}>
                          {prescription.status?.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(prescription.created_at), "MMM dd, yyyy")}
                        <span>•</span>
                        <span>Dr. {prescription.doctor?.profile?.full_name || 'Unknown'}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {prescription.items?.length || 0} medication(s)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {expandedId === prescription.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-4 pb-4 border-t pt-4 bg-muted/30">
                  {prescription.items && prescription.items.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium mb-2">Medications:</p>
                      {prescription.items.map((item, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium">{item.medicine_name}</p>
                            <p className="text-muted-foreground">
                              {[item.dosage, item.frequency, item.duration].filter(Boolean).join(' • ')}
                            </p>
                            {item.instructions && (
                              <p className="text-xs text-muted-foreground italic mt-0.5">
                                {item.instructions}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No medication details</p>
                  )}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
}
