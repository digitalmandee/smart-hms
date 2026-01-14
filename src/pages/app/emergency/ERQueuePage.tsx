import { PageHeader } from "@/components/PageHeader";
import { ERQueueBoard } from "@/components/emergency/ERQueueBoard";
import { IncomingAmbulancePanel } from "@/components/emergency/IncomingAmbulancePanel";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users, Monitor, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const ERQueuePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["er-queue"] });
    queryClient.invalidateQueries({ queryKey: ["ambulance-alerts"] });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="ER Queue Management"
        subtitle="View and manage all patients in the Emergency Department"
        icon={Users}
        backUrl="/app/emergency"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="secondary" onClick={() => navigate("/app/emergency/display")}>
              <Monitor className="h-4 w-4 mr-2" />
              TV Display
            </Button>
          </div>
        }
      />

      {/* Incoming Ambulances - Compact */}
      <IncomingAmbulancePanel compact />

      {/* Zone-based Queue */}
      <ERQueueBoard
        onTriagePatient={(id) => navigate(`/app/emergency/${id}`)}
        onAdmitPatient={(id) => navigate(`/app/emergency/${id}/admit`)}
      />
    </div>
  );
};

export default ERQueuePage;
