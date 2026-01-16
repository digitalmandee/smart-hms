import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowRightLeft, Search, Bed, MapPin } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const BedTransfersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: transfers = [], isLoading } = useQuery({
    queryKey: ["bed-transfers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bed_transfers")
        .select(`
          *,
          admission:admissions(
            admission_number,
            patient:patients(first_name, last_name)
          ),
          from_ward:wards!bed_transfers_from_ward_id_fkey(name),
          to_ward:wards!bed_transfers_to_ward_id_fkey(name),
          from_bed:beds!bed_transfers_from_bed_id_fkey(bed_number),
          to_bed:beds!bed_transfers_to_bed_id_fkey(bed_number),
          ordered_by_profile:profiles!bed_transfers_ordered_by_fkey(full_name),
          transferred_by_profile:profiles!bed_transfers_transferred_by_fkey(full_name)
        `)
        .order("transferred_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
  });

  const filteredTransfers = transfers.filter((t: any) =>
    t.admission?.admission_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.admission?.patient?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.admission?.patient?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.transfer_reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bed Transfers"
        description="View history of patient bed transfers"
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              Transfer History
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transfers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading transfers...
            </div>
          ) : filteredTransfers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ArrowRightLeft className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No bed transfers found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date/Time</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Transferred By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransfers.map((transfer: any) => (
                  <TableRow key={transfer.id}>
                    <TableCell>
                      {transfer.transferred_at
                        ? format(new Date(transfer.transferred_at), "dd MMM yyyy HH:mm")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {transfer.admission?.patient?.first_name}{" "}
                          {transfer.admission?.patient?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {transfer.admission?.admission_number}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span>{transfer.from_ward?.name || "N/A"}</span>
                        <span className="text-muted-foreground">/</span>
                        <Bed className="h-3 w-3 text-muted-foreground" />
                        <span>{transfer.from_bed?.bed_number || "N/A"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-primary" />
                        <span className="font-medium">{transfer.to_ward?.name}</span>
                        <span className="text-muted-foreground">/</span>
                        <Bed className="h-3 w-3 text-primary" />
                        <span className="font-medium">{transfer.to_bed?.bed_number}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {transfer.transfer_reason || "Not specified"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {transfer.transferred_by_profile?.full_name || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BedTransfersPage;
