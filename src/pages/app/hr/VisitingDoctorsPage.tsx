import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";
import { useAllDoctors } from "@/hooks/useDoctors";
import { useDoctorCompensationPlans } from "@/hooks/useDoctorCompensation";
import { Search, Plus, Stethoscope, DollarSign, Calendar, Clock } from "lucide-react";

export default function VisitingDoctorsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: doctors, isLoading } = useAllDoctors();
  const { data: compensationPlans } = useDoctorCompensationPlans();

  // Filter visiting doctors (those with consultation share or visiting pattern)
  const visitingDoctors = doctors?.filter((doc) => {
    const plan = compensationPlans?.find((p) => p.doctor_id === doc.id);
    // Visiting doctors typically have commission-based compensation
    return (plan?.consultation_share_percent && plan.consultation_share_percent > 0) || 
      doc.is_available === false;
  }) || [];

  const filteredDoctors = visitingDoctors.filter((doc) =>
    doc.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCompensationPlan = (doctorId: string) => {
    return compensationPlans?.find((p) => p.doctor_id === doctorId);
  };

  // Stats
  const totalVisiting = visitingDoctors.length;
  const withCompensation = visitingDoctors.filter((d) => getCompensationPlan(d.id)).length;
  const commissionBased = compensationPlans?.filter((p) => 
    p.consultation_share_percent && p.consultation_share_percent > 0 && visitingDoctors.find((d) => d.id === p.doctor_id)
  ).length || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visiting Doctors"
        description="Manage visiting consultants and their compensation plans"
        breadcrumbs={[
          { label: t('nav.hr' as any), href: "/app/hr" },
          { label: "Employees" },
          { label: "Visiting Doctors" },
        ]}
        actions={
          <Button onClick={() => navigate("/app/hr/payroll/doctor-compensation")}>
            <DollarSign className="h-4 w-4 mr-2" />
            Manage Compensation
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Stethoscope className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{totalVisiting}</div>
                <p className="text-muted-foreground text-sm">Total Visiting</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{withCompensation}</div>
                <p className="text-muted-foreground text-sm">With Compensation Plan</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{commissionBased}</div>
                <p className="text-muted-foreground text-sm">Commission Based</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Clock className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{totalVisiting - commissionBased}</div>
                <p className="text-muted-foreground text-sm">Fee Per Service</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or specialization..." className="pl-9"
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>

      {/* Doctors Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Qualification</TableHead>
                  <TableHead>Compensation Type</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDoctors.map((doc) => {
                  const plan = getCompensationPlan(doc.id);
                  return (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={doc.profile?.avatar_url || ""} />
                            <AvatarFallback>
                              {doc.profile?.full_name?.split(" ").map((n) => n[0]).join("") || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{doc.profile?.full_name}</p>
                            <p className="text-sm text-muted-foreground">{doc.profile?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{doc.specialization || "-"}</Badge>
                      </TableCell>
                      <TableCell>{doc.qualification || "-"}</TableCell>
                      <TableCell>
                        {plan ? (
                          <Badge className={
                            plan.consultation_share_percent ? "bg-green-100 text-green-800" :
                            plan.surgery_share_percent ? "bg-blue-100 text-blue-800" :
                            "bg-gray-100 text-gray-800"
                          }>
                            {plan.consultation_share_percent ? "Commission" : "Fee Based"}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {plan?.consultation_share_percent ? (
                          <span>{plan.consultation_share_percent}%</span>
                        ) : plan?.base_salary ? (
                          <span>Rs. {plan.base_salary}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={doc.is_available ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>
                          {doc.is_available ? "Available" : "Unavailable"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" 
                            onClick={() => navigate(`/app/hr/payroll/doctor-compensation?doctor=${doc.id}`)}>
                            Compensation
                          </Button>
                          <Button variant="ghost" size="sm"
                            onClick={() => navigate(`/app/hr/payroll/doctor-earnings?doctor=${doc.id}`)}>
                            Earnings
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!filteredDoctors.length && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No visiting doctors found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
