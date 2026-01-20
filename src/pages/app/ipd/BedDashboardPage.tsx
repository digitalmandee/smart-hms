import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bed, 
  TrendingUp, 
  Activity, 
  Wrench, 
  Sparkles,
  Users,
  Building,
  Filter,
  Download,
  LayoutGrid,
  List
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBeds, useWards, useIPDStats } from "@/hooks/useIPD";
import { BedStatusBadge } from "@/components/ipd/BedStatusBadge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  available: "#22c55e",
  occupied: "#3b82f6",
  reserved: "#eab308",
  maintenance: "#ef4444",
  housekeeping: "#a855f7",
};

export default function BedDashboardPage() {
  const navigate = useNavigate();
  const [wardFilter, setWardFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const { data: beds, isLoading: bedsLoading } = useBeds();
  const { data: wards } = useWards();
  const { data: stats } = useIPDStats();

  // Calculate ward-wise stats
  const wardStats = useMemo(() => {
    if (!beds || !wards) return [];
    
    return wards.map((ward: any) => {
      const wardBeds = beds.filter((b: any) => b.ward_id === ward.id);
      const occupied = wardBeds.filter((b: any) => b.status === "occupied").length;
      const total = wardBeds.length;
      const occupancyRate = total > 0 ? (occupied / total) * 100 : 0;

      return {
        name: ward.name,
        total,
        occupied,
        available: wardBeds.filter((b: any) => b.status === "available").length,
        maintenance: wardBeds.filter((b: any) => b.status === "maintenance").length,
        housekeeping: wardBeds.filter((b: any) => b.status === "housekeeping").length,
        occupancyRate,
      };
    }).filter((w: any) => w.total > 0);
  }, [beds, wards]);

  // Calculate status distribution
  const statusDistribution = useMemo(() => {
    if (!beds) return [];
    
    const counts: Record<string, number> = {
      available: 0,
      occupied: 0,
      reserved: 0,
      maintenance: 0,
      housekeeping: 0,
    };

    beds.forEach((bed: any) => {
      if (counts[bed.status] !== undefined) {
        counts[bed.status]++;
      }
    });

    return Object.entries(counts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: STATUS_COLORS[status],
    }));
  }, [beds]);

  // Filter beds
  const filteredBeds = useMemo(() => {
    if (!beds) return [];
    
    return beds.filter((bed: any) => {
      const matchesWard = wardFilter === "all" || bed.ward_id === wardFilter;
      const matchesStatus = statusFilter === "all" || bed.status === statusFilter;
      const matchesSearch = 
        bed.bed_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bed.ward?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesWard && matchesStatus && matchesSearch;
    });
  }, [beds, wardFilter, statusFilter, searchQuery]);

  const totalBeds = beds?.length || 0;
  const occupiedBeds = beds?.filter((b: any) => b.status === "occupied").length || 0;
  const availableBeds = beds?.filter((b: any) => b.status === "available").length || 0;
  const maintenanceBeds = beds?.filter((b: any) => b.status === "maintenance").length || 0;
  const housekeepingBeds = beds?.filter((b: any) => b.status === "housekeeping").length || 0;
  const overallOccupancy = totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : "0";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bed Dashboard</h1>
          <p className="text-muted-foreground">Organization-wide bed utilization and management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/app/ipd/beds")}>
            <LayoutGrid className="h-4 w-4 mr-2" /> Bed Map
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Beds</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBeds}</div>
            <p className="text-xs text-muted-foreground">Across {wards?.length || 0} wards</p>
          </CardContent>
        </Card>

        <Card className="border-green-500/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{availableBeds}</div>
            <p className="text-xs text-muted-foreground">Ready for admission</p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{occupiedBeds}</div>
            <p className="text-xs text-muted-foreground">{overallOccupancy}% occupancy</p>
          </CardContent>
        </Card>

        <Card className="border-red-500/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{maintenanceBeds}</div>
            <p className="text-xs text-muted-foreground">Under repair</p>
          </CardContent>
        </Card>

        <Card className="border-purple-500/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Housekeeping</CardTitle>
            <Sparkles className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{housekeepingBeds}</div>
            <p className="text-xs text-muted-foreground">Pending cleaning</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Ward Occupancy Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Ward Occupancy</CardTitle>
            <CardDescription>Bed utilization by ward</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wardStats} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <YAxis dataKey="name" type="category" width={70} />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(1)}%`, "Occupancy"]}
                  />
                  <Bar 
                    dataKey="occupancyRate" 
                    fill="hsl(var(--primary))" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Bed Status Distribution</CardTitle>
            <CardDescription>Current status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Bed Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Beds</CardTitle>
              <CardDescription>Detailed view of all beds with filters</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("table")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search bed number or ward..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={wardFilter} onValueChange={setWardFilter}>
              <SelectTrigger className="w-[180px]">
                <Building className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Wards" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Wards</SelectItem>
                {wards?.map((ward: any) => (
                  <SelectItem key={ward.id} value={ward.id}>
                    {ward.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="housekeeping">Housekeeping</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table View */}
          {viewMode === "table" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bed #</TableHead>
                  <TableHead>Ward</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Current Patient</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBeds.map((bed: any) => (
                  <TableRow key={bed.id}>
                    <TableCell className="font-medium">{bed.bed_number}</TableCell>
                    <TableCell>{bed.ward?.name}</TableCell>
                    <TableCell>{bed.bed_type || "Standard"}</TableCell>
                    <TableCell>
                      <BedStatusBadge status={bed.status} />
                    </TableCell>
                    <TableCell>
                      {bed.current_admission?.patient ? (
                        <span>
                          {bed.current_admission.patient.first_name} {bed.current_admission.patient.last_name}
                        </span>
                      ) : "-"}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{bed.notes || "-"}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/app/ipd/beds/${bed.id}/profile`)}
                      >
                        View Profile
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredBeds.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No beds found matching your filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {/* Grid View */}
          {viewMode === "grid" && (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredBeds.map((bed: any) => (
                <Card 
                  key={bed.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/app/ipd/beds/${bed.id}/profile`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold">{bed.bed_number}</span>
                      <BedStatusBadge status={bed.status} size="sm" />
                    </div>
                    <p className="text-sm text-muted-foreground">{bed.ward?.name}</p>
                    {bed.current_admission?.patient && (
                      <p className="text-sm mt-2 truncate">
                        {bed.current_admission.patient.first_name} {bed.current_admission.patient.last_name}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
