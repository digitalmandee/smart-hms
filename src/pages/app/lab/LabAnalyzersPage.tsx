import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModernPageHeader } from '@/components/ModernPageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  useLabAnalyzers, 
  useDeleteLabAnalyzer,
  LabAnalyzer,
  ANALYZER_TYPES,
  CONNECTION_TYPES,
} from '@/hooks/useLabAnalyzers';
import { 
  FlaskConical, 
  Plus, 
  Edit, 
  Trash2, 
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
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

export default function LabAnalyzersPage() {
  const navigate = useNavigate();
  const { data: analyzers, isLoading } = useLabAnalyzers();
  const deleteAnalyzer = useDeleteLabAnalyzer();
  const [deletingAnalyzer, setDeletingAnalyzer] = useState<LabAnalyzer | null>(null);

  const handleDelete = async () => {
    if (!deletingAnalyzer) return;
    try {
      await deleteAnalyzer.mutateAsync(deletingAnalyzer.id);
      setDeletingAnalyzer(null);
    } catch (error) {
      // Error handled in hook
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Online
          </Badge>
        );
      case 'offline':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Offline
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

  const getTypeLabel = (type: string) => {
    return ANALYZER_TYPES.find(t => t.value === type)?.label || type;
  };

  const getConnectionLabel = (type: string) => {
    return CONNECTION_TYPES.find(t => t.value === type)?.label || type;
  };

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title="Lab Analyzers"
        subtitle="Manage laboratory analyzer devices and test mappings"
        icon={FlaskConical}
        iconColor="text-primary"
        actions={
          <Button onClick={() => navigate('/app/lab/analyzers/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Analyzer
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : analyzers && analyzers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Manufacturer / Model</TableHead>
                  <TableHead>Connection</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analyzers.map((analyzer) => (
                  <TableRow key={analyzer.id}>
                    <TableCell className="font-medium">{analyzer.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getTypeLabel(analyzer.analyzer_type)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        {analyzer.manufacturer && <span className="font-medium">{analyzer.manufacturer}</span>}
                        {analyzer.model && <span className="text-muted-foreground ml-1">{analyzer.model}</span>}
                        {!analyzer.manufacturer && !analyzer.model && <span className="text-muted-foreground">-</span>}
                      </div>
                    </TableCell>
                    <TableCell>{getConnectionLabel(analyzer.connection_type)}</TableCell>
                    <TableCell className="text-muted-foreground">{analyzer.location || '-'}</TableCell>
                    <TableCell>{getStatusBadge(analyzer.connection_status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/app/lab/analyzers/${analyzer.id}/mapping`)}
                          title="Test Mapping"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/app/lab/analyzers/${analyzer.id}/edit`)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeletingAnalyzer(analyzer)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <FlaskConical className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Analyzers Configured</h3>
              <p className="text-muted-foreground text-center mb-4">
                Add laboratory analyzers to map tests and track results.
              </p>
              <Button onClick={() => navigate('/app/lab/analyzers/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Analyzer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deletingAnalyzer} onOpenChange={() => setDeletingAnalyzer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Analyzer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingAnalyzer?.name}"? 
              This will also remove all test mappings for this analyzer.
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
