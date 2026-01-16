import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useKioskAuth, logKioskToken } from "@/hooks/useKioskAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Loader2, Phone, User, Printer, ArrowLeft, 
  CheckCircle2, Clock, LogOut, Stethoscope
} from "lucide-react";
import { format } from "date-fns";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
}

interface Department {
  name: string;
  doctors: Doctor[];
}

interface TokenData {
  tokenNumber: number;
  patientName: string;
  doctorName: string;
  department: string;
  estimatedWait: number;
  generatedAt: Date;
}

type Step = "phone" | "name" | "department" | "doctor" | "confirm" | "success";

export default function KioskTerminalPage() {
  const { kioskId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session, isLoading: authLoading, logout, isAuthenticated } = useKioskAuth();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [organizationName, setOrganizationName] = useState("");

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/kiosk/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Fetch organization name and doctors
  useEffect(() => {
    if (!session?.organizationId) return;

    const fetchData = async () => {
      try {
        // Fetch organization
        const { data: org } = await (supabase as any)
          .from("organizations")
          .select("name")
          .eq("id", session.organizationId)
          .single();

        if (org) setOrganizationName(org.name);

        // Fetch doctors - filter by kiosk departments if configured
        let query = (supabase as any)
          .from("doctors")
          .select("id, specialization, profile:profiles(full_name)")
          .eq("organization_id", session.organizationId)
          .eq("is_active", true)
          .eq("is_available", true);

        const { data: doctors } = await query;

        if (doctors) {
          // Filter by kiosk departments if set
          const kioskDepts = session.departments || [];
          const filteredDoctors = kioskDepts.length > 0
            ? doctors.filter((d: any) => kioskDepts.includes(d.specialization))
            : doctors;

          // Group by specialization
          const deptMap = new Map<string, Doctor[]>();
          filteredDoctors.forEach((d: any) => {
            const dept = d.specialization || "General";
            if (!deptMap.has(dept)) deptMap.set(dept, []);
            deptMap.get(dept)!.push({
              id: d.id,
              name: d.profile?.full_name || "Doctor",
              specialization: dept,
            });
          });

          setDepartments(
            Array.from(deptMap.entries()).map(([name, doctors]) => ({
              name,
              doctors,
            }))
          );
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [session?.organizationId, session?.departments]);

  const handlePhoneSubmit = async () => {
    if (phone.length < 10) {
      toast({
        title: "Invalid Phone",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Search for existing patient
      const { data: patients } = await (supabase as any)
        .from("patients")
        .select("id, first_name, last_name")
        .eq("organization_id", session?.organizationId)
        .eq("phone", phone)
        .limit(1);

      if (patients && patients.length > 0) {
        const patient = patients[0];
        setPatientId(patient.id);
        setPatientName(`${patient.first_name} ${patient.last_name}`);
        setStep("department");
      } else {
        setStep("name");
      }
    } catch (err) {
      console.error("Error searching patient:", err);
      setStep("name");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNameSubmit = () => {
    if (patientName.trim().length < 2) {
      toast({
        title: "Invalid Name",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }
    setStep("department");
  };

  const handleDepartmentSelect = (dept: string) => {
    setSelectedDepartment(dept);
    const deptData = departments.find((d) => d.name === dept);
    if (deptData && deptData.doctors.length === 1) {
      setSelectedDoctor(deptData.doctors[0]);
      setStep("confirm");
    } else {
      setStep("doctor");
    }
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setStep("confirm");
  };

  const handleGenerateToken = async () => {
    if (!session?.organizationId || !selectedDoctor) return;

    setIsProcessing(true);

    try {
      // Get branch ID
      const { data: branch } = await (supabase as any)
        .from("branches")
        .select("id")
        .eq("organization_id", session.organizationId)
        .limit(1)
        .single();

      if (!branch) throw new Error("No branch found");

      // Create patient if new
      let finalPatientId = patientId;
      if (!finalPatientId) {
        const names = patientName.trim().split(" ");
        const firstName = names[0];
        const lastName = names.slice(1).join(" ") || "";

        const { data: newPatient, error: patientError } = await (supabase as any)
          .from("patients")
          .insert([{
            organization_id: session.organizationId,
            branch_id: branch.id,
            first_name: firstName,
            last_name: lastName,
            phone: phone,
            gender: "unknown",
          }])
          .select()
          .single();

        if (patientError) throw patientError;
        finalPatientId = newPatient.id;
      }

      // Get next token number
      const today = format(new Date(), "yyyy-MM-dd");
      const { data: lastAppt } = await (supabase as any)
        .from("appointments")
        .select("token_number")
        .eq("organization_id", session.organizationId)
        .eq("appointment_date", today)
        .order("token_number", { ascending: false })
        .limit(1);

      const nextToken = (lastAppt?.[0]?.token_number || 0) + 1;

      // Calculate estimated wait
      const { count: waitingCount } = await (supabase as any)
        .from("appointments")
        .select("id", { count: "exact" })
        .eq("doctor_id", selectedDoctor.id)
        .eq("appointment_date", today)
        .in("status", ["scheduled", "checked_in"]);

      const estimatedWait = (waitingCount || 0) * 10;

      // Create appointment
      const { data: appointment, error: apptError } = await (supabase as any)
        .from("appointments")
        .insert([{
          organization_id: session.organizationId,
          branch_id: branch.id,
          patient_id: finalPatientId,
          doctor_id: selectedDoctor.id,
          appointment_date: today,
          appointment_time: format(new Date(), "HH:mm"),
          appointment_type: session.kioskType === "emergency" ? "emergency" : "walk_in",
          status: "checked_in",
          check_in_at: new Date().toISOString(),
          token_number: nextToken,
          priority: session.kioskType === "emergency" ? 1 : 0,
        }])
        .select()
        .single();

      if (apptError) throw apptError;

      // Log to kiosk_token_logs
      await logKioskToken({
        kioskId: session.kioskId!,
        sessionId: session.sessionId!,
        organizationId: session.organizationId,
        appointmentId: appointment.id,
        tokenNumber: nextToken,
        patientName: patientName,
        patientPhone: phone,
        doctorName: selectedDoctor.name,
        department: selectedDepartment || "",
        priority: session.kioskType === "emergency" ? 1 : 0,
      });

      setTokenData({
        tokenNumber: nextToken,
        patientName: patientName,
        doctorName: selectedDoctor.name,
        department: selectedDepartment || "",
        estimatedWait,
        generatedAt: new Date(),
      });

      setStep("success");
    } catch (err: any) {
      console.error("Error generating token:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to generate token",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleNewToken = () => {
    setStep("phone");
    setPhone("");
    setPatientName("");
    setPatientId(null);
    setSelectedDepartment(null);
    setSelectedDoctor(null);
    setTokenData(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/kiosk/login");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-token, .print-token * { visibility: visible; }
          .print-token { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 80mm;
            padding: 10mm;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6 no-print">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{organizationName || "Hospital"}</h1>
            <p className="text-primary-foreground/80">
              {session?.kioskName} • {session?.kioskType?.toUpperCase()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-mono font-bold">
              {format(currentTime, "HH:mm:ss")}
            </p>
            <p className="text-sm text-primary-foreground/80">
              {format(currentTime, "EEEE, MMMM d, yyyy")}
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {/* Back button for intermediate steps */}
        {step !== "phone" && step !== "success" && (
          <Button
            variant="ghost"
            onClick={() => {
              if (step === "name") setStep("phone");
              else if (step === "department") setStep(patientId ? "phone" : "name");
              else if (step === "doctor") setStep("department");
              else if (step === "confirm") setStep("doctor");
            }}
            className="mb-4 no-print"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}

        {/* Step: Phone */}
        {step === "phone" && (
          <Card className="max-w-md mx-auto shadow-xl">
            <CardContent className="p-8 space-y-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Phone className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Enter Phone Number</h2>
                <p className="text-muted-foreground mt-2">
                  Enter your phone number to get started
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-base">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="03XX-XXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  className="h-14 text-xl text-center font-mono"
                  maxLength={11}
                  autoFocus
                />
              </div>
              <Button
                onClick={handlePhoneSubmit}
                className="w-full h-14 text-lg"
                disabled={phone.length < 10 || isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Continue"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step: Name (new patient) */}
        {step === "name" && (
          <Card className="max-w-md mx-auto shadow-xl">
            <CardContent className="p-8 space-y-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Enter Your Name</h2>
                <p className="text-muted-foreground mt-2">
                  We couldn't find your record. Please enter your name.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="h-14 text-xl"
                  autoFocus
                />
              </div>
              <Button
                onClick={handleNameSubmit}
                className="w-full h-14 text-lg"
                disabled={patientName.trim().length < 2}
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step: Department */}
        {step === "department" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Welcome, {patientName}</h2>
              <p className="text-muted-foreground mt-2">
                Please select your department
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {departments.map((dept) => (
                <Card
                  key={dept.name}
                  className="cursor-pointer hover:border-primary hover:shadow-lg transition-all"
                  onClick={() => handleDepartmentSelect(dept.name)}
                >
                  <CardContent className="p-6 text-center">
                    <Stethoscope className="h-10 w-10 mx-auto text-primary mb-3" />
                    <h3 className="font-semibold text-lg">{dept.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {dept.doctors.length} doctor{dept.doctors.length !== 1 ? "s" : ""}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step: Doctor */}
        {step === "doctor" && selectedDepartment && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">{selectedDepartment}</h2>
              <p className="text-muted-foreground mt-2">Select your doctor</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {departments
                .find((d) => d.name === selectedDepartment)
                ?.doctors.map((doctor) => (
                  <Card
                    key={doctor.id}
                    className="cursor-pointer hover:border-primary hover:shadow-lg transition-all"
                    onClick={() => handleDoctorSelect(doctor)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <User className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="font-semibold">{doctor.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {doctor.specialization}
                      </p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* Step: Confirm */}
        {step === "confirm" && selectedDoctor && (
          <Card className="max-w-md mx-auto shadow-xl">
            <CardContent className="p-8 space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold">Confirm Details</h2>
              </div>
              <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Patient</span>
                  <span className="font-medium">{patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department</span>
                  <span className="font-medium">{selectedDepartment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Doctor</span>
                  <span className="font-medium">{selectedDoctor.name}</span>
                </div>
              </div>
              <Button
                onClick={handleGenerateToken}
                className="w-full h-14 text-lg"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Printer className="mr-2 h-5 w-5" />
                    Generate Token
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step: Success / Token Display */}
        {step === "success" && tokenData && (
          <div className="space-y-6">
            <Card className="max-w-md mx-auto shadow-xl print-token">
              <CardContent className="p-8 text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center no-print">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">
                    Your Token Number
                  </p>
                  <p className="text-7xl font-bold text-primary my-4">
                    {tokenData.tokenNumber}
                  </p>
                </div>
                <div className="border-t border-b py-4 space-y-2 text-sm">
                  <p><strong>{tokenData.patientName}</strong></p>
                  <p>{tokenData.department}</p>
                  <p>{tokenData.doctorName}</p>
                </div>
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Estimated wait: ~{tokenData.estimatedWait} min</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(tokenData.generatedAt, "dd/MM/yyyy HH:mm")}
                </p>
                <p className="text-xs font-medium">{organizationName}</p>
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-center no-print">
              <Button onClick={handlePrint} size="lg" variant="outline">
                <Printer className="mr-2 h-5 w-5" />
                Print Token
              </Button>
              <Button onClick={handleNewToken} size="lg">
                New Token
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Logout button */}
      <div className="fixed bottom-4 right-4 no-print">
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
