import { useState, useEffect } from 'react';
import { Search, Plus, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { QuickPatientModal } from './QuickPatientModal';

interface Patient {
  id: string;
  first_name: string;
  last_name: string | null;
  patient_number: string;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
}

interface PatientSearchProps {
  onSelect: (patient: Patient) => void;
  onCreateNew?: () => void;
  selectedPatient?: Patient | null;
}

export function PatientSearch({ onSelect, onCreateNew, selectedPatient }: PatientSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { profile } = useAuth();
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    const search = async () => {
      if (!debouncedSearch || debouncedSearch.length < 2 || !profile?.organization_id) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('id, first_name, last_name, patient_number, phone, date_of_birth, gender')
          .eq('organization_id', profile.organization_id)
          .eq('is_active', true)
          .or(`first_name.ilike.%${debouncedSearch}%,last_name.ilike.%${debouncedSearch}%,patient_number.ilike.%${debouncedSearch}%,phone.ilike.%${debouncedSearch}%`)
          .limit(10);

        if (error) throw error;
        setResults(data || []);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    search();
  }, [debouncedSearch, profile?.organization_id]);

  const handleSelect = (patient: Patient) => {
    onSelect(patient);
    setSearchTerm('');
    setShowResults(false);
  };

  if (selectedPatient) {
    return (
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">
                {selectedPatient.first_name} {selectedPatient.last_name}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedPatient.patient_number} • {selectedPatient.phone || 'No phone'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelect(null as any)}
          >
            Change
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, MR number, or phone..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          className="pl-10"
        />
      </div>

      {showResults && (searchTerm.length >= 2 || results.length > 0) && (
        <Card className="absolute z-50 w-full mt-1 max-h-64 overflow-auto shadow-lg">
          {isSearching ? (
            <div className="p-4 text-center text-muted-foreground">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="p-1">
              {results.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => handleSelect(patient)}
                  className="w-full p-3 text-left hover:bg-muted rounded-md flex items-center gap-3 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {patient.first_name} {patient.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {patient.patient_number} • {patient.phone || 'No phone'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : searchTerm.length >= 2 ? (
            <div className="p-4">
              <p className="text-center text-muted-foreground mb-3">
                No patients found
              </p>
              <div className="flex gap-2">
                <QuickPatientModal
                  onPatientCreated={(patient) => handleSelect(patient as Patient)}
                  trigger={
                    <Button variant="default" size="sm" className="flex-1">
                      <Plus className="h-4 w-4 mr-2" />
                      Quick Register
                    </Button>
                  }
                />
                {onCreateNew && (
                  <Button variant="outline" size="sm" className="flex-1" onClick={onCreateNew}>
                    Full Form
                  </Button>
                )}
              </div>
            </div>
          ) : null}
        </Card>
      )}

      {/* Click outside to close */}
      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
}

// Add debounce hook if not exists
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
