import { useState } from "react";
import { TestTube, Clock, CheckCircle2, Search, AlertCircle, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { useHaptics } from "@/hooks/useHaptics";
import { cn } from "@/lib/utils";

interface LabOrder {
  id: string;
  patientName: string;
  testName: string;
  sampleType: string;
  status: "pending" | "sample_collected" | "processing" | "completed";
  priority?: "urgent" | "stat" | "normal";
  orderedAt: string;
}

const mockLabOrders: LabOrder[] = [
  {
    id: "1",
    patientName: "Ahmed Khan",
    testName: "Complete Blood Count",
    sampleType: "Blood",
    status: "pending",
    priority: "stat",
    orderedAt: "10 min ago",
  },
  {
    id: "2",
    patientName: "Sara Ali",
    testName: "Lipid Profile",
    sampleType: "Blood",
    status: "sample_collected",
    orderedAt: "25 min ago",
  },
  {
    id: "3",
    patientName: "Mohammad Rizwan",
    testName: "Urinalysis",
    sampleType: "Urine",
    status: "processing",
    priority: "urgent",
    orderedAt: "40 min ago",
  },
  {
    id: "4",
    patientName: "Fatima Zahra",
    testName: "Blood Sugar Fasting",
    sampleType: "Blood",
    status: "completed",
    orderedAt: "1 hour ago",
  },
];

export default function MobileLabPage() {
  const [labOrders, setLabOrders] = useState<LabOrder[]>(mockLabOrders);
  const [activeTab, setActiveTab] = useState("queue");
  const [search, setSearch] = useState("");
  const haptics = useHaptics();

  const handleRefresh = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const filteredOrders = labOrders.filter((o) => {
    const matchesSearch =
      !search ||
      o.patientName.toLowerCase().includes(search.toLowerCase()) ||
      o.testName.toLowerCase().includes(search.toLowerCase());

    if (activeTab === "queue") return matchesSearch && o.status !== "completed";
    return matchesSearch && o.status === "completed";
  });

  const pendingCount = labOrders.filter((o) => o.status !== "completed").length;

  const getStatusBadge = (status: LabOrder["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "sample_collected":
        return <Badge className="bg-info/10 text-info border-info/20">Sample Collected</Badge>;
      case "processing":
        return <Badge className="bg-warning/10 text-warning border-warning/20">Processing</Badge>;
      case "completed":
        return <Badge className="bg-success/10 text-success border-success/20">Completed</Badge>;
    }
  };

  const getPriorityColor = (priority?: LabOrder["priority"]) => {
    switch (priority) {
      case "stat":
        return "border-l-destructive";
      case "urgent":
        return "border-l-warning";
      default:
        return "";
    }
  };

  const getNextAction = (status: LabOrder["status"]) => {
    switch (status) {
      case "pending":
        return "Collect Sample";
      case "sample_collected":
        return "Start Processing";
      case "processing":
        return "Enter Results";
      default:
        return null;
    }
  };

  const advanceStatus = (id: string) => {
    haptics.medium();
    setLabOrders((prev) =>
      prev.map((order) => {
        if (order.id !== id) return order;
        const statusMap: Record<string, LabOrder["status"]> = {
          pending: "sample_collected",
          sample_collected: "processing",
          processing: "completed",
        };
        return { ...order, status: statusMap[order.status] || order.status };
      })
    );
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="px-4 py-4 bg-background border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Lab Queue</h1>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <FileText className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="queue" className="gap-2">
              Queue
              {pendingCount > 0 && (
                <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="px-4 py-4 space-y-3">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <Card
                key={order.id}
                className={cn(
                  "touch-manipulation active:scale-[0.98] transition-transform",
                  order.priority && "border-l-4",
                  getPriorityColor(order.priority)
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{order.patientName}</span>
                        {order.priority && order.priority !== "normal" && (
                          <Badge
                            variant={order.priority === "stat" ? "destructive" : "outline"}
                            className={cn(
                              "text-[10px] px-1.5 py-0",
                              order.priority === "urgent" && "border-warning text-warning"
                            )}
                          >
                            {order.priority.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium text-primary mt-0.5">{order.testName}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <TestTube className="h-3 w-3" />
                          {order.sampleType}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {order.orderedAt}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(order.status)}
                      {getNextAction(order.status) && (
                        <Button size="sm" onClick={() => advanceStatus(order.id)}>
                          {getNextAction(order.status)}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <TestTube className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                {activeTab === "queue" ? "No tests in queue" : "No completed tests"}
              </p>
            </div>
          )}
        </div>
      </PullToRefresh>
    </div>
  );
}
