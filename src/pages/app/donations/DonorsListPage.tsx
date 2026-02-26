import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Search, Phone, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFinancialDonors } from "@/hooks/useDonations";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";
import { useState } from "react";

const DONOR_TYPES = ["all", "individual", "corporate", "foundation", "government", "anonymous"];

export default function DonorsListPage() {
  const navigate = useNavigate();
  const t = useTranslation();
  const { data: donors, isLoading } = useFinancialDonors();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = donors?.filter((d) => {
    const matchesSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.donor_number.toLowerCase().includes(search.toLowerCase()) ||
      d.phone?.includes(search) || d.email?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || d.donor_type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("donations.donorsList")}
        description={t("donations.donorsListDesc")}
        breadcrumbs={[{ label: t("donations.title"), href: "/app/donations" }, { label: t("donations.donors") }]}
      >
        <Button onClick={() => navigate("/app/donations/donors/new")}>
          <Plus className="h-4 w-4 mr-2" />
          {t("donations.addDonor")}
        </Button>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t("donations.searchDonors")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DONOR_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type === "all" ? t("common.all") : t(`donations.donorType.${type}` as any)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      ) : !filtered?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t("donations.noDonorsFound")}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((donor) => (
            <Card key={donor.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/app/donations/donors/${donor.id}`)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{donor.name}</h3>
                    {donor.name_ar && <p className="text-sm text-muted-foreground" dir="rtl">{donor.name_ar}</p>}
                    <p className="text-xs text-muted-foreground">{donor.donor_number}</p>
                  </div>
                  <Badge variant={donor.is_active ? "default" : "secondary"}>
                    {t(`donations.donorType.${donor.donor_type}` as any)}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {donor.phone && <div className="flex items-center gap-2"><Phone className="h-3 w-3" />{donor.phone}</div>}
                  {donor.email && <div className="flex items-center gap-2"><Mail className="h-3 w-3" />{donor.email}</div>}
                </div>
                <div className="mt-3 pt-3 border-t flex justify-between text-sm">
                  <span>{t("donations.totalDonated")}: <strong>PKR {Number(donor.total_donated).toLocaleString()}</strong></span>
                  <span>{donor.total_donations_count} {t("donations.donations")}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
