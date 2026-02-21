import { useState, useCallback } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Key, Plus, Copy, Trash2, Eye, EyeOff, Shield } from "lucide-react";
import { toast } from "sonner";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string | null;
  isNew?: boolean;
}

function generateApiKey(): string {
  return "wms_" + crypto.randomUUID().replace(/-/g, "");
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());

  const handleCreateKey = useCallback(() => {
    const name = newKeyName.trim() || `API Key ${keys.length + 1}`;
    const newKey: ApiKey = {
      id: crypto.randomUUID(),
      name,
      key: generateApiKey(),
      createdAt: new Date().toISOString(),
      lastUsed: null,
      isNew: true,
    };
    setKeys((prev) => [newKey, ...prev]);
    setRevealedKeys((prev) => new Set(prev).add(newKey.id));
    setNewKeyName("");
    toast.success("API key generated. Copy it now — it won't be shown again after you leave.");
  }, [newKeyName, keys.length]);

  const handleCopy = useCallback((key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("API key copied to clipboard");
  }, []);

  const handleRevoke = useCallback((id: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== id));
    setRevealedKeys((prev) => { const n = new Set(prev); n.delete(id); return n; });
    toast.success("API key revoked");
  }, []);

  const toggleReveal = useCallback((id: string) => {
    setRevealedKeys((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }, []);

  const maskKey = (key: string) => key.slice(0, 8) + "••••••••••••••••" + key.slice(-4);

  return (
    <div className="space-y-6">
      <PageHeader
        title="API Keys"
        description="Generate and manage API keys for external system integration"
        breadcrumbs={[
          { label: "Inventory", href: "/app/inventory" },
          { label: "Integrations", href: "/app/inventory/integrations" },
          { label: "API Keys" },
        ]}
      />

      {/* Generate Key */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Generate New API Key
          </CardTitle>
          <CardDescription>
            Create a key for external systems to access your warehouse data via API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 max-w-md">
            <Input
              placeholder="Key name (e.g., ERP Integration)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateKey()}
            />
            <Button onClick={handleCreateKey}>
              <Key className="mr-2 h-4 w-4" />
              Generate
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Keys are generated locally for demonstration. In production, keys are stored securely server-side.
          </p>
        </CardContent>
      </Card>

      {/* Keys List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Active API Keys
          </CardTitle>
        </CardHeader>
        <CardContent>
          {keys.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Key className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p>No API keys generated yet</p>
              <p className="text-xs mt-1">Create your first key above to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((apiKey) => (
                  <TableRow key={apiKey.id}>
                    <TableCell className="font-medium">{apiKey.name}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {revealedKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(apiKey.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {apiKey.isNew ? (
                        <Badge variant="default">New</Badge>
                      ) : (
                        <Badge variant="secondary">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleReveal(apiKey.id)}>
                          {revealedKeys.has(apiKey.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy(apiKey.key)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently revoke "{apiKey.name}". Any systems using this key will lose access.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRevoke(apiKey.id)}>Revoke</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
