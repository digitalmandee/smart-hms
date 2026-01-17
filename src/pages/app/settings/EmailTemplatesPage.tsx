import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Mail, Edit2, RotateCcw, Eye, Save, Loader2, Copy, CheckCircle } from "lucide-react";
import { 
  useNotificationTemplates, 
  useNotificationTemplate,
  useSaveNotificationTemplate, 
  useResetToDefault,
  EVENT_TYPE_LABELS,
  EVENT_TYPE_CATEGORIES,
  AVAILABLE_PLACEHOLDERS,
  type NotificationTemplate 
} from "@/hooks/useNotificationTemplates";
import { useAuth } from "@/contexts/AuthContext";

export default function EmailTemplatesPage() {
  const { profile } = useAuth();
  const { data: templates, isLoading } = useNotificationTemplates("email");
  const saveTemplate = useSaveNotificationTemplate();
  const resetToDefault = useResetToDefault();

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [editedSubject, setEditedSubject] = useState("");
  const [editedTemplate, setEditedTemplate] = useState("");
  const [editedActive, setEditedActive] = useState(true);
  const [copiedPlaceholder, setCopiedPlaceholder] = useState<string | null>(null);

  const { data: currentTemplate, isLoading: isLoadingTemplate } = useNotificationTemplate(
    selectedTemplate || "",
    "email"
  );

  const handleEditTemplate = (eventType: string) => {
    setSelectedTemplate(eventType);
    setEditMode(true);
  };

  const handlePreviewTemplate = (eventType: string) => {
    setSelectedTemplate(eventType);
    setPreviewMode(true);
  };

  // Load template data when switching to edit mode
  const handleOpenEditDialog = () => {
    if (currentTemplate) {
      setEditedSubject(currentTemplate.subject || "");
      setEditedTemplate(currentTemplate.template);
      setEditedActive(currentTemplate.is_active);
    }
  };

  const handleSaveTemplate = () => {
    if (!selectedTemplate) return;

    saveTemplate.mutate({
      event_type: selectedTemplate,
      channel: "email",
      subject: editedSubject,
      template: editedTemplate,
      is_active: editedActive,
    }, {
      onSuccess: () => {
        setEditMode(false);
        setSelectedTemplate(null);
      }
    });
  };

  const handleResetTemplate = (eventType: string) => {
    resetToDefault.mutate({ eventType, channel: "email" });
  };

  const copyPlaceholder = (placeholder: string) => {
    navigator.clipboard.writeText(placeholder);
    setCopiedPlaceholder(placeholder);
    setTimeout(() => setCopiedPlaceholder(null), 2000);
  };

  const getPreviewHtml = (template: string) => {
    // Replace placeholders with sample data
    return template
      .replace(/\{\{patient_name\}\}/g, "John Doe")
      .replace(/\{\{patient_email\}\}/g, "john@example.com")
      .replace(/\{\{patient_number\}\}/g, "PT-240117-0001")
      .replace(/\{\{appointment_date\}\}/g, "January 20, 2026")
      .replace(/\{\{appointment_time\}\}/g, "10:30 AM")
      .replace(/\{\{doctor_name\}\}/g, "Dr. Sarah Smith")
      .replace(/\{\{department\}\}/g, "General Medicine")
      .replace(/\{\{token_number\}\}/g, "15")
      .replace(/\{\{organization_name\}\}/g, "City Hospital")
      .replace(/\{\{organization_phone\}\}/g, "+92 300 1234567")
      .replace(/\{\{organization_address\}\}/g, "123 Medical Street, Lahore")
      .replace(/\{\{invoice_number\}\}/g, "INV-240117-0001")
      .replace(/\{\{total_amount\}\}/g, "5,000")
      .replace(/\{\{amount_due\}\}/g, "2,500")
      .replace(/\{\{currency\}\}/g, "PKR")
      .replace(/\{\{due_date\}\}/g, "January 25, 2026")
      .replace(/\{\{days_overdue\}\}/g, "5")
      .replace(/\{\{payment_amount\}\}/g, "2,500")
      .replace(/\{\{payment_date\}\}/g, "January 17, 2026")
      .replace(/\{\{payment_method\}\}/g, "Cash")
      .replace(/\{\{balance_due\}\}/g, "0")
      .replace(/\{\{lab_order_number\}\}/g, "LO-240117-0001")
      .replace(/\{\{test_names\}\}/g, "Complete Blood Count, Lipid Profile")
      .replace(/\{\{access_code\}\}/g, "847293")
      .replace(/\{\{report_link\}\}/g, "https://example.com/lab-reports")
      .replace(/\{\{prescription_number\}\}/g, "RX-240117-0001")
      .replace(/\{\{medication_count\}\}/g, "3")
      .replace(/\{\{pharmacy_hours\}\}/g, "8:00 AM - 10:00 PM");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Email Templates" description="Customize email notifications" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-96" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Email Templates" 
        description="Customize the email templates sent to patients and clients"
      />

      <Tabs defaultValue="Appointments" className="space-y-4">
        <TabsList>
          {Object.keys(EVENT_TYPE_CATEGORIES).map((category) => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(EVENT_TYPE_CATEGORIES).map(([category, eventTypes]) => (
          <TabsContent key={category} value={category} className="space-y-4">
            {eventTypes.map((eventType) => {
              const template = templates?.find(t => t.event_type === eventType);
              const isCustomized = template?.organization_id !== null;

              return (
                <Card key={eventType}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{EVENT_TYPE_LABELS[eventType]}</h3>
                            {isCustomized && (
                              <Badge variant="secondary" className="text-xs">Customized</Badge>
                            )}
                            {template?.is_active === false && (
                              <Badge variant="outline" className="text-xs">Disabled</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            Subject: {template?.subject || "No subject"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreviewTemplate(eventType)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTemplate(eventType)}
                        >
                          <Edit2 className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        {isCustomized && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResetTemplate(eventType)}
                            disabled={resetToDefault.isPending}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Reset
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit Dialog */}
      <Dialog 
        open={editMode} 
        onOpenChange={(open) => {
          setEditMode(open);
          if (!open) setSelectedTemplate(null);
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onOpenAutoFocus={handleOpenEditDialog}>
          <DialogHeader>
            <DialogTitle>
              Edit Template: {selectedTemplate && EVENT_TYPE_LABELS[selectedTemplate]}
            </DialogTitle>
            <DialogDescription>
              Customize this email template. Use placeholders to insert dynamic content.
            </DialogDescription>
          </DialogHeader>

          {isLoadingTemplate ? (
            <div className="space-y-4 p-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <div className="flex-1 overflow-hidden grid grid-cols-3 gap-4">
              {/* Editor */}
              <div className="col-span-2 space-y-4 overflow-auto pr-2">
                <div className="flex items-center justify-between">
                  <Label>Active</Label>
                  <Switch
                    checked={editedActive}
                    onCheckedChange={setEditedActive}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Subject Line</Label>
                  <Input
                    value={editedSubject}
                    onChange={(e) => setEditedSubject(e.target.value)}
                    placeholder="Email subject..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email Body (HTML)</Label>
                  <Textarea
                    value={editedTemplate}
                    onChange={(e) => setEditedTemplate(e.target.value)}
                    placeholder="Enter HTML template..."
                    className="min-h-[400px] font-mono text-sm"
                  />
                </div>
              </div>

              {/* Placeholders Panel */}
              <div className="border-l pl-4">
                <h4 className="font-medium mb-2">Available Placeholders</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Click to copy a placeholder
                </p>
                <ScrollArea className="h-[450px]">
                  <div className="space-y-1">
                    {selectedTemplate && AVAILABLE_PLACEHOLDERS[selectedTemplate]?.map((placeholder) => (
                      <Button
                        key={placeholder}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start font-mono text-xs h-8"
                        onClick={() => copyPlaceholder(placeholder)}
                      >
                        {copiedPlaceholder === placeholder ? (
                          <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3 mr-2" />
                        )}
                        {placeholder}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}

          <Separator />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setEditMode(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate} disabled={saveTemplate.isPending}>
              {saveTemplate.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Template
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog 
        open={previewMode} 
        onOpenChange={(open) => {
          setPreviewMode(open);
          if (!open) setSelectedTemplate(null);
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              Preview: {selectedTemplate && EVENT_TYPE_LABELS[selectedTemplate]}
            </DialogTitle>
            <DialogDescription>
              This is how the email will appear to recipients (with sample data)
            </DialogDescription>
          </DialogHeader>

          {isLoadingTemplate ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <div className="space-y-4">
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm">
                  <strong>Subject:</strong>{" "}
                  {currentTemplate?.subject && getPreviewHtml(currentTemplate.subject)}
                </p>
              </div>
              <ScrollArea className="h-[500px] border rounded-lg">
                <div 
                  className="p-4"
                  dangerouslySetInnerHTML={{ 
                    __html: currentTemplate?.template ? getPreviewHtml(currentTemplate.template) : "" 
                  }}
                />
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
