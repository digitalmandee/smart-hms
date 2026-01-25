import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Wallet, 
  Search, 
  Download, 
  CheckCircle,
  Loader2,
  TrendingUp,
  Users,
  DollarSign,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/currency";
import { useMarkEarningsAsPaid } from "@/hooks/useDoctorCompensation";
import { toast } from "sonner";

interface DoctorBalance {
  doctorId: string;
  doctorName: string;
  employeeNumber: string;
  department: string | null;
  totalUnpaid: number;
  consultations: number;
  surgeries: number;
  procedures: number;
  other: number;
  earningIds: string[];
}

export default function DoctorWalletBalancesPage() {
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [payingDoctorId, setPayingDoctorId] = useState<string | null>(null);
  const markAsPaid = useMarkEarningsAsPaid();

  const { data: balances, isLoading, refetch } = useQuery({
    queryKey: ["doctor-wallet-balances", profile?.organization_id],
    queryFn: async () => {
      // Get all doctors with their employees
      const { data: doctors, error: docError } = await supabase
        .from("doctors")
        .select(`
          id,
          employee:employees!doctors_employee_id_fkey(
            first_name,
            last_name,
            employee_number,
            department:departments(name)
          )
        `)
        .eq("organization_id", profile!.organization_id!);

      if (docError) throw docError;

      // Get all unpaid earnings
      const { data: earnings, error: earnError } = await supabase
        .from("doctor_earnings")
        .select("id, doctor_id, source_type, doctor_share_amount")
        .eq("organization_id", profile!.organization_id!)
        .eq("is_paid", false);

      if (earnError) throw earnError;

      // Aggregate by doctor
      const balanceMap: Record<string, DoctorBalance> = {};

      doctors?.forEach((doc: any) => {
        const emp = doc.employee;
        if (!emp) return;
        
        balanceMap[doc.id] = {
          doctorId: doc.id,
          doctorName: `${emp.first_name || ""} ${emp.last_name || ""}`.trim(),
          employeeNumber: emp.employee_number || "",
          department: emp.department?.name || null,
          totalUnpaid: 0,
          consultations: 0,
          surgeries: 0,
          procedures: 0,
          other: 0,
          earningIds: [],
        };
      });

      earnings?.forEach((e: any) => {
        const balance = balanceMap[e.doctor_id];
        if (!balance) return;

        const amount = Number(e.doctor_share_amount);
        balance.totalUnpaid += amount;
        balance.earningIds.push(e.id);

        switch (e.source_type) {
          case "consultation":
          case "ipd_visit":
            balance.consultations += amount;
            break;
          case "surgery":
            balance.surgeries += amount;
            break;
          case "procedure":
            balance.procedures += amount;
            break;
          default:
            balance.other += amount;
        }
      });

      return Object.values(balanceMap)
        .filter(b => b.totalUnpaid > 0)
        .sort((a, b) => b.totalUnpaid - a.totalUnpaid);
    },
    enabled: !!profile?.organization_id,
  });

  const filteredBalances = balances?.filter(b => 
    b.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPending = balances?.reduce((sum, b) => sum + b.totalUnpaid, 0) || 0;
  const doctorsWithBalance = balances?.length || 0;

  const handleMarkAsPaid = async (balance: DoctorBalance) => {
    setPayingDoctorId(balance.doctorId);
    try {
      await markAsPaid.mutateAsync(balance.earningIds);
      toast.success(`Marked ${formatCurrency(balance.totalUnpaid)} as paid for ${balance.doctorName}`);
      refetch();
    } catch (error) {
      // Error handled in hook
    } finally {
      setPayingDoctorId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Doctor Wallet Balances"
        description="View and manage pending commission payments for all doctors"
        breadcrumbs={[
          { label: "HR", href: "/app/hr" },
          { label: "Payroll", href: "/app/hr/payroll" },
          { label: "Wallet Balances" },
        ]}
        actions={
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Pending</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPending)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-full">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Doctors with Balance</p>
                <p className="text-2xl font-bold">{doctorsWithBalance}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg per Doctor</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(doctorsWithBalance > 0 ? totalPending / doctorsWithBalance : 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Balances Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              <CardTitle>Pending Balances</CardTitle>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredBalances?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No pending wallet balances</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Consultations</TableHead>
                  <TableHead className="text-right">Surgeries</TableHead>
                  <TableHead className="text-right">Procedures</TableHead>
                  <TableHead className="text-right">Other</TableHead>
                  <TableHead className="text-right">Total Pending</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBalances?.map((balance) => (
                  <TableRow key={balance.doctorId}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{balance.doctorName}</p>
                        <p className="text-sm text-muted-foreground">{balance.employeeNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {balance.department ? (
                        <Badge variant="outline">{balance.department}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {balance.consultations > 0 ? formatCurrency(balance.consultations) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {balance.surgeries > 0 ? formatCurrency(balance.surgeries) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {balance.procedures > 0 ? formatCurrency(balance.procedures) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {balance.other > 0 ? formatCurrency(balance.other) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold text-primary">
                        {formatCurrency(balance.totalUnpaid)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkAsPaid(balance)}
                        disabled={payingDoctorId === balance.doctorId}
                      >
                        {payingDoctorId === balance.doctorId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Paid
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
