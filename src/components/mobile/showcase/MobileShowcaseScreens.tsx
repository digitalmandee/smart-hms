import {
  Activity,
  AlertCircle,
  Bed,
  Bell,
  Calendar,
  ClipboardList,
  Download,
  FileText,
  Heart,
  Home,
  Menu,
  Pill,
  Receipt,
  Search,
  Stethoscope,
  TestTube,
  User,
  Users,
} from "lucide-react";
import { MobileStatsCard } from "@/components/mobile/MobileStatsCard";
import { QuickActionCard } from "@/components/mobile/QuickActionCard";
import { AppointmentCard } from "@/components/mobile/AppointmentCard";
import { TaskCard } from "@/components/mobile/TaskCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HealthOS24Logo } from "@/components/brand/HealthOS24Logo";
import { cn } from "@/lib/utils";

export type ShowcaseRole = "doctor" | "nurse" | "patient" | "staff";

export const SHOWCASE_ROLES: ShowcaseRole[] = ["doctor", "nurse", "patient", "staff"];

const noop = () => {};

/* ── Shared chrome: same header / bottom bar shape as the live mobile app ── */
function ShowcaseHeader({ initials }: { initials: string }) {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-1">
          <span className="h-10 w-10 rounded-xl inline-flex items-center justify-center">
            <Menu className="h-5 w-5" />
          </span>
          <span className="h-10 w-10 rounded-xl inline-flex items-center justify-center">
            <Search className="h-5 w-5" />
          </span>
        </div>
        <HealthOS24Logo variant="minimal" size="sm" />
        <div className="flex items-center gap-1">
          <span className="relative h-10 w-10 rounded-xl inline-flex items-center justify-center">
            <Bell className="h-5 w-5" />
            <Badge className="absolute top-1 right-1 h-4 min-w-4 px-1 text-[9px] justify-center">3</Badge>
          </span>
          <span className="h-8 w-8 rounded-full bg-primary/10 text-primary text-xs font-semibold inline-flex items-center justify-center">
            {initials}
          </span>
        </div>
      </div>
    </header>
  );
}

