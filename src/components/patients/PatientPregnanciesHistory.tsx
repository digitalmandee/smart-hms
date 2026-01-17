import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Baby, Calendar, Heart, AlertTriangle, Plus, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface PatientPregnanciesHistoryProps {
  patientId: string;
}

export function PatientPregnanciesHistory({ patientId }: PatientPregnanciesHistoryProps) {
  // Fetch ANC records for the patient
  const { data: ancRecords, isLoading: loadingANC } = useQuery({
    queryKey: ['patient-anc-records', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('anc_records')
        .select(`
          *,
          attended_by_doctor:doctors!anc_records_attended_by_fkey(
            id,
            profiles:profiles(full_name)
          )
        `)
        .eq('patient_id', patientId)
        .order('visit_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch birth records where this patient is the mother
  const { data: birthRecords, isLoading: loadingBirths } = useQuery({
    queryKey: ['patient-birth-records', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('birth_records')
        .select(`
          *,
          baby:patients!birth_records_baby_patient_id_fkey(id, first_name, last_name, patient_number),
          doctor:doctors!birth_records_delivered_by_fkey(
            id,
            profiles:profiles(full_name)
          )
        `)
        .eq('mother_patient_id', patientId)
        .order('birth_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const isLoading = loadingANC || loadingBirths;

  // Group ANC records by pregnancy_id or by year if no pregnancy_id
  const groupedPregnancies = ancRecords?.reduce((acc: any, record: any) => {
    const key = record.pregnancy_id || `year-${record.visit_date?.substring(0, 4)}`;
    if (!acc[key]) {
      acc[key] = {
        records: [],
        eddDate: record.edd_date,
        lmpDate: record.lmp_date,
        riskCategory: record.risk_category,
        gravida: record.gravida,
        para: record.para,
      };
    }
    acc[key].records.push(record);
    return acc;
  }, {}) || {};

  const getRiskBadge = (risk: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
      low: "secondary",
      moderate: "outline",
      high: "destructive",
      very_high: "destructive",
    };
    return <Badge variant={variants[risk] || "outline"}>{risk?.replace('_', ' ')}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  const hasData = (ancRecords?.length || 0) > 0 || (birthRecords?.length || 0) > 0;

  if (!hasData) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Baby className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No pregnancy records found</p>
          <Link to={`/app/opd/anc/new?patientId=${patientId}`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Record First ANC Visit
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Birth Records */}
      {birthRecords && birthRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Baby className="h-5 w-5" />
              Birth Outcomes ({birthRecords.length})
            </CardTitle>
            <CardDescription>Recorded births for this patient</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {birthRecords.map((birth: any) => (
                <div 
                  key={birth.id}
                  className="p-4 rounded-lg border"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={birth.gender === 'male' ? 'default' : 'secondary'}>
                          {birth.gender === 'male' ? '♂ Male' : birth.gender === 'female' ? '♀ Female' : 'Unknown'}
                        </Badge>
                        <span className="font-medium">
                          {format(new Date(birth.birth_date), 'MMMM dd, yyyy')} at {birth.birth_time}
                        </span>
                      </div>
                      {birth.baby && (
                        <Link 
                          to={`/app/patients/${birth.baby.id}`}
                          className="text-sm text-primary hover:underline mt-1 block"
                        >
                          Baby: {birth.baby.first_name} {birth.baby.last_name} ({birth.baby.patient_number})
                        </Link>
                      )}
                    </div>
                    <div className="text-right">
                      {birth.certificate_number && (
                        <Badge variant="outline" className="gap-1">
                          <FileText className="h-3 w-3" />
                          {birth.certificate_number}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Delivery Type:</span>
                      <p className="font-medium capitalize">{birth.delivery_type?.replace('_', ' ') || '-'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Weight:</span>
                      <p className="font-medium">{birth.birth_weight_grams ? `${birth.birth_weight_grams}g` : '-'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">APGAR:</span>
                      <p className="font-medium">
                        {birth.apgar_1min !== null ? `${birth.apgar_1min}/${birth.apgar_5min || '-'}` : '-'}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Delivered By:</span>
                      <p className="font-medium">{birth.doctor?.profiles?.full_name || '-'}</p>
                    </div>
                  </div>

                  {/* Vaccinations */}
                  <div className="mt-3 flex gap-2">
                    {birth.bcg_given && <Badge variant="outline">BCG</Badge>}
                    {birth.opv0_given && <Badge variant="outline">OPV-0</Badge>}
                    {birth.hep_b_given && <Badge variant="outline">Hep-B</Badge>}
                    {birth.vitamin_k_given && <Badge variant="outline">Vit-K</Badge>}
                    {birth.nicu_admission && <Badge variant="destructive">NICU</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ANC Records grouped by pregnancy */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Antenatal Care Records
            </CardTitle>
            <CardDescription>ANC visits and pregnancy tracking</CardDescription>
          </div>
          <Link to={`/app/opd/anc/new?patientId=${patientId}`}>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New Visit
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedPregnancies).length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No ANC records found</p>
          ) : (
            <Accordion type="single" collapsible className="space-y-2">
              {Object.entries(groupedPregnancies).map(([key, pregnancy]: [string, any]) => (
                <AccordionItem key={key} value={key} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-4 text-left">
                      <div>
                        <p className="font-medium">
                          {pregnancy.eddDate 
                            ? `EDD: ${format(new Date(pregnancy.eddDate), 'MMM dd, yyyy')}`
                            : `Pregnancy ${key}`
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">
                          G{pregnancy.gravida || 0}P{pregnancy.para || 0} • {pregnancy.records.length} visits
                        </p>
                      </div>
                      {pregnancy.riskCategory && getRiskBadge(pregnancy.riskCategory)}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      {pregnancy.records.map((record: any) => (
                        <div 
                          key={record.id}
                          className="p-3 rounded border bg-muted/30"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {format(new Date(record.visit_date), 'MMM dd, yyyy')}
                              </span>
                              {record.visit_number && (
                                <Badge variant="outline">Visit #{record.visit_number}</Badge>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {record.gestational_age_weeks && `${record.gestational_age_weeks}+${record.gestational_age_days || 0} weeks`}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            {record.weight_kg && (
                              <div>
                                <span className="text-muted-foreground">Weight:</span> {record.weight_kg} kg
                              </div>
                            )}
                            {record.blood_pressure_systolic && (
                              <div>
                                <span className="text-muted-foreground">BP:</span> {record.blood_pressure_systolic}/{record.blood_pressure_diastolic} mmHg
                              </div>
                            )}
                            {record.fundal_height_cm && (
                              <div>
                                <span className="text-muted-foreground">Fundal Height:</span> {record.fundal_height_cm} cm
                              </div>
                            )}
                            {record.fetal_heart_rate && (
                              <div>
                                <span className="text-muted-foreground">FHR:</span> {record.fetal_heart_rate} bpm
                              </div>
                            )}
                          </div>

                          {record.notes && (
                            <p className="mt-2 text-sm text-muted-foreground">{record.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
