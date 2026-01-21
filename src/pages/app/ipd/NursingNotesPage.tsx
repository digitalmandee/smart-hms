import { useState } from "react";
import { format } from "date-fns";
import { FileText, ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAdmissions } from "@/hooks/useAdmissions";
import { NursingNotesForm } from "@/components/ipd/NursingNotesForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const NursingNotesPage = () => {
  const [selectedAdmission, setSelectedAdmission] = useState<string>("");

  const { data: admissions = [] } = useAdmissions();
  const activeAdmissions = admissions.filter((a) => a.status === "admitted");

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["nursing-notes", selectedAdmission],
    queryFn: async () => {
      if (!selectedAdmission) return [];
      const { data, error } = await supabase
        .from("nursing_notes")
        .select(`
          *,
          nurse:profiles!nursing_notes_recorded_by_fkey(full_name)
        `)
        .eq("admission_id", selectedAdmission)
        .order("recorded_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedAdmission,
  });

  const selectedAdmissionData = admissions.find((a) => a.id === selectedAdmission);

  const getNoteTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      assessment: "default",
      intervention: "secondary",
      observation: "outline",
      handover: "default",
      progress: "secondary",
      medication: "outline",
      procedure: "default",
      admission: "default",
      discharge: "destructive",
    };
    return variants[type] || "default";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nursing Notes"
        description="Document patient care and observations"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Patient</CardTitle>
        </CardHeader>
        <CardContent>
          {activeAdmissions.length === 0 ? (
            <p className="text-muted-foreground">No admitted patients found</p>
          ) : (
            <Select value={selectedAdmission} onValueChange={setSelectedAdmission}>
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Select admitted patient" />
              </SelectTrigger>
              <SelectContent>
                {activeAdmissions.map((admission) => (
                  <SelectItem key={admission.id} value={admission.id}>
                    {admission.admission_number} - {admission.patient?.first_name}{" "}
                    {admission.patient?.last_name} {admission.bed?.bed_number ? `(${admission.bed.bed_number})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {selectedAdmission && (
        <>
          <NursingNotesForm admissionId={selectedAdmission} />

          <Card>
            <CardHeader>
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Nursing Documentation
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {selectedAdmissionData?.patient?.first_name}{" "}
                  {selectedAdmissionData?.patient?.last_name} - Bed{" "}
                  {selectedAdmissionData?.bed?.bed_number}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading notes...
                </div>
              ) : notes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No nursing notes recorded yet</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {notes.map((note: any) => (
                      <Card key={note.id} className="bg-muted/50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant={getNoteTypeBadge(note.note_type)}>
                                {note.note_type}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(note.recorded_at), "dd MMM yyyy HH:mm")}
                              </span>
                            </div>
                            <span className="text-sm font-medium">
                              {note.nurse?.full_name || "Unknown"}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default NursingNotesPage;
