import { PageHeader } from "@/components/PageHeader";
import { QuickERRegistration } from "@/components/emergency/QuickERRegistration";
import { useNavigate, useSearchParams } from "react-router-dom";

const ERRegistrationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ambulanceId = searchParams.get("ambulance_id");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Emergency Registration"
        description="Quickly register a new emergency patient"
        breadcrumbs={[
          { label: "Emergency", href: "/app/emergency" },
          { label: "New Registration" },
        ]}
      />

      <div className="max-w-4xl">
        <QuickERRegistration
          ambulanceAlertId={ambulanceId || undefined}
          onSuccess={(id) => navigate(`/app/emergency/${id}`)}
        />
      </div>
    </div>
  );
};

export default ERRegistrationPage;
