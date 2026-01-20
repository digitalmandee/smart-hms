import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, User, Phone, FileText, Clock, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDebounce } from "@/hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

interface PatientSearchResult {
  id: string;
  patient_number: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  last_visit?: string | null;
}

interface PatientGlobalSearchProps {
  onPatientSelect?: (patient: PatientSearchResult) => void;
  placeholder?: string;
  showQuickActions?: boolean;
}

export function PatientGlobalSearch({
  onPatientSelect,
  placeholder = "Search patient by MR#, name, or phone...",
  showQuickActions = true,
}: PatientGlobalSearchProps) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const debouncedQuery = useDebounce(searchQuery, 300);

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["patient-global-search", debouncedQuery, profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id || !debouncedQuery || debouncedQuery.length < 2) {
        return [];
      }

      const searchTerm = debouncedQuery.toLowerCase();

      const { data, error } = await supabase
        .from("patients")
        .select(`
          id,
          patient_number,
          first_name,
          last_name,
          phone,
          date_of_birth,
          gender
        `)
        .eq("organization_id", profile.organization_id)
        .or(`patient_number.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as PatientSearchResult[];
    },
    enabled: !!profile?.organization_id && debouncedQuery.length >= 2,
  });

  const handlePatientClick = useCallback((patient: PatientSearchResult) => {
    if (onPatientSelect) {
      onPatientSelect(patient);
    } else {
      navigate(`/app/patients/${patient.id}`);
    }
    setSearchQuery("");
    setIsFocused(false);
  }, [onPatientSelect, navigate]);

  const calculateAge = (dob: string | null): string => {
    if (!dob) return "";
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age}y`;
  };

  const showResults = isFocused && (results.length > 0 || (debouncedQuery.length >= 2 && !isLoading));

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className="pl-10 pr-4"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      </div>

      {showResults && (
        <Card className="absolute z-50 w-full mt-1 shadow-lg border">
          <ScrollArea className="max-h-80">
            <CardContent className="p-2">
              {results.length === 0 && debouncedQuery.length >= 2 ? (
                <div className="py-6 text-center text-muted-foreground">
                  <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No patients found for "{debouncedQuery}"</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {results.map((patient) => (
                    <div
                      key={patient.id}
                      onClick={() => handlePatientClick(patient)}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {patient.first_name} {patient.last_name}
                            <Badge variant="outline" className="text-xs">
                              {patient.patient_number}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-3">
                            {patient.gender && (
                              <span className="capitalize">{patient.gender}</span>
                            )}
                            {patient.date_of_birth && (
                              <span>{calculateAge(patient.date_of_birth)}</span>
                            )}
                            {patient.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {patient.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {showQuickActions && (
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/app/patients/${patient.id}`);
                            }}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Profile
                          </Button>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </ScrollArea>
        </Card>
      )}
    </div>
  );
}
