import { PageHeader } from "@/components/PageHeader";
import { QuickERRegistration } from "@/components/emergency/QuickERRegistration";
import { UserPlus } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

const ERRegistrationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ambulanceId = searchParams.get("ambulance_id");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Emergency Registration"
        subtitle="Quickly register a new emergency patient"
        icon={UserPlus}
        backUrl="/app/emergency"
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
