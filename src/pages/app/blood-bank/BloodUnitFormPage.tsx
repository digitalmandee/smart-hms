import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import {
  useCreateBloodUnit,
  type BloodGroupType,
  type BloodComponentType,
} from "@/hooks/useBloodBank";

const bloodGroups: BloodGroupType[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const componentTypes: { value: BloodComponentType; label: string }[] = [
  { value: "whole_blood", label: "Whole Blood" },
  { value: "packed_rbc", label: "Packed RBC" },
  { value: "fresh_frozen_plasma", label: "Fresh Frozen Plasma" },
  { value: "platelet_concentrate", label: "Platelet Concentrate" },
  { value: "cryoprecipitate", label: "Cryoprecipitate" },
  { value: "granulocytes", label: "Granulocytes" },
];

export default function BloodUnitFormPage() {
  const navigate = useNavigate();
  const createUnit = useCreateBloodUnit();

  const [form, setForm] = useState({
    blood_group: "" as BloodGroupType | "",
    component_type: "" as BloodComponentType | "",
    volume_ml: 450,
    collection_date: new Date().toISOString().split("T")[0],
    expiry_date: "",
    bag_number: "",
    storage_location: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.blood_group || !form.component_type || !form.expiry_date) return;

    await createUnit.mutateAsync({
      blood_group: form.blood_group as BloodGroupType,
      component_type: form.component_type as BloodComponentType,
      volume_ml: form.volume_ml,
      collection_date: form.collection_date,
      expiry_date: form.expiry_date,
      bag_number: form.bag_number || null,
      storage_location: form.storage_location || null,
      status: "quarantine",
    });

    navigate("/app/blood-bank/inventory");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Blood Unit"
        description="Manually add a blood unit to inventory"
        actions={
          <Button variant="outline" onClick={() => navigate("/app/blood-bank/inventory")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        }
      />

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Blood Unit Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Blood Group *</Label>
                <Select value={form.blood_group} onValueChange={(v) => setForm({ ...form, blood_group: v as BloodGroupType })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodGroups.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Component Type *</Label>
                <Select value={form.component_type} onValueChange={(v) => setForm({ ...form, component_type: v as BloodComponentType })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select component" />
                  </SelectTrigger>
                  <SelectContent>
                    {componentTypes.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Volume (ml) *</Label>
                <Input
                  type="number"
                  value={form.volume_ml}
                  onChange={(e) => setForm({ ...form, volume_ml: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label>Bag Number</Label>
                <Input
                  value={form.bag_number}
                  onChange={(e) => setForm({ ...form, bag_number: e.target.value })}
                  placeholder="Optional bag number"
                />
              </div>

              <div className="space-y-2">
                <Label>Collection Date *</Label>
                <Input
                  type="date"
                  value={form.collection_date}
                  onChange={(e) => setForm({ ...form, collection_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Expiry Date *</Label>
                <Input
                  type="date"
                  value={form.expiry_date}
                  onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Storage Location</Label>
                <Input
                  value={form.storage_location}
                  onChange={(e) => setForm({ ...form, storage_location: e.target.value })}
                  placeholder="e.g., Refrigerator A, Shelf 2"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate("/app/blood-bank/inventory")}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!form.blood_group || !form.component_type || !form.expiry_date || createUnit.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                Add Unit
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