function ShowcaseBottomNav({
  items,
}: {
  items: { icon: React.ComponentType<{ className?: string }>; label: string }[];
}) {
  return (
    <nav className="sticky bottom-0 z-40 bg-background/95 backdrop-blur-lg border-t border-border">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item, i) => (
          <div
            key={item.label}
            className={cn(
              "flex flex-col items-center justify-center gap-1 flex-1",
              i === 0 ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </nav>
  );
}

function Greeting({ name, sub, roleLabel }: { name: string; sub: string; roleLabel?: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold">Good Morning, {name}</h1>
      <p className="text-muted-foreground">{sub}</p>
      {roleLabel && (
        <span className="inline-flex items-center mt-2 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
          {roleLabel}
        </span>
      )}
    </div>
  );
}

function SectionTitle({ title, action }: { title: string; action?: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {action && <span className="text-sm text-primary">{action}</span>}
    </div>
  );
}

/* ── Doctor ─────────────────────────────────────────────────── */
function DoctorScreen() {
  return (
    <div className="px-4 py-6 space-y-6">
      <Greeting name="Ahmed" sub="Friday, September 11" roleLabel="Doctor" />
      <div className="grid grid-cols-2 gap-3">
        <MobileStatsCard title="Today's Patients" value={18} icon={<Users className="h-5 w-5" />} />
        <MobileStatsCard title="Pending Surgeries" value={2} icon={<Activity className="h-5 w-5" />} />
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3">
          <QuickActionCard icon={<Stethoscope className="h-6 w-6" />} label="Start Consult" variant="primary" onClick={noop} />
          <QuickActionCard icon={<Calendar className="h-6 w-6" />} label="Schedule" onClick={noop} />
          <QuickActionCard icon={<FileText className="h-6 w-6" />} label="Lab Results" onClick={noop} />
        </div>
      </div>
      <div>
        <SectionTitle title="Next Up" action="View All" />
        <div className="space-y-3">
          <AppointmentCard
            id="1"
            patientName="Fatima Noor"
            time="09:40 AM"
            type="Follow-up"
            status="checked_in"
            tokenNumber={4}
            chiefComplaint="Blood pressure review, medication refill"
            onClick={noop}
          />
          <AppointmentCard
            id="2"
            patientName="Bilal Khan"
            time="10:05 AM"
            type="Consultation"
            status="scheduled"
            priority={1}
            tokenNumber={5}
            chiefComplaint="Chest pain since morning"
            onClick={noop}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Nurse ──────────────────────────────────────────────────── */
function NurseScreen() {
  return (
    <div className="px-4 py-6 space-y-6">
      <Greeting name="Ayesha" sub="Friday, September 11" roleLabel="IPD Nurse · Ward B" />
      <div className="grid grid-cols-2 gap-3">
        <MobileStatsCard title="Ward Patients" value={24} icon={<Bed className="h-5 w-5" />} />
        <MobileStatsCard
          title="Critical"
          value={2}
          icon={<AlertCircle className="h-5 w-5 text-destructive" />}
          className="border-destructive/50"
        />
        <MobileStatsCard title="Pending Vitals" value={7} icon={<Heart className="h-5 w-5" />} />
        <MobileStatsCard title="Pending Meds" value={11} icon={<Pill className="h-5 w-5" />} />
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3">
          <QuickActionCard icon={<Activity className="h-6 w-6" />} label="Record Vitals" variant="primary" onClick={noop} />
          <QuickActionCard icon={<Pill className="h-6 w-6" />} label="Medications" onClick={noop} />
          <QuickActionCard icon={<ClipboardList className="h-6 w-6" />} label="Nursing Notes" onClick={noop} />
        </div>
      </div>
      <div>
        <SectionTitle title="My Tasks" action="View All" />
        <div className="space-y-3">
          <TaskCard
            id="1"
            title="Record vitals — Bed 12"
            patientName="Ahmed Khan"
            dueTime="10:30 AM"
            status="pending"
            priority="high"
            category="Vitals"
            onComplete={noop}
            onClick={noop}
          />
          <TaskCard
            id="2"
            title="Administer medication"
            patientName="Sara Ali"
            dueTime="11:00 AM"
            status="pending"
            priority="urgent"
            category="Medication"
            onComplete={noop}
            onClick={noop}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Patient ────────────────────────────────────────────────── */
function PatientScreen() {
  return (
    <div className="px-4 py-6 space-y-6">
      <Greeting name="Hassan" sub="Friday, September 11" roleLabel="Patient" />
      <div className="grid grid-cols-2 gap-3">
        <MobileStatsCard title="Upcoming Visits" value={1} icon={<Calendar className="h-5 w-5" />} />
        <MobileStatsCard title="Pending Bills" value="SAR 450" icon={<Receipt className="h-5 w-5" />} />
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3">
          <QuickActionCard icon={<Calendar className="h-6 w-6" />} label="Book Appointment" variant="primary" onClick={noop} />
          <QuickActionCard icon={<FileText className="h-6 w-6" />} label="My Reports" onClick={noop} />
          <QuickActionCard icon={<Pill className="h-6 w-6" />} label="Prescriptions" onClick={noop} />
        </div>
      </div>
      <div>
        <SectionTitle title="Upcoming Appointment" />
        <AppointmentCard
          id="1"
          patientName="Dr. Ahmed Hassan"
          time="Tomorrow · 10:30 AM"
          type="Cardiology follow-up"
          status="scheduled"
          onClick={noop}
        />
      </div>
      <div className="bg-card border rounded-xl p-4">
        <h3 className="font-semibold mb-3">Latest Reports</h3>
        <div className="space-y-3">
          {[
            { name: "CBC — Complete Blood Count", when: "Ready today" },
            { name: "Chest X-Ray", when: "Reported yesterday" },
          ].map((r) => (
            <div key={r.name} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.when}</p>
              </div>
              <Button size="sm" variant="outline" className="shrink-0">
                <Download className="h-3.5 w-3.5 mr-1" /> PDF
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Staff ──────────────────────────────────────────────────── */
function StaffScreen() {
  return (
    <div className="px-4 py-6 space-y-6">
      <Greeting name="Zainab" sub="Friday, September 11" roleLabel="Receptionist" />
      <div className="grid grid-cols-2 gap-3">
        <MobileStatsCard title="Pending Tasks" value={9} icon={<ClipboardList className="h-5 w-5" />} />
        <MobileStatsCard title="Notifications" value={4} icon={<Bell className="h-5 w-5" />} />
        <MobileStatsCard title="Queue Waiting" value={13} icon={<Users className="h-5 w-5" />} />
        <MobileStatsCard title="Open Cash Session" value={1} icon={<Receipt className="h-5 w-5" />} />
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3">
          <QuickActionCard icon={<Users className="h-6 w-6" />} label="Patients" variant="primary" onClick={noop} />
          <QuickActionCard icon={<Calendar className="h-6 w-6" />} label="Appointments" onClick={noop} />
          <QuickActionCard icon={<ClipboardList className="h-6 w-6" />} label="Check-in" onClick={noop} />
        </div>
      </div>
      <div>
        <SectionTitle title="Front Desk Tasks" action="View All" />
        <div className="space-y-3">
          <TaskCard
            id="1"
            title="Walk-in registration"
            description="4 steps · payment then token print"
            dueTime="Now"
            status="in_progress"
            priority="high"
            category="Reception"
            onComplete={noop}
            onClick={noop}
          />
          <TaskCard
            id="2"
            title="Close cash session"
            description="Reconcile before shift end"
            dueTime="6:00 PM"
            status="pending"
            priority="normal"
            category="Billing"
            onComplete={noop}
            onClick={noop}
          />
        </div>
      </div>
      <div className="bg-card border rounded-xl p-4">
        <h3 className="font-semibold mb-3">Today's Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tasks Completed</span>
            <span className="font-medium">12 / 17</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shift Ends</span>
            <span className="font-medium">6:00 PM</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const ROLE_CONFIG: Record<
  ShowcaseRole,
  {
    label: string;
    initials: string;
    nav: { icon: React.ComponentType<{ className?: string }>; label: string }[];
    Screen: () => JSX.Element;
  }
> = {
  doctor: {
    label: "Doctor",
    initials: "AH",
    nav: [
      { icon: Home, label: "Home" },
      { icon: Calendar, label: "Schedule" },
      { icon: ClipboardList, label: "Tasks" },
      { icon: TestTube, label: "Lab" },
      { icon: User, label: "Profile" },
    ],
    Screen: DoctorScreen,
  },
  nurse: {
    label: "Nurse",
    initials: "AY",
    nav: [
      { icon: Home, label: "Home" },
      { icon: Calendar, label: "Schedule" },
      { icon: ClipboardList, label: "Tasks" },
      { icon: Pill, label: "Meds" },
      { icon: User, label: "Profile" },
    ],
    Screen: NurseScreen,
  },
  patient: {
    label: "Patient",
    initials: "HM",
    nav: [
      { icon: Home, label: "Home" },
      { icon: Calendar, label: "Schedule" },
      { icon: User, label: "Profile" },
    ],
    Screen: PatientScreen,
  },
  staff: {
    label: "Staff",
    initials: "ZK",
    nav: [
      { icon: Home, label: "Home" },
      { icon: Calendar, label: "Schedule" },
      { icon: ClipboardList, label: "Tasks" },
      { icon: Receipt, label: "Billing" },
      { icon: User, label: "Profile" },
    ],
    Screen: StaffScreen,
  },
};

export function MobileShowcaseScreen({ role }: { role: ShowcaseRole }) {
  const cfg = ROLE_CONFIG[role];
  return (
    <div className="w-[390px] h-[844px] bg-background flex flex-col overflow-hidden">
      <ShowcaseHeader initials={cfg.initials} />
      <div className="flex-1 overflow-hidden">
        <cfg.Screen />
      </div>
      <ShowcaseBottomNav items={cfg.nav} />
    </div>
  );
}

export function showcaseRoleLabel(role: ShowcaseRole) {
  return ROLE_CONFIG[role].label;
}
