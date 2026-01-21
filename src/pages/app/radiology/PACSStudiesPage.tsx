import { useState } from 'react';
import { ModernPageHeader } from '@/components/ModernPageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PACSViewer } from '@/components/radiology/PACSViewer';
import { usePACSHealth } from '@/hooks/usePACS';
import { Radio, Search, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { usePatients } from '@/hooks/usePatients';

export default function PACSStudiesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const { data: health, isLoading: healthLoading, refetch: refetchHealth } = usePACSHealth();
  const { data: patients } = usePatients();

  const filteredPatients = patients?.filter(p => 
    searchTerm.length >= 2 && (
      p.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.patient_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone?.includes(searchTerm)
    )
  ).slice(0, 10) || [];

  const getStatusIcon = () => {
    if (healthLoading) return <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />;
    if (health?.status === 'connected') return <CheckCircle className="h-5 w-5 text-success" />;
    if (health?.status === 'error') return <XCircle className="h-5 w-5 text-destructive" />;
    return <AlertTriangle className="h-5 w-5 text-warning" />;
  };

  const getStatusText = () => {
    if (healthLoading) return 'Checking connection...';
    if (health?.status === 'connected') return `Connected to ${health.pacsServer || 'PACS Server'}`;
    if (health?.status === 'error') return health.message || 'Connection error';
    return 'PACS not configured';
  };

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title="PACS Studies"
        subtitle="Browse and view DICOM imaging studies"
        icon={Radio}
        iconColor="text-primary"
        actions={
          <Button variant="outline" onClick={() => refetchHealth()} disabled={healthLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${healthLoading ? 'animate-spin' : ''}`} />
            Refresh Status
          </Button>
        }
      />

      {/* Connection Status */}
      <Card>
        <CardContent className="flex items-center gap-3 py-4">
          {getStatusIcon()}
          <span className="text-sm font-medium">{getStatusText()}</span>
          {health && 'aeTitle' in health && health.aeTitle && (
            <span className="text-xs text-muted-foreground ml-auto">AE Title: {health.aeTitle}</span>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Patient Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Find Patient
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, MRN, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {searchTerm.length >= 2 && (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredPatients.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No patients found
                  </p>
                ) : (
                  filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      onClick={() => setSelectedPatientId(patient.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedPatientId === patient.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <p className="font-medium">{patient.first_name} {patient.last_name}</p>
                      <p className="text-sm text-muted-foreground">
                        ID: {patient.patient_number} • {patient.phone}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}

            {searchTerm.length < 2 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Type at least 2 characters to search
              </p>
            )}
          </CardContent>
        </Card>

        {/* PACS Studies Viewer */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>DICOM Studies</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedPatientId ? (
                <PACSViewer 
                  patientId={selectedPatientId}
                  onStudySelect={(study) => console.log('Selected study:', study)}
                />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Radio className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Select a patient to view studies</p>
                  <p className="text-sm">Search for a patient on the left to browse their DICOM studies</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
