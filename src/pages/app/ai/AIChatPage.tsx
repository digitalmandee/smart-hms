import { PageHeader } from "@/components/PageHeader";
import { PatientAIChat } from "@/components/ai/PatientAIChat";
import { Card, CardContent } from "@/components/ui/card";
import { Stethoscope } from "lucide-react";

export default function AIChatPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tabeebi - Your Personal Doctor"
        breadcrumbs={[
          { label: "OPD", href: "/app/opd" },
          { label: "Tabeebi" },
        ]}
      />
      <div className="max-w-3xl mx-auto space-y-4">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-3 py-3">
            <Stethoscope className="h-5 w-5 text-primary shrink-0" />
            <p className="text-sm text-muted-foreground">
              Get preliminary medical guidance. Tabeebi will ask about your symptoms and prepare a summary for your physician.
            </p>
          </CardContent>
        </Card>
        <PatientAIChat />
      </div>
    </div>
  );
}
