import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { Plus } from "lucide-react";

export default function TaskAssignmentsPage() {
  const { t } = useTranslation();

  return (
    <div>
      <PageHeader
        title={t("housekeeping.tasks" as any, "Task Assignments")}
        description={t("housekeeping.tasksDesc" as any, "Create and assign cleaning tasks to staff")}
        breadcrumbs={[
          { label: t("housekeeping.title" as any, "Housekeeping"), href: "/app/housekeeping" },
          { label: t("housekeeping.tasks" as any, "Tasks") },
        ]}
        actions={<Button><Plus className="mr-2 h-4 w-4" />New Task</Button>}
      />

      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Create cleaning tasks with priority levels, room/area selection, assigned staff, and due times.
        </CardContent>
      </Card>
    </div>
  );
}
