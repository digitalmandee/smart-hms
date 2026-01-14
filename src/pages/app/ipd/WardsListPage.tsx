import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { useWards, WARD_TYPES } from "@/hooks/useIPD";
import { WardCard } from "@/components/ipd/WardCard";

export default function WardsListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data: wards, isLoading } = useWards();

  const filteredWards = (wards || []).filter((ward: any) => {
    const matchesSearch =
      ward.name.toLowerCase().includes(search.toLowerCase()) ||
      ward.code.toLowerCase().includes(search.toLowerCase());
    const matchesType =
      typeFilter === "all" || ward.ward_type === typeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ward Management"
        description="Manage hospital wards and their configurations"
        actions={
          <Button onClick={() => navigate("/app/ipd/wards/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Ward
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search wards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {WARD_TYPES.map((type) => (
              <SelectItem key={type} value={type.toLowerCase()}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Wards Grid */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading wards...</div>
      ) : filteredWards.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredWards.map((ward: any) => (
            <WardCard
              key={ward.id}
              ward={ward}
              onView={(id) => navigate(`/app/ipd/wards/${id}`)}
              onEdit={(id) => navigate(`/app/ipd/wards/${id}/edit`)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          {search || typeFilter !== "all"
            ? "No wards match your filters"
            : "No wards configured yet"}
        </div>
      )}
    </div>
  );
}
