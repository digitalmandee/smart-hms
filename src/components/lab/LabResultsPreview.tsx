import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FlaskConical, FileText, Calendar, CheckCircle, Clock, AlertCircle, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface LabResultsPreviewProps {
  patientId: string;
  patientName?: string;
}

interface LabOrder {
  id: string;
  order_number: string;
  status: string;
  priority: string;
  created_at: string;
  clinical_notes: string | null;
  doctor: {
    profiles: {
      full_name: string;
    };
  } | null;
  items: LabOrderItem[];
}

interface LabOrderItem {
  id: string;
  test_name: string;
  status: string;
  result_values: Record<string, unknown> | null;
  result_notes: string | null;
  normal_range: string | null;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  pending: { label: "Pending", variant: "secondary", icon: <Clock className="h-3 w-3" /> },
  sample_collected: { label: "Sample Collected", variant: "outline", icon: <FlaskConical className="h-3 w-3" /> },
  in_progress: { label: "In Progress", variant: "default", icon: <Clock className="h-3 w-3" /> },
  completed: { label: "Completed", variant: "default", icon: <CheckCircle className="h-3 w-3" /> },
  cancelled: { label: "Cancelled", variant: "destructive", icon: <AlertCircle className="h-3 w-3" /> },
};

export function LabResultsPreview({ patientId, patientName }: LabResultsPreviewProps) {
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: labOrders = [], isLoading } = useQuery({
    queryKey: ["patient-lab-orders", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lab_orders")
        .select(`
          id,
          order_number,
          status,
          priority,
          created_at,
          clinical_notes,
          doctor:doctors(
            profiles(full_name)
          ),
          items:lab_order_items(
            id,
            test_name,
            status,
            result_values,
            result_notes
          )
        `)
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as unknown as LabOrder[];
    },
    enabled: !!patientId,
  });

  const formatResultValue = (value: Record<string, unknown> | null): string => {
    if (!value) return "—";
    
    // Handle different result formats
    if (typeof value === "object") {
      return Object.entries(value)
        .map(([key, val]) => `${key}: ${val}`)
        .join(", ");
    }
    return String(value);
  };

  const ResultCard = ({ order }: { order: LabOrder }) => {
    const status = statusConfig[order.status] || statusConfig.pending;
    const completedTests = order.items?.filter(i => i.status === "completed").length || 0;
    const totalTests = order.items?.length || 0;

    return (
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => {
          setSelectedOrder(order);
          setIsDialogOpen(true);
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-primary" />
              <span className="font-medium">{order.order_number}</span>
            </div>
            <Badge variant={status.variant} className="flex items-center gap-1">
              {status.icon}
              {status.label}
            </Badge>
          </div>
          
          <div className="text-sm text-muted-foreground flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(order.created_at), "MMM d, yyyy")}
            </span>
            <span>{completedTests}/{totalTests} tests completed</span>
          </div>

          {order.items && order.items.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {order.items.slice(0, 3).map((item) => (
                <Badge key={item.id} variant="outline" className="text-xs">
                  {item.test_name}
                </Badge>
              ))}
              {order.items.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{order.items.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-primary" />
              Lab Results
            </CardTitle>
            {labOrders.length > 0 && (
              <Badge variant="secondary">{labOrders.length} orders</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-2" />
              Loading lab results...
            </div>
          ) : labOrders.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <FlaskConical className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>No lab orders found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {labOrders.slice(0, 3).map((order) => (
                <ResultCard key={order.id} order={order} />
              ))}
              {labOrders.length > 3 && (
                <Button variant="outline" className="w-full" size="sm">
                  View All {labOrders.length} Orders
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Result Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5" />
              Lab Results - {selectedOrder?.order_number}
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="flex-1 pr-4">
            {selectedOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Order Date:</span>
                    <p className="font-medium">
                      {format(new Date(selectedOrder.created_at), "PPp")}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ordered By:</span>
                    <p className="font-medium">
                      {selectedOrder.doctor?.profiles?.full_name || "—"}
                    </p>
                  </div>
                  {selectedOrder.clinical_notes && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Clinical Notes:</span>
                      <p className="font-medium">{selectedOrder.clinical_notes}</p>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-semibold">Test Results</h4>
                  {selectedOrder.items?.map((item) => {
                    const itemStatus = statusConfig[item.status] || statusConfig.pending;
                    return (
                      <Card key={item.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{item.test_name}</span>
                            <Badge variant={itemStatus.variant} className="flex items-center gap-1">
                              {itemStatus.icon}
                              {itemStatus.label}
                            </Badge>
                          </div>
                          
                          {item.status === "completed" ? (
                            <div className="space-y-1">
                              <div className="text-sm">
                                <span className="text-muted-foreground">Result: </span>
                                <span className="font-medium">
                                  {formatResultValue(item.result_values)}
                                </span>
                              </div>
                              {item.normal_range && (
                                <div className="text-sm">
                                  <span className="text-muted-foreground">Normal Range: </span>
                                  <span>{item.normal_range}</span>
                                </div>
                              )}
                              {item.result_notes && (
                                <div className="text-sm text-muted-foreground mt-2">
                                  {item.result_notes}
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Results pending...
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
