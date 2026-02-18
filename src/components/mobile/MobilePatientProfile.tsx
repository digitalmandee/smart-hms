import { useState } from "react";
import { Link } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Droplets,
  AlertCircle,
  Edit,
  Activity,
  Heart,
  Pill,
  Stethoscope,
  TestTubes,
  Bed,
  Receipt,
  Scissors,
  ChevronLeft,
  ChevronRight,
  Camera,
  Thermometer,
  Ticket,
} from "lucide-react";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Capacitor } from "@capacitor/core";
import { useIsRTL } from "@/lib/i18n";

interface Patient {
  id: string;
  first_name: string;
  last_name?: string;
  patient_number: string;
  phone?: string;
  email?: string;
  date_of_birth?: string;
  gender?: string;
  blood_group?: string;
  address?: string;
  city?: string;
  profile_photo_url?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  is_active: boolean;
}

interface ProfileStats {
  totalVisits: number;
  totalPrescriptions: number;
  totalLabOrders: number;
  totalAdmissions: number;
}

interface CurrentVisit {
  id: string;
  token_number: number;
  status: string;
  doctor_name: string;
}

interface ActiveAdmission {
  id: string;
  admission_number: string;
  ward?: { name: string };
  bed?: { bed_number: string };
  status: string;
}

interface MobilePatientProfileProps {
  patient: Patient;
  profileStats?: ProfileStats;
  currentVisit?: CurrentVisit | null;
  activeAdmission?: ActiveAdmission | null;
  onRefresh: () => Promise<void>;
  onTakePhoto: () => void;
  onPrintCard: () => void;
  tabContent: Record<string, React.ReactNode>;
}

