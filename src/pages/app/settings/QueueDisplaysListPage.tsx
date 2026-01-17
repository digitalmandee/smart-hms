import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Tv, Pencil, Trash2, ExternalLink, Copy, Volume2, VolumeX } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQueueDisplays, useDeleteQueueDisplay, QueueDisplayConfig } from "@/hooks/useQueueDisplays";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const displayTypeConfig = {
  opd: { label: "OPD", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
  ipd: { label: "IPD", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
  emergency: { label: "Emergency", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
  combined: { label: "Combined", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" },
};

export default function QueueDisplaysListPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: displays, isLoading } = useQueueDisplays();
  const deleteDisplay = useDeleteQueueDisplay();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getDisplayUrl = (display: QueueDisplayConfig) => {
    return `${window.location.origin}/display/${display.id}`;
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "URL Copied",
      description: "The display URL has been copied to clipboard.",
    });
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteDisplay.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Queue Displays"
        description="Configure TV displays for patient queue visualization"
        actions={
          <Button onClick={() => navigate("/app/settings/queue-displays/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Display
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : displays?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Tv className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Queue Displays Configured</h3>
            <p className="text-muted-foreground text-center mb-4">
              Queue displays are automatically created when you add a kiosk. You can also create standalone displays here.
            </p>
            <Button onClick={() => navigate("/app/settings/queue-displays/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Display
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displays?.map((display) => {
            const typeConfig = displayTypeConfig[display.display_type];
            return (
              <Card key={display.id} className={!display.is_active ? "opacity-60" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Tv className="h-5 w-5" />
                        {display.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {display.branch?.name || "All Branches"}
                      </CardDescription>
                    </div>
                    <Badge className={typeConfig.color}>{typeConfig.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-1">
                    {display.departments?.length > 0 ? (
                      display.departments.slice(0, 3).map((dept) => (
                        <Badge key={dept} variant="outline" className="text-xs">
                          {dept}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline" className="text-xs">All Departments</Badge>
                    )}
                    {display.departments?.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{display.departments.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary" className="gap-1">
                      {display.audio_enabled ? (
                        <Volume2 className="h-3 w-3" />
                      ) : (
                        <VolumeX className="h-3 w-3" />
                      )}
                      Audio {display.audio_enabled ? "On" : "Off"}
                    </Badge>
                    <Badge variant="secondary">
                      Next {display.show_next_count}
                    </Badge>
                    {!display.is_active && <Badge variant="destructive">Inactive</Badge>}
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {display.linked_kiosk_ids?.length || 0} linked kiosk(s)
                    </Badge>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground flex-1 truncate">
                        Display URL
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleCopy(getDisplayUrl(display))}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => window.open(getDisplayUrl(display), "_blank")}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/app/settings/queue-displays/${display.id}`)}
                    >
                      <Pencil className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(display.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Queue Display"
        description="Are you sure you want to delete this queue display? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
