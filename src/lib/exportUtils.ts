/**
 * Export utilities for CSV download and printing
 */
import DOMPurify from "dompurify";
import { logExportAudit } from "@/lib/auditExport";

interface ColumnConfig {
  key: string;
  header: string;
  format?: (value: any) => string;
}

export const exportToCSV = <T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns: ColumnConfig[],
  entityType?: string
): void => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Create header row
  const headerRow = columns.map(col => `"${col.header}"`).join(',');

  // Create data rows
  const dataRows = data.map(row => 
    columns.map(col => {
      const value = row[col.key];
      const formattedValue = col.format ? col.format(value) : value;
      // Escape quotes and wrap in quotes
      const escaped = String(formattedValue ?? '').replace(/"/g, '""');
      return `"${escaped}"`;
    }).join(',')
  );

  // Combine and create CSV content
  const csvContent = [headerRow, ...dataRows].join('\n');
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  // HIPAA: Audit log the export
  logExportAudit({
    entityType: entityType || filename,
    recordCount: data.length,
    exportFormat: "csv",
    filename: `${filename}.csv`,
  });
};

export const formatCurrency = (value: number | null | undefined): string => {
  if (value == null) return 'Rs. 0.00';
  return `Rs. ${Number(value).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatDate = (date: string | Date | null): string => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date: string | Date | null): string => {
  if (!date) return '-';
  return new Date(date).toLocaleString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const printElement = (element: HTMLElement, title: string): void => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  // Sanitize innerHTML to prevent XSS in print window
  const sanitizedContent = DOMPurify.sanitize(element.innerHTML);

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        ${sanitizedContent}
      </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.print();
  printWindow.close();
};
