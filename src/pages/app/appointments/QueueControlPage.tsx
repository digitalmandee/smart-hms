import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { 
  Megaphone, 
  SkipForward, 
  RotateCcw, 
  CheckCircle, 
  Users,
  Volume2,
  VolumeX,
  RefreshCw
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDoctors } from "@/hooks/useDoctors";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface QueuePatient {
  id: string;
  token_number: number;
  priority: number;
  status: string;
  patient: {
    first_name: string;
    last_name: string;
    patient_number: string;
  };
  doctor: {
    id: string;
    employee: {
      first_name: string;
      last_name: string;
    };
  };
  chief_complaint: string | null;
  check_in_at: string | null;
}

const priorityConfig: Record<number, { label: string; color: string }> = {
  0: { label: "Normal", color: "bg-slate-100 text-slate-800" },
  1: { label: "Urgent", color: "bg-amber-100 text-amber-800" },
  2: { label: "Emergency", color: "bg-red-100 text-red-800" },
};

export default function QueueControlPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { data: doctors } = useDoctors();
  
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all");
  const [queue, setQueue] = useState<QueuePatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const today = format(new Date(), "yyyy-MM-dd");

  const fetchQueue = useCallback(async () => {
    if (!profile?.organization_id) return;

    const client: any = supabase;
    let query = client
      .from("appointments")
      .select(`
        id,
        token_number,
        priority,
        status,
        chief_complaint,
        check_in_at,
        patient:patients(first_name, last_name, patient_number),
        doctor:doctors(id, employee:employees(first_name, last_name))
      `)
      .eq("organization_id", profile.organization_id)
      .eq("appointment_date", today)
      .in("status", ["checked_in", "in_progress"])
      .order("priority", { ascending: false })
      .order("token_number", { ascending: true });

    if (selectedDoctor !== "all") {
      query = query.eq("doctor_id", selectedDoctor);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching queue:", error);
      return;
    }

    setQueue(data || []);
    setIsLoading(false);
  }, [profile?.organization_id, today, selectedDoctor]);

  useEffect(() => {
    fetchQueue();

    // Set up real-time subscription
    const channel = supabase
      .channel("queue-control-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
          filter: `appointment_date=eq.${today}`,
        },
        () => {
          fetchQueue();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchQueue, today]);

  const speakToken = (tokenNumber: number, patientName: string) => {
    if (!audioEnabled || !("speechSynthesis" in window)) return;

    const utterance = new SpeechSynthesisUtterance(
      `Token number ${tokenNumber}. ${patientName}, please proceed to the consultation room.`
    );
    utterance.rate = 0.9;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
  };

  const handleCallNext = async () => {
    const waitingPatients = queue.filter((p) => p.status === "checked_in");
    if (waitingPatients.length === 0) {
      toast({
        title: "No patients waiting",
        description: "There are no patients in the queue to call.",
      });
      return;
    }

    setIsProcessing(true);
    const nextPatient = waitingPatients[0];

    const client: any = supabase;
    const { error } = await client
      .from("appointments")
      .update({ status: "in_progress" })
      .eq("id", nextPatient.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to call next patient.",
        variant: "destructive",
      });
    } else {
      const patientName = `${nextPatient.patient.first_name} ${nextPatient.patient.last_name}`;
      speakToken(nextPatient.token_number, patientName);
      toast({
        title: "Patient Called",
        description: `Token #${nextPatient.token_number} - ${patientName}`,
      });
    }

    setIsProcessing(false);
  };

  const handleSkip = async () => {
    const currentPatient = queue.find((p) => p.status === "in_progress");
    if (!currentPatient) {
      toast({
        title: "No patient in progress",
        description: "Call a patient first before skipping.",
      });
      return;
    }

    setIsProcessing(true);
    const client: any = supabase;

    // Move current patient back to checked_in
    await client
      .from("appointments")
      .update({ status: "checked_in", priority: 0 })
      .eq("id", currentPatient.id);

    // Call next patient
    await handleCallNext();
    setIsProcessing(false);
  };

  const handleRecall = async () => {
    const currentPatient = queue.find((p) => p.status === "in_progress");
    if (!currentPatient) {
      toast({
        title: "No patient to recall",
        description: "No patient is currently being served.",
      });
      return;
    }

    const patientName = `${currentPatient.patient.first_name} ${currentPatient.patient.last_name}`;
    speakToken(currentPatient.token_number, patientName);
    toast({
      title: "Patient Recalled",
      description: `Token #${currentPatient.token_number} - ${patientName}`,
    });
  };

  const handleComplete = async () => {
    const currentPatient = queue.find((p) => p.status === "in_progress");
    if (!currentPatient) {
      toast({
        title: "No patient in progress",
        description: "Call a patient first before completing.",
      });
      return;
    }

    setIsProcessing(true);
    const client: any = supabase;
    const { error } = await client
      .from("appointments")
      .update({ status: "completed" })
      .eq("id", currentPatient.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to complete consultation.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Consultation Completed",
        description: `Token #${currentPatient.token_number} marked as completed.`,
      });
    }

    setIsProcessing(false);
  };

  const currentPatient = queue.find((p) => p.status === "in_progress");
  const waitingPatients = queue.filter((p) => p.status === "checked_in");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Queue Control"
        description="Manage patient queue and call next patients"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setAudioEnabled(!audioEnabled)}
            >
              {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={fetchQueue}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <div className="flex items-center gap-4">
        <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select Doctor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Doctors</SelectItem>
            {doctors?.map((doctor) => (
              <SelectItem key={doctor.id} value={doctor.id}>
                Dr. {doctor.employee?.first_name} {doctor.employee?.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Current Patient */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Now Serving
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : currentPatient ? (
              <div className="text-center space-y-4">
                <div className="text-8xl font-bold text-primary">
                  #{currentPatient.token_number}
                </div>
                <div className="text-2xl font-semibold">
                  {currentPatient.patient.first_name} {currentPatient.patient.last_name}
                </div>
                <div className="text-muted-foreground">
                  MR#: {currentPatient.patient.patient_number}
                </div>
                {currentPatient.chief_complaint && (
                  <div className="text-sm text-muted-foreground">
                    Complaint: {currentPatient.chief_complaint}
                  </div>
                )}
                <Badge className={priorityConfig[currentPatient.priority]?.color || priorityConfig[0].color}>
                  {priorityConfig[currentPatient.priority]?.label || "Normal"}
                </Badge>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No patient currently being served</p>
                <p className="text-sm">Click "Call Next" to serve the next patient</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Control Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Controls</CardTitle>
            <CardDescription>
              {waitingPatients.length} patients waiting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full h-16 text-lg"
              onClick={handleCallNext}
              disabled={isProcessing || waitingPatients.length === 0}
            >
              <Megaphone className="mr-2 h-5 w-5" />
              Call Next
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleRecall}
              disabled={isProcessing || !currentPatient}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Recall Current
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleSkip}
              disabled={isProcessing || !currentPatient}
            >
              <SkipForward className="mr-2 h-4 w-4" />
              Skip & Call Next
            </Button>

            <Button
              variant="default"
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={handleComplete}
              disabled={isProcessing || !currentPatient}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Complete
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Waiting List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Waiting Queue
          </CardTitle>
          <CardDescription>
            Patients waiting to be called (sorted by priority and token number)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : waitingPatients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No patients waiting in queue
            </div>
          ) : (
            <div className="space-y-2">
              {waitingPatients.map((patient, index) => (
                <div
                  key={patient.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    index === 0 ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-primary">
                      #{patient.token_number}
                    </div>
                    <div>
                      <div className="font-medium">
                        {patient.patient.first_name} {patient.patient.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Dr. {patient.doctor?.employee?.first_name} {patient.doctor?.employee?.last_name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={priorityConfig[patient.priority]?.color || priorityConfig[0].color}>
                      {priorityConfig[patient.priority]?.label || "Normal"}
                    </Badge>
                    {index === 0 && (
                      <Badge variant="outline">Next</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
