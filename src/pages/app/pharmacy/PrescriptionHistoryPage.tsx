import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { usePrescriptions } from "@/hooks/usePrescriptions";
import { ArrowLeft, Search, Calendar as CalendarIcon, Filter, Eye } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";

export default function PrescriptionHistoryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  
  const { data: prescriptions, isLoading } = usePrescriptions();

  const filteredPrescriptions = (prescriptions || []).filter((p) => {
    const matchesSearch =
      !search ||
      p.prescription_number?.toLowerCase().includes(search.toLowerCase()) ||
      p.patient?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.patient?.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.patient?.patient_number?.toLowerCase().includes(search.toLowerCase()) ||
      p.doctor?.profile?.full_name?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || p.status === statusFilter;

    const prescriptionDate = new Date(p.created_at);
    const matchesDateFrom = !dateFrom || prescriptionDate >= dateFrom;
    const matchesDateTo = !dateTo || prescriptionDate <= new Date(dateTo.getTime() + 86400000);

    return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      created: "outline",
      partially_dispensed: "secondary",
      dispensed: "default",
      cancelled: "destructive",
    };
    const labels: Record<string, string> = {
      created: "Pending",
      partially_dispensed: "Partial",
      dispensed: "Dispensed",
      cancelled: "Cancelled",
    };
    return (
      <Badge variant={variants[status] || "outline"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const columns: ColumnDef<(typeof prescriptions)[0]>[] = [
    {
      accessorKey: "prescription_number",
      header: "Rx #",
      cell: ({ row }) => (
        <span className="font-mono font-medium">{row.original.prescription_number}</span>
      ),
    },
    {
      accessorKey: "patient",
      header: "Patient",
      cell: ({ row }) => {
        const patient = row.original.patient;
        return (
          <div>
            <p className="font-medium">
              {patient?.first_name} {patient?.last_name}
            </p>
            <p className="text-xs text-muted-foreground">{patient?.patient_number}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "doctor",
      header: "Doctor",
      cell: ({ row }) => row.original.doctor?.profile?.full_name || "-",
    },
    {
      accessorKey: "created_at",
      header: "Date/Time",
      cell: ({ row }) => format(new Date(row.original.created_at), "MMM d, yyyy h:mm a"),
    },
    {
      accessorKey: "itemCount",
      header: "Items",
      cell: ({ row }) => `${row.original.items?.length || 0} item(s)`,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              // Navigate to prescription detail or view
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {(row.original.status === "created" || row.original.status === "partially_dispensed") && (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/app/pharmacy/dispense/${row.original.id}`);
              }}
            >
              Dispense
            </Button>
          )}
        </div>
      ),
    },
  ];

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prescription History"
        description="View all prescriptions with filters and search"
        actions={
          <Button variant="outline" onClick={() => navigate("/app/pharmacy")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Pharmacy
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end bg-muted/30 p-4 rounded-lg">
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium mb-1 block">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rx#, patient, doctor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="w-[180px]">
          <label className="text-sm font-medium mb-1 block">Status</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="created">Pending</SelectItem>
              <SelectItem value="partially_dispensed">Partial</SelectItem>
              <SelectItem value="dispensed">Dispensed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-[160px]">
          <label className="text-sm font-medium mb-1 block">From Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateFrom && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFrom ? format(dateFrom, "MMM d, yyyy") : "Pick date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFrom}
                onSelect={setDateFrom}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="w-[160px]">
          <label className="text-sm font-medium mb-1 block">To Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateTo && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateTo ? format(dateTo, "MMM d, yyyy") : "Pick date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateTo}
                onSelect={setDateTo}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button variant="ghost" onClick={clearFilters} className="h-10">
          <Filter className="mr-2 h-4 w-4" />
          Clear Filters
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{filteredPrescriptions.length}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-orange-600">
            {filteredPrescriptions.filter((p) => p.status === "created").length}
          </p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Dispensed</p>
          <p className="text-2xl font-bold text-green-600">
            {filteredPrescriptions.filter((p) => p.status === "dispensed").length}
          </p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Partial</p>
          <p className="text-2xl font-bold text-blue-600">
            {filteredPrescriptions.filter((p) => p.status === "partially_dispensed").length}
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredPrescriptions}
        isLoading={isLoading}
      />
    </div>
  );
}
