import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Stethoscope } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDebounce } from "@/hooks/useDebounce";
import { useDentalT } from "@/lib/dental/i18n";
import { SEO } from "@/components/SEO";

export default function DentalWorkspacePatientsPage() {
  const { dt, isRTL } = useDentalT();
  const { profile } = useAuth();
  const [search, setSearch] = useState("");
  const q = useDebounce(search, 300);

  const { data: patients, isLoading } = useQuery({
    queryKey: ["dental-ws-patients", q, profile?.organization_id],
    queryFn: async () => {
      let query = supabase
        .from("patients")
        .select("id, patient_number, first_name, last_name, gender, phone, date_of_birth")
        .eq("organization_id", profile!.organization_id!)
        .order("created_at", { ascending: false })
        .limit(50);
      if (q.trim()) {
        query = query.or(
          `first_name.ilike.%${q}%,last_name.ilike.%${q}%,phone.ilike.%${q}%,patient_number.ilike.%${q}%`
        );
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  return (
    <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
      <SEO
        title="Dental Workspace — Select Patient"
        description="Open the dental workspace for a patient to chart the odontogram, plan treatment and record specialty care."
        path="/app/dental/workspace"
      />
      <div>
        <h1 className="text-xl font-semibold">{dt("dw.workspace")}</h1>
        <p className="text-sm text-muted-foreground">{dt("dw.selectPatient")}</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            {dt("dw.patients")}
            <Badge variant="secondary">{dt("dw.total")}: {patients?.length ?? 0}</Badge>
          </CardTitle>
          <div className="relative">
            <Search className="absolute start-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={dt("dw.searchPatient")}
              className="ps-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">…</p>
          ) : !patients?.length ? (
            <p className="text-sm text-muted-foreground">{dt("dw.noRecords")}</p>
          ) : (
            <div className="divide-y">
              {patients.map((p: any) => (
                <div key={p.id} className="flex items-center gap-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.first_name} {p.last_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.patient_number}{p.phone ? ` · ${p.phone}` : ""}{p.gender ? ` · ${p.gender}` : ""}
                    </p>
                  </div>
                  <Button asChild size="sm" className="gap-1.5">
                    <Link to={`/app/dental/workspace/${p.id}`}>
                      <Stethoscope className="h-4 w-4" /> {dt("dw.openWorkspace")}
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
