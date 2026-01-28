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

interface ColumnConfig {
  key: string;
  header: string;
  format?: (value: any) => string;
}

interface ReportExportButtonProps<T> {
  data: T[];
  filename: string;
  columns: ColumnConfig[];
  title?: string;
  onPrint?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function ReportExportButton<T extends Record<string, any>>({
  data,
  filename,
  columns,
  title,
  onPrint,
  isLoading = false,
  disabled = false,
}: ReportExportButtonProps<T>) {
  const [exporting, setExporting] = useState(false);

  const handleExportCSV = async () => {
    if (!data || data.length === 0) return;
    
    setExporting(true);
    try {
      exportToCSV(data, filename, columns);
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
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
        <DropdownMenuItem onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
