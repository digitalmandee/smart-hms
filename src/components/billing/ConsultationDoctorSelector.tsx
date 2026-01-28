import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/currency";
import { User, Stethoscope } from "lucide-react";

interface ConsultationDoctorSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceName: string;
  serviceDefaultPrice: number;
  onConfirm: (doctorId: string, doctorName: string, consultationFee: number) => void;
}

interface DoctorWithFee {
  id: string;
  name: string;
  specialization: string | null;
  consultationFee: number;
}

export function ConsultationDoctorSelector({
  open,
  onOpenChange,
  serviceName,
  serviceDefaultPrice,
  onConfirm,
}: ConsultationDoctorSelectorProps) {
  const { profile } = useAuth();
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");

  // Fetch doctors with their consultation fees
  const { data: doctors, isLoading } = useQuery({
    queryKey: ["doctors-with-fees", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("doctors")
        .select(`
          id,
          specialization,
          consultation_fee,
          employee:employees!doctors_employee_id_fkey(first_name, last_name)
        `)
        .eq("organization_id", profile!.organization_id!)
        .eq("is_active", true);

      if (error) throw error;

      return (data || []).map((doc: any): DoctorWithFee => ({
        id: doc.id,
        name: doc.employee 
          ? `${doc.employee.first_name || ""} ${doc.employee.last_name || ""}`.trim()
          : "Unknown Doctor",
        specialization: doc.specialization,
        consultationFee: Number(doc.consultation_fee) || serviceDefaultPrice,
      }));
    },
    enabled: open && !!profile?.organization_id,
  });

  const selectedDoctor = doctors?.find(d => d.id === selectedDoctorId);

  const handleConfirm = () => {
    if (!selectedDoctor) return;
    onConfirm(selectedDoctor.id, selectedDoctor.name, selectedDoctor.consultationFee);
    setSelectedDoctorId("");
  };

  const handleCancel = () => {
    setSelectedDoctorId("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            Select Doctor for Consultation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Service</p>
            <p className="font-medium">{serviceName}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Doctor</label>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a doctor..." />
                </SelectTrigger>
                <SelectContent>
                  {doctors?.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      No doctors available
                    </div>
                  ) : (
                    doctors?.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id}>
                        <div className="flex items-center justify-between w-full gap-4">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{doc.name}</span>
                            {doc.specialization && (
                              <Badge variant="outline" className="text-xs">
                                {doc.specialization}
                              </Badge>
                            )}
                          </div>
                          <span className="text-primary font-medium">
                            {formatCurrency(doc.consultationFee)}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {selectedDoctor && (
            <div className="p-4 border rounded-lg bg-primary/5 border-primary/20">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{selectedDoctor.name}</p>
                  {selectedDoctor.specialization && (
                    <p className="text-sm text-muted-foreground">{selectedDoctor.specialization}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Consultation Fee</p>
                  <p className="text-xl font-bold text-primary">
                    {formatCurrency(selectedDoctor.consultationFee)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedDoctorId}>
            Add to Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
