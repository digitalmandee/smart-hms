import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNurses, useNurseStats, NURSE_SPECIALIZATIONS } from "@/hooks/useNurses";
import { NurseEmployeeCard } from "@/components/hr/NurseEmployeeCard";
import { StatsCard } from "@/components/StatsCard";
import { 
  Search, 
  Plus, 
  Heart, 
  Users, 
  UserCheck, 
  MapPin,
  Filter 
} from "lucide-react";

export default function NursesListPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWard, setSelectedWard] = useState<string>("");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("");

  const { data: nurses, isLoading } = useNurses({
    wardId: selectedWard || undefined,
    available: availabilityFilter === "available" ? true : availabilityFilter === "unavailable" ? false : undefined,
  });
  const { data: stats } = useNurseStats();

  // Filter by search
  const filteredNurses = nurses?.filter((nurse) => {
    if (!searchQuery) return true;
    const fullName = `${nurse.employee?.first_name || ''} ${nurse.employee?.last_name || ''}`.toLowerCase();
    const empNumber = nurse.employee?.employee_number?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || empNumber.includes(query);
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nursing Staff"
        description="Manage nurses and nursing assignments"
        breadcrumbs={[
          { label: "HR", href: "/app/hr" },
          { label: "Nursing Staff" },
        ]}
        actions={
          <Button onClick={() => navigate("/app/hr/employees/new?category=nurse")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Nurse
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Nurses"
          value={stats?.total || 0}
          icon={Users}
          description="Registered nursing staff"
        />
        <StatsCard
          title="Available"
          value={stats?.available || 0}
          icon={UserCheck}
          description="Available for duty"
          trend={stats?.total ? { value: Math.round((stats.available / stats.total) * 100), isPositive: true } : undefined}
        />
        <StatsCard
          title="Charge Nurses"
          value={stats?.chargeNurses || 0}
          icon={Heart}
          description="Ward supervisors"
        />
        <StatsCard
          title="Ward Assigned"
          value={stats?.assignedToWards || 0}
          icon={MapPin}
          description="Assigned to wards"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or employee number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Specialization quick filters */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="cursor-pointer hover:bg-muted">
          <Filter className="h-3 w-3 mr-1" />
          All Specializations
        </Badge>
        {NURSE_SPECIALIZATIONS.slice(0, 5).map((spec) => (
          <Badge 
            key={spec.value} 
            variant="secondary" 
            className="cursor-pointer hover:bg-secondary/80"
          >
            {spec.label}
          </Badge>
        ))}
      </div>

      {/* Nurses Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : filteredNurses?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Nurses Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? "No nurses match your search criteria"
                : "Start by adding nursing staff to your organization"
              }
            </p>
            <Button onClick={() => navigate("/app/hr/employees/new?category=nurse")}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Nurse
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNurses?.map((nurse) => (
            <NurseEmployeeCard
              key={nurse.id}
              nurse={nurse}
              onClick={() => navigate(`/app/hr/employees/${nurse.employee_id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
