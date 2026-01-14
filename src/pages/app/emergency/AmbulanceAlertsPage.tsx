import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AmbulanceAlertCard } from "@/components/emergency/AmbulanceAlertCard";
import { useAmbulanceAlerts, useCreateAmbulanceAlert } from "@/hooks/useEmergency";
import { Ambulance, Plus, Loader2, Clock, CheckCircle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AmbulanceAlertsPage = () => {
  const navigate = useNavigate();
  const { data: incomingAlerts } = useAmbulanceAlerts("incoming");
  const { data: arrivedAlerts } = useAmbulanceAlerts("arrived");
  const createMutation = useCreateAmbulanceAlert();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    ambulance_id: "",
    eta_minutes: "",
    patient_count: "1",
    condition_summary: "",
    caller_name: "",
    caller_phone: "",
    priority: "2",
    prehospital_care: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({
      ambulance_id: formData.ambulance_id || null,
      eta_minutes: formData.eta_minutes ? parseInt(formData.eta_minutes) : null,
      patient_count: parseInt(formData.patient_count),
      condition_summary: formData.condition_summary || null,
      caller_name: formData.caller_name || null,
      caller_phone: formData.caller_phone || null,
      priority: parseInt(formData.priority),
      prehospital_care: formData.prehospital_care || null,
    });
    setFormData({
      ambulance_id: "",
      eta_minutes: "",
      patient_count: "1",
      condition_summary: "",
      caller_name: "",
      caller_phone: "",
      priority: "2",
      prehospital_care: "",
    });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ambulance Alerts"
        description="Manage incoming ambulance notifications"
        breadcrumbs={[
          { label: "Emergency", href: "/app/emergency" },
          { label: "Ambulance Alerts" },
        ]}
        actions={
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                New Alert
              </>
            )}
          </Button>
        }
      />

      {/* New Alert Form */}
      {showForm && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-lg">Create Ambulance Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Vehicle Number</Label>
                  <Input
                    value={formData.ambulance_id}
                    onChange={(e) => setFormData({ ...formData, ambulance_id: e.target.value })}
                    placeholder="e.g., AMB-1234"
                  />
                </div>
                <div>
                  <Label>ETA (minutes) *</Label>
                  <Input
                    type="number"
                    value={formData.eta_minutes}
                    onChange={(e) => setFormData({ ...formData, eta_minutes: e.target.value })}
                    placeholder="e.g., 15"
                    required
                  />
                </div>
                <div>
                  <Label>Priority *</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(v) => setFormData({ ...formData, priority: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Critical - Level 1</SelectItem>
                      <SelectItem value="2">Serious - Level 2</SelectItem>
                      <SelectItem value="3">Stable - Level 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Patient Condition *</Label>
                <Textarea
                  value={formData.condition_summary}
                  onChange={(e) => setFormData({ ...formData, condition_summary: e.target.value })}
                  placeholder="Brief description of patient condition..."
                  rows={2}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Number of Patients</Label>
                  <Input
                    type="number"
                    value={formData.patient_count}
                    onChange={(e) => setFormData({ ...formData, patient_count: e.target.value })}
                    min="1"
                  />
                </div>
                <div>
                  <Label>Caller Name</Label>
                  <Input
                    value={formData.caller_name}
                    onChange={(e) => setFormData({ ...formData, caller_name: e.target.value })}
                    placeholder="EMT name"
                  />
                </div>
                <div>
                  <Label>Caller Phone</Label>
                  <Input
                    value={formData.caller_phone}
                    onChange={(e) => setFormData({ ...formData, caller_phone: e.target.value })}
                    placeholder="Contact number"
                  />
                </div>
              </div>

              <div>
                <Label>Prehospital Care Given</Label>
                <Textarea
                  value={formData.prehospital_care}
                  onChange={(e) => setFormData({ ...formData, prehospital_care: e.target.value })}
                  placeholder="Treatment provided enroute..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Alert
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Alerts Tabs */}
      <Tabs defaultValue="incoming">
        <TabsList>
          <TabsTrigger value="incoming" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Incoming ({incomingAlerts?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="arrived" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Arrived Today
          </TabsTrigger>
        </TabsList>

        <TabsContent value="incoming" className="mt-4">
          {!incomingAlerts || incomingAlerts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Ambulance className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                <p className="text-lg font-medium text-muted-foreground">No Incoming Ambulances</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create an alert when you receive an ambulance notification
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {incomingAlerts.map((alert) => (
                <AmbulanceAlertCard
                  key={alert.id}
                  alert={alert}
                  onArrived={() => navigate("/app/emergency/register")}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="arrived" className="mt-4">
          {!arrivedAlerts || arrivedAlerts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No ambulance arrivals recorded today
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {arrivedAlerts.map((alert) => (
                <AmbulanceAlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AmbulanceAlertsPage;
