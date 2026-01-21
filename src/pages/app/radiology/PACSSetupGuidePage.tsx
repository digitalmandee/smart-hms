import { ModernPageHeader } from '@/components/ModernPageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  Server, 
  Terminal, 
  Shield, 
  CheckCircle, 
  Copy, 
  ExternalLink,
  HardDrive,
  Network,
  Lock,
  Workflow,
  AlertTriangle,
  Info,
  FileCode,
  Container,
  Settings,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function PACSSetupGuidePage() {
  const navigate = useNavigate();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const CodeBlock = ({ code, label }: { code: string; label?: string }) => (
    <div className="relative group">
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
        <code>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => copyToClipboard(code, label || 'Code')}
      >
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title="PACS Setup Guide"
        subtitle="Complete guide to deploying and configuring PACS with your HMS"
        icon={BookOpen}
        iconColor="text-primary"
        actions={
          <Button variant="outline" onClick={() => navigate('/app/radiology/pacs/settings')}>
            <Settings className="h-4 w-4 mr-2" />
            PACS Settings
          </Button>
        }
      />

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            What is PACS?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            <strong>PACS (Picture Archiving and Communication System)</strong> is a medical imaging technology 
            that provides economical storage and convenient access to images from multiple modalities like 
            X-ray, CT, MRI, and Ultrasound machines.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <HardDrive className="h-8 w-8 text-primary mb-2" />
              <h4 className="font-medium">Image Storage</h4>
              <p className="text-sm text-muted-foreground">Store DICOM images from all modalities in one central location</p>
            </div>
            <div className="p-4 border rounded-lg">
              <Network className="h-8 w-8 text-primary mb-2" />
              <h4 className="font-medium">Network Access</h4>
              <p className="text-sm text-muted-foreground">Access images from any workstation in the network</p>
            </div>
            <div className="p-4 border rounded-lg">
              <Workflow className="h-8 w-8 text-primary mb-2" />
              <h4 className="font-medium">Workflow Integration</h4>
              <p className="text-sm text-muted-foreground">Seamless integration with HMS for radiology workflows</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Setup Tabs */}
      <Tabs defaultValue="docker" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="docker" className="gap-2">
            <Container className="h-4 w-4" />
            Docker Setup
          </TabsTrigger>
          <TabsTrigger value="configuration" className="gap-2">
            <Settings className="h-4 w-4" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="integration" className="gap-2">
            <Zap className="h-4 w-4" />
            HMS Integration
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Docker Setup Tab */}
        <TabsContent value="docker" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Container className="h-5 w-5" />
                Quick Start with Docker
              </CardTitle>
              <CardDescription>
                Deploy Orthanc PACS server in minutes using Docker
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Prerequisites */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  Prerequisites
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                  <li>Docker installed on your server (<a href="https://docs.docker.com/get-docker/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Install Docker</a>)</li>
                  <li>Docker Compose (usually included with Docker Desktop)</li>
                  <li>Minimum 4GB RAM, 20GB storage (more for production)</li>
                  <li>Port 8042 available for web interface</li>
                  <li>Port 4242 available for DICOM protocol</li>
                </ul>
              </div>

              <Separator />

              {/* Step 1: Basic Setup */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Badge variant="outline">Step 1</Badge>
                  Quick Start (Single Command)
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Run Orthanc with default settings for testing:
                </p>
                <CodeBlock 
                  code="docker run -p 4242:4242 -p 8042:8042 --name orthanc jodogne/orthanc"
                  label="Docker command"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Access web interface at: <code className="bg-muted px-1 rounded">http://localhost:8042</code> (default: orthanc/orthanc)
                </p>
              </div>

              <Separator />

              {/* Step 2: Production Setup */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Badge variant="outline">Step 2</Badge>
                  Production Setup with Docker Compose
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Create a <code className="bg-muted px-1 rounded">docker-compose.yml</code> file:
                </p>
                <CodeBlock 
                  code={`version: '3.8'

services:
  orthanc:
    image: jodogne/orthanc-plugins:latest
    container_name: orthanc-pacs
    restart: unless-stopped
    ports:
      - "4242:4242"  # DICOM port
      - "8042:8042"  # Web interface & REST API
    volumes:
      - orthanc-db:/var/lib/orthanc/db
      - ./orthanc.json:/etc/orthanc/orthanc.json:ro
    environment:
      - ORTHANC_NAME=Hospital PACS
      - VERBOSE_ENABLED=true
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8042/system"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  orthanc-db:
    driver: local`}
                  label="docker-compose.yml"
                />
              </div>

              <Separator />

              {/* Step 3: Configuration File */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Badge variant="outline">Step 3</Badge>
                  Create Orthanc Configuration
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Create <code className="bg-muted px-1 rounded">orthanc.json</code> in the same directory:
                </p>
                <CodeBlock 
                  code={`{
  "Name": "Hospital PACS Server",
  "StorageDirectory": "/var/lib/orthanc/db",
  "IndexDirectory": "/var/lib/orthanc/db",
  "StorageCompression": false,
  
  "RemoteAccessAllowed": true,
  "AuthenticationEnabled": true,
  "RegisteredUsers": {
    "admin": "your-secure-password-here",
    "hms": "hms-integration-password"
  },
  
  "DicomServerEnabled": true,
  "DicomAet": "ORTHANC",
  "DicomPort": 4242,
  "DicomCheckCalledAet": false,
  
  "HttpServerEnabled": true,
  "HttpPort": 8042,
  "HttpDescribeErrors": true,
  
  "DicomWeb": {
    "Enable": true,
    "Root": "/dicom-web/",
    "EnableWado": true,
    "WadoRoot": "/wado",
    "Host": "0.0.0.0",
    "Ssl": false,
    "StudiesMetadata": "Full",
    "SeriesMetadata": "Full"
  },
  
  "DicomModalities": {
    "CT_SCANNER": ["CT_AET", "192.168.1.100", 104],
    "MRI_MACHINE": ["MRI_AET", "192.168.1.101", 104],
    "XRAY": ["XRAY_AET", "192.168.1.102", 104]
  },
  
  "OrthancPeers": {},
  
  "StableAge": 60,
  "DicomAssociationCloseDelay": 5,
  "QueryRetrieveSize": 100,
  "CaseSensitivePN": false,
  "LoadPrivateDictionary": true,
  
  "Plugins": [
    "/usr/share/orthanc/plugins"
  ]
}`}
                  label="orthanc.json"
                />
              </div>

              <Separator />

              {/* Step 4: Start Services */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Badge variant="outline">Step 4</Badge>
                  Start the PACS Server
                </h4>
                <CodeBlock 
                  code={`# Start Orthanc
docker-compose up -d

# Check logs
docker-compose logs -f orthanc

# Stop Orthanc
docker-compose down`}
                  label="Docker commands"
                />
              </div>

              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Verify Installation</AlertTitle>
                <AlertDescription>
                  After starting, verify the server is running:
                  <ul className="list-disc list-inside mt-2 text-sm">
                    <li>Web UI: <code className="bg-muted px-1 rounded">http://your-server:8042</code></li>
                    <li>REST API: <code className="bg-muted px-1 rounded">http://your-server:8042/system</code></li>
                    <li>DICOM: Port 4242 should accept connections</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Cloud Deployment Options */}
          <Card>
            <CardHeader>
              <CardTitle>Cloud Deployment Options</CardTitle>
              <CardDescription>Deploy Orthanc on popular cloud platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">AWS</h4>
                  <p className="text-sm text-muted-foreground mb-2">Deploy on EC2 or ECS with S3 for storage</p>
                  <a 
                    href="https://aws.amazon.com/marketplace/pp/prodview-67pqfj5wy2zrc" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                  >
                    AWS Marketplace <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Google Cloud</h4>
                  <p className="text-sm text-muted-foreground mb-2">Use GKE or Cloud Run with Healthcare API</p>
                  <a 
                    href="https://cloud.google.com/healthcare-api/docs/concepts/dicom" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Healthcare API <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Azure</h4>
                  <p className="text-sm text-muted-foreground mb-2">Deploy with Azure Health Data Services</p>
                  <a 
                    href="https://learn.microsoft.com/en-us/azure/healthcare-apis/dicom/dicom-services-overview" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                  >
                    DICOM Service <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="h-5 w-5" />
                Orthanc Configuration Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Storage Configuration */}
              <div>
                <h4 className="font-medium mb-3">Storage Configuration</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <code className="text-sm font-mono">"StorageDirectory"</code>
                    <p className="text-sm text-muted-foreground mt-1">
                      Path where DICOM files are stored. Use a volume mount for persistence.
                    </p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <code className="text-sm font-mono">"StorageCompression"</code>
                    <p className="text-sm text-muted-foreground mt-1">
                      Enable to compress stored files (saves space but uses more CPU).
                    </p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <code className="text-sm font-mono">"MaximumStorageSize"</code>
                    <p className="text-sm text-muted-foreground mt-1">
                      Maximum storage in MB. Set to 0 for unlimited.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* DICOM Configuration */}
              <div>
                <h4 className="font-medium mb-3">DICOM Settings</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <code className="text-sm font-mono">"DicomAet"</code>
                    <p className="text-sm text-muted-foreground mt-1">
                      Application Entity Title - unique identifier for this PACS node. Default: "ORTHANC"
                    </p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <code className="text-sm font-mono">"DicomPort"</code>
                    <p className="text-sm text-muted-foreground mt-1">
                      Port for DICOM communications. Standard port is 104, but 4242 is often used.
                    </p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <code className="text-sm font-mono">"DicomModalities"</code>
                    <p className="text-sm text-muted-foreground mt-1">
                      Configure connected imaging devices (CT, MRI, X-ray, etc.)
                    </p>
                    <CodeBlock 
                      code={`"DicomModalities": {
  "CT_SCANNER": ["CT_AET", "192.168.1.100", 104],
  "MRI": ["MRI_AET", "192.168.1.101", 104]
}`}
                      label="Modalities config"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* DICOMweb Configuration */}
              <div>
                <h4 className="font-medium mb-3">DICOMweb Settings (Required for HMS)</h4>
                <Alert className="mb-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    DICOMweb must be enabled for the HMS integration to work. This provides REST API access to DICOM data.
                  </AlertDescription>
                </Alert>
                <CodeBlock 
                  code={`"DicomWeb": {
  "Enable": true,
  "Root": "/dicom-web/",
  "EnableWado": true,
  "WadoRoot": "/wado",
  "Ssl": false,
  "StudiesMetadata": "Full",
  "SeriesMetadata": "Full"
}`}
                  label="DICOMweb config"
                />
              </div>
            </CardContent>
          </Card>

          {/* Modality Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Connecting Imaging Equipment</CardTitle>
              <CardDescription>Configure your CT, MRI, X-ray, and other modalities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Each imaging device needs to be configured to send images to Orthanc. You'll need:
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="p-3 border rounded-lg">
                  <h5 className="font-medium">On the Modality (Equipment)</h5>
                  <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                    <li>Orthanc IP address: <code className="bg-muted px-1 rounded">your-server-ip</code></li>
                    <li>Orthanc AET: <code className="bg-muted px-1 rounded">ORTHANC</code></li>
                    <li>Orthanc Port: <code className="bg-muted px-1 rounded">4242</code></li>
                  </ul>
                </div>
                <div className="p-3 border rounded-lg">
                  <h5 className="font-medium">In Orthanc Configuration</h5>
                  <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                    <li>Modality AET (from equipment settings)</li>
                    <li>Modality IP address</li>
                    <li>Modality DICOM port (usually 104)</li>
                  </ul>
                </div>
              </div>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>DICOM Echo Test</AlertTitle>
                <AlertDescription>
                  After configuration, perform a DICOM Echo (C-ECHO) test from the modality to verify connectivity.
                  Most equipment has this option in their network or DICOM settings.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* HMS Integration Tab */}
        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Connecting to HMS
              </CardTitle>
              <CardDescription>
                Configure your Supabase Edge Function secrets to connect HMS to PACS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Required Secrets */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Badge variant="outline">Step 1</Badge>
                  Add Supabase Secrets
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Go to your Supabase Dashboard → Settings → Edge Functions → Secrets and add:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <code className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-mono whitespace-nowrap">PACS_SERVER_URL</code>
                    <div>
                      <p className="text-sm font-medium">PACS Server URL</p>
                      <p className="text-xs text-muted-foreground">
                        Example: <code className="bg-muted px-1 rounded">http://your-orthanc-server:8042</code>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <code className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-mono whitespace-nowrap">PACS_USERNAME</code>
                    <div>
                      <p className="text-sm font-medium">Authentication Username</p>
                      <p className="text-xs text-muted-foreground">
                        The username from RegisteredUsers in orthanc.json (e.g., "hms")
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <code className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-mono whitespace-nowrap">PACS_PASSWORD</code>
                    <div>
                      <p className="text-sm font-medium">Authentication Password</p>
                      <p className="text-xs text-muted-foreground">
                        The password for the HMS user in orthanc.json
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Test Connection */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Badge variant="outline">Step 2</Badge>
                  Test the Connection
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  After adding secrets, go to PACS Settings and click "Test Connection":
                </p>
                <Button onClick={() => navigate('/app/radiology/pacs/settings')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Go to PACS Settings
                </Button>
              </div>

              <Separator />

              {/* Integration Flow */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Badge variant="outline">Step 3</Badge>
                  How Integration Works
                </h4>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">1</div>
                      <span className="text-sm">Modality sends DICOM images to Orthanc via DICOM protocol</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">2</div>
                      <span className="text-sm">Orthanc stores images and exposes them via DICOMweb REST API</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">3</div>
                      <span className="text-sm">HMS pacs-gateway Edge Function queries Orthanc's DICOMweb API</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">4</div>
                      <span className="text-sm">Radiologists view images in HMS PACS Viewer component</span>
                    </div>
                  </div>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Patient Matching</AlertTitle>
                <AlertDescription>
                  For studies to appear correctly, ensure patient IDs in your imaging equipment match 
                  the patient IDs in HMS. Configure your modalities to use the HMS patient number as the Patient ID.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Workflow Integration */}
          <Card>
            <CardHeader>
              <CardTitle>Radiology Workflow Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium mb-2">Order to Image Flow</h5>
                  <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                    <li>Doctor creates imaging order in HMS</li>
                    <li>Technician performs scan on modality</li>
                    <li>Modality sends images to Orthanc</li>
                    <li>Images appear in HMS PACS viewer</li>
                    <li>Radiologist creates report</li>
                  </ol>
                </div>
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium mb-2">Where Images Appear</h5>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>PACS Studies page (patient search)</li>
                    <li>Imaging Order Detail page</li>
                    <li>Report Entry page (for radiologists)</li>
                    <li>Patient medical records</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Best Practices
              </CardTitle>
              <CardDescription>
                Protect patient imaging data with proper security measures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>HIPAA Compliance</AlertTitle>
                <AlertDescription>
                  Medical images contain Protected Health Information (PHI). Ensure your PACS deployment 
                  complies with HIPAA, GDPR, or your local healthcare data protection regulations.
                </AlertDescription>
              </Alert>

              {/* Authentication */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Authentication
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                    Enable authentication in Orthanc (<code className="bg-muted px-1 rounded">"AuthenticationEnabled": true</code>)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                    Use strong, unique passwords for each user
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                    Create separate users for different applications (HMS, viewers, etc.)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                    Regularly rotate passwords and audit access logs
                  </li>
                </ul>
              </div>

              <Separator />

              {/* Network Security */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  Network Security
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                    Deploy Orthanc behind a reverse proxy (nginx, Traefik)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                    Use HTTPS/TLS for all web communications
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                    Restrict DICOM port access to known modality IPs
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                    Use a VPN or private network for DICOM traffic
                  </li>
                </ul>
              </div>

              <Separator />

              {/* HTTPS Setup */}
              <div>
                <h4 className="font-medium mb-3">HTTPS with Nginx Reverse Proxy</h4>
                <CodeBlock 
                  code={`# nginx.conf
server {
    listen 443 ssl;
    server_name pacs.yourhospital.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    location / {
        proxy_pass http://orthanc:8042;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # For large DICOM files
        client_max_body_size 500M;
        proxy_read_timeout 300;
    }
}`}
                  label="nginx config"
                />
              </div>

              <Separator />

              {/* Backup */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  Data Backup
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                    Implement automated daily backups of the storage volume
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                    Test backup restoration procedures regularly
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                    Store backups in a separate location (offsite/cloud)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                    Encrypt backup data at rest and in transit
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <a 
              href="https://orthanc.uclouvain.be/book/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
            >
              <BookOpen className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-medium">Orthanc Book</h4>
              <p className="text-xs text-muted-foreground">Complete documentation</p>
            </a>
            <a 
              href="https://groups.google.com/g/orthanc-users" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
            >
              <Network className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-medium">Community Forum</h4>
              <p className="text-xs text-muted-foreground">Get help from users</p>
            </a>
            <a 
              href="https://www.dicomstandard.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
            >
              <FileCode className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-medium">DICOM Standard</h4>
              <p className="text-xs text-muted-foreground">Official specification</p>
            </a>
            <a 
              href="https://hub.docker.com/r/jodogne/orthanc" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
            >
              <Container className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-medium">Docker Hub</h4>
              <p className="text-xs text-muted-foreground">Official images</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
