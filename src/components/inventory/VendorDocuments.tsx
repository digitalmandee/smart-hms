import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { FileText, Upload, Trash2 } from "lucide-react";
import { format, differenceInDays, isPast } from "date-fns";
import { toast } from "sonner";

interface VendorDocumentsProps {
  vendorId: string;
}

export function VendorDocuments({ vendorId }: VendorDocumentsProps) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState("license");
  const [expiryDate, setExpiryDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: documents, isLoading } = useQuery({
    queryKey: ["vendor-documents", vendorId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("vendor_documents")
        .select("*")
        .eq("vendor_id", vendorId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (docId: string) => {
      const { error } = await (supabase as any)
        .from("vendor_documents")
        .delete()
        .eq("id", docId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-documents", vendorId] });
      toast.success("Document deleted");
    },
  });

  const handleUpload = async () => {
    if (!file || !docName || !profile?.organization_id) return;
    setUploading(true);
    try {
      const filePath = `${profile.organization_id}/${vendorId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("vendor-documents")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("vendor-documents")
        .getPublicUrl(filePath);

      const { error: insertError } = await (supabase as any)
        .from("vendor_documents")
        .insert({
          vendor_id: vendorId,
          organization_id: profile.organization_id,
          document_name: docName,
          document_type: docType,
          expiry_date: expiryDate || null,
          file_url: filePath,
          status: "active",
          uploaded_by: profile.id,
        });
      if (insertError) throw insertError;

      queryClient.invalidateQueries({ queryKey: ["vendor-documents", vendorId] });
      toast.success("Document uploaded");
      setOpen(false);
      setDocName("");
      setDocType("license");
      setExpiryDate("");
      setFile(null);
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const getExpiryBadge = (expiryDate: string | null) => {
    if (!expiryDate) return null;
    const expiry = new Date(expiryDate);
    if (isPast(expiry)) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    const daysLeft = differenceInDays(expiry, new Date());
    if (daysLeft <= 30) {
      return <Badge className="bg-amber-500 text-white">Expiring Soon</Badge>;
    }
    return <Badge variant="secondary">Valid</Badge>;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documents
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Vendor Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Document Name</Label>
                <Input value={docName} onChange={(e) => setDocName(e.target.value)} placeholder="e.g. Trade License 2025" />
              </div>
              <div>
                <Label>Document Type</Label>
                <Select value={docType} onValueChange={setDocType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="license">License</SelectItem>
                    <SelectItem value="certificate">Certificate</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Expiry Date (optional)</Label>
                <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
              </div>
              <div>
                <Label>File</Label>
                <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleUpload} disabled={uploading || !file || !docName}>
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground text-center py-4">Loading...</p>
        ) : documents && documents.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc: any) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.document_name}</TableCell>
                  <TableCell className="capitalize">{doc.document_type}</TableCell>
                  <TableCell>
                    {doc.expiry_date ? format(new Date(doc.expiry_date), "MMM dd, yyyy") : "—"}
                  </TableCell>
                  <TableCell>{getExpiryBadge(doc.expiry_date)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(doc.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            No documents uploaded for this vendor
          </p>
        )}
      </CardContent>
    </Card>
  );
}
