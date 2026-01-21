import { Link } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLabOrders, useLabOrder } from "@/hooks/useLabOrders";
import { useOrganizationBranding } from "@/hooks/useOrganizationBranding";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { TestTubes, Calendar, ExternalLink, Globe, Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { PrintableLabReport } from "@/components/lab/PrintableLabReport";

interface PatientLabHistoryProps {
  patientId: string;
}

const statusColors: Record<string, string> = {
  ordered: 'bg-yellow-100 text-yellow-800',
  collected: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function PatientLabHistory({ patientId }: PatientLabHistoryProps) {
  const { data: labOrders, isLoading } = useLabOrders({ patientId });
  const { data: branding } = useOrganizationBranding();
  const { profile } = useAuth();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [shouldPrint, setShouldPrint] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  
  const { data: selectedOrder } = useLabOrder(selectedOrderId || undefined);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    onAfterPrint: () => {
      setSelectedOrderId(null);
      setShouldPrint(false);
    },
  });

  // Trigger print when data is loaded AND shouldPrint is true
  useEffect(() => {
    if (shouldPrint && selectedOrder && printRef.current) {
      handlePrint();
    }
  }, [shouldPrint, selectedOrder, handlePrint]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lab Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!labOrders || labOrders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lab Results</CardTitle>
          <CardDescription>Laboratory test orders and results</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <TestTubes className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No lab orders yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lab Results</CardTitle>
        <CardDescription>{labOrders.length} lab order(s) on record</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {labOrders.map((order) => (
          <div
            key={order.id}
            className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <TestTubes className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{order.order_number}</p>
                  <Badge className={statusColors[order.status] || 'bg-muted'}>
                    {order.status?.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(order.created_at), "MMM dd, yyyy")}
                </div>
                {order.items && order.items.length > 0 && (
                  <p className="text-sm">
                    <span className="font-medium">Tests:</span>{' '}
                    {order.items.map(i => i.test_name).join(', ')}
                  </p>
                )}
                {order.priority === 'urgent' || order.priority === 'stat' ? (
                  <Badge variant="destructive" className="text-xs mt-1">
                    {order.priority.toUpperCase()}
                  </Badge>
                ) : null}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {order.status === 'completed' && (order as any).is_published && (
                <Badge variant="secondary" className="text-xs">
                  <Globe className="h-3 w-3 mr-1" />
                  Published
                </Badge>
              )}
              {order.status === 'completed' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={selectedOrderId === order.id && shouldPrint}
                  onClick={() => {
                    setSelectedOrderId(order.id);
                    setShouldPrint(true);
                  }}
                >
                  <Printer className="h-4 w-4" />
                </Button>
              )}
              <Link to={`/app/lab/orders/${order.id}`}>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
        
        {/* Hidden printable report - positioned off-screen for print */}
        {selectedOrder && (
          <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
            <PrintableLabReport
              ref={printRef}
              labOrder={selectedOrder}
              organization={branding}
              performedBy={profile?.full_name}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
