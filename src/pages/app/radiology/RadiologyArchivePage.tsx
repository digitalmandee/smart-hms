import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useVerifiedImagingOrders } from '@/hooks/useImaging';
import { 
  Search, 
  Eye, 
  Printer, 
  Download, 
  FileCheck2,
  Filter,
  X,
  Archive
} from 'lucide-react';
import { ImagingDetailDialog } from '@/components/radiology/ImagingDetailDialog';

const modalityLabels: Record<string, string> = {
  xray: 'X-Ray',
  ultrasound: 'Ultrasound',
  ct_scan: 'CT Scan',
  mri: 'MRI',
  ecg: 'ECG',
  echo: 'Echo',
  mammography: 'Mammography',
  fluoroscopy: 'Fluoroscopy',
  dexa: 'DEXA',
  pet_ct: 'PET-CT',
};

interface ArchiveOrder {
  id: string;
  order_number: string;
  modality: string;
  procedure_name?: string;
  updated_at: string;
  patient?: {
    first_name: string;
    last_name: string;
    patient_number: string;
  };
  procedure?: {
    name: string;
  };
  result?: {
    verified_at?: string;
    images?: string[];
    verified_by_profile?: {
      first_name: string;
      last_name: string;
    };
    radiologist_profile?: {
      first_name: string;
      last_name: string;
    };
  };
}

export default function RadiologyArchivePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalityFilter, setModalityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const pageSize = 15;

  const { data: ordersData, isLoading } = useVerifiedImagingOrders();
  const orders = (ordersData || []) as ArchiveOrder[];

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchQuery || 
      order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.patient?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.patient?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.patient?.patient_number?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesModality = modalityFilter === 'all' || order.modality === modalityFilter;
    
    return matchesSearch && matchesModality;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleClearFilters = () => {
    setSearchQuery('');
    setModalityFilter('all');
    setCurrentPage(1);
  };

  const handlePrint = (orderId: string) => {
    navigate(`/app/radiology/orders/${orderId}?print=true`);
  };

  const handleDownloadImages = (order: ArchiveOrder) => {
    const images = order.result?.images || [];
    if (images.length === 0) {
      return;
    }
    // Download each image
    images.forEach((url: string, index: number) => {
      const link = document.createElement('a');
      link.href = url;
      link.download = `${order.order_number}-image-${index + 1}.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Radiology Archive"
        description="All verified and finalized radiology reports"
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-primary" />
                Completed Reports
              </CardTitle>
              <CardDescription>
                {filteredOrders.length} verified report(s)
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patient or order..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 w-[200px]"
                />
              </div>
              <Select value={modalityFilter} onValueChange={(v) => {
                setModalityFilter(v);
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Modality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modalities</SelectItem>
                  {Object.entries(modalityLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(searchQuery || modalityFilter !== 'all') && (
                <Button variant="ghost" size="icon" onClick={handleClearFilters}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : paginatedOrders.length === 0 ? (
            <div className="text-center py-12">
              <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No verified reports found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Modality</TableHead>
                    <TableHead>Procedure</TableHead>
                    <TableHead>Report Date</TableHead>
                    <TableHead>Radiologist</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.order_number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {order.patient?.first_name} {order.patient?.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.patient?.patient_number}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {modalityLabels[order.modality] || order.modality}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {order.procedure?.name || order.procedure_name || '-'}
                      </TableCell>
                      <TableCell>
                        {order.result?.verified_at 
                          ? format(new Date(order.result.verified_at), 'MMM dd, yyyy')
                          : order.updated_at 
                            ? format(new Date(order.updated_at), 'MMM dd, yyyy')
                            : '-'}
                      </TableCell>
                      <TableCell>
                        {order.result?.verified_by_profile 
                          ? `Dr. ${order.result.verified_by_profile.first_name} ${order.result.verified_by_profile.last_name}`
                          : order.result?.radiologist_profile
                            ? `Dr. ${order.result.radiologist_profile.first_name} ${order.result.radiologist_profile.last_name}`
                            : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedOrderId(order.id)}
                            title="View Report"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePrint(order.id)}
                            title="Print Report"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          {(order.result?.images?.length ?? 0) > 0 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownloadImages(order)}
                              title="Download Images"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum = i + 1;
                        if (totalPages > 5) {
                          if (currentPage > 3) {
                            pageNum = currentPage - 2 + i;
                          }
                          if (currentPage > totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          }
                        }
                        if (pageNum > totalPages) return null;
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => setCurrentPage(pageNum)}
                              isActive={currentPage === pageNum}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ImagingDetailDialog
        orderId={selectedOrderId}
        open={!!selectedOrderId}
        onOpenChange={(open) => !open && setSelectedOrderId(null)}
      />
    </div>
  );
}
