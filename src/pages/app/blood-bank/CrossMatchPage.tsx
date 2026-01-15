import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { TestTubes, CheckCircle2, XCircle, Clock, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { 
  useCrossMatchTests, 
  type CrossMatchResult 
} from "@/hooks/useBloodBank";
import { BloodGroupBadge } from "@/components/blood-bank/BloodGroupBadge";

const resultConfig: Record<CrossMatchResult, { label: string; color: string; icon: any }> = {
  compatible: { label: 'Compatible', color: 'bg-success/10 text-success border-success/20', icon: CheckCircle2 },
  incompatible: { label: 'Incompatible', color: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle },
  pending: { label: 'Pending', color: 'bg-warning/10 text-warning border-warning/20', icon: Clock },
};

export default function CrossMatchPage() {
  const navigate = useNavigate();
  const [resultFilter, setResultFilter] = useState<CrossMatchResult | "all">("all");

  const { data: tests, isLoading } = useCrossMatchTests({
    result: resultFilter === "all" ? undefined : resultFilter,
  });

  // Group by result for summary
  const summary = tests?.reduce((acc, test) => {
    acc[test.overall_result] = (acc[test.overall_result] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cross-Matching"
        description="Compatibility testing for blood transfusions"
        actions={
          <Button onClick={() => navigate('/app/blood-bank/cross-match/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Cross-Match
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(resultConfig).map(([result, config]) => {
          const ResultIcon = config.icon;
          return (
            <Card 
              key={result}
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                resultFilter === result ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setResultFilter(resultFilter === result ? "all" : result as CrossMatchResult)}
            >
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{summary[result] || 0}</p>
                    <p className="text-sm text-muted-foreground">{config.label}</p>
                  </div>
                  <ResultIcon className={`h-8 w-8 ${config.color.split(' ')[1]}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={resultFilter} onValueChange={(v) => setResultFilter(v as CrossMatchResult | "all")}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Result" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Results</SelectItem>
            {Object.entries(resultConfig).map(([value, config]) => (
              <SelectItem key={value} value={value}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tests List */}
      {isLoading ? (
        <div className="space-y-2">
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : tests && tests.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 text-sm font-medium">Test #</th>
                    <th className="text-left p-3 text-sm font-medium">Patient</th>
                    <th className="text-left p-3 text-sm font-medium">Patient Group</th>
                    <th className="text-left p-3 text-sm font-medium">Donor Unit</th>
                    <th className="text-left p-3 text-sm font-medium">Donor Group</th>
                    <th className="text-left p-3 text-sm font-medium">Major</th>
                    <th className="text-left p-3 text-sm font-medium">Minor</th>
                    <th className="text-left p-3 text-sm font-medium">Result</th>
                    <th className="text-left p-3 text-sm font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {tests.map((test) => {
                    const resultInfo = resultConfig[test.overall_result];
                    const ResultIcon = resultInfo.icon;
                    const patientName = test.request?.patient 
                      ? `${(test.request.patient as any).first_name} ${(test.request.patient as any).last_name || ''}`.trim()
                      : 'Unknown';

                    return (
                      <tr 
                        key={test.id} 
                        className="border-b hover:bg-muted/50 cursor-pointer"
                        onClick={() => navigate(`/app/blood-bank/cross-match/${test.id}`)}
                      >
                        <td className="p-3 font-mono text-sm">{test.test_number || '-'}</td>
                        <td className="p-3 text-sm">{patientName}</td>
                        <td className="p-3">
                          <BloodGroupBadge group={test.patient_blood_group} size="sm" />
                        </td>
                        <td className="p-3 font-mono text-sm">
                          {(test.blood_unit as any)?.unit_number || '-'}
                        </td>
                        <td className="p-3">
                          <BloodGroupBadge group={test.donor_blood_group} size="sm" />
                        </td>
                        <td className="p-3">
                          <Badge className={resultConfig[test.major_cross_match].color}>
                            {resultConfig[test.major_cross_match].label}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge className={resultConfig[test.minor_cross_match].color}>
                            {resultConfig[test.minor_cross_match].label}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge className={resultInfo.color}>
                            <ResultIcon className="h-3 w-3 mr-1" />
                            {resultInfo.label}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {test.performed_at 
                            ? format(parseISO(test.performed_at), "MMM d, h:mm a")
                            : '-'
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-12">
          <TestTubes className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No cross-match tests found</h3>
          <p className="text-muted-foreground mb-4">
            {resultFilter !== "all"
              ? "Try adjusting your filters"
              : "Cross-match tests are performed when processing blood requests"}
          </p>
          <Button onClick={() => navigate('/app/blood-bank/requests')}>
            View Blood Requests
          </Button>
        </div>
      )}
    </div>
  );
}
