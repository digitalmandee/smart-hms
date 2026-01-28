import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReportTable, Column } from "@/components/reports/ReportTable";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";

interface ExecutiveDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  data: any[];
  type: "beds" | "lab" | "pharmacy" | "revenue" | "opd" | "ipd";
}

export function ExecutiveDetailDialog({
  open,
  onOpenChange,
  title,
  data,
  type,
}: ExecutiveDetailDialogProps) {
  const getColumns = (): Column<any>[] => {
    switch (type) {
      case "beds":
        return [
          { key: "ward", header: "Ward", sortable: true },
          { key: "bedNumber", header: "Bed #", sortable: true },
          { 
            key: "status", 
            header: "Status",
            cell: (row) => (
              <Badge variant={
                row.status === "available" ? "default" :
                row.status === "occupied" ? "secondary" :
                "outline"
              }>
                {row.status}
              </Badge>
            ),
            sortable: true,
          },
          { key: "patientName", header: "Patient" },
        ];
      case "lab":
        return [
          { key: "orderNumber", header: "Order #", sortable: true },
          { key: "patientName", header: "Patient", sortable: true },
          { key: "testName", header: "Test", sortable: true },
          { 
            key: "status", 
            header: "Status",
            cell: (row) => (
              <Badge variant={
                row.status === "completed" ? "default" :
                row.status === "processing" ? "secondary" :
                "outline"
              }>
                {row.status}
              </Badge>
            ),
            sortable: true,
          },
          { 
            key: "amount", 
            header: "Amount",
            cell: (row) => formatCurrency(row.amount),
            className: "text-right",
            sortable: true,
          },
        ];
      case "pharmacy":
        return [
          { key: "transactionNumber", header: "Transaction #", sortable: true },
          { key: "patientName", header: "Customer", sortable: true },
          { key: "itemCount", header: "Items", className: "text-center", sortable: true },
          { 
            key: "amount", 
            header: "Amount",
            cell: (row) => formatCurrency(row.amount),
            className: "text-right",
            sortable: true,
          },
          { key: "paymentMethod", header: "Payment", sortable: true },
        ];
      case "revenue":
        return [
          { key: "department", header: "Department", sortable: true },
          { 
            key: "revenue", 
            header: "Revenue",
            cell: (row) => formatCurrency(row.revenue),
            className: "text-right",
            sortable: true,
          },
          { key: "transactions", header: "Transactions", className: "text-center", sortable: true },
          { 
            key: "percentage", 
            header: "% of Total",
            cell: (row) => `${row.percentage?.toFixed(1)}%`,
            className: "text-right",
            sortable: true,
          },
        ];
      case "opd":
        return [
          { key: "doctorName", header: "Doctor", sortable: true },
          { key: "department", header: "Department", sortable: true },
          { key: "consultations", header: "Consultations", className: "text-center", sortable: true },
          { 
            key: "revenue", 
            header: "Revenue",
            cell: (row) => formatCurrency(row.revenue),
            className: "text-right",
            sortable: true,
          },
        ];
      case "ipd":
        return [
          { key: "admissionNumber", header: "Admission #", sortable: true },
          { key: "patientName", header: "Patient", sortable: true },
          { key: "ward", header: "Ward", sortable: true },
          { key: "bedNumber", header: "Bed", sortable: true },
          { key: "admissionDate", header: "Admitted", sortable: true },
          { 
            key: "status", 
            header: "Status",
            cell: (row) => (
              <Badge variant={
                row.status === "admitted" ? "default" :
                row.status === "discharged" ? "secondary" :
                "outline"
              }>
                {row.status}
              </Badge>
            ),
            sortable: true,
          },
        ];
      default:
        return [];
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ReportTable
          data={data}
          columns={getColumns()}
          pageSize={10}
          searchable={true}
          emptyMessage="No data available"
        />
      </DialogContent>
    </Dialog>
  );
}
