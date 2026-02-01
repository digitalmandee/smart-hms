import { useState } from "react";
import { CheckCircle2, Circle, Clock, AlertTriangle, Plus, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { useHaptics } from "@/hooks/useHaptics";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in_progress" | "completed";
  dueTime?: string;
  patientName?: string;
  room?: string;
}

// Mock tasks
const mockTasks: Task[] = [
  {
    id: "1",
    title: "Record vitals",
    description: "Blood pressure, temperature, pulse",
    priority: "high",
    status: "pending",
    dueTime: "Now",
    patientName: "Ahmed Khan",
    room: "Room 204",
  },
  {
    id: "2",
    title: "Administer medication",
    description: "Paracetamol 500mg",
    priority: "high",
    status: "pending",
    dueTime: "10:30 AM",
    patientName: "Sara Ali",
    room: "Room 108",
  },
  {
    id: "3",
    title: "Change IV drip",
    priority: "medium",
    status: "in_progress",
    dueTime: "11:00 AM",
    patientName: "Mohammad Rizwan",
    room: "ICU Bed 3",
  },
  {
    id: "4",
    title: "Pre-op preparation",
    description: "Patient preparation for surgery",
    priority: "high",
    status: "pending",
    dueTime: "11:30 AM",
    patientName: "Fatima Zahra",
    room: "Pre-Op",
  },
  {
    id: "5",
    title: "Wound dressing",
    priority: "low",
    status: "completed",
    patientName: "Ali Hassan",
    room: "Room 312",
  },
];

export default function MobileTasksPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [activeTab, setActiveTab] = useState("pending");
  const haptics = useHaptics();

  const handleRefresh = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const toggleTaskStatus = (taskId: string) => {
    haptics.success();
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const newStatus = task.status === "completed" ? "pending" : "completed";
          return { ...task, status: newStatus };
        }
        return task;
      })
    );
  };

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "pending") return task.status !== "completed";
    return task.status === "completed";
  });

  const getPriorityStyles = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium":
        return "bg-warning/10 text-warning border-warning/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const pendingCount = tasks.filter((t) => t.status !== "completed").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="px-4 py-4 bg-background border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">My Tasks</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Filter className="h-4 w-4" />
            </Button>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending" className="gap-2">
              Pending
              {pendingCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              Done
              {completedCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                  {completedCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="px-4 py-4 space-y-2">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <Card
                key={task.id}
                className={cn(
                  "touch-manipulation transition-all",
                  task.status === "completed" && "opacity-60"
                )}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTaskStatus(task.id)}
                      className="mt-0.5 touch-manipulation"
                    >
                      {task.status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={cn(
                            "font-medium text-sm",
                            task.status === "completed" && "line-through text-muted-foreground"
                          )}
                        >
                          {task.title}
                        </h3>
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] px-1.5 py-0", getPriorityStyles(task.priority))}
                        >
                          {task.priority}
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        {task.patientName && <span>{task.patientName}</span>}
                        {task.room && (
                          <>
                            <span>•</span>
                            <span>{task.room}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {task.dueTime && task.status !== "completed" && (
                      <div
                        className={cn(
                          "flex items-center gap-1 text-xs",
                          task.dueTime === "Now" ? "text-destructive" : "text-muted-foreground"
                        )}
                      >
                        {task.dueTime === "Now" ? (
                          <AlertTriangle className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        {task.dueTime}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                {activeTab === "pending" ? "All tasks completed!" : "No completed tasks"}
              </p>
            </div>
          )}
        </div>
      </PullToRefresh>
    </div>
  );
}
