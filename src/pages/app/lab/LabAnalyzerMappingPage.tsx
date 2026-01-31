import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Search, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useLabAnalyzer } from "@/hooks/useLabAnalyzers";
import {
  useLabAnalyzerMappings,
  useCreateTestMapping,
  useDeleteTestMapping,
  useBulkCreateTestMappings,
} from "@/hooks/useLabAnalyzerMappings";
import { useLabTestTemplates, LabTestTemplate } from "@/hooks/useLabTestTemplates";

export default function LabAnalyzerMappingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: analyzer, isLoading: analyzerLoading } = useLabAnalyzer(id);
  const { data: mappings, isLoading: mappingsLoading } = useLabAnalyzerMappings(id);
  const { data: allTests, isLoading: testsLoading } = useLabTestTemplates();

  const createMapping = useCreateTestMapping();
  const deleteMapping = useDeleteTestMapping();
  const bulkCreate = useBulkCreateTestMappings();

  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedTests, setSelectedTests] = useState<Set<string>>(new Set());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  // Form state for bulk add dialog
  const [bulkMappings, setBulkMappings] = useState<
    { testId: string; testName: string; code: string }[]
  >([]);

  // Get unique categories from all tests
  const categories = useMemo(() => {
    if (!allTests) return [];
    const cats = new Set(allTests.map((t) => t.test_category));
    return Array.from(cats).sort();
  }, [allTests]);

  // Filter to get unmapped tests
  const mappedTestIds = useMemo(
    () => new Set(mappings?.map((m) => m.lab_test_template_id) || []),
    [mappings]
  );

  const availableTests = useMemo(() => {
    if (!allTests) return [];
    return allTests.filter((t) => {
      if (mappedTestIds.has(t.id)) return false;
      if (categoryFilter !== "all" && t.test_category !== categoryFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          t.test_name.toLowerCase().includes(query) ||
          t.test_category.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [allTests, mappedTestIds, categoryFilter, searchQuery]);

  // Handle checkbox selection
  const handleTestSelect = (testId: string, checked: boolean) => {
    const newSelected = new Set(selectedTests);
    if (checked) {
      newSelected.add(testId);
    } else {
      newSelected.delete(testId);
    }
    setSelectedTests(newSelected);
  };

  // Open add dialog with selected tests
  const handleOpenAddDialog = () => {
    const testsToAdd = availableTests.filter((t) => selectedTests.has(t.id));
    setBulkMappings(
      testsToAdd.map((t) => ({
        testId: t.id,
        testName: t.test_name,
        code: "",
      }))
    );
    setIsAddDialogOpen(true);
  };

  // Update code for a test in bulk mappings
  const updateMappingCode = (testId: string, code: string) => {
    setBulkMappings((prev) =>
      prev.map((m) => (m.testId === testId ? { ...m, code } : m))
    );
  };

  // Submit bulk mappings
  const handleSubmitMappings = async () => {
    if (!id) return;

    const validMappings = bulkMappings.filter((m) => m.code.trim());
    if (validMappings.length === 0) return;

    await bulkCreate.mutateAsync(
      validMappings.map((m) => ({
        analyzer_id: id,
        lab_test_template_id: m.testId,
        analyzer_test_code: m.code.trim(),
      }))
    );

    setIsAddDialogOpen(false);
    setSelectedTests(new Set());
    setBulkMappings([]);
  };

  // Handle delete mapping
  const handleDeleteMapping = async () => {
    if (!deleteConfirm || !id) return;
    await deleteMapping.mutateAsync({ id: deleteConfirm.id, analyzerId: id });
    setDeleteConfirm(null);
  };

  const isLoading = analyzerLoading || mappingsLoading || testsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analyzer) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Analyzer not found</p>
        <Button variant="outline" onClick={() => navigate("/app/lab/analyzers")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Analyzers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/app/lab/analyzers")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Test Mapping</h1>
            <p className="text-muted-foreground">
              {analyzer.name} • {analyzer.manufacturer} {analyzer.model}
            </p>
          </div>
        </div>
        <Badge variant={analyzer.is_active ? "default" : "secondary"}>
          {analyzer.is_active ? "Active" : "Inactive"}
        </Badge>
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Tests Panel */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Available Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and filter */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Test list */}
            <div className="border rounded-md max-h-[400px] overflow-y-auto">
              {availableTests.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  {searchQuery || categoryFilter !== "all"
                    ? "No matching tests found"
                    : "All tests have been mapped"}
                </div>
              ) : (
                <div className="divide-y">
                  {availableTests.map((test) => (
                    <label
                      key={test.id}
                      className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedTests.has(test.id)}
                        onCheckedChange={(checked) =>
                          handleTestSelect(test.id, checked as boolean)
                        }
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{test.test_name}</p>
                        <p className="text-sm text-muted-foreground">{test.test_category}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Add button */}
            <Button
              onClick={handleOpenAddDialog}
              disabled={selectedTests.size === 0}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Selected ({selectedTests.size})
            </Button>
          </CardContent>
        </Card>

        {/* Mapped Tests Panel */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              Mapped Tests ({mappings?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!mappings || mappings.length === 0 ? (
              <div className="border rounded-md p-8 text-center text-muted-foreground">
                <p>No tests mapped yet</p>
                <p className="text-sm mt-1">
                  Select tests from the left panel and add them with analyzer codes
                </p>
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Analyzer Code</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mappings.map((mapping) => (
                      <TableRow key={mapping.id}>
                        <TableCell className="font-medium">
                          {mapping.lab_test_template?.test_name || "Unknown Test"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {mapping.lab_test_template?.test_category || "-"}
                        </TableCell>
                        <TableCell>
                          <code className="bg-muted px-2 py-1 rounded text-sm">
                            {mapping.analyzer_test_code}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setDeleteConfirm({
                                id: mapping.id,
                                name: mapping.lab_test_template?.test_name || "this mapping",
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Mappings Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Test Mappings</DialogTitle>
            <DialogDescription>
              Enter the analyzer code for each test. This code is used by the analyzer to
              identify the test.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[400px] overflow-y-auto py-4">
            {bulkMappings.map((mapping) => (
              <div key={mapping.testId} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <Label className="font-medium truncate block">{mapping.testName}</Label>
                </div>
                <Input
                  placeholder="Analyzer code"
                  value={mapping.code}
                  onChange={(e) => updateMappingCode(mapping.testId, e.target.value)}
                  className="w-[150px]"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setBulkMappings((prev) => prev.filter((m) => m.testId !== mapping.testId));
                    setSelectedTests((prev) => {
                      const newSet = new Set(prev);
                      newSet.delete(mapping.testId);
                      return newSet;
                    });
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitMappings}
              disabled={
                bulkCreate.isPending ||
                bulkMappings.filter((m) => m.code.trim()).length === 0
              }
            >
              {bulkCreate.isPending ? "Adding..." : "Add Mappings"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Test Mapping?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the mapping for "{deleteConfirm?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMapping}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMapping.isPending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
