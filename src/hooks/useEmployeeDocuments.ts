import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { addDays, isAfter, isBefore, parseISO } from 'date-fns';

export interface EmployeeDocument {
  id: string;
  employee_id: string;
  document_name: string;
  document_type: string;
  document_category: string | null;
  document_number: string | null;
  file_url: string;
  issue_date: string | null;
  expiry_date: string | null;
  notes: string | null;
  verified_at: string | null;
  verified_by: string | null;
  created_at: string;
}

export interface EmployeeLicense {
  id: string;
  employee_id: string;
  license_type: string;
  license_number: string;
  issuing_authority: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  document_url: string | null;
  is_verified: boolean;
  verified_at: string | null;
  verified_by: string | null;
  created_at: string;
}

// Fetch employee documents
export function useEmployeeDocuments(employeeId: string | undefined) {
  return useQuery({
    queryKey: ['employee-documents', employeeId],
    queryFn: async () => {
      if (!employeeId) return [];

      const { data, error } = await supabase
        .from('employee_documents')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as EmployeeDocument[];
    },
    enabled: !!employeeId,
  });
}

// Fetch employee licenses
export function useEmployeeLicenses(employeeId: string | undefined) {
  return useQuery({
    queryKey: ['employee-licenses', employeeId],
    queryFn: async () => {
      if (!employeeId) return [];

      const { data, error } = await supabase
        .from('employee_licenses')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as EmployeeLicense[];
    },
    enabled: !!employeeId,
  });
}

// Create document
export function useCreateEmployeeDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (document: {
      employee_id: string;
      document_name: string;
      document_type: string;
      file_url: string;
      document_category?: "education" | "employment" | "identity" | "legal" | "medical" | "other";
      document_number?: string;
      issue_date?: string;
      expiry_date?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('employee_documents')
        .insert([document])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employee-documents', variables.employee_id] });
      toast.success('Document added successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to add document: ' + error.message);
    },
  });
}

// Create license
export function useCreateEmployeeLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (license: {
      employee_id: string;
      license_type: string;
      license_number: string;
      issuing_authority?: string;
      issue_date?: string;
      expiry_date?: string;
      document_url?: string;
    }) => {
      const { data, error } = await supabase
        .from('employee_licenses')
        .insert([{ ...license, is_verified: false }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employee-licenses', variables.employee_id] });
      toast.success('License added successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to add license: ' + error.message);
    },
  });
}

// Delete document
export function useDeleteEmployeeDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, employeeId }: { id: string; employeeId: string }) => {
      const { error } = await supabase
        .from('employee_documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id, employeeId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employee-documents', variables.employeeId] });
      toast.success('Document deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete document: ' + error.message);
    },
  });
}

// Delete license
export function useDeleteEmployeeLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, employeeId }: { id: string; employeeId: string }) => {
      const { error } = await supabase
        .from('employee_licenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id, employeeId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employee-licenses', variables.employeeId] });
      toast.success('License deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete license: ' + error.message);
    },
  });
}

// Fetch expiring licenses (across all employees)
export function useExpiringLicenses(daysAhead: number = 30) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['expiring-licenses', profile?.organization_id, daysAhead],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const today = new Date();
      const futureDate = addDays(today, daysAhead);

      const { data, error } = await supabase
        .from('employee_licenses')
        .select(`
          *,
          employee:employee_id(
            id,
            first_name,
            last_name,
            employee_number,
            category:category_id(name, color)
          )
        `)
        .not('expiry_date', 'is', null)
        .lte('expiry_date', futureDate.toISOString().split('T')[0])
        .order('expiry_date', { ascending: true });

      if (error) throw error;

      // Filter to only show from this organization's employees
      // and categorize by expired vs expiring soon
      const result = (data || []).map((license) => {
        const expiryDate = license.expiry_date ? parseISO(license.expiry_date) : null;
        const isExpired = expiryDate ? isBefore(expiryDate, today) : false;
        const isExpiringSoon = expiryDate ? isAfter(expiryDate, today) && isBefore(expiryDate, futureDate) : false;

        return {
          ...license,
          isExpired,
          isExpiringSoon,
        };
      });

      return result;
    },
    enabled: !!profile?.organization_id,
  });
}

// Document categories
export const DOCUMENT_CATEGORIES = [
  { value: 'identity', label: 'Identity Documents' },
  { value: 'education', label: 'Education Certificates' },
  { value: 'employment', label: 'Employment Documents' },
  { value: 'medical', label: 'Medical Certificates' },
  { value: 'other', label: 'Other Documents' },
];

// Document types
export const DOCUMENT_TYPES = [
  { value: 'national_id', label: 'National ID / CNIC', category: 'identity' },
  { value: 'passport', label: 'Passport', category: 'identity' },
  { value: 'driving_license', label: 'Driving License', category: 'identity' },
  { value: 'degree', label: 'Degree Certificate', category: 'education' },
  { value: 'transcript', label: 'Transcript', category: 'education' },
  { value: 'experience_letter', label: 'Experience Letter', category: 'employment' },
  { value: 'offer_letter', label: 'Offer Letter', category: 'employment' },
  { value: 'contract', label: 'Employment Contract', category: 'employment' },
  { value: 'relieving_letter', label: 'Relieving Letter', category: 'employment' },
  { value: 'fitness_certificate', label: 'Medical Fitness Certificate', category: 'medical' },
  { value: 'other', label: 'Other', category: 'other' },
];

// License types
export const LICENSE_TYPES = [
  { value: 'medical', label: 'Medical License (MBBS/MD)' },
  { value: 'nursing', label: 'Nursing License' },
  { value: 'pharmacy', label: 'Pharmacy License' },
  { value: 'lab_technician', label: 'Lab Technician License' },
  { value: 'radiology', label: 'Radiology Technician License' },
  { value: 'physiotherapy', label: 'Physiotherapy License' },
  { value: 'dental', label: 'Dental License' },
  { value: 'other', label: 'Other Professional License' },
];
