import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Plus, FileText, Eye } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const JournalEntriesPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["journal-entries", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from("journal_entries")
        .select(`
          *,
          created_by_profile:profiles!journal_entries_created_by_fkey(full_name),
          posted_by_profile:profiles!journal_entries_posted_by_fkey(full_name)
        `)
        .eq("organization_id", profile.organization_id)
        .order("entry_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  const filteredEntries = entries.filter(
    (entry) =>
      entry.entry_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Journal Entries"
        description="Manage accounting journal entries"
        actions={
          <Button onClick={() => navigate("/app/accounts/journal-entries/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Entry
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">All Entries</CardTitle>
            <Input
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading entries...
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No journal entries found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entry #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      {entry.entry_number}
                    </TableCell>
                    <TableCell>
                      {format(new Date(entry.entry_date), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {entry.description || "-"}
                    </TableCell>
                    <TableCell>{entry.entry_type || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={entry.is_posted ? "default" : "secondary"}
                      >
                        {entry.is_posted ? "Posted" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{(entry.total_debit_amount || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate(`/app/accounts/journal-entries/${entry.id}`)
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
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

export default JournalEntriesPage;
