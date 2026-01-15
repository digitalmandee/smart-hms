import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  BarChart3, TrendingUp, Package, DollarSign,
  FileBarChart, ArrowUpDown, ShoppingCart
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export default function InventoryReportsPage() {
  const reports = [
    {
      title: "Stock Valuation",
      description: "Current inventory value by FIFO method",
      icon: DollarSign,
      href: "/app/inventory/reports/valuation",
    },
    {
      title: "Stock Movement",
      description: "Track stock ins and outs over time",
      icon: ArrowUpDown,
      href: "/app/inventory/reports/movement",
    },
    {
      title: "Low Stock Report",
      description: "Items below reorder level",
      icon: Package,
      href: "/app/inventory/stock?lowStock=true",
    },
    {
      title: "Procurement Summary",
      description: "Purchase analysis by vendor and category",
      icon: ShoppingCart,
      href: "/app/inventory/reports/procurement",
    },
    {
      title: "Expiry Report",
      description: "Items expiring soon",
      icon: TrendingUp,
      href: "/app/inventory/reports/expiry",
    },
    {
      title: "Consumption Report",
      description: "Stock usage by department",
      icon: BarChart3,
      href: "/app/inventory/reports/consumption",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Reports"
        description="Analytics and insights for inventory management"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Link key={report.title} to={report.href}>
            <Card className="hover:bg-accent/50 transition-colors h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <report.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{report.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{report.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
