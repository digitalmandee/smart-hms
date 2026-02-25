import { useParams, useNavigate, Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, Package, Calendar, Droplets, MapPin,
  CheckCircle, Clock, Printer, AlertTriangle, XCircle
} from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import {
  useBloodInventory,
  useUpdateBloodUnit,
  type BloodUnitStatus,
  type BloodComponentType,
} from "@/hooks/useBloodBank";
import { BloodGroupBadge } from "@/components/blood-bank/BloodGroupBadge";

const statusConfig: Record<BloodUnitStatus, { label: string; color: string }> = {
  quarantine: { label: "Quarantine", color: "bg-yellow-100 text-yellow-700" },
  available: { label: "Available", color: "bg-green-100 text-green-700" },
  reserved: { label: "Reserved", color: "bg-blue-100 text-blue-700" },
  cross_matched: { label: "Cross-Matched", color: "bg-purple-100 text-purple-700" },
  issued: { label: "Issued", color: "bg-teal-100 text-teal-700" },
  transfused: { label: "Transfused", color: "bg-gray-100 text-gray-700" },
  expired: { label: "Expired", color: "bg-red-100 text-red-700" },
  discarded: { label: "Discarded", color: "bg-red-200 text-red-800" },
};

const statusWorkflow: BloodUnitStatus[] = ["quarantine", "available", "reserved", "issued", "transfused"];

const componentLabels: Record<BloodComponentType, string> = {
  whole_blood: "Whole Blood",
  packed_rbc: "Packed RBC",
  fresh_frozen_plasma: "Fresh Frozen Plasma",
  platelet_concentrate: "Platelet Concentrate",
  cryoprecipitate: "Cryoprecipitate",
  granulocytes: "Granulocytes",
};

export default function BloodUnitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const updateUnit = useUpdateBloodUnit();

  const { data: inventory, isLoading } = useBloodInventory();
  const unit = inventory?.find((u) => u.id === id);

  const handleStatusChange = async (newStatus: BloodUnitStatus) => {
    if (!id) return;
    await updateUnit.mutateAsync({ id, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Blood Unit Details" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-64 md:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="space-y-6">
        <PageHeader title="Blood Unit Details" />
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Blood unit not found</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate("/app/blood-bank/inventory")}>
              Back to Inventory
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const daysUntilExpiry = differenceInDays(parseISO(unit.expiry_date), new Date());
  const isExpired = daysUntilExpiry < 0;
  const isExpiringSoon = daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
  const statusInfo = statusConfig[unit.status];
  const currentIdx = statusWorkflow.indexOf(unit.status);
  const nextStatus = currentIdx >= 0 && currentIdx < statusWorkflow.length - 1 ? statusWorkflow[currentIdx + 1] : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Unit ${unit.unit_number}`}
        description={componentLabels[unit.component_type] || unit.component_type}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/app/blood-bank/inventory")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Link to="/app/blood-bank/labels">
              <Button variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Print Label
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Unit Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Unit Information
                </CardTitle>
                <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Blood Group</p>
                  <BloodGroupBadge group={unit.blood_group} size="lg" showIcon />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Component Type</p>
                  <p className="font-medium">{componentLabels[unit.component_type]}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Volume</p>
                  <p className="font-medium">{unit.volume_ml} ml</p>
                </div>
                {unit.bag_number && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Bag Number</p>
                    <p className="font-medium font-mono">{unit.bag_number}</p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Collection Date</p>
                  <p className="font-medium">{format(parseISO(unit.collection_date), "MMMM dd, yyyy")}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Storage Location</p>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="font-medium">{unit.storage_location || "Not assigned"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Workflow */}
          <Card>
            <CardHeader>
              <CardTitle>Status Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                {statusWorkflow.map((status, index) => {
                  const isCompleted = index < currentIdx;
                  const isCurrent = status === unit.status;
                  return (
                    <div key={status} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium ${
                            isCompleted
                              ? "bg-primary text-primary-foreground"
                              : isCurrent
                              ? "bg-primary/20 text-primary border-2 border-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {isCompleted ? <CheckCircle className="h-4 w-4" /> : index + 1}
                        </div>
                        <p className={`text-xs mt-1 capitalize ${isCurrent ? "font-medium" : "text-muted-foreground"}`}>
                          {statusConfig[status].label}
                        </p>
                      </div>
                      {index < statusWorkflow.length - 1 && (
                        <div className={`h-0.5 w-8 mx-1 ${isCompleted ? "bg-primary" : "bg-muted"}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Expiry */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Expiry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-medium">{format(parseISO(unit.expiry_date), "MMMM dd, yyyy")}</p>
              {isExpired ? (
                <div className="flex items-center gap-2 text-destructive">
                  <XCircle className="h-5 w-5" />
                  <span className="font-medium">Expired</span>
                </div>
              ) : isExpiringSoon ? (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">{daysUntilExpiry} days remaining</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-5 w-5" />
                  <span>{daysUntilExpiry} days remaining</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {nextStatus && !isExpired && unit.status !== "discarded" && (
                <Button
                  className="w-full"
                  onClick={() => handleStatusChange(nextStatus)}
                  disabled={updateUnit.isPending}
                >
                  Move to {statusConfig[nextStatus].label}
                </Button>
              )}
              {unit.status !== "discarded" && unit.status !== "transfused" && (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => handleStatusChange("discarded")}
                  disabled={updateUnit.isPending}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Discard Unit
                </Button>
              )}
              {unit.donation_id && (
                <Link to={`/app/blood-bank/donations/${unit.donation_id}`} className="block">
                  <Button variant="outline" className="w-full">
                    <Droplets className="h-4 w-4 mr-2" />
                    View Donation
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
