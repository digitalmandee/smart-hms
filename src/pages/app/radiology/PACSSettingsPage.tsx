import { ModernPageHeader } from '@/components/ModernPageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePACSHealth } from '@/hooks/usePACS';
import { 
  Server, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink,
  Shield,
  Info
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function PACSSettingsPage() {
  const { data: health, isLoading, refetch, error } = usePACSHealth();

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
            Test Connection
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
        <CardContent className="space-y-4">
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
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Connection Failed</AlertTitle>
              <AlertDescription>
                {health.message || 'Unable to connect to PACS server. Please check your configuration.'}
              </AlertDescription>
            </Alert>
          )}

          {health?.status === 'not_configured' && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>PACS Not Configured</AlertTitle>
              <AlertDescription>
                PACS integration requires server configuration. Please add the required secrets.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Configuration Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Configuration Guide
          </CardTitle>
          <CardDescription>
            How to configure PACS integration with your imaging server
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-2">Required Secrets</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Add these secrets in your Supabase Edge Function secrets:
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <code className="bg-background px-2 py-1 rounded text-xs font-mono">PACS_SERVER_URL</code>
                <div>
                  <p className="text-sm font-medium">PACS Server URL</p>
                  <p className="text-xs text-muted-foreground">
                    The base URL of your DICOMweb-compatible PACS server (e.g., http://orthanc:8042)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <code className="bg-background px-2 py-1 rounded text-xs font-mono">PACS_USERNAME</code>
                <div>
                  <p className="text-sm font-medium">Username (Optional)</p>
                  <p className="text-xs text-muted-foreground">
                    Authentication username if your PACS requires Basic Auth
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <code className="bg-background px-2 py-1 rounded text-xs font-mono">PACS_PASSWORD</code>
                <div>
                  <p className="text-sm font-medium">Password (Optional)</p>
                  <p className="text-xs text-muted-foreground">
                    Authentication password if your PACS requires Basic Auth
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Supported PACS Servers</h4>
            <div className="grid gap-3 md:grid-cols-2">
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
                <p className="text-xs text-muted-foreground">Any server supporting QIDO-RS & WADO-RS</p>
              </div>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Quick Start with Orthanc</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-2">Run Orthanc locally with Docker:</p>
              <code className="block bg-muted p-2 rounded text-xs font-mono">
                docker run -p 8042:8042 jodogne/orthanc
              </code>
              <p className="mt-2 text-xs">
                Then set PACS_SERVER_URL to http://localhost:8042
              </p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
