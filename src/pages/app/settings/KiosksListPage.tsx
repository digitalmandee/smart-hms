import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Monitor, Pencil, Trash2, ExternalLink, Copy, QrCode } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useKiosks, useDeleteKiosk, KioskConfig } from "@/hooks/useKiosks";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const kioskTypeConfig = {
  opd: { label: "OPD", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
  ipd: { label: "IPD", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
  emergency: { label: "Emergency", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
};

export default function KiosksListPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: kiosks, isLoading } = useKiosks();
  const deleteKiosk = useDeleteKiosk();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getKioskUrl = (kiosk: KioskConfig) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/kiosk/${kiosk.organization_id}/${kiosk.id}`;
  };

  const getDisplayUrl = (kiosk: KioskConfig) => {
    const baseUrl = window.location.origin;
    if (kiosk.kiosk_type === "emergency") {
      return `${baseUrl}/display/er/${kiosk.organization_id}`;
    }
    return `${baseUrl}/display/queue/${kiosk.organization_id}`;
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "URL Copied",
      description: "The URL has been copied to clipboard.",
    });
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteKiosk.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kiosk Management"
        description="Configure self-service kiosks for OPD, IPD, and Emergency departments"
        actions={
          <Button onClick={() => navigate("/app/settings/kiosks/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Kiosk
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
      ) : kiosks?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Monitor className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Kiosks Configured</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first kiosk to enable self-service token generation for patients.
            </p>
            <Button onClick={() => navigate("/app/settings/kiosks/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Kiosk
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {kiosks?.map((kiosk) => {
            const typeConfig = kioskTypeConfig[kiosk.kiosk_type];
            return (
              <Card key={kiosk.id} className={!kiosk.is_active ? "opacity-60" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Monitor className="h-5 w-5" />
                        {kiosk.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {kiosk.branch?.name || "All Branches"}
                      </CardDescription>
                    </div>
                    <Badge className={typeConfig.color}>{typeConfig.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-1">
                    {kiosk.departments?.length > 0 ? (
                      kiosk.departments.slice(0, 3).map((dept) => (
                        <Badge key={dept} variant="outline" className="text-xs">
                          {dept}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline" className="text-xs">All Departments</Badge>
                    )}
                    {kiosk.departments?.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{kiosk.departments.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {kiosk.auto_print && <Badge variant="secondary">Auto Print</Badge>}
                    {kiosk.show_estimated_wait && <Badge variant="secondary">Wait Time</Badge>}
                    {!kiosk.is_active && <Badge variant="destructive">Inactive</Badge>}
                  </div>

                  <div className="pt-2 border-t space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground flex-1 truncate">
                        Kiosk URL
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleCopy(getKioskUrl(kiosk))}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => window.open(getKioskUrl(kiosk), "_blank")}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground flex-1 truncate">
                        Display URL
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleCopy(getDisplayUrl(kiosk))}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => window.open(getDisplayUrl(kiosk), "_blank")}
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
                      onClick={() => navigate(`/app/settings/kiosks/${kiosk.id}`)}
                    >
                      <Pencil className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(kiosk.id)}
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
        title="Delete Kiosk"
        description="Are you sure you want to delete this kiosk? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
