import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Trash2, Upload, Calendar, AlertCircle } from "lucide-react";
import { DOCUMENT_TYPES, DOCUMENT_CATEGORIES } from "@/hooks/useEmployeeDocuments";

export interface PendingDocument {
  id: string;
  document_name: string;
  document_type: string;
  document_category: string;
  document_number?: string;
  expiry_date?: string;
  file?: File;
  notes?: string;
}

interface DocumentUploadSectionProps {
  pendingDocuments: PendingDocument[];
  onDocumentsChange: (documents: PendingDocument[]) => void;
  disabled?: boolean;
}

export function DocumentUploadSection({
  pendingDocuments,
  onDocumentsChange,
  disabled = false,
}: DocumentUploadSectionProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDocument, setNewDocument] = useState<Partial<PendingDocument>>({
    document_category: "",
    document_type: "",
    document_name: "",
    document_number: "",
    expiry_date: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const filteredTypes = newDocument.document_category
    ? DOCUMENT_TYPES.filter((t) => t.category === newDocument.document_category)
    : DOCUMENT_TYPES;

  const handleAddDocument = () => {
    if (!newDocument.document_name || !newDocument.document_type) return;

    const doc: PendingDocument = {
      id: crypto.randomUUID(),
      document_name: newDocument.document_name,
      document_type: newDocument.document_type,
      document_category: newDocument.document_category || "other",
      document_number: newDocument.document_number || undefined,
      expiry_date: newDocument.expiry_date || undefined,
      file: selectedFile || undefined,
      notes: newDocument.notes || undefined,
    };

    onDocumentsChange([...pendingDocuments, doc]);
    setNewDocument({
      document_category: "",
      document_type: "",
      document_name: "",
      document_number: "",
      expiry_date: "",
    });
    setSelectedFile(null);
    setShowAddForm(false);
  };

  const handleRemoveDocument = (id: string) => {
    onDocumentsChange(pendingDocuments.filter((d) => d.id !== id));
  };

  const getDocumentTypeLabel = (type: string) => {
    return DOCUMENT_TYPES.find((d) => d.value === type)?.label || type;
  };

  const getCategoryLabel = (category: string) => {
    return DOCUMENT_CATEGORIES.find((c) => c.value === category)?.label || category;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Documents
            </CardTitle>
            <CardDescription>
              Upload required documents for employee onboarding (CNIC, certificates, etc.)
            </CardDescription>
          </div>
          {!showAddForm && !disabled && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Document
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Document Form */}
        {showAddForm && (
          <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={newDocument.document_category}
                  onValueChange={(value) =>
                    setNewDocument({ ...newDocument, document_category: value, document_type: "" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Document Type *</Label>
                <Select
                  value={newDocument.document_type}
                  onValueChange={(value) => {
                    const docType = DOCUMENT_TYPES.find((t) => t.value === value);
                    setNewDocument({
                      ...newDocument,
                      document_type: value,
                      document_name: docType?.label || "",
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Document Name *</Label>
                <Input
                  value={newDocument.document_name || ""}
                  onChange={(e) =>
                    setNewDocument({ ...newDocument, document_name: e.target.value })
                  }
                  placeholder="e.g., CNIC Front Copy"
                />
              </div>

              <div className="space-y-2">
                <Label>Document Number</Label>
                <Input
                  value={newDocument.document_number || ""}
                  onChange={(e) =>
                    setNewDocument({ ...newDocument, document_number: e.target.value })
                  }
                  placeholder="e.g., 35201-1234567-1"
                />
              </div>

              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <Input
                  type="date"
                  value={newDocument.expiry_date || ""}
                  onChange={(e) =>
                    setNewDocument({ ...newDocument, expiry_date: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Upload File</Label>
                <Input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <p className="text-xs text-muted-foreground">
                  PDF, JPG, PNG, DOC up to 10MB
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAddForm(false);
                  setNewDocument({
                    document_category: "",
                    document_type: "",
                    document_name: "",
                    document_number: "",
                    expiry_date: "",
                  });
                  setSelectedFile(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleAddDocument}
                disabled={!newDocument.document_name || !newDocument.document_type}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        )}

        {/* Documents List */}
        {pendingDocuments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>No documents added yet</p>
            <p className="text-sm">Click "Add Document" to upload employee documents</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-background hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{doc.document_name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {getCategoryLabel(doc.document_category)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{getDocumentTypeLabel(doc.document_type)}</span>
                      {doc.document_number && <span>#{doc.document_number}</span>}
                      {doc.expiry_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Expires: {doc.expiry_date}
                        </span>
                      )}
                      {doc.file && (
                        <span className="flex items-center gap-1 text-green-600">
                          <Upload className="h-3 w-3" />
                          File attached
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {!disabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDocument(doc.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Info notice */}
        {pendingDocuments.length > 0 && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Documents will be uploaded after the employee record is saved.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
