import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Printer, ArrowLeft, User, Stethoscope, Building, Check } from "lucide-react";
import { format } from "date-fns";

// Using any client to prevent deep type instantiation issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const client: any = supabase;

interface Doctor {
  id: string;
  specialization: string | null;
  profile: {
    full_name: string;
  };
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
  date: string;
  time: string;
  estimatedWait: number;
}

type Step = "phone" | "department" | "doctor" | "confirm" | "success";

export default function PublicTokenKiosk() {
  const { organizationId } = useParams<{ organizationId: string }>();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [orgName, setOrgName] = useState("");
  const [branchId, setBranchId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch organization and branch
  useEffect(() => {
    if (!organizationId) return;

    const fetchOrg = async () => {
      const { data: org } = await client
        .from("organizations")
        .select("name")
        .eq("id", organizationId)
        .single();

      if (org) setOrgName(org.name);

      // Get main branch
      const { data: branch } = await client
        .from("branches")
        .select("id")
        .eq("organization_id", organizationId)
        .eq("is_main_branch", true)
        .single();

      if (branch) setBranchId(branch.id);
    };

    fetchOrg();
  }, [organizationId]);

  // Fetch doctors and group by specialization
  useEffect(() => {
    if (!organizationId) return;

    const fetchDoctors = async () => {
      const { data } = await client
        .from("doctors")
        .select("id, specialization, profile:profiles(full_name)")
        .eq("organization_id", organizationId)
        .eq("is_active", true);

      if (data) {
        // Group by specialization
        const grouped: Record<string, Doctor[]> = {};
        const doctors = (data || []) as Doctor[];
        doctors.forEach((doc) => {
          const dept = doc.specialization || "General";
          if (!grouped[dept]) grouped[dept] = [];
          grouped[dept].push(doc);
        });

        setDepartments(
          Object.entries(grouped).map(([name, doctors]) => ({ name, doctors }))
        );
      }
    };

    fetchDoctors();
  }, [organizationId]);

  // Clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Search patient by phone
  const handlePhoneSubmit = async () => {
    if (!phone || phone.length < 10) {
      toast({ title: "Please enter a valid phone number", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    const { data: patient } = await client
      .from("patients")
      .select("id, first_name, last_name")
      .eq("organization_id", organizationId!)
      .eq("phone", phone)
      .single();

    if (patient) {
      setPatientId(patient.id);
      setPatientName(`${patient.first_name} ${patient.last_name || ""}`);
    } else {
      // New patient - will create during token generation
      setPatientId(null);
      setPatientName("");
    }

    setIsLoading(false);
    setStep("department");
  };

  // Generate token
  const handleGenerateToken = async () => {
    if (!selectedDoctor || !branchId || !organizationId) return;

    setIsLoading(true);

    try {
      const today = new Date().toISOString().split("T")[0];
      const now = new Date();
      const currentTimeStr = format(now, "HH:mm");

      // Create patient if new
      let finalPatientId = patientId;
      if (!finalPatientId && patientName) {
        const [firstName, ...lastNameParts] = patientName.split(" ");
        // Generate temp patient number - trigger will override
        const tempPatientNumber = `KIOSK-${Date.now()}`;
        
        const { data: newPatient, error: patientError } = await client
          .from("patients")
          .insert([{
            organization_id: organizationId,
            branch_id: branchId,
            first_name: firstName,
            last_name: lastNameParts.join(" ") || null,
            phone: phone,
            gender: "other",
            date_of_birth: "2000-01-01",
            patient_number: tempPatientNumber,
          }])
          .select("id")
          .single();

        if (patientError) throw patientError;
        finalPatientId = newPatient.id;
      }

      if (!finalPatientId) {
        toast({ title: "Please enter patient name", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      // Get next token number
      const { data: lastAppointment } = await client
        .from("appointments")
        .select("token_number")
        .eq("doctor_id", selectedDoctor.id)
        .eq("appointment_date", today)
        .order("token_number", { ascending: false })
        .limit(1)
        .single();

      const nextToken = (lastAppointment?.token_number || 0) + 1;

      // Count waiting patients for estimate
      const { count } = await client
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("doctor_id", selectedDoctor.id)
        .eq("appointment_date", today)
        .in("status", ["scheduled", "checked_in"]);

      const estimatedWait = (count || 0) * 10; // 10 min per patient

      // Create appointment with checked_in status
      const { error: appointmentError } = await client.from("appointments").insert({
        organization_id: organizationId,
        branch_id: branchId,
        patient_id: finalPatientId,
        doctor_id: selectedDoctor.id,
        appointment_date: today,
        appointment_time: currentTimeStr,
        appointment_type: "walk_in",
        status: "checked_in",
        token_number: nextToken,
        check_in_at: now.toISOString(),
      });

      if (appointmentError) throw appointmentError;

      // Set token data for display/print
      setTokenData({
        tokenNumber: nextToken,
        patientName,
        doctorName: selectedDoctor.profile.full_name,
        department: selectedDept || "General",
        date: format(now, "dd MMM yyyy"),
        time: format(now, "hh:mm a"),
        estimatedWait,
      });

      setStep("success");
    } catch (error: unknown) {
      console.error("Token generation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Failed to generate token",
        description: errorMessage,
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  // Print token
  const handlePrint = () => {
    window.print();
  };

  // Reset kiosk
  const handleNewToken = () => {
    setStep("phone");
    setPhone("");
    setPatientName("");
    setPatientId(null);
    setSelectedDept(null);
    setSelectedDoctor(null);
    setTokenData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-slate-900 text-white">
      {/* Header */}
      <header className="p-6 flex items-center justify-between border-b border-slate-700">
        <div>
          <h1 className="text-2xl font-bold">{orgName || "Hospital"}</h1>
          <p className="text-blue-400">Self-Service Token Kiosk</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-mono font-bold text-blue-400">
            {format(currentTime, "HH:mm")}
          </div>
          <div className="text-slate-400 text-sm">{format(currentTime, "dd MMM yyyy")}</div>
        </div>
      </header>

      <main className="p-6 max-w-4xl mx-auto">
        {/* Step: Phone Entry */}
        {step === "phone" && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="text-center">
              <User className="h-16 w-16 mx-auto text-blue-400 mb-4" />
              <CardTitle className="text-2xl text-white">Welcome!</CardTitle>
              <p className="text-slate-400">Enter your phone number to get started</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <Input
                type="tel"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                className="text-center text-3xl h-16 bg-slate-700 border-slate-600 text-white"
              />
              <Button
                onClick={handlePhoneSubmit}
                disabled={phone.length < 10 || isLoading}
                className="w-full h-14 text-xl bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? "Searching..." : "Continue"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step: Department Selection */}
        {step === "department" && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <Button
                variant="ghost"
                onClick={() => setStep("phone")}
                className="text-slate-400 hover:text-white mb-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              <Building className="h-12 w-12 mx-auto text-blue-400 mb-4" />
              <CardTitle className="text-center text-2xl text-white">Select Department</CardTitle>
              {!patientId && (
                <div className="mt-4">
                  <Input
                    placeholder="Enter your name"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white text-center"
                  />
                </div>
              )}
              {patientId && (
                <p className="text-center text-emerald-400">Welcome back, {patientName}!</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {departments.map((dept) => (
                  <Button
                    key={dept.name}
                    variant="outline"
                    onClick={() => {
                      setSelectedDept(dept.name);
                      setStep("doctor");
                    }}
                    className="h-24 text-lg border-slate-600 bg-slate-700/50 hover:bg-blue-600/50 hover:border-blue-500 text-white"
                  >
                    {dept.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step: Doctor Selection */}
        {step === "doctor" && selectedDept && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <Button
                variant="ghost"
                onClick={() => setStep("department")}
                className="text-slate-400 hover:text-white mb-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              <Stethoscope className="h-12 w-12 mx-auto text-blue-400 mb-4" />
              <CardTitle className="text-center text-2xl text-white">
                Select Doctor - {selectedDept}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {departments
                  .find((d) => d.name === selectedDept)
                  ?.doctors.map((doc) => (
                    <Button
                      key={doc.id}
                      variant="outline"
                      onClick={() => {
                        setSelectedDoctor(doc);
                        setStep("confirm");
                      }}
                      className="h-20 text-lg justify-start border-slate-600 bg-slate-700/50 hover:bg-blue-600/50 hover:border-blue-500 text-white"
                    >
                      <div className="text-left">
                        <div className="font-semibold">Dr. {doc.profile.full_name}</div>
                        <div className="text-sm text-slate-400">{doc.specialization || "General"}</div>
                      </div>
                    </Button>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step: Confirm */}
        {step === "confirm" && selectedDoctor && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <Button
                variant="ghost"
                onClick={() => setStep("doctor")}
                className="text-slate-400 hover:text-white mb-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              <Check className="h-12 w-12 mx-auto text-emerald-400 mb-4" />
              <CardTitle className="text-center text-2xl text-white">Confirm Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Patient:</span>
                  <span className="text-white font-medium">{patientName || "New Patient"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Phone:</span>
                  <span className="text-white font-medium">{phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Department:</span>
                  <span className="text-white font-medium">{selectedDept}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Doctor:</span>
                  <span className="text-white font-medium">Dr. {selectedDoctor.profile.full_name}</span>
                </div>
              </div>
              <Button
                onClick={handleGenerateToken}
                disabled={isLoading || (!patientId && !patientName)}
                className="w-full h-14 text-xl bg-emerald-600 hover:bg-emerald-700"
              >
                {isLoading ? "Generating Token..." : "Get Token"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step: Success / Token Display */}
        {step === "success" && tokenData && (
          <div className="text-center space-y-6">
            <Card className="bg-white text-black p-8 print:shadow-none" id="token-slip">
              <div className="text-center space-y-4">
                <h2 className="text-xl font-bold">{orgName}</h2>
                <div className="border-2 border-dashed border-slate-300 py-6 px-4 rounded-lg">
                  <p className="text-slate-500 text-sm">YOUR TOKEN NUMBER</p>
                  <p className="text-7xl font-bold text-blue-600 my-4">{tokenData.tokenNumber}</p>
                </div>
                <div className="text-left space-y-2 text-sm">
                  <p>
                    <strong>Patient:</strong> {tokenData.patientName}
                  </p>
                  <p>
                    <strong>Doctor:</strong> Dr. {tokenData.doctorName}
                  </p>
                  <p>
                    <strong>Department:</strong> {tokenData.department}
                  </p>
                  <p>
                    <strong>Date:</strong> {tokenData.date}
                  </p>
                  <p>
                    <strong>Time:</strong> {tokenData.time}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-500">
                    Estimated Wait: ~{tokenData.estimatedWait} minutes
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Please wait for your token to be called
                  </p>
                </div>
              </div>
            </Card>

            <div className="flex gap-4 justify-center print:hidden">
              <Button onClick={handlePrint} className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700">
                <Printer className="h-5 w-5 mr-2" />
                Print Token
              </Button>
              <Button
                onClick={handleNewToken}
                variant="outline"
                className="h-14 px-8 text-lg border-slate-600 text-white hover:bg-slate-700"
              >
                New Token
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #token-slip, #token-slip * {
            visibility: visible;
          }
          #token-slip {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
          }
        }
      `}</style>
    </div>
  );
}
