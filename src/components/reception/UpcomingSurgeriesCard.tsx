import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Scissors, Calendar, Clock, User, ArrowRight } from "lucide-react";
import { format, addDays } from "date-fns";
import { useSurgeries } from "@/hooks/useOT";
import { useAuth } from "@/contexts/AuthContext";

interface UpcomingSurgeriesCardProps {
  maxItems?: number;
  daysAhead?: number;
}

const priorityConfig = {
  elective: { label: "Elective", variant: "secondary" as const },
  urgent: { label: "Urgent", variant: "default" as const },
  emergency: { label: "Emergency", variant: "destructive" as const },
};

export function UpcomingSurgeriesCard({ 
  maxItems = 5, 
  daysAhead = 30 
}: UpcomingSurgeriesCardProps) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const futureDate = format(addDays(new Date(), daysAhead), 'yyyy-MM-dd');
  
  const { data: surgeries, isLoading } = useSurgeries({
    dateFrom: today,
    dateTo: futureDate,
    branchId: profile?.branch_id || undefined,
    status: ['scheduled', 'pre_op'],
  });

  if (isLoading) {
    return (
      <Card className="transition-all hover:shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Scissors className="h-4 w-4 text-primary" />
            </div>
            Upcoming Surgeries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const displaySurgeries = surgeries?.slice(0, maxItems) || [];

  return (
    <Card className="transition-all hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Scissors className="h-4 w-4 text-primary" />
            </div>
            Upcoming Surgeries
            {surgeries && surgeries.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {surgeries.length}
              </Badge>
            )}
          </CardTitle>
          {surgeries && surgeries.length > maxItems && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/app/ot/schedule")}
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[350px]">
          <div className="space-y-2 p-4 pt-0">
            {displaySurgeries.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No upcoming surgeries scheduled
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => navigate("/app/ot/surgeries/new")}
                >
                  Schedule Surgery
                </Button>
              </div>
            ) : (
              displaySurgeries.map((surgery) => {
                const scheduledDate = new Date(surgery.scheduled_date);
                const isToday = surgery.scheduled_date === today;
                const config = priorityConfig[surgery.priority as keyof typeof priorityConfig] || priorityConfig.elective;
                
                return (
                  <div
                    key={surgery.id}
                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/app/ot/surgeries/${surgery.id}`)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm truncate">
                            {surgery.procedure_name}
                          </p>
                          <Badge variant={config.variant} className="text-xs shrink-0">
                            {config.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span className="truncate">
                            {surgery.patient?.first_name} {surgery.patient?.last_name}
                          </span>
                          {surgery.patient?.mr_number && (
                            <span className="text-xs">({surgery.patient.mr_number})</span>
                          )}
                        </div>
                        {surgery.lead_surgeon?.profile?.full_name && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Surgeon: Dr. {surgery.lead_surgeon.profile.full_name}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 text-xs">
                          <Calendar className="h-3 w-3" />
                          <span className={isToday ? "text-primary font-medium" : ""}>
                            {isToday ? "Today" : format(scheduledDate, "MMM d")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(`2000-01-01T${surgery.scheduled_start_time}`), 'h:mm a')}
                        </div>
                        {surgery.ot_room?.name && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {surgery.ot_room.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
