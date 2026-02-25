import { useParams, useNavigate, Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, TestTubes, CheckCircle2, XCircle, Clock,
  User, Package, FileText
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { useCrossMatchTests, type CrossMatchResult } from "@/hooks/useBloodBank";
import { BloodGroupBadge } from "@/components/blood-bank/BloodGroupBadge";

const resultConfig: Record<CrossMatchResult, { label: string; color: string; icon: any }> = {
  compatible: { label: "Compatible", color: "bg-success/10 text-success border-success/20", icon: CheckCircle2 },
  incompatible: { label: "Incompatible", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
  pending: { label: "Pending", color: "bg-warning/10 text-warning border-warning/20", icon: Clock },
};

export default function CrossMatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: tests, isLoading } = useCrossMatchTests();
  const test = tests?.find((t) => t.id === id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Cross-Match Details" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-64 md:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="space-y-6">
        <PageHeader title="Cross-Match Details" />
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Cross-match test not found</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate("/app/blood-bank/cross-match")}>
              Back to Cross-Matching
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const overallInfo = resultConfig[test.overall_result];
  const OverallIcon = overallInfo.icon;
  const patientName = test.request?.patient
    ? `${(test.request.patient as any).first_name} ${(test.request.patient as any).last_name || ""}`.trim()
    : "Unknown Patient";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Cross-Match ${test.test_number || ""}`}
        description={`Compatibility test for ${patientName}`}
        actions={
          <Button variant="outline" onClick={() => navigate("/app/blood-bank/cross-match")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Results */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TestTubes className="h-5 w-5" />
                  Test Results
                </CardTitle>
                <Badge className={overallInfo.color}>
                  <OverallIcon className="h-3 w-3 mr-1" />
                  {overallInfo.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-2">Major Cross-Match</p>
                  <Badge className={resultConfig[test.major_cross_match].color}>
                    {resultConfig[test.major_cross_match].label}
                  </Badge>
                </div>
                <div className="text-center p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-2">Minor Cross-Match</p>
                  <Badge className={resultConfig[test.minor_cross_match].color}>
                    {resultConfig[test.minor_cross_match].label}
                  </Badge>
                </div>
                <div className="text-center p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-2">Overall Result</p>
                  <Badge className={overallInfo.color}>
                    <OverallIcon className="h-3 w-3 mr-1" />
                    {overallInfo.label}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Blood Group Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Blood Group Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-8">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">Patient</p>
                  <BloodGroupBadge group={test.patient_blood_group} size="lg" showIcon />
                </div>
                <div className="text-2xl text-muted-foreground">↔</div>
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">Donor Unit</p>
                  <BloodGroupBadge group={test.donor_blood_group} size="lg" showIcon />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Test Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Test Number</p>
                  <p className="font-medium font-mono">{test.test_number || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Performed At</p>
                  <p className="font-medium">
                    {test.performed_at ? format(parseISO(test.performed_at), "MMM dd, yyyy h:mm a") : "-"}
                  </p>
                </div>
                {test.valid_until && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Valid Until</p>
                    <p className="font-medium">{format(parseISO(test.valid_until), "MMM dd, yyyy h:mm a")}</p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">{format(parseISO(test.created_at), "MMM dd, yyyy")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Patient */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Patient
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{patientName}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {(test.request?.patient as any)?.patient_number || ""}
              </p>
            </CardContent>
          </Card>

          {/* Linked Records */}
          <Card>
            <CardHeader>
              <CardTitle>Linked Records</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {test.blood_unit && (
                <Link to={`/app/blood-bank/inventory/${test.blood_unit_id}`} className="block">
                  <Button variant="outline" size="sm" className="w-full">
                    <Package className="h-3 w-3 mr-2" />
                    Unit: {(test.blood_unit as any)?.unit_number || "View"}
                  </Button>
                </Link>
              )}
              {test.request_id && (
                <Link to={`/app/blood-bank/requests/${test.request_id}`} className="block">
                  <Button variant="outline" size="sm" className="w-full">
                    <FileText className="h-3 w-3 mr-2" />
                    Request: {test.request?.request_number || "View"}
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
