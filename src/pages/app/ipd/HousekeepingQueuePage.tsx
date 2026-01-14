import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHousekeepingQueue, useMaintenanceQueue, useUpdateBedStatus } from "@/hooks/useBedManagement";
import { Sparkles, Wrench, CheckCircle, Clock, Bed, Building2 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

export default function HousekeepingQueuePage() {
  const { data: housekeepingBeds, isLoading: loadingHousekeeping } = useHousekeepingQueue();
  const { data: maintenanceBeds, isLoading: loadingMaintenance } = useMaintenanceQueue();
  const { mutate: updateBedStatus, isPending: isUpdating } = useUpdateBedStatus();

  const handleMarkClean = (bedId: string) => {
    updateBedStatus({ bedId, status: "available" });
  };

  const handleCompleteMaintenance = (bedId: string) => {
    updateBedStatus({ bedId, status: "available" });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Housekeeping & Maintenance"
        description="Manage bed cleaning and maintenance tasks"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{housekeepingBeds?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Beds Pending Cleaning</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Wrench className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{maintenanceBeds?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Beds Under Maintenance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="housekeeping">
        <TabsList>
          <TabsTrigger value="housekeeping" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Cleaning Queue
            {(housekeepingBeds?.length || 0) > 0 && (
              <Badge variant="secondary">{housekeepingBeds?.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Maintenance Queue
            {(maintenanceBeds?.length || 0) > 0 && (
              <Badge variant="secondary">{maintenanceBeds?.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="housekeeping" className="mt-4">
          {loadingHousekeeping ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Loading...
              </CardContent>
            </Card>
          ) : housekeepingBeds && housekeepingBeds.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {housekeepingBeds.map((bed: {
                id: string;
                bed_number: string;
                bed_type?: string;
                updated_at?: string;
                notes?: string;
                ward?: { name: string; code: string };
              }) => (
                <Card key={bed.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Bed className="h-4 w-4" />
                        {bed.bed_number}
                      </CardTitle>
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Pending Clean
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm space-y-1">
                      {bed.ward && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Building2 className="h-3 w-3" />
                          {bed.ward.name} ({bed.ward.code})
                        </div>
                      )}
                      {bed.bed_type && (
                        <Badge variant="secondary" className="text-xs">
                          {bed.bed_type}
                        </Badge>
                      )}
                      {bed.updated_at && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Waiting: {formatDistanceToNow(new Date(bed.updated_at))}
                        </div>
                      )}
                    </div>
                    {bed.notes && (
                      <p className="text-sm text-muted-foreground">{bed.notes}</p>
                    )}
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleMarkClean(bed.id)}
                      disabled={isUpdating}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Clean
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">All beds are clean!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="maintenance" className="mt-4">
          {loadingMaintenance ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Loading...
              </CardContent>
            </Card>
          ) : maintenanceBeds && maintenanceBeds.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {maintenanceBeds.map((bed: {
                id: string;
                bed_number: string;
                bed_type?: string;
                updated_at?: string;
                notes?: string;
                ward?: { name: string; code: string };
              }) => (
                <Card key={bed.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Bed className="h-4 w-4" />
                        {bed.bed_number}
                      </CardTitle>
                      <Badge variant="outline" className="bg-orange-500/10 text-orange-500">
                        <Wrench className="h-3 w-3 mr-1" />
                        Maintenance
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm space-y-1">
                      {bed.ward && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Building2 className="h-3 w-3" />
                          {bed.ward.name} ({bed.ward.code})
                        </div>
                      )}
                      {bed.bed_type && (
                        <Badge variant="secondary" className="text-xs">
                          {bed.bed_type}
                        </Badge>
                      )}
                      {bed.updated_at && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Since: {format(new Date(bed.updated_at), "dd MMM yyyy")}
                        </div>
                      )}
                    </div>
                    {bed.notes && (
                      <div className="bg-muted/50 rounded p-2">
                        <p className="text-sm">{bed.notes}</p>
                      </div>
                    )}
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleCompleteMaintenance(bed.id)}
                      disabled={isUpdating}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Maintenance
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Wrench className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No beds under maintenance</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
