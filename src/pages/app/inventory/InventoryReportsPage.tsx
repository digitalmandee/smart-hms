import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { 
  BarChart3, TrendingUp, Package, DollarSign,
  FileBarChart, ArrowUpDown, ShoppingCart, Pill, AlertTriangle, Calendar,
  LayoutDashboard, Users, PackageX, Zap, Search
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganizations";
import { useOrganizationModules } from "@/hooks/useOrganizationModules";
import { useCombinedInventoryStats } from "@/hooks/useInventory";
import { Skeleton } from "@/components/ui/skeleton";

interface ReportCard {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  highlight?: boolean;
}

export default function InventoryReportsPage() {
  const { profile } = useAuth();
  const { data: organization } = useOrganization(profile?.organization_id);
  const { data: enabledModules } = useOrganizationModules(profile?.organization_id);
  const [searchFilter, setSearchFilter] = useState("");
  
  const { data: stats, isLoading: statsLoading } = useCombinedInventoryStats(
    profile?.organization_id,
    organization?.facility_type,
    enabledModules
  );

  const isWarehouse = organization?.facility_type === "warehouse";

  const executiveReport: ReportCard = {
    title: isWarehouse ? "Warehouse Executive Dashboard" : "Inventory Executive Dashboard",
    description: "Complete overview with KPIs, trends, and drill-down analytics",
    icon: LayoutDashboard,
    href: "/app/inventory/reports/executive",
    highlight: true,
  };

  const generalReports: ReportCard[] = [
    { title: "Stock Valuation", description: "Current inventory value by FIFO method", icon: DollarSign, href: "/app/inventory/reports/valuation" },
    { title: "Stock Movement", description: "Track stock ins and outs over time", icon: ArrowUpDown, href: "/app/inventory/reports/movement" },
    { title: "Low Stock Report", description: "Items below reorder level", icon: Package, href: "/app/inventory/stock?lowStock=true" },
    { title: "Procurement Summary", description: "Purchase analysis by vendor and category", icon: ShoppingCart, href: "/app/inventory/reports/procurement" },
    { title: "Expiry Report", description: "Items expiring soon", icon: TrendingUp, href: "/app/inventory/reports/expiry" },
    { title: "Consumption Report", description: "Stock usage by department", icon: BarChart3, href: "/app/inventory/reports/consumption" },
    { title: "Vendor Performance", description: "Vendor spend, PO completion, and delivery metrics", icon: Users, href: "/app/inventory/reports/vendor-performance" },
    { title: "Dead Stock", description: "Items with no movement — identify idle capital", icon: PackageX, href: "/app/inventory/reports/dead-stock" },
    { title: "Fast Moving Items", description: "Top items by consumption frequency", icon: Zap, href: "/app/inventory/reports/fast-moving" },
  ];

  const warehouseReports: ReportCard[] = [
    { title: "Warehouse Operations", description: "Put-away rates, bin utilization metrics", icon: FileBarChart, href: "/app/inventory/reports/operations" },
    { title: "Picking & Shipping", description: "Pick list and shipment performance", icon: TrendingUp, href: "/app/inventory/reports/picking-shipping" },
    { title: "ABC Analysis", description: "Pareto analysis of inventory value", icon: BarChart3, href: "/app/inventory/reports/abc-analysis" },
  ];

  const pharmacyReports: ReportCard[] = [
    { title: "Pharmacy Stock Valuation", description: "Medicine inventory value summary", icon: DollarSign, href: "/app/pharmacy/reports" },
    { title: "Pharmacy Low Stock", description: "Medicines below reorder level", icon: AlertTriangle, href: "/app/pharmacy/alerts" },
    { title: "Pharmacy Expiry Report", description: "Medicines expiring soon", icon: Calendar, href: "/app/pharmacy/alerts" },
    { title: "Pharmacy Stock Movements", description: "Track medicine stock changes", icon: ArrowUpDown, href: "/app/pharmacy/stock-movements" },
    { title: "Sales Report", description: "Pharmacy sales and revenue analysis", icon: BarChart3, href: "/app/pharmacy/reports" },
  ];

  const showPharmacySection = stats?.isHospital && stats?.hasPharmacyModule;

  const filterReports = (reports: ReportCard[]) => {
    if (!searchFilter) return reports;
    const q = searchFilter.toLowerCase();
    return reports.filter(r => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
  };

  const formatCurrency = (value: number) => {
    if (value >= 100000) return `Rs. ${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `Rs. ${(value / 1000).toFixed(0)}K`;
    return `Rs. ${value.toFixed(0)}`;
  };

  const renderReportCard = (report: ReportCard) => (
    <Link key={report.title} to={report.href}>
      <Card className={`hover:bg-accent/50 transition-colors h-full ${report.highlight ? "border-primary/40 bg-primary/5 dark:bg-primary/10" : ""}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${report.highlight ? "bg-primary/20" : "bg-primary/10"}`}>
              <report.icon className={`h-5 w-5 ${report.highlight ? "text-primary" : "text-primary"}`} />
            </div>
            <CardTitle className="text-base">{report.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{report.description}</p>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={isWarehouse ? "Warehouse Reports" : "Inventory Reports"}
        description="Analytics and insights for inventory management"
        actions={
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-9"
            />
          </div>
        }
      />

      {/* Combined Summary Stats */}
      {statsLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
              <CardContent><Skeleton className="h-8 w-20" /><Skeleton className="h-3 w-32 mt-2" /></CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Inventory Value</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.combined.totalValue)}</div>
              {showPharmacySection && (
                <p className="text-xs text-muted-foreground mt-1">General: {formatCurrency(stats.general.totalValue)} • Pharmacy: {formatCurrency(stats.pharmacy.totalValue)}</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.combined.totalItems}</div>
              {showPharmacySection && (
                <p className="text-xs text-muted-foreground mt-1">General: {stats.general.totalItems} • Medicines: {stats.pharmacy.totalItems}</p>
              )}
            </CardContent>
          </Card>
          <Card className={stats.combined.lowStockCount > 0 ? "border-orange-200 bg-orange-50/50 dark:border-orange-900 dark:bg-orange-950/20" : ""}>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Alerts</CardTitle></CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.combined.lowStockCount > 0 ? "text-orange-600 dark:text-orange-400" : ""}`}>{stats.combined.lowStockCount}</div>
              {showPharmacySection && (
                <p className="text-xs text-muted-foreground mt-1">General: {stats.general.lowStockCount} • Pharmacy: {stats.pharmacy.lowStockCount}</p>
              )}
            </CardContent>
          </Card>
          <Card className={stats.combined.expiringCount > 0 ? "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20" : ""}>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Expiring Soon</CardTitle></CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.combined.expiringCount > 0 ? "text-red-600 dark:text-red-400" : ""}`}>{stats.combined.expiringCount}</div>
              {showPharmacySection && (
                <p className="text-xs text-muted-foreground mt-1">General: {stats.general.expiringCount} • Pharmacy: {stats.pharmacy.expiringCount}</p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Executive Dashboard Card */}
      {(!searchFilter || executiveReport.title.toLowerCase().includes(searchFilter.toLowerCase())) && (
        <div className="grid gap-4 md:grid-cols-1">
          {renderReportCard(executiveReport)}
        </div>
      )}

      {/* General Inventory Reports */}
      {filterReports(generalReports).length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">General Inventory Reports</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filterReports(generalReports).map(renderReportCard)}
          </div>
        </div>
      )}

      {/* Warehouse Operations Reports */}
      {filterReports(warehouseReports).length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileBarChart className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Warehouse Operations Reports</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filterReports(warehouseReports).map(renderReportCard)}
          </div>
        </div>
      )}

      {/* Pharmacy Inventory Reports */}
      {showPharmacySection && filterReports(pharmacyReports).length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-success" />
            <h2 className="text-lg font-semibold">Pharmacy Inventory Reports</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filterReports(pharmacyReports).map((report) => (
              <Link key={report.title} to={report.href}>
                <Card className="hover:bg-accent/50 transition-colors h-full border-success/20">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-success/10 rounded-lg">
                        <report.icon className="h-5 w-5 text-success" />
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
      )}
    </div>
  );
}
