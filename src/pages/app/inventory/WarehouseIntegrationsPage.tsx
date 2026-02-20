import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Webhook, FileSpreadsheet, Key, QrCode } from "lucide-react";

const integrations = [
  {
    title: "Webhook Notifications",
    description: "Configure outbound webhooks for events like GRN verified, shipment dispatched, stock alerts.",
    icon: Webhook,
    status: "Available",
    action: "Configure",
  },
  {
    title: "CSV Import/Export",
    description: "Bulk import items, stock levels, and vendors via CSV. Export data for external reporting.",
    icon: FileSpreadsheet,
    status: "Available",
    action: "Import/Export",
  },
  {
    title: "API Keys",
    description: "Generate API keys for external systems to integrate with your warehouse management.",
    icon: Key,
    status: "Coming Soon",
    action: "Manage Keys",
  },
  {
    title: "Barcode/QR Scanning",
    description: "Enable barcode and QR code scanning for item lookup, bin assignment, and picking operations.",
    icon: QrCode,
    status: "Coming Soon",
    action: "Setup",
  },
];

export default function WarehouseIntegrationsPage() {
  return (
    <div className="p-6">
      <PageHeader title="Integrations" description="Connect your warehouse with external services and tools"
        breadcrumbs={[{ label: "Inventory", href: "/app/inventory" }, { label: "Integrations" }]}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((int) => (
          <Card key={int.title}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center"><int.icon className="h-5 w-5" /></div>
                  <div>
                    <CardTitle className="text-base">{int.title}</CardTitle>
                    <Badge variant={int.status === "Available" ? "default" : "secondary"} className="mt-1">{int.status}</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">{int.description}</CardDescription>
              <Button variant="outline" size="sm" disabled={int.status !== "Available"}>{int.action}</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
