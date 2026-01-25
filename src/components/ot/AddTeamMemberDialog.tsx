import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UserPlus, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { otLogger } from "@/lib/logger";
import type { SurgeryTeamRole } from "@/hooks/useOT";

interface AddTeamMemberDialogProps {
  surgeryId: string;
  disabled?: boolean;
}

interface StaffOption {
  id: string;
  name: string;
  role?: string;
  type: 'doctor' | 'nurse' | 'employee';
}

const NURSING_ROLES: { value: SurgeryTeamRole; label: string }[] = [
  { value: 'assistant_surgeon', label: 'Assistant Surgeon' },
  { value: 'scrub_nurse', label: 'Scrub Nurse' },
  { value: 'circulating_nurse', label: 'Circulating Nurse' },
  { value: 'technician', label: 'OT Technician' },
];

export function AddTeamMemberDialog({ surgeryId, disabled }: AddTeamMemberDialogProps) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [staffOpen, setStaffOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<SurgeryTeamRole | ''>('');
  const [selectedStaff, setSelectedStaff] = useState<StaffOption | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch available staff based on role
  const { data: staffOptions = [], isLoading: loadingStaff } = useQuery({
    queryKey: ['available-staff', profile?.organization_id, selectedRole, searchQuery],
    queryFn: async () => {
      if (!profile?.organization_id || !selectedRole) return [];

      const options: StaffOption[] = [];

      // For assistant surgeon, fetch doctors
      if (selectedRole === 'assistant_surgeon') {
        // Use explicit any to avoid TS2589 deep type instantiation
        const sb = supabase as any;
        const { data: doctors } = await sb
          .from('doctors')
          .select('id, specialization, profile_id')
          .eq('organization_id', profile.organization_id)
          .eq('is_active', true)
          .limit(50);

        // Fetch profiles separately to avoid deep type instantiation
        for (const d of (doctors || []) as any[]) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', d.profile_id)
            .maybeSingle();
          
          const name = prof?.full_name || 'Unknown';
          if (!searchQuery || name.toLowerCase().includes(searchQuery.toLowerCase())) {
            options.push({
              id: d.id,
              name,
              role: d.specialization || undefined,
              type: 'doctor',
            });
          }
        }
      }

      // For nursing roles, fetch nurses
      if (['scrub_nurse', 'circulating_nurse'].includes(selectedRole)) {
        // Use explicit any to avoid TS2589 deep type instantiation
        const sb = supabase as any;
        const { data: nurses } = await sb
          .from('nurses')
          .select('id, specialization, profile_id')
          .eq('organization_id', profile.organization_id)
          .eq('is_available', true)
          .limit(50);

        for (const n of (nurses || []) as any[]) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', n.profile_id)
            .maybeSingle();
          
          const name = prof?.full_name || 'Unknown';
          if (!searchQuery || name.toLowerCase().includes(searchQuery.toLowerCase())) {
            options.push({
              id: n.id,
              name,
              role: n.specialization || undefined,
              type: 'nurse',
            });
          }
        }
      }

      // For technician, fetch employees
      if (selectedRole === 'technician') {
        // Use explicit any to avoid TS2589 deep type instantiation
        const sb = supabase as any;
        const { data: employees } = await sb
          .from('employees')
          .select('id, first_name, last_name, designation_id')
          .eq('organization_id', profile.organization_id)
          .eq('employment_status', 'active')
          .limit(50);

        (employees as any[])?.forEach((e) => {
          const name = `${e.first_name || ''} ${e.last_name || ''}`.trim() || 'Unknown';
          if (!searchQuery || name.toLowerCase().includes(searchQuery.toLowerCase())) {
            options.push({
              id: e.id,
              name,
              role: undefined,
              type: 'employee',
            });
          }
        });
      }

      return options;
    },
    enabled: !!profile?.organization_id && !!selectedRole,
  });

  // Add team member mutation
  const addMember = useMutation({
    mutationFn: async () => {
      if (!selectedRole || !selectedStaff) throw new Error('Please select role and staff');

      otLogger.info('AddTeamMemberDialog: Adding team member', {
        surgeryId,
        role: selectedRole,
        staffId: selectedStaff.id,
        staffType: selectedStaff.type,
      });

      const insertData: any = {
        surgery_id: surgeryId,
        role: selectedRole,
        confirmation_status: 'pending',
      };

      // Set the correct foreign key based on staff type
      if (selectedStaff.type === 'doctor') {
        insertData.doctor_id = selectedStaff.id;
      } else if (selectedStaff.type === 'nurse') {
        insertData.staff_id = selectedStaff.id; // nurses use staff_id
      } else {
        insertData.staff_id = selectedStaff.id; // employees also use staff_id
      }

      const { error } = await supabase
        .from('surgery_team_members')
        .insert(insertData);

      if (error) throw error;
    },
    onSuccess: () => {
      otLogger.info('AddTeamMemberDialog: Team member added successfully', { surgeryId });
      toast.success('Team member added');
      queryClient.invalidateQueries({ queryKey: ['surgery', surgeryId] });
      queryClient.invalidateQueries({ queryKey: ['surgeries'] });
      setOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      otLogger.error('AddTeamMemberDialog: Failed to add team member', error, { surgeryId });
      toast.error(error.message || 'Failed to add team member');
    },
  });

  const resetForm = () => {
    setSelectedRole('');
    setSelectedStaff(null);
    setSearchQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Role Selection */}
          <div className="space-y-2">
            <Label>Role *</Label>
            <Select
              value={selectedRole}
              onValueChange={(v) => {
                setSelectedRole(v as SurgeryTeamRole);
                setSelectedStaff(null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role..." />
              </SelectTrigger>
              <SelectContent>
                {NURSING_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Staff Selection */}
          {selectedRole && (
            <div className="space-y-2">
              <Label>Staff Member *</Label>
              <Popover open={staffOpen} onOpenChange={setStaffOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={staffOpen}
                    className="w-full justify-between"
                  >
                    {selectedStaff ? selectedStaff.name : "Search staff..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Search by name..." 
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandList>
                      {loadingStaff ? (
                        <div className="p-4 text-center">
                          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        </div>
                      ) : staffOptions.length === 0 ? (
                        <CommandEmpty>No staff found</CommandEmpty>
                      ) : (
                        <CommandGroup>
                          {staffOptions.map((staff) => (
                            <CommandItem
                              key={staff.id}
                              value={staff.name}
                              onSelect={() => {
                                setSelectedStaff(staff);
                                setStaffOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedStaff?.id === staff.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div>
                                <div className="font-medium">{staff.name}</div>
                                {staff.role && (
                                  <div className="text-xs text-muted-foreground">{staff.role}</div>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={() => addMember.mutate()}
            disabled={!selectedRole || !selectedStaff || addMember.isPending}
            className="w-full"
          >
            {addMember.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Add to Team
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
