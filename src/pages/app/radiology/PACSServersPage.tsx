import { useState } from 'react';
import { ModernPageHeader } from '@/components/ModernPageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  usePACSServers, 
  useDeletePACSServer, 
  useTestPACSServerConnection,
  useUpdatePACSServer,
  PACSServer 
} from '@/hooks/usePACSServers';
import { PACSServerFormDialog } from '@/components/radiology/PACSServerFormDialog';
import { 
  Server, 
  Plus, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Trash2,
  Edit,
  RefreshCw,
  Star,
  StarOff,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function PACSServersPage() {
  const { data: servers, isLoading, refetch } = usePACSServers();
  const deleteServer = useDeletePACSServer();
  const testConnection = useTestPACSServerConnection();
  const updateServer = useUpdatePACSServer();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<PACSServer | null>(null);
  const [deletingServer, setDeletingServer] = useState<PACSServer | null>(null);
  const [testingServerId, setTestingServerId] = useState<string | null>(null);

  const handleEdit = (server: PACSServer) => {
    setEditingServer(server);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingServer) return;
    try {
      await deleteServer.mutateAsync(deletingServer.id);
      setDeletingServer(null);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleTestConnection = async (server: PACSServer) => {
    setTestingServerId(server.id);
    try {
      const result = await testConnection.mutateAsync(server);
      if (result.success) {
        toast.success(result.message);
        // Update connection status
        await updateServer.mutateAsync({
          id: server.id,
          connection_status: 'connected',
          last_connection_check: new Date().toISOString(),
        });
      } else {
        toast.error(result.message);
        await updateServer.mutateAsync({
          id: server.id,
          connection_status: 'error',
          last_connection_check: new Date().toISOString(),
        });
      }
    } catch (error: any) {
      toast.error(error.message || 'Connection test failed');
    } finally {
      setTestingServerId(null);
    }
  };

  const handleSetDefault = async (server: PACSServer) => {
    try {
      await updateServer.mutateAsync({
        id: server.id,
        is_default: true,
      });
    } catch (error) {
      // Error handled in hook
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <AlertCircle className="h-3 w-3 mr-1" />
            Unknown
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title="PACS Servers"
        subtitle="Manage multiple PACS server connections"
        icon={Server}
        iconColor="text-primary"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => { setEditingServer(null); setIsFormOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add PACS Server
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : servers && servers.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {servers.map((server) => (
            <Card key={server.id} className={server.is_default ? 'border-primary' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{server.name}</CardTitle>
                    {server.is_default && (
                      <Badge variant="outline" className="text-primary border-primary">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Default
                      </Badge>
                    )}
                  </div>
                  {getStatusBadge(server.connection_status)}
                </div>
                <CardDescription className="font-mono text-xs">
                  {server.server_url}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">AE Title</p>
                    <p className="font-medium">{server.ae_title}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Authentication</p>
                    <p className="font-medium">{server.username ? 'Basic Auth' : 'None'}</p>
                  </div>
                  {server.modality_types && server.modality_types.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground mb-1">Modalities</p>
                      <div className="flex flex-wrap gap-1">
                        {server.modality_types.map((mod) => (
                          <Badge key={mod} variant="secondary" className="text-xs">
                            {mod}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestConnection(server)}
                    disabled={testingServerId === server.id}
                  >
                    {testingServerId === server.id ? (
                      <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-1" />
                    )}
                    Test
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(server)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  {!server.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(server)}
                    >
                      <StarOff className="h-4 w-4 mr-1" />
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeletingServer(server)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Server className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No PACS Servers Configured</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add a PACS server to enable radiology image integration.
            </p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add PACS Server
            </Button>
          </CardContent>
        </Card>
      )}

      <PACSServerFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        server={editingServer}
      />

      <AlertDialog open={!!deletingServer} onOpenChange={() => setDeletingServer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete PACS Server</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingServer?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
