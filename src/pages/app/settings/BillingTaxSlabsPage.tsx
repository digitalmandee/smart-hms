import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, Percent, Star } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface BillingTaxSlab {
  id: string;
  organization_id: string;
  name: string;
  tax_rate: number;
  applies_to: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
}

export default function BillingTaxSlabsPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSlab, setEditingSlab] = useState<BillingTaxSlab | null>(null);
  const [name, setName] = useState("");
  const [taxRate, setTaxRate] = useState("0");
  const [appliesTo, setAppliesTo] = useState("all");
  const [isDefault, setIsDefault] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const { data: slabs, isLoading } = useQuery({
    queryKey: ["billing-tax-slabs", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from("billing_tax_slabs")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as BillingTaxSlab[];
    },
    enabled: !!profile?.organization_id,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.organization_id) throw new Error("No organization");

      // If setting as default, unset others first
      if (isDefault) {
        await supabase
          .from("billing_tax_slabs")
          .update({ is_default: false } as any)
          .eq("organization_id", profile.organization_id);
      }

      if (editingSlab) {
        const { error } = await supabase
          .from("billing_tax_slabs")
          .update({
            name,
            tax_rate: parseFloat(taxRate),
            applies_to: appliesTo,
            is_default: isDefault,
            is_active: isActive,
          } as any)
          .eq("id", editingSlab.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("billing_tax_slabs")
          .insert({
            organization_id: profile.organization_id,
            name,
            tax_rate: parseFloat(taxRate),
            applies_to: appliesTo,
            is_default: isDefault,
            is_active: isActive,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing-tax-slabs"] });
      toast({ title: t("billing_tax.saved"), description: t("billing_tax.saved_desc") });
      closeDialog();
    },
    onError: () => {
      toast({ title: t("common.error"), description: t("billing_tax.save_error"), variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("billing_tax_slabs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing-tax-slabs"] });
      toast({ title: t("billing_tax.deleted") });
    },
  });

  const openCreate = () => {
    setEditingSlab(null);
    setName("");
    setTaxRate("0");
    setAppliesTo("all");
    setIsDefault(false);
    setIsActive(true);
    setDialogOpen(true);
  };

  const openEdit = (slab: BillingTaxSlab) => {
    setEditingSlab(slab);
    setName(slab.name);
    setTaxRate(String(slab.tax_rate));
    setAppliesTo(slab.applies_to);
    setIsDefault(slab.is_default);
    setIsActive(slab.is_active);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingSlab(null);
  };

  const appliesLabel = (val: string) => {
    const map: Record<string, string> = {
      all: t("billing_tax.all_categories"),
      services: t("billing_tax.services"),
      medicines: t("billing_tax.medicines"),
      lab: t("billing_tax.lab"),
      custom: t("billing_tax.custom"),
    };
    return map[val] || val;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{t("billing_tax.title")}</h1>
          <p className="text-muted-foreground">{t("billing_tax.description")}</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t("billing_tax.add_slab")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            {t("billing_tax.tax_categories")}
          </CardTitle>
          <CardDescription>{t("billing_tax.tax_categories_desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : !slabs || slabs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("billing_tax.no_slabs")}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.name")}</TableHead>
                  <TableHead className="text-right">{t("billing_tax.rate")}</TableHead>
                  <TableHead>{t("billing_tax.applies_to")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead className="w-20">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slabs.map((slab) => (
                  <TableRow key={slab.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {slab.name}
                        {slab.is_default && (
                          <Badge variant="secondary" className="gap-1">
                            <Star className="h-3 w-3" />
                            {t("billing_tax.default")}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{slab.tax_rate}%</TableCell>
                    <TableCell>{appliesLabel(slab.applies_to)}</TableCell>
                    <TableCell>
                      <Badge variant={slab.is_active ? "default" : "secondary"}>
                        {slab.is_active ? t("billing_tax.active") : t("billing_tax.inactive")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(slab)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(slab.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSlab ? t("billing_tax.edit_slab") : t("billing_tax.add_slab")}
            </DialogTitle>
            <DialogDescription>{t("billing_tax.slab_form_desc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("common.name")}</Label>
              <Input
                placeholder="e.g., Standard Rate, Zero Rated"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("billing_tax.rate")} (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("billing_tax.applies_to")}</Label>
              <Select value={appliesTo} onValueChange={setAppliesTo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("billing_tax.all_categories")}</SelectItem>
                  <SelectItem value="services">{t("billing_tax.services")}</SelectItem>
                  <SelectItem value="medicines">{t("billing_tax.medicines")}</SelectItem>
                  <SelectItem value="lab">{t("billing_tax.lab")}</SelectItem>
                  <SelectItem value="custom">{t("billing_tax.custom")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>{t("billing_tax.set_default")}</Label>
              <Switch checked={isDefault} onCheckedChange={setIsDefault} />
            </div>
            <div className="flex items-center justify-between">
              <Label>{t("billing_tax.active")}</Label>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>{t("common.cancel")}</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={!name || saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
