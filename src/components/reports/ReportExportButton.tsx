import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, Printer, Loader2 } from "lucide-react";
import { exportToCSV } from "@/lib/exportUtils";
import { generatePDFReport, PDFColumn, PDFExportOptions } from "@/lib/pdfExport";
import { useOrganizationBranding } from "@/hooks/useOrganizationBranding";

interface ColumnConfig {
  key: string;
  header: string;
  format?: (value: any) => string;
  align?: "left" | "center" | "right";
}

interface PDFOptions {
  title: string;
  subtitle?: string;
  dateRange?: { from: Date; to: Date };
  filters?: { label: string; value: string }[];
  orientation?: "portrait" | "landscape";
}

interface ReportExportButtonProps<T> {
  data: T[];
  filename: string;
  columns: ColumnConfig[];
  title?: string;
  onPrint?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  pdfOptions?: PDFOptions;
  summaryRow?: Record<string, any>;
}

export function ReportExportButton<T extends Record<string, any>>({
  data,
  filename,
  columns,
  title,
  onPrint,
  isLoading = false,
  disabled = false,
  pdfOptions,
  summaryRow,
}: ReportExportButtonProps<T>) {
  const [exporting, setExporting] = useState(false);
  const { data: branding } = useOrganizationBranding();

  const handleExportCSV = async () => {
    if (!data || data.length === 0) return;
    
    setExporting(true);
    try {
      exportToCSV(data, filename, columns);
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = () => {
    if (!data || data.length === 0) return;
    
    setExporting(true);
    try {
      const pdfColumns: PDFColumn[] = columns.map(col => ({
        key: col.key,
        header: col.header,
        align: col.align,
        format: col.format,
      }));

      generatePDFReport({
        title: pdfOptions?.title || title || "Report",
        subtitle: pdfOptions?.subtitle,
        dateRange: pdfOptions?.dateRange,
        filters: pdfOptions?.filters,
        data,
        columns: pdfColumns,
        summaryRow,
        orientation: pdfOptions?.orientation,
        organization: branding ? {
          name: branding.name || "SmartHMS",
          address: branding.address,
          phone: branding.phone,
          email: branding.email,
          logo_url: branding.logo_url,
        } : undefined,
      });
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      // Use PDF export for print
      handleExportPDF();
    }
  };

  const isDisabled = disabled || isLoading || data.length === 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isDisabled}>
          {exporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleExportCSV}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Export PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
