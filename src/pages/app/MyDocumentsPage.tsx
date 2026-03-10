import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Shield, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function MyDocumentsPage() {
  const { user, profile } = useAuth();

  const { data: employee } = useQuery({
    queryKey: ['my-employee-record', user?.id],
    queryFn: async () => {
      if (!user?.id || !profile?.organization_id) return null;
      const { data } = await supabase
        .from('employees')
        .select('id')
        .eq('organization_id', profile.organization_id)
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id && !!profile?.organization_id,
  });

  const { data: documents, isLoading } = useQuery({
    queryKey: ['my-documents', employee?.id],
    queryFn: async () => {
      if (!employee?.id) return [];
      const { data, error } = await (supabase as any)
        .from('employee_documents')
        .select('*')
        .eq('employee_id', employee.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!employee?.id,
  });

  const { data: licenses } = useQuery({
    queryKey: ['my-licenses', employee?.id],
    queryFn: async () => {
      if (!employee?.id) return [];
      const { data, error } = await (supabase as any)
        .from('employee_licenses')
        .select('*')
        .eq('employee_id', employee.id)
        .order('expiry_date', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!employee?.id,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="My Documents" subtitle="View your uploaded documents and licenses" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Documents</p><p className="text-2xl font-bold">{documents?.length || 0}</p></div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Licenses</p><p className="text-2xl font-bold">{licenses?.length || 0}</p></div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Documents</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : !documents?.length ? (
            <p className="text-center py-8 text-muted-foreground">No documents found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc: any) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.document_name || doc.name || "—"}</TableCell>
                    <TableCell>{doc.document_type || "—"}</TableCell>
                    <TableCell>{doc.created_at ? format(new Date(doc.created_at), "dd MMM yyyy") : "—"}</TableCell>
                    <TableCell><Badge variant="secondary">{doc.status || "active"}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {licenses && licenses.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Licenses & Certifications</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>License</TableHead>
                  <TableHead>Number</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {licenses.map((lic: any) => {
                  const isExpired = lic.expiry_date && new Date(lic.expiry_date) < new Date();
                  return (
                    <TableRow key={lic.id}>
                      <TableCell className="font-medium">{lic.license_type || lic.license_name || "—"}</TableCell>
                      <TableCell>{lic.license_number || "—"}</TableCell>
                      <TableCell>{lic.expiry_date ? format(new Date(lic.expiry_date), "dd MMM yyyy") : "—"}</TableCell>
                      <TableCell><Badge className={isExpired ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>{isExpired ? "Expired" : "Valid"}</Badge></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
