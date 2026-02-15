import { PageHeader } from "@/components/PageHeader";
import { PatientAIChat } from "@/components/ai/PatientAIChat";

export default function AIChatPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Medical Assistant"
        breadcrumbs={[
          { label: "AI Assistant" },
        ]}
      />
      <div className="max-w-3xl mx-auto">
        <PatientAIChat />
      </div>
    </div>
  );
}
