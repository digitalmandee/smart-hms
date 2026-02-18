import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus, UserPlus, Users, UserCheck, Calendar, ArrowUpDown, Search } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/StatusBadge";
import { usePatients, usePatientStats, useUpdatePatient } from "@/hooks/usePatients";
import { Database } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobilePatientList } from "@/components/mobile/MobilePatientList";
import { useTranslation } from "@/lib/i18n";

type Patient = Database["public"]["Tables"]["patients"]["Row"];

export function PatientsListPage() {
  const navigate = useNavigate();
  const { roles } = useAuth();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: patients, isLoading } = usePatients(searchQuery);
  const { data: stats } = usePatientStats();
  const updatePatient = useUpdatePatient();

  const isMobileScreen = useIsMobile();
  const isNative = Capacitor.isNativePlatform();
  const showMobileUI = isMobileScreen || isNative;

  if (showMobileUI) return <MobilePatientList />;

  const canRegisterPatient = roles.some(r =>
    ['receptionist', 'nurse', 'org_admin', 'branch_admin', 'super_admin'].includes(r)
  );

  const handleToggleActive = (id: string, currentStatus: boolean) => {
    updatePatient.mutate({ id, data: { is_active: !currentStatus } });
  };

  const getFullName = (patient: Patient) =>
    `${patient.first_name}${patient.last_name ? ` ${patient.last_name}` : ""}`;

  const getAge = (dob: string | null) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const columns: ColumnDef<Patient>[] = [
    {
      accessorKey: "patient_number",
      header: t("patients.patientNo"),
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.patient_number}</span>,
    },
    {
      accessorKey: "first_name",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-ml-4">
          {t("patients.patientName")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{getFullName(row.original)}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {row.original.gender && <span className="capitalize">{row.original.gender}</span>}
            {row.original.date_of_birth && (
              <><span>•</span><span>{getAge(row.original.date_of_birth)} yrs</span></>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: t("patients.contact"),
      cell: ({ row }) => (
        <div className="text-sm">
          <p>{row.original.phone || "-"}</p>
          {row.original.email && <p className="text-xs text-muted-foreground">{row.original.email}</p>}
        </div>
      ),
    },
    {
      accessorKey: "blood_group",
      header: t("patients.blood"),
      cell: ({ row }) =>
        row.original.blood_group ? (
          <Badge variant="outline" className="font-medium">{row.original.blood_group}</Badge>
        ) : <span className="text-muted-foreground">-</span>,
    },
    {
      accessorKey: "city",
      header: t("patients.city"),
      cell: ({ row }) => row.original.city || "-",
    },
    {
      accessorKey: "is_active",
      header: t("common.status"),
      cell: ({ row }) => <StatusBadge status={row.original.is_active ? "active" : "inactive"} />,
    },
    {
      accessorKey: "created_at",
      header: t("patients.registered"),
      cell: ({ row }) => format(new Date(row.original.created_at), "MMM dd, yyyy"),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/app/patients/${row.original.id}`)}>
              {t("patients.viewProfile")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/app/patients/${row.original.id}/edit`)}>
              {t("common.edit")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleActive(row.original.id, row.original.is_active || false)}>
              {row.original.is_active ? t("patients.deactivate") : t("patients.activate")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t("patients.title")}
        description={t("patients.subtitle")}
        breadcrumbs={[{ label: t("patients.title") }]}
        actions={
          canRegisterPatient && (
            <Link to="/app/patients/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t("patients.registerPatient")}
              </Button>
            </Link>
          )
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard title={t("patients.totalPatients")} value={stats?.total || 0} icon={Users} variant="primary" />
        <StatsCard title={t("patients.activePatients")} value={stats?.active || 0} icon={UserCheck} variant="success" />
        <StatsCard title={t("patients.registeredToday")} value={stats?.today || 0} icon={UserPlus} variant="info" />
        <StatsCard title={t("patients.newThisMonth")} value={stats?.thisMonth || 0} icon={Calendar} variant="warning" />
      </div>

      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("patients.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={patients || []}
        isLoading={isLoading}
        onRowClick={(row) => navigate(`/app/patients/${row.id}`)}
      />
    </div>
  );
}
