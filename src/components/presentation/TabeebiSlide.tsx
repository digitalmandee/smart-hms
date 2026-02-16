import { Bot, Mic, FileText, ClipboardList, Clock, Globe, MessageCircle } from "lucide-react";

const capabilities = [
  {
    icon: Mic,
    title: "Trilingual Voice Consultations",
    desc: "Patients speak naturally in English, Arabic, or Urdu. Tabeebi listens, understands symptoms, and responds like a real doctor.",
  },
  {
    icon: ClipboardList,
    title: "Clinical Summaries for Doctors",
    desc: "Every patient interaction produces a structured clinical summary on the doctor's dashboard before they even see the patient.",
  },
  {
    icon: FileText,
    title: "Prescription Generation",
    desc: "Auto-generates e-prescriptions with dosages, drug interaction checks, and pharmacy routing from the consultation.",
  },
  {
    icon: Clock,
    title: "24/7 Patient Pre-Screening",
    desc: "Patients get immediate AI-guided triage any time of day, reducing wait times and filtering urgent cases for doctors.",
  },
];

const stats = [
  { label: "3 Languages", icon: Globe },
  { label: "50K+ Consultations", icon: MessageCircle },
  { label: "24/7 Available", icon: Clock },
];

export function TabeebiSlide() {
  return (
    <div className="slide">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <Bot className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            Built-in Medical AI — <span className="text-primary">Tabeebi</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            A competitive advantage included in every HealthOS 24 installation
          </p>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {capabilities.map((cap) => (
          <div key={cap.title} className="rounded-xl border bg-card p-5 flex gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <cap.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-1">{cap.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{cap.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chat mockup + stats row */}
      <div className="flex items-center gap-6">
        {/* Mini chat mockup */}
        <div className="flex-1 rounded-xl border bg-muted/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bot className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">Dr. Tabeebi</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary ml-1" />
            <span className="text-xs text-muted-foreground">EN / AR / UR</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-end">
              <div className="bg-primary text-primary-foreground rounded-xl rounded-br-sm px-3 py-1.5 text-xs max-w-[70%]">
                I have a headache and mild fever
              </div>
            </div>
            <div className="flex justify-start">
              <div className="bg-card border rounded-xl rounded-bl-sm px-3 py-1.5 text-xs max-w-[70%] text-foreground">
                I understand. Is the headache on one side or both? Any nausea?
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-3">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-card border">
              <s.icon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Slide footer */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-between items-center px-8 text-xs text-muted-foreground">
        <span>HealthOS 24</span>
        <span>Slide 24 of 33</span>
      </div>
    </div>
  );
}
