import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileText, Trash2, Download, Loader2, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ClaimAttachment {
  id: string;
  claim_id: string;
  file_name: string;
  file_type: string;
  file_url: string;
  attachment_type: string;
  created_at: string;
}

interface ClaimAttachmentsProps {
  claimId: string;
  readOnly?: boolean;
}

const ATTACHMENT_TYPES = [
  { value: "medical_report", label: "Medical Report" },
  { value: "lab_result", label: "Lab Result" },
  { value: "radiology_image", label: "Radiology Image" },
  { value: "prescription", label: "Prescription" },
  { value: "other", label: "Other" },
];

export function ClaimAttachments({ claimId, readOnly = false }: ClaimAttachmentsProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [attachmentType, setAttachmentType] = useState("medical_report");

  const { data: attachments = [], isLoading } = useQuery({
    queryKey: ["claim-attachments", claimId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("claim_attachments" as any)
        .select("*")
        .eq("claim_id", claimId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as ClaimAttachment[];
    },
    enabled: !!claimId,
  });

  const deleteMutation = useMutation({
    mutationFn: async (attachment: ClaimAttachment) => {
      // Delete from storage
      const path = attachment.file_url.split("/claim-attachments/").pop();
      if (path) {
        await supabase.storage.from("claim-attachments").remove([path]);
      }
      // Delete from DB
      const { error } = await supabase.from("claim_attachments" as any).delete().eq("id", attachment.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["claim-attachments", claimId] });
      toast.success("Attachment deleted");
    },
    onError: (e: Error) => toast.error("Delete failed: " + e.message),
  });

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File too large. Maximum 10MB.");
        return;
      }

      setUploading(true);
      try {
        const ext = file.name.split(".").pop();
        const filePath = `${claimId}/${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("claim-attachments")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("claim-attachments")
          .getPublicUrl(filePath);

        const { error: dbError } = await supabase.from("claim_attachments" as any).insert({
          claim_id: claimId,
          file_name: file.name,
          file_type: file.type,
          file_url: urlData.publicUrl,
          attachment_type: attachmentType,
        } as any);

        if (dbError) throw dbError;

        queryClient.invalidateQueries({ queryKey: ["claim-attachments", claimId] });
        toast.success("Attachment uploaded");
      } catch (err: any) {
        toast.error("Upload failed: " + err.message);
      } finally {
        setUploading(false);
        e.target.value = "";
      }
    },
    [claimId, attachmentType, queryClient]
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Paperclip className="h-4 w-4" />
          {t("attach.title" as any, "Attachments")}
          <Badge variant="secondary">{attachments.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!readOnly && (
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Select value={attachmentType} onValueChange={setAttachmentType}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ATTACHMENT_TYPES.map((at) => (
                    <SelectItem key={at.value} value={at.value}>
                      {at.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" disabled={uploading} asChild>
              <label className="cursor-pointer">
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin me-1" />
                ) : (
                  <Upload className="h-4 w-4 me-1" />
                )}
                Upload
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.dicom"
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </label>
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : attachments.length === 0 ? (
          <div className="text-sm text-muted-foreground py-4 text-center">
            No attachments yet
          </div>
        ) : (
          <div className="space-y-2">
            {attachments.map((att) => (
              <div key={att.id} className="flex items-center gap-2 p-2 rounded border text-sm">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium">{att.file_name}</div>
                  <Badge variant="outline" className="text-xs">
                    {ATTACHMENT_TYPES.find((t) => t.value === att.attachment_type)?.label || att.attachment_type}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => window.open(att.file_url, "_blank")}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  {!readOnly && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => deleteMutation.mutate(att)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
