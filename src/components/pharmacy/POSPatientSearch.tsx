import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  User, 
  Phone, 
  FileText, 
  Plus, 
  X, 
  Pill,
  Calendar,
  Stethoscope,
  BedDouble
} from "lucide-react";
import { 
  useSearchPatientForPOS, 
  usePatientPrescriptionsForPOS,
  usePatientAdmissionStatus,
  PatientForPOS,
  PrescriptionForPOS,
  PatientAdmissionStatus
} from "@/hooks/usePatientPrescriptionsForPOS";
import { CartItem } from "@/hooks/usePOS";
import { useInventory } from "@/hooks/usePharmacy";
import { format, differenceInYears } from "date-fns";
import { cn } from "@/lib/utils";

interface POSPatientSearchProps {
  onAddToCart: (item: CartItem) => void;
  onPatientSelect: (patient: PatientForPOS | null) => void;
  selectedPatient: PatientForPOS | null;
  onAdmissionStatusChange?: (admission: PatientAdmissionStatus | null) => void;
}

export function POSPatientSearch({ 
  onAddToCart, 
  onPatientSelect, 
  selectedPatient,
  onAdmissionStatusChange 
}: POSPatientSearchProps) {
  const [search, setSearch] = useState("");
  const [showResults, setShowResults] = useState(false);
  const lastAdmissionIdRef = useRef<string | null>(null);
  
  const { data: patients, isLoading: searchLoading } = useSearchPatientForPOS(search);
  const { data: prescriptions, isLoading: rxLoading } = usePatientPrescriptionsForPOS(selectedPatient?.id);
  const { data: admissionStatus } = usePatientAdmissionStatus(selectedPatient?.id);
  const { data: inventory } = useInventory();

  // Notify parent when admission status changes (using proper useEffect)
  useEffect(() => {
    const currentId = admissionStatus?.id || null;
    if (currentId !== lastAdmissionIdRef.current) {
      lastAdmissionIdRef.current = currentId;
      onAdmissionStatusChange?.(admissionStatus || null);
    }
  }, [admissionStatus, onAdmissionStatusChange]);

  const handlePatientClick = (patient: PatientForPOS) => {
    onPatientSelect(patient);
    setSearch("");
    setShowResults(false);
  };

  const handleClearPatient = () => {
    onPatientSelect(null);
    setSearch("");
  };

  const handleAddPrescriptionItem = (item: { 
    id: string;
    prescription_id?: string;
    medicine_id: string | null; 
    medicine_name: string; 
    quantity: number;
  }) => {
    if (!item.medicine_id) {
      // Try to find by name in inventory
      const invItem = inventory?.find(i => 
        i.medicine?.name?.toLowerCase() === item.medicine_name.toLowerCase() && i.quantity > 0
      );
      
      if (invItem) {
        const cartItem: CartItem = {
          id: crypto.randomUUID(),
          inventory_id: invItem.id,
          medicine_id: invItem.medicine_id,
          medicine_name: invItem.medicine?.name || item.medicine_name,
          batch_number: invItem.batch_number,
          quantity: Math.min(item.quantity, invItem.quantity),
          unit_price: Number(invItem.unit_price) || 0,
          selling_price: Number(invItem.selling_price) || Number(invItem.unit_price) || 0,
          available_quantity: invItem.quantity,
          discount_percent: 0,
          tax_percent: 0,
          prescription_id: item.prescription_id,
          prescription_item_id: item.id,
        };
        onAddToCart(cartItem);
      }
      return;
    }

    // Find in inventory by medicine_id
    const invItem = inventory?.find(i => i.medicine_id === item.medicine_id && i.quantity > 0);
    if (invItem) {
      const cartItem: CartItem = {
        id: crypto.randomUUID(),
        inventory_id: invItem.id,
        medicine_id: invItem.medicine_id,
        medicine_name: invItem.medicine?.name || item.medicine_name,
        batch_number: invItem.batch_number,
        quantity: Math.min(item.quantity, invItem.quantity),
        unit_price: Number(invItem.unit_price) || 0,
        selling_price: Number(invItem.selling_price) || Number(invItem.unit_price) || 0,
        available_quantity: invItem.quantity,
        discount_percent: 0,
        tax_percent: 0,
        prescription_id: item.prescription_id,
        prescription_item_id: item.id,
      };
      onAddToCart(cartItem);
    }
  };

  const handleAddAllFromPrescription = (rx: PrescriptionForPOS) => {
    rx.items
      .filter(item => !item.is_dispensed)
      .forEach(item => {
        handleAddPrescriptionItem({
          id: item.id,
          prescription_id: rx.id,
          medicine_id: item.medicine_id,
          medicine_name: item.medicine_name,
          quantity: item.quantity,
        });
      });
  };

  const getAge = (dob: string | null) => {
    if (!dob) return null;
    return differenceInYears(new Date(), new Date(dob));
  };

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <User className="h-4 w-4" />
          Patient Lookup (Optional)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {/* Selected Patient Display */}
        {selectedPatient ? (
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">
                  {selectedPatient.first_name} {selectedPatient.last_name}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {selectedPatient.patient_number}
                  </Badge>
                  {selectedPatient.token_number && (
                    <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-700">
                      Today Token #{selectedPatient.token_number}
                    </Badge>
                  )}
                  {admissionStatus && (
                    <Badge variant="default" className="text-xs bg-blue-600 hover:bg-blue-700">
                      <BedDouble className="h-3 w-3 mr-1" />
                      Admitted - {admissionStatus.ward?.name || "Ward"} 
                      {admissionStatus.bed?.bed_number && ` / Bed ${admissionStatus.bed.bed_number}`}
                    </Badge>
                  )}
                  {selectedPatient.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {selectedPatient.phone}
                    </span>
                  )}
                  {selectedPatient.date_of_birth && (
                    <span>{getAge(selectedPatient.date_of_birth)}Y</span>
                  )}
                  {selectedPatient.gender && (
                    <span className="capitalize">{selectedPatient.gender}</span>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleClearPatient}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Prescriptions */}
            <div className="mt-3">
              {rxLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : prescriptions && prescriptions.length > 0 ? (
                <ScrollArea className="max-h-48">
                  <div className="space-y-2">
                    {prescriptions.map((rx) => (
                      <div
                        key={rx.id}
                        className="p-2 bg-background rounded border"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <FileText className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs font-medium">{rx.prescription_number}</span>
                            <Badge variant={rx.status === "created" ? "default" : "secondary"} className="text-xs">
                              {rx.status}
                            </Badge>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => handleAddAllFromPrescription(rx)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add All
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(rx.created_at), "dd MMM yyyy")}
                          {rx.doctor?.profile?.full_name && (
                            <>
                              <span>•</span>
                              <Stethoscope className="h-3 w-3" />
                              {rx.doctor.profile.full_name}
                            </>
                          )}
                        </div>
                        <div className="space-y-1">
                          {rx.items.slice(0, 3).map((item) => (
                            <div
                              key={item.id}
                              className={cn(
                                "flex items-center justify-between text-xs p-1 rounded",
                                item.is_dispensed ? "opacity-50 line-through" : "hover:bg-muted cursor-pointer"
                              )}
                              onClick={() => !item.is_dispensed && handleAddPrescriptionItem({
                                id: item.id,
                                prescription_id: rx.id,
                                medicine_id: item.medicine_id,
                                medicine_name: item.medicine_name,
                                quantity: item.quantity,
                              })}
                            >
                              <span className="flex items-center gap-1">
                                <Pill className="h-3 w-3 text-primary" />
                                {item.medicine_name}
                                {item.dosage && <span className="text-muted-foreground">({item.dosage})</span>}
                              </span>
                              {!item.is_dispensed && (
                                <Plus className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                          ))}
                          {rx.items.length > 3 && (
                            <p className="text-xs text-muted-foreground text-center">
                              +{rx.items.length - 3} more items
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No pending prescriptions
                </p>
              )}
            </div>
          </div>
        ) : (
          /* Search Input */
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Token#, MR#, phone, or name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
              className="pl-9 h-9"
            />

            {/* Search Results */}
            {showResults && search.length >= 1 && (
              <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg">
                <CardContent className="p-2">
                  {searchLoading ? (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      Searching...
                    </div>
                  ) : patients && patients.length > 0 ? (
                    <div className="space-y-1">
                      {patients.map((patient: any) => (
                        <div
                          key={patient.id}
                          className="flex items-center justify-between p-2 rounded hover:bg-muted cursor-pointer"
                          onClick={() => handlePatientClick(patient)}
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {patient.first_name} {patient.last_name}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {patient.token_number && (
                                <Badge variant="default" className="text-xs">
                                  Token #{patient.token_number}
                                </Badge>
                              )}
                              <span>{patient.patient_number}</span>
                              {patient.phone && <span>• {patient.phone}</span>}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Select
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      No patients found
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
