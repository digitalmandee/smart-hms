import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useExpiringLicenses } from "@/hooks/useEmployeeDocuments";
import { AlertTriangle, Calendar, ChevronRight, Award, CheckCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";

interface LicenseExpiryAlertsProps {
  daysAhead?: number;
  limit?: number;
}

export function LicenseExpiryAlerts({ daysAhead = 60, limit = 5 }: LicenseExpiryAlertsProps) {
  const navigate = useNavigate();
  const { data: expiringLicenses, isLoading } = useExpiringLicenses(daysAhead);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">License Expiry Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  const expiredLicenses = expiringLicenses?.filter(l => l.isExpired) || [];
  const expiringSoonLicenses = expiringLicenses?.filter(l => l.isExpiringSoon) || [];
  const allAlerts = [...expiredLicenses, ...expiringSoonLicenses].slice(0, limit);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Award className="h-4 w-4" />
          License Expiry Alerts
        </CardTitle>
        {allAlerts.length > 0 && (
          <Badge 
            variant={expiredLicenses.length > 0 ? "destructive" : "outline"}
            className={expiredLicenses.length === 0 ? "border-amber-500 text-amber-600" : ""}
          >
            {expiredLicenses.length > 0 
              ? `${expiredLicenses.length} expired`
              : `${expiringSoonLicenses.length} expiring`
            }
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {allAlerts.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500 opacity-70" />
            <p className="text-sm">All licenses are up to date</p>
            <p className="text-xs mt-1">No licenses expiring in the next {daysAhead} days</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allAlerts.map((license) => (
              <div
                key={license.id}
                className={`flex items-start justify-between p-3 rounded-lg border ${
                  license.isExpired 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-amber-50 border-amber-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle 
                    className={`h-5 w-5 mt-0.5 ${
                      license.isExpired ? 'text-red-500' : 'text-amber-500'
                    }`} 
                  />
                  <div>
                    <p className="font-medium text-sm">
                      {license.employee?.first_name} {license.employee?.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {license.license_type} License - {license.license_number}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-xs">
                      <Calendar className="h-3 w-3" />
                      <span className={license.isExpired ? 'text-red-600' : 'text-amber-600'}>
                        {license.isExpired ? 'Expired: ' : 'Expires: '}
                        {license.expiry_date 
                          ? format(parseISO(license.expiry_date), 'MMM d, yyyy')
                          : 'Unknown'
                        }
                      </span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate(`/app/hr/employees/${license.employee_id}`)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {(expiredLicenses.length + expiringSoonLicenses.length) > limit && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2"
                onClick={() => navigate("/app/hr/employees")}
              >
                View All ({expiredLicenses.length + expiringSoonLicenses.length} total)
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