export function MobilePatientProfile({
  patient,
  profileStats,
  currentVisit,
  activeAdmission,
  onRefresh,
  onTakePhoto,
  onPrintCard,
  tabContent,
}: MobilePatientProfileProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const isRTL = useIsRTL();

  const triggerHaptic = async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  };

  const getAge = (dob: string | null | undefined) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const fullName = `${patient.first_name}${patient.last_name ? ` ${patient.last_name}` : ""}`;
  const age = getAge(patient.date_of_birth);

  const quickActions = [
    { icon: Calendar, label: "Book Visit", href: `/app/appointments/new?patientId=${patient.id}` },
    { icon: Receipt, label: "Invoice", href: `/app/billing/invoices/new?patientId=${patient.id}` },
    { icon: Scissors, label: "Surgery", href: `/app/ot/surgeries/new?patientId=${patient.id}` },
    { icon: Edit, label: "Edit", href: `/app/patients/${patient.id}/edit` },
  ];

  const tabs = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "vitals", label: "Vitals", icon: Thermometer },
    { id: "history", label: "Medical", icon: Heart },
    { id: "opd-visits", label: "OPD", icon: Ticket },
    { id: "visits", label: "Consults", icon: Stethoscope },
    { id: "prescriptions", label: "Rx", icon: Pill },
    { id: "lab", label: "Lab", icon: TestTubes },
    { id: "ipd", label: "IPD", icon: Bed },
  ];

  return (
    <PullToRefresh onRefresh={onRefresh}>
      <div className="pb-24">
        {/* Header with Back Button */}
        <div className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <Link to="/app/patients">
            <Button variant="ghost" size="icon" className="shrink-0">
              {isRTL ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">{fullName}</h1>
            <p className="text-sm text-muted-foreground">{patient.patient_number}</p>
          </div>
          <Badge variant={patient.is_active ? "default" : "secondary"}>
            {patient.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>

        {/* Current Visit Alert */}
        {currentVisit && (
          <div className="mx-4 mt-4">
            <Card className="bg-green-50 dark:bg-green-950/30 border-green-200">
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">
                    Token #{currentVisit.token_number}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {currentVisit.status} • {currentVisit.doctor_name}
                  </p>
                </div>
                <Link to={`/app/appointments`}>
                  <Button size="sm" variant="outline">View</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Active Admission Alert */}
        {activeAdmission && (
          <div className="mx-4 mt-4">
            <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200">
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200">
                    {activeAdmission.status === 'pending' ? 'Pending Admission' : 'Currently Admitted'}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {activeAdmission.admission_number}
                    {activeAdmission.ward?.name && ` • ${activeAdmission.ward.name}`}
                    {activeAdmission.bed?.bed_number && ` - Bed ${activeAdmission.bed.bed_number}`}
                  </p>
                </div>
                <Link to={`/app/ipd/admissions/${activeAdmission.id}`}>
                  <Button size="sm" variant="outline">View</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Profile Card */}
        <div className="px-4 pt-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="h-16 w-16">
                    {patient.profile_photo_url ? (
                      <AvatarImage src={patient.profile_photo_url} alt={fullName} />
                    ) : null}
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {patient.first_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full"
                    onClick={onTakePhoto}
                  >
                    <Camera className="h-3 w-3" />
                  </Button>
                </div>

                {/* Basic Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {patient.gender && (
                      <Badge variant="outline" className="capitalize">
                        {patient.gender}
                      </Badge>
                    )}
                    {age && (
                      <Badge variant="outline">{age}y</Badge>
                    )}
                    {patient.blood_group && (
                      <Badge variant="outline" className="gap-1">
                        <Droplets className="h-3 w-3" />
                        {patient.blood_group}
                      </Badge>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="mt-3 space-y-1">
                    {patient.phone && (
                      <a href={`tel:${patient.phone}`} className="flex items-center gap-2 text-sm">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{patient.phone}</span>
                      </a>
                    )}
                    {patient.city && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{patient.city}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              {patient.emergency_contact_name && (
                <div className="mt-4 pt-3 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="font-medium">Emergency:</span>
                    <span className="text-muted-foreground">
                      {patient.emergency_contact_name}
                      {patient.emergency_contact_phone && ` (${patient.emergency_contact_phone})`}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Horizontal Scroll */}
        <div className="px-4 pt-4">
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2">
              {quickActions.map((action) => (
                <Link key={action.label} to={action.href} onClick={triggerHaptic}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 gap-2 whitespace-nowrap"
                  >
                    <action.icon className="h-4 w-4" />
                    {action.label}
                  </Button>
                </Link>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="h-10 gap-2 whitespace-nowrap"
                onClick={onPrintCard}
              >
                Print ID
              </Button>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* Stats Row */}
        {profileStats && (
          <div className="px-4 pt-4 grid grid-cols-4 gap-2">
            <Card>
              <CardContent className="p-2 text-center">
                <p className="text-lg font-bold">{profileStats.totalVisits}</p>
                <p className="text-[10px] text-muted-foreground">Visits</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-2 text-center">
                <p className="text-lg font-bold">{profileStats.totalPrescriptions}</p>
                <p className="text-[10px] text-muted-foreground">Rx</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-2 text-center">
                <p className="text-lg font-bold">{profileStats.totalLabOrders}</p>
                <p className="text-[10px] text-muted-foreground">Labs</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-2 text-center">
                <p className="text-lg font-bold">{profileStats.totalAdmissions}</p>
                <p className="text-[10px] text-muted-foreground">IPD</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="px-4 pt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Scrollable Tab List */}
            <ScrollArea className="w-full">
              <TabsList className="w-max h-12 bg-muted/50 p-1">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="h-10 gap-1.5 px-3 data-[state=active]:bg-background"
                    onClick={triggerHaptic}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {/* Tab Content */}
            <div className="mt-4">
              {tabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="mt-0">
                  {tabContent[tab.id] || (
                    <Card className="py-8">
                      <CardContent className="flex flex-col items-center text-center">
                        <tab.icon className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No {tab.label.toLowerCase()} data</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>
      </div>
    </PullToRefresh>
  );
}
