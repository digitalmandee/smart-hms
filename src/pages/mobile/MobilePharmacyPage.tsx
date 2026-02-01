import { useState } from "react";
import { Pill, Clock, CheckCircle2, Search, Filter, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { useHaptics } from "@/hooks/useHaptics";
import { cn } from "@/lib/utils";

interface Prescription {
  id: string;
  patientName: string;
  doctorName: string;
  items: number;
  status: "pending" | "in_progress" | "completed";
  createdAt: string;
  priority?: "urgent" | "normal";
}

const mockPrescriptions: Prescription[] = [
  {
    id: "1",
    patientName: "Ahmed Khan",
    doctorName: "Dr. Sarah Johnson",
    items: 3,
    status: "pending",
    createdAt: "5 min ago",
    priority: "urgent",
  },
  {
    id: "2",
    patientName: "Sara Ali",
    doctorName: "Dr. Mohammed Rizvi",
    items: 2,
    status: "pending",
    createdAt: "12 min ago",
  },
  {
    id: "3",
    patientName: "Fatima Zahra",
    doctorName: "Dr. Sarah Johnson",
    items: 4,
    status: "in_progress",
    createdAt: "20 min ago",
  },
  {
    id: "4",
    patientName: "Ali Hassan",
    doctorName: "Dr. Imran Shah",
    items: 1,
    status: "completed",
    createdAt: "45 min ago",
  },
];

export default function MobilePharmacyPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(mockPrescriptions);
  const [activeTab, setActiveTab] = useState("queue");
  const [search, setSearch] = useState("");
  const haptics = useHaptics();

  const handleRefresh = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const filteredPrescriptions = prescriptions.filter((p) => {
    const matchesSearch =
      !search ||
      p.patientName.toLowerCase().includes(search.toLowerCase()) ||
      p.doctorName.toLowerCase().includes(search.toLowerCase());

    if (activeTab === "queue") return matchesSearch && p.status !== "completed";
    return matchesSearch && p.status === "completed";
  });

  const pendingCount = prescriptions.filter((p) => p.status !== "completed").length;

  const getStatusBadge = (status: Prescription["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "in_progress":
        return <Badge className="bg-warning/10 text-warning border-warning/20">Dispensing</Badge>;
      case "completed":
        return <Badge className="bg-success/10 text-success border-success/20">Completed</Badge>;
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="px-4 py-4 bg-background border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Pharmacy</h1>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Package className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search prescriptions..."
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
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="px-4 py-4 space-y-3">
          {filteredPrescriptions.length > 0 ? (
            filteredPrescriptions.map((rx) => (
              <Card
                key={rx.id}
                className={cn(
                  "touch-manipulation active:scale-[0.98] transition-transform",
                  rx.priority === "urgent" && "border-l-4 border-l-destructive"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{rx.patientName}</span>
                        {rx.priority === "urgent" && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                            Urgent
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{rx.doctorName}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Pill className="h-3 w-3" />
                          {rx.items} items
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {rx.createdAt}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(rx.status)}
                      {rx.status !== "completed" && (
                        <Button
                          size="sm"
                          variant={rx.status === "pending" ? "default" : "outline"}
                          onClick={() => {
                            haptics.medium();
                            setPrescriptions((prev) =>
                              prev.map((p) =>
                                p.id === rx.id
                                  ? {
                                      ...p,
                                      status:
                                        p.status === "pending" ? "in_progress" : "completed",
                                    }
                                  : p
                              )
                            );
                          }}
                        >
                          {rx.status === "pending" ? "Start" : "Complete"}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Pill className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                {activeTab === "queue" ? "No prescriptions in queue" : "No history"}
              </p>
            </div>
          )}
        </div>
      </PullToRefresh>
    </div>
  );
}
