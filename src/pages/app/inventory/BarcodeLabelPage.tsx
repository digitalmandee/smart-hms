import { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Printer, Search, Tag } from "lucide-react";
import { BarcodeLabelPrinter } from "@/components/inventory/BarcodeLabelPrinter";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function BarcodeLabelPage() {
  const { profile } = useAuth();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const { data: items, isLoading } = useQuery({
    queryKey: ["inventory-items-for-labels", profile?.organization_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("inventory_items")
        .select("id, item_code, name, barcode, sku, unit_of_measure")
        .eq("organization_id", profile!.organization_id!)
        .eq("is_active", true)
        .order("name");
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  const filteredItems = items?.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.item_code.toLowerCase().includes(search.toLowerCase()) ||
      (item.barcode && item.barcode.includes(search))
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (!filteredItems) return;
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map((i) => i.id)));
    }
  };

  const selectedItems = items?.filter((i) => selectedIds.has(i.id)) || [];

  const labels = selectedItems.map((item) => ({
    itemCode: item.item_code,
    itemName: item.name,
    barcode: item.barcode,
    unitOfMeasure: item.unit_of_measure,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Barcode Labels"
        description="Generate and print barcode labels for inventory items"
        actions={
          <Button onClick={() => handlePrint()} disabled={selectedIds.size === 0}>
            <Printer className="mr-2 h-4 w-4" />
            Print Labels ({selectedIds.size})
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Item Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Select Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, code, or barcode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={filteredItems?.length ? selectedIds.size === filteredItems.length : false}
                        onCheckedChange={toggleAll}
                      />
                    </TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Barcode</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems?.map((item) => (
                    <TableRow key={item.id} className="cursor-pointer" onClick={() => toggleSelect(item.id)}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(item.id)}
                          onCheckedChange={() => toggleSelect(item.id)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">{item.item_code}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {item.barcode || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!isLoading && filteredItems?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        No items found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Label Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Label Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedIds.size === 0 ? (
              <p className="text-center py-12 text-muted-foreground">
                Select items from the left to preview labels
              </p>
            ) : (
              <div ref={printRef}>
                <BarcodeLabelPrinter labels={labels} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
