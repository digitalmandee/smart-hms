import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useKioskTokenLogs } from "@/hooks/useKioskAuth";
import { useKiosks } from "@/hooks/useKiosks";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileText, RefreshCw, Download, Calendar, 
  Ticket, User, Stethoscope, Phone 
} from "lucide-react";
import { format, subDays } from "date-fns";

interface TokenLogData {
  id: string;
  kiosk_id: string;
  token_number: number;
  patient_name: string | null;
  patient_phone: string | null;
  doctor_name: string | null;
  department: string | null;
  priority: number;
  generated_at: string;
  printed: boolean;
  kiosk: {
    name: string;
    kiosk_type: string;
  };
}

export default function KioskActivityPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { getLogs } = useKioskTokenLogs(profile?.organization_id);
  const { data: kiosks } = useKiosks();

  const [logs, setLogs] = useState<TokenLogData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedKiosk, setSelectedKiosk] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState(format(subDays(new Date(), 7), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(format(new Date(), "yyyy-MM-dd"));

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await getLogs({
        kioskId: selectedKiosk === "all" ? undefined : selectedKiosk,
        dateFrom: `${dateFrom}T00:00:00`,
        dateTo: `${dateTo}T23:59:59`,
        limit: 500,
      });
      setLogs(data || []);
    } catch (err) {
      console.error("Error fetching logs:", err);
      toast({
        title: "Error",
        description: "Failed to load activity logs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedKiosk, dateFrom, dateTo, profile?.organization_id]);

  const handleExport = () => {
    const csvContent = [
      ["Token", "Patient", "Phone", "Doctor", "Department", "Kiosk", "Type", "Generated At"].join(","),
      ...logs.map((log) =>
        [
          log.token_number,
          `"${log.patient_name || ""}"`,
          log.patient_phone || "",
          `"${log.doctor_name || ""}"`,
          `"${log.department || ""}"`,
          `"${log.kiosk?.name || ""}"`,
          log.kiosk?.kiosk_type || "",
          format(new Date(log.generated_at), "yyyy-MM-dd HH:mm:ss"),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kiosk-activity-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exported",
      description: `${logs.length} records exported to CSV`,
    });
  };

  const priorityBadge = (priority: number) => {
    if (priority >= 2) return <Badge variant="destructive">Emergency</Badge>;
    if (priority === 1) return <Badge variant="default">Urgent</Badge>;
    return <Badge variant="secondary">Normal</Badge>;
  };

  // Stats
  const totalTokens = logs.length;
  const todayTokens = logs.filter(
    (l) => format(new Date(l.generated_at), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
  ).length;
  const uniquePatients = new Set(logs.map((l) => l.patient_phone).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kiosk Activity Log"
        description="View all tokens generated from kiosks"
        breadcrumbs={[
          { label: "Settings", href: "/app/settings" },
          { label: "Kiosks", href: "/app/settings/kiosks" },
          { label: "Activity Log" },
        ]}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Ticket className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalTokens}</p>
                <p className="text-sm text-muted-foreground">Total Tokens</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayTokens}</p>
                <p className="text-sm text-muted-foreground">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{uniquePatients}</p>
                <p className="text-sm text-muted-foreground">Unique Patients</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label>Kiosk</Label>
              <Select value={selectedKiosk} onValueChange={setSelectedKiosk}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Kiosks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Kiosks</SelectItem>
                  {kiosks?.map((kiosk) => (
                    <SelectItem key={kiosk.id} value={kiosk.id}>
                      {kiosk.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>From Date</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-[160px]"
              />
            </div>

            <div className="space-y-2">
              <Label>To Date</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-[160px]"
              />
            </div>

            <Button variant="outline" onClick={fetchLogs}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>

            <Button variant="outline" onClick={handleExport} disabled={logs.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No activity logs found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting the date range or kiosk filter
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Kiosk</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Generated At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <span className="font-mono font-bold text-lg">
                          {log.token_number}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{log.patient_name || "N/A"}</p>
                            {log.patient_phone && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {log.patient_phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-4 w-4 text-muted-foreground" />
                          {log.doctor_name || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>{log.department || "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{log.kiosk?.name}</span>
                          <Badge variant="outline" className="text-xs w-fit uppercase">
                            {log.kiosk?.kiosk_type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{priorityBadge(log.priority)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{format(new Date(log.generated_at), "dd MMM yyyy")}</p>
                          <p className="text-muted-foreground">
                            {format(new Date(log.generated_at), "HH:mm:ss")}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
