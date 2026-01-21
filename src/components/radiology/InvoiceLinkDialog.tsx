import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Search, Receipt, Check } from 'lucide-react';
import { InvoiceStatusBadge } from '@/components/billing/InvoiceStatusBadge';

interface InvoiceLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  onSelect: (invoiceId: string) => void;
}

export function InvoiceLinkDialog({ open, onOpenChange, patientId, onSelect }: InvoiceLinkDialogProps) {
  const [search, setSearch] = useState('');

  // Fetch patient's invoices that don't have an imaging order linked
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['patient-invoices-for-linking', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          invoice_date,
          total_amount,
          paid_amount,
          status,
          items:invoice_items(
            description,
            service_type:service_types(name, category)
          )
        `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Filter invoices that have radiology/imaging items
      return data?.filter(inv => {
        const hasRadiologyItem = inv.items?.some((item: any) => {
          const category = item.service_type?.category;
          const desc = (item.description || '').toLowerCase();
          const name = (item.service_type?.name || '').toLowerCase();
          
          // Check for radiology category or imaging keywords
          if (category === 'radiology' || category === 'imaging') return true;
          if (category === 'procedure') {
            const keywords = ['x-ray', 'xray', 'ct', 'mri', 'ultrasound', 'scan', 'mammography', 'ecg', 'echo'];
            return keywords.some(kw => desc.includes(kw) || name.includes(kw));
          }
          return false;
        });
        return hasRadiologyItem;
      }) || [];
    },
    enabled: open && !!patientId,
  });

  const filteredInvoices = invoices?.filter(inv => 
    inv.invoice_number.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Link to Invoice
          </DialogTitle>
          <DialogDescription>
            Select an existing invoice to link with this imaging order
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <ScrollArea className="h-[300px] border rounded-md">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                Loading invoices...
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No radiology invoices found for this patient
              </div>
            ) : (
              <div className="divide-y">
                {filteredInvoices.map(invoice => (
                  <button
                    key={invoice.id}
                    onClick={() => {
                      onSelect(invoice.id);
                      onOpenChange(false);
                    }}
                    className="w-full p-3 text-left hover:bg-muted/50 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium">{invoice.invoice_number}</span>
                        <InvoiceStatusBadge status={invoice.status} />
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {invoice.invoice_date && format(new Date(invoice.invoice_date), 'MMM dd, yyyy')}
                        {' • '}
                        Rs. {invoice.total_amount?.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {invoice.items?.slice(0, 2).map((item: any, idx: number) => (
                          <span key={idx}>
                            {idx > 0 && ', '}
                            {item.description || item.service_type?.name}
                          </span>
                        ))}
                        {(invoice.items?.length || 0) > 2 && ` +${invoice.items!.length - 2} more`}
                      </div>
                    </div>
                    <Check className="h-4 w-4 text-muted-foreground/50" />
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
