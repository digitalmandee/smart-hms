import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLetterTemplates, useCreateLetterTemplate, useIssuedLetters, useIssueLetter, LETTER_TYPES } from "@/hooks/useHRLetters";
import { useEmployees } from "@/hooks/useHR";
import { useTranslation } from "@/lib/i18n";
import { FileText, Plus, Send, Loader2, Printer } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function LettersPage() {
  const { t } = useTranslation();
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);
  const [templateForm, setTemplateForm] = useState({ name: "", letter_type: "", template_body: "" });
  const [issueForm, setIssueForm] = useState({ employee_id: "", letter_type: "", subject: "", body: "" });

  const { data: templates, isLoading: loadingTemplates } = useLetterTemplates();
  const { data: issuedLetters, isLoading: loadingIssued } = useIssuedLetters();
  const { data: employees } = useEmployees();
  const createTemplate = useCreateLetterTemplate();
  const issueLetter = useIssueLetter();

  const handleCreateTemplate = async () => {
    await createTemplate.mutateAsync(templateForm);
    setIsTemplateDialogOpen(false);
    setTemplateForm({ name: "", letter_type: "", template_body: "" });
  };

  const handleIssueLetter = async () => {
    await issueLetter.mutateAsync(issueForm);
    setIsIssueDialogOpen(false);
    setIssueForm({ employee_id: "", letter_type: "", subject: "", body: "" });
  };

  const handleUseTemplate = (template: any) => {
    setIssueForm({
      ...issueForm,
      letter_type: template.letter_type,
      subject: template.name,
      body: template.template_body,
    });
    setIsIssueDialogOpen(true);
  };

  const handlePrint = (letter: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>${letter.subject}</title><style>body{font-family:Arial;padding:40px;line-height:1.6}h1{font-size:20px}</style></head>
      <body><h1>${letter.subject}</h1><p>Date: ${format(parseISO(letter.issued_date), "MMMM d, yyyy")}</p>
      <p>To: ${letter.employee?.first_name} ${letter.employee?.last_name}</p><hr/><div>${letter.body.replace(/\n/g, "<br/>")}</div></body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loadingTemplates || loadingIssued) {
    return <div className="space-y-6"><PageHeader title="HR Letters" description="Manage letter templates and issued letters" /><Skeleton className="h-64" /></div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="HR Letters & Templates" subtitle="Create templates and issue letters to employees">
        <div className="flex gap-2">
          <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
            <DialogTrigger asChild><Button variant="outline"><Plus className="h-4 w-4 mr-2" />New Template</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Create Letter Template</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div><Label>Template Name</Label><Input value={templateForm.name} onChange={e => setTemplateForm({ ...templateForm, name: e.target.value })} /></div>
                <div><Label>Letter Type</Label>
                  <Select value={templateForm.letter_type} onValueChange={v => setTemplateForm({ ...templateForm, letter_type: v })}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>{LETTER_TYPES.map(lt => <SelectItem key={lt.value} value={lt.value}>{lt.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Template Body</Label><Textarea rows={8} value={templateForm.template_body} onChange={e => setTemplateForm({ ...templateForm, template_body: e.target.value })} placeholder="Use {{employee_name}}, {{date}}, {{designation}} as variables..." /></div>
                <Button className="w-full" onClick={handleCreateTemplate} disabled={createTemplate.isPending || !templateForm.name || !templateForm.letter_type}>
                  {createTemplate.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Create Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isIssueDialogOpen} onOpenChange={setIsIssueDialogOpen}>
            <DialogTrigger asChild><Button><Send className="h-4 w-4 mr-2" />Issue Letter</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Issue Letter</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div><Label>Employee</Label>
                  <Select value={issueForm.employee_id} onValueChange={v => setIssueForm({ ...issueForm, employee_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                    <SelectContent>{(employees || []).map(e => <SelectItem key={e.id} value={e.id}>{e.first_name} {e.last_name} ({e.employee_number})</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Letter Type</Label>
                  <Select value={issueForm.letter_type} onValueChange={v => setIssueForm({ ...issueForm, letter_type: v })}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>{LETTER_TYPES.map(lt => <SelectItem key={lt.value} value={lt.value}>{lt.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Subject</Label><Input value={issueForm.subject} onChange={e => setIssueForm({ ...issueForm, subject: e.target.value })} /></div>
                <div><Label>Body</Label><Textarea rows={8} value={issueForm.body} onChange={e => setIssueForm({ ...issueForm, body: e.target.value })} /></div>
                <Button className="w-full" onClick={handleIssueLetter} disabled={issueLetter.isPending || !issueForm.employee_id || !issueForm.subject}>
                  {issueLetter.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Issue Letter
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader>

      <Tabs defaultValue="templates">
        <TabsList><TabsTrigger value="templates">Templates ({(templates || []).length})</TabsTrigger><TabsTrigger value="issued">Issued Letters ({(issuedLetters || []).length})</TabsTrigger></TabsList>

        <TabsContent value="templates" className="space-y-4">
          {(templates || []).length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground"><FileText className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>No templates yet</p></CardContent></Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(templates || []).map((tpl: any) => (
                <Card key={tpl.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{tpl.name}</CardTitle>
                      <Badge variant="secondary">{LETTER_TYPES.find(l => l.value === tpl.letter_type)?.label || tpl.letter_type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{tpl.template_body}</p>
                    <Button size="sm" variant="outline" onClick={() => handleUseTemplate(tpl)}>Use Template</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="issued">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(issuedLetters || []).length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No letters issued yet</TableCell></TableRow>
                  ) : (
                    (issuedLetters || []).map((letter: any) => (
                      <TableRow key={letter.id}>
                        <TableCell>{letter.employee?.first_name} {letter.employee?.last_name}</TableCell>
                        <TableCell><Badge variant="outline">{LETTER_TYPES.find(l => l.value === letter.letter_type)?.label || letter.letter_type}</Badge></TableCell>
                        <TableCell>{letter.subject}</TableCell>
                        <TableCell>{format(parseISO(letter.issued_date), "MMM d, yyyy")}</TableCell>
                        <TableCell><Button size="sm" variant="ghost" onClick={() => handlePrint(letter)}><Printer className="h-4 w-4" /></Button></TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
