import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ReceiptSettingsEditorProps {
  header: string;
  footer: string;
  onHeaderChange: (value: string) => void;
  onFooterChange: (value: string) => void;
  disabled?: boolean;
}

export function ReceiptSettingsEditor({
  header,
  footer,
  onHeaderChange,
  onFooterChange,
  disabled = false,
}: ReceiptSettingsEditorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="receipt-header">Receipt Header</Label>
        <Textarea
          id="receipt-header"
          value={header}
          onChange={(e) => onHeaderChange(e.target.value)}
          placeholder="Organization Name&#10;License: ABC-123&#10;NTN: 1234567-8"
          rows={4}
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">
          Appears at the top of receipts and invoices. Include organization name,
          license, and tax registration numbers.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="receipt-footer">Receipt Footer</Label>
        <Textarea
          id="receipt-footer"
          value={footer}
          onChange={(e) => onFooterChange(e.target.value)}
          placeholder="Thank you for visiting!&#10;For queries: +92 42 1234567"
          rows={3}
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">
          Appears at the bottom of receipts. Include thank you message, contact
          info, or return policy.
        </p>
      </div>
    </div>
  );
}
