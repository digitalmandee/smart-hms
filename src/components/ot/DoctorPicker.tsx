import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useDoctorsByCategory, useConsultants, useAnesthesiologists, useSurgeons, type DoctorWithCategory } from "@/hooks/useDoctors";

export type DoctorCategory = 'surgeon' | 'consultant' | 'anesthesia' | 'radiologist' | 'pathologist';

interface DoctorPickerProps {
  category?: DoctorCategory;
  branchId?: string;
  value?: string;
  onChange: (doctorId: string, doctorName: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function DoctorPicker({
  category,
  branchId,
  value,
  onChange,
  placeholder = "Select doctor",
  disabled = false,
}: DoctorPickerProps) {
  // Use category-specific hooks for efficiency
  const { data: categoryDoctors, isLoading: categoryLoading } = useDoctorsByCategory(
    category || 'consultant',
    branchId
  );

  const doctors = categoryDoctors || [];
  const isLoading = categoryLoading;

  const handleChange = (doctorId: string) => {
    const selected = doctors.find(d => d.id === doctorId);
    const name = selected?.profile?.full_name || 'Unknown';
    onChange(doctorId, name);
  };

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <Select value={value} onValueChange={handleChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {doctors.length === 0 ? (
          <div className="px-3 py-2 text-sm text-muted-foreground">
            No doctors available
          </div>
        ) : (
          doctors.map((doc) => (
            <SelectItem key={doc.id} value={doc.id}>
              <div className="flex flex-col">
                <span>{doc.profile?.full_name}</span>
                {doc.specialization && (
                  <span className="text-xs text-muted-foreground">
                    {doc.specialization}
                  </span>
                )}
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
