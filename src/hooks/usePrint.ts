import { useRef, useCallback } from "react";

interface PrintOptions {
  title?: string;
  styles?: string;
  skipDefaultStyles?: boolean;
}

export function usePrint() {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useCallback((options?: PrintOptions) => {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow pop-ups to print");
      return;
    }

    const customStyles = options?.styles || "";
    const title = options?.title || "Print";
    const skipDefaultStyles = options?.skipDefaultStyles || false;

    const defaultStyles = skipDefaultStyles ? "" : `
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', Arial, sans-serif;
              font-size: 11pt;
              line-height: 1.5;
              color: #1a1a1a;
              padding: 10mm;
            }
            
            @page {
              margin: 10mm;
              size: A4;
            }
            
            .print-header {
              text-align: center;
              padding-bottom: 12px;
              border-bottom: 2px solid #0d9488;
              margin-bottom: 16px;
            }
            
            .print-header h1 {
              font-size: 18pt;
              color: #0d9488;
              margin-bottom: 4px;
            }
            
            .print-header p {
              font-size: 9pt;
              color: #666;
            }
            
            .print-section {
              margin-bottom: 16px;
            }
            
            .print-section-title {
              font-size: 11pt;
              font-weight: 600;
              color: #0d9488;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 4px;
              margin-bottom: 8px;
            }
            
            .print-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 8px;
            }
            
            .print-row {
              display: flex;
              gap: 8px;
              margin-bottom: 4px;
            }
            
            .print-label {
              color: #666;
              font-size: 9pt;
              min-width: 100px;
            }
            
            .print-value {
              font-weight: 500;
            }
            
            .prescription-item {
              display: flex;
              gap: 12px;
              padding: 8px;
              border: 1px solid #e5e7eb;
              border-radius: 4px;
              margin-bottom: 8px;
            }
            
            .prescription-number {
              width: 24px;
              height: 24px;
              background: #0d9488;
              color: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10pt;
              font-weight: 600;
              flex-shrink: 0;
            }
            
            .prescription-details {
              flex: 1;
            }
            
            .medicine-name {
              font-weight: 600;
              font-size: 11pt;
            }
            
            .medicine-info {
              font-size: 9pt;
              color: #666;
            }
            
            .medicine-instructions {
              font-size: 9pt;
              color: #888;
              font-style: italic;
              margin-top: 2px;
            }
            
            .print-footer {
              margin-top: 24px;
              padding-top: 16px;
              border-top: 1px solid #e5e7eb;
              display: flex;
              justify-content: space-between;
            }
            
            .signature-area {
              text-align: right;
            }
            
            .signature-line {
              margin-top: 30px;
              padding-top: 4px;
              border-top: 1px solid #333;
              font-size: 9pt;
            }
    `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            ${defaultStyles}
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', Arial, sans-serif;
              font-size: 11pt;
              line-height: 1.5;
              color: #1a1a1a;
              padding: 10mm;
            }
            
            @page {
              margin: 10mm;
              size: A4;
            }
            
            .print-header {
              text-align: center;
              padding-bottom: 12px;
              border-bottom: 2px solid #0d9488;
              margin-bottom: 16px;
            }
            
            .print-header h1 {
              font-size: 18pt;
              color: #0d9488;
              margin-bottom: 4px;
            }
            
            .print-header p {
              font-size: 9pt;
              color: #666;
            }
            
            .print-section {
              margin-bottom: 16px;
            }
            
            .print-section-title {
              font-size: 11pt;
              font-weight: 600;
              color: #0d9488;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 4px;
              margin-bottom: 8px;
            }
            
            .print-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 8px;
            }
            
            .print-row {
              display: flex;
              gap: 8px;
              margin-bottom: 4px;
            }
            
            .print-label {
              color: #666;
              font-size: 9pt;
              min-width: 100px;
            }
            
            .print-value {
              font-weight: 500;
            }
            
            .prescription-item {
              display: flex;
              gap: 12px;
              padding: 8px;
              border: 1px solid #e5e7eb;
              border-radius: 4px;
              margin-bottom: 8px;
            }
            
            .prescription-number {
              width: 24px;
              height: 24px;
              background: #0d9488;
              color: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10pt;
              font-weight: 600;
              flex-shrink: 0;
            }
            
            .prescription-details {
              flex: 1;
            }
            
            .medicine-name {
              font-weight: 600;
              font-size: 11pt;
            }
            
            .medicine-info {
              font-size: 9pt;
              color: #666;
            }
            
            .medicine-instructions {
              font-size: 9pt;
              color: #888;
              font-style: italic;
              margin-top: 2px;
            }
            
            .print-footer {
              margin-top: 24px;
              padding-top: 16px;
              border-top: 1px solid #e5e7eb;
              display: flex;
              justify-content: space-between;
            }
            
            .signature-area {
              text-align: right;
            }
            
            ${customStyles}
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    };
  }, []);

  return { printRef, handlePrint };
}
