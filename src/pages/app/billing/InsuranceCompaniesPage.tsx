import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Building2, Phone, Mail, Globe, Search } from "lucide-react";
import { 
  useAllInsuranceCompanies, 
  useCreateInsuranceCompany, 
  useUpdateInsuranceCompany,
  type InsuranceCompany
} from "@/hooks/useInsurance";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

export default function InsuranceCompaniesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [editCompany, setEditCompany] = useState<InsuranceCompany | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    website: "",
    notes: "",
    cchi_payer_code: "",
    nphies_payer_id: "",
  });
  
  const { data: companies, isLoading } = useAllInsuranceCompanies();
  const createCompany = useCreateInsuranceCompany();
  const updateCompany = useUpdateInsuranceCompany();

  const filteredCompanies = companies?.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const openCreateDialog = () => {
    setEditCompany(null);
    setFormData({
      name: "", code: "", contact_person: "", email: "", phone: "",
      address: "", city: "", website: "", notes: "",
      cchi_payer_code: "", nphies_payer_id: "",
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (company: InsuranceCompany) => {
    setEditCompany(company);
    setFormData({
      name: company.name,
      code: company.code || "",
      contact_person: company.contact_person || "",
      email: company.email || "",
      phone: company.phone || "",
      address: company.address || "",
      city: company.city || "",
      website: company.website || "",
      notes: company.notes || "",
      cchi_payer_code: company.cchi_payer_code || "",
      nphies_payer_id: company.nphies_payer_id || "",
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) return;

    if (editCompany) {
      await updateCompany.mutateAsync({ id: editCompany.id, ...formData });
    } else {
      await createCompany.mutateAsync(formData);
    }
    
    setIsDialogOpen(false);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await updateCompany.mutateAsync({ id: deleteId, is_active: false });
      setDeleteId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Insurance Companies"
        description="Manage insurance providers and their details"
        breadcrumbs={[
          { label: t('nav.billing' as any), href: "/app/billing" },
          { label: "Insurance Companies" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/app/billing/insurance/plans")}>
              View Plans
            </Button>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          </div>
        }
      />

      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companies?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Building2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {companies?.filter(c => c.is_active).length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {companies?.filter(c => !c.is_active).length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No insurance companies found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCompanies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{company.name}</div>
                            {company.code && (
                              <div className="text-sm text-muted-foreground">{company.code}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{company.contact_person || "-"}</TableCell>
                        <TableCell>{company.phone || "-"}</TableCell>
                        <TableCell>{company.city || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={company.is_active ? "default" : "secondary"}>
                            {company.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(company)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(company.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editCompany ? "Edit Insurance Company" : "New Insurance Company"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., State Life Insurance"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g., SLI"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input
                id="contact_person"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cchi_payer_code">CCHI Payer Code</Label>
              <Input
                id="cchi_payer_code"
                value={formData.cchi_payer_code}
                onChange={(e) => setFormData({ ...formData, cchi_payer_code: e.target.value })}
                placeholder="e.g., 301"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nphies_payer_id">NPHIES Payer ID</Label>
              <Input
                id="nphies_payer_id"
                value={formData.nphies_payer_id}
                onChange={(e) => setFormData({ ...formData, nphies_payer_id: e.target.value })}
                placeholder="NPHIES identifier"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!formData.name || createCompany.isPending || updateCompany.isPending}
            >
              {editCompany ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Company"
        description="Are you sure you want to delete this insurance company?"
        onConfirm={handleDelete}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
}
