import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useEmployeeDocuments,
  useEmployeeLicenses,
  DOCUMENT_TYPES,
  LICENSE_TYPES,
} from "@/hooks/useEmployeeDocuments";
import {
  FileText,
  Award,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Plus,
  Trash2,
} from "lucide-react";
import { format, parseISO, isBefore, addDays } from "date-fns";

interface EmployeeDocumentsSectionProps {
  employeeId: string;
  readOnly?: boolean;
}

export function EmployeeDocumentsSection({
  employeeId,
  readOnly = true,
}: EmployeeDocumentsSectionProps) {
  const { data: documents, isLoading: loadingDocs } = useEmployeeDocuments(employeeId);
  const { data: licenses, isLoading: loadingLicenses } = useEmployeeLicenses(employeeId);

  const isLoading = loadingDocs || loadingLicenses;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const getDocumentTypeLabel = (type: string) => {
    return DOCUMENT_TYPES.find(d => d.value === type)?.label || type;
  };

  const getLicenseTypeLabel = (type: string) => {
    return LICENSE_TYPES.find(l => l.value === type)?.label || type;
  };

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    return isBefore(parseISO(expiryDate), new Date());
  };

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const date = parseISO(expiryDate);
    return isBefore(date, addDays(new Date(), 30)) && !isBefore(date, new Date());
  };

  return (
    <div className="space-y-6">
      {/* Licenses Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            Professional Licenses
          </CardTitle>
          {!readOnly && (
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add License
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {!licenses || licenses.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No licenses on record</p>
            </div>
          ) : (
            <div className="space-y-3">
              {licenses.map((license) => (
                <div
                  key={license.id}
                  className="flex items-start justify-between p-3 border rounded-lg bg-muted/30"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {getLicenseTypeLabel(license.license_type)}
                      </span>
                      {license.is_verified ? (
                        <Badge variant="default" className="bg-green-500 text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Pending Verification
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {license.license_number}
                    </p>
                    {license.issuing_authority && (
                      <p className="text-xs text-muted-foreground">
                        Issued by: {license.issuing_authority}
                      </p>
                    )}
                    {license.expiry_date && (
                      <div className="flex items-center gap-1 text-xs">
                        <Calendar className="h-3 w-3" />
                        <span>Expires: {format(parseISO(license.expiry_date), "MMM d, yyyy")}</span>
                        {isExpired(license.expiry_date) && (
                          <Badge variant="destructive" className="text-xs ml-1">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Expired
                          </Badge>
                        )}
                        {isExpiringSoon(license.expiry_date) && (
                          <Badge variant="outline" className="text-xs ml-1 border-amber-500 text-amber-600">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Expiring Soon
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {license.document_url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={license.document_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {!readOnly && (
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Documents
          </CardTitle>
          {!readOnly && (
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add Document
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {!documents || documents.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No documents uploaded</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{doc.document_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {getDocumentTypeLabel(doc.document_type)}
                      </p>
                      {doc.document_number && (
                        <p className="text-xs text-muted-foreground">
                          #{doc.document_number}
                        </p>
                      )}
                      {doc.expiry_date && (
                        <div className="flex items-center gap-1 text-xs">
                          <Calendar className="h-3 w-3" />
                          <span>Expires: {format(parseISO(doc.expiry_date), "MMM d, yyyy")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" asChild>
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    {!readOnly && (
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
