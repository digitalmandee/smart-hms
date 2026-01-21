import { ModernPageHeader } from '@/components/ModernPageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePACSHealth } from '@/hooks/usePACS';
import { PACSConfigurationForm } from '@/components/radiology/PACSConfigurationForm';
import { 
  Server, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink,
} from 'lucide-react';

export default function PACSSettingsPage() {
  const { data: health, isLoading, refetch } = usePACSHealth();

  const getStatusBadge = () => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-2 text-muted-foreground">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Checking connection...</span>
        </div>
      );
    }
    
    if (health?.status === 'connected') {
      return (
        <div className="flex items-center gap-2 text-success">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Connected</span>
        </div>
      );
    }
    
    if (health?.status === 'error') {
      return (
        <div className="flex items-center gap-2 text-destructive">
          <XCircle className="h-5 w-5" />
          <span className="font-medium">Connection Error</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-2 text-warning">
        <AlertTriangle className="h-5 w-5" />
        <span className="font-medium">Not Configured</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title="PACS Settings"
        subtitle="Configure PACS/DICOM integration"
        icon={Server}
        iconColor="text-primary"
        actions={
          <Button onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Status
          </Button>
        }
      />

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Connection Status</CardTitle>
              <CardDescription>Current PACS server connection state</CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          {health?.status === 'connected' && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Server URL</p>
                <p className="font-mono text-sm">{health.pacsServer || 'N/A'}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">AE Title</p>
                <p className="font-mono text-sm">{health.aeTitle || 'LOVABLE_HMS'}</p>
              </div>
            </div>
          )}

          {health?.status === 'error' && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive font-medium">
                {health.message || 'Unable to connect to PACS server. Please check your configuration.'}
              </p>
            </div>
          )}

          {health?.status === 'not_configured' && (
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <p className="text-sm text-warning-foreground">
                Configure your PACS server below to enable radiology image integration.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration Form */}
      <PACSConfigurationForm />

      {/* Supported PACS Servers */}
      <Card>
        <CardHeader>
          <CardTitle>Supported PACS Servers</CardTitle>
          <CardDescription>
            Any DICOMweb-compatible server can be integrated
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-3 border rounded-lg">
              <p className="font-medium">Orthanc</p>
              <p className="text-xs text-muted-foreground">Free, open-source DICOM server</p>
              <a 
                href="https://www.orthanc-server.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1"
              >
                Learn more <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-medium">DCM4CHEE</p>
              <p className="text-xs text-muted-foreground">Enterprise-grade PACS solution</p>
              <a 
                href="https://www.dcm4che.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1"
              >
                Learn more <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-medium">Google Healthcare API</p>
              <p className="text-xs text-muted-foreground">Cloud-based DICOM storage</p>
              <a 
                href="https://cloud.google.com/healthcare-api/docs/concepts/dicom" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1"
              >
                Learn more <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-medium">Any DICOMweb Server</p>
              <p className="text-xs text-muted-foreground">Supporting QIDO-RS & WADO-RS</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
