import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays, isWithinInterval } from "date-fns";
import {
  Baby,
  Calendar,
  Heart,
  AlertTriangle,
  Plus,
  Users,
  Activity,
  ClipboardList,
  FileText,
  Stethoscope,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function GynecologyDashboard() {
  const { profile } = useAuth();

  // Fetch active pregnancies (recent ANC records)
  const { data: activePregnancies, isLoading: loadingPregnancies } = useQuery({
    queryKey: ['active-pregnancies', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('anc_records')
        .select(`
          *,
          patient:patients(id, first_name, last_name, patient_number, phone)
        `)
        .eq('organization_id', profile?.organization_id!)
        .order('edd_date', { ascending: true })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  // Fetch recent births
  const { data: recentBirths, isLoading: loadingBirths } = useQuery({
    queryKey: ['recent-births', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('birth_records')
        .select(`
          *,
          mother:patients!birth_records_mother_patient_id_fkey(id, first_name, last_name, patient_number)
        `)
        .eq('organization_id', profile?.organization_id!)
        .order('birth_date', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  // Upcoming deliveries (EDD within 2 weeks)
  const upcomingDeliveries = activePregnancies?.filter(p => {
    if (!p.edd_date) return false;
    const eddDate = new Date(p.edd_date);
    const today = new Date();
    return isWithinInterval(eddDate, {
      start: today,
      end: addDays(today, 14)
    });
  }) || [];

  // High risk pregnancies
  const highRiskPregnancies = activePregnancies?.filter(p => 
    p.risk_category === 'high' || p.risk_category === 'very_high'
  ) || [];

  return (
    <div>
      <PageHeader
        title="Gynecology & Obstetrics"
        description="Manage antenatal care, deliveries, and birth registrations"
        breadcrumbs={[
          { label: "OPD", href: "/app/opd" },
          { label: "Gynecology" },
        ]}
        actions={
          <div className="flex gap-2">
            <Link to="/app/opd/anc/new">
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                New ANC Visit
              </Button>
            </Link>
            <Link to="/app/ipd/births/new">
              <Button>
                <Baby className="h-4 w-4 mr-2" />
                Register Birth
              </Button>
            </Link>
          </div>
        }
      />

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-pink-500/10">
              <Heart className="h-5 w-5 text-pink-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activePregnancies?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Active Pregnancies</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-500/10">
              <Calendar className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{upcomingDeliveries.length}</p>
              <p className="text-sm text-muted-foreground">Due in 2 Weeks</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{highRiskPregnancies.length}</p>
              <p className="text-sm text-muted-foreground">High Risk</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/10">
              <Baby className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{recentBirths?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Recent Births</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Deliveries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Deliveries
            </CardTitle>
            <CardDescription>Expected within the next 2 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingPregnancies ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : upcomingDeliveries.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No upcoming deliveries</p>
            ) : (
              <div className="space-y-3">
                {upcomingDeliveries.map((pregnancy: any) => (
                  <Link 
                    key={pregnancy.id}
                    to={`/app/patients/${pregnancy.patient?.id}`}
                    className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {pregnancy.patient?.first_name} {pregnancy.patient?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {pregnancy.patient?.patient_number}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          EDD: {pregnancy.edd_date && format(new Date(pregnancy.edd_date), 'MMM dd')}
                        </Badge>
                        {pregnancy.risk_category === 'high' && (
                          <Badge variant="destructive" className="ml-2">High Risk</Badge>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      G{pregnancy.gravida || 0}P{pregnancy.para || 0}A{pregnancy.abortion || 0}L{pregnancy.living || 0}
                      {pregnancy.gestational_age_weeks && ` • ${pregnancy.gestational_age_weeks}+${pregnancy.gestational_age_days || 0} weeks`}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Births */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Baby className="h-5 w-5" />
                Recent Births
              </CardTitle>
              <CardDescription>Latest birth registrations</CardDescription>
            </div>
            <Link to="/app/ipd/births">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loadingBirths ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : !recentBirths?.length ? (
              <p className="text-muted-foreground text-center py-4">No birth records yet</p>
            ) : (
              <div className="space-y-3">
                {recentBirths.map((birth: any) => (
                  <div 
                    key={birth.id}
                    className="p-3 rounded-lg border"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          Baby of {birth.mother?.first_name} {birth.mother?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {birth.certificate_number || 'Pending certificate'}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={birth.gender === 'male' ? 'default' : 'secondary'}>
                          {birth.gender === 'male' ? '♂ Boy' : birth.gender === 'female' ? '♀ Girl' : 'Unknown'}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                      <span>{format(new Date(birth.birth_date), 'MMM dd, yyyy')} at {birth.birth_time}</span>
                      {birth.birth_weight_grams && <span>{birth.birth_weight_grams}g</span>}
                      <span className="capitalize">{birth.delivery_type?.replace('_', ' ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <Link to="/app/opd/anc/new">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                  <Stethoscope className="h-6 w-6" />
                  <span>New ANC Visit</span>
                </Button>
              </Link>
              <Link to="/app/ipd/births/new">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                  <Baby className="h-6 w-6" />
                  <span>Register Birth</span>
                </Button>
              </Link>
              <Link to="/app/ipd/deaths">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                  <FileText className="h-6 w-6" />
                  <span>Death Records</span>
                </Button>
              </Link>
              <Link to="/app/certificates">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                  <ClipboardList className="h-6 w-6" />
                  <span>Certificates</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
