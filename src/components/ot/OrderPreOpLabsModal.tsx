import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { FlaskConical, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/currency";

interface OrderPreOpLabsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrder: (tests: PreOpLabTest[], priority: string, notes: string) => void;
  isLoading?: boolean;
  patientName?: string;
}

export interface PreOpLabTest {
  id: string;
  name: string;
  category: string;
  required: boolean;
  price: number;
  service_type_id: string;
}

// Common pre-op test names for marking as "required" in the UI
const REQUIRED_TEST_PATTERNS = [
  'cbc', 'complete blood count', 'blood group', 'rh typing',
  'pt', 'inr', 'blood sugar', 'creatinine', 'random blood sugar'
];

function usePreOpLabTests() {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['preop-lab-tests', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      // Fetch lab tests from service_types with lab category
      const { data: categoryData } = await supabase
        .from('service_categories')
        .select('id')
        .eq('organization_id', profile.organization_id)
        .eq('code', 'lab')
        .maybeSingle();
      
      if (!categoryData) return [];
      
      const { data, error } = await supabase
        .from('service_types')
        .select('id, name, default_price, category_id')
        .eq('organization_id', profile.organization_id)
        .eq('category_id', categoryData.id)
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      
      return (data || []).map(test => ({
        id: test.id,
        name: test.name,
        category: 'lab',
        price: test.default_price || 0,
        service_type_id: test.id,
        required: REQUIRED_TEST_PATTERNS.some(pattern => 
          test.name.toLowerCase().includes(pattern)
        ),
      })) as PreOpLabTest[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function OrderPreOpLabsModal({ 
  open, 
  onOpenChange, 
  onOrder, 
  isLoading,
  patientName 
}: OrderPreOpLabsModalProps) {
  const { data: labTests, isLoading: testsLoading } = usePreOpLabTests();
  const [selectedTests, setSelectedTests] = useState<Set<string>>(new Set());
  const [priority, setPriority] = useState('routine');
  const [clinicalNotes, setClinicalNotes] = useState('Pre-operative workup');

  const allTests = labTests || [];
  const requiredTests = useMemo(() => allTests.filter(t => t.required), [allTests]);

  // Calculate total price of selected tests
  const selectedTotal = useMemo(() => {
    return allTests
      .filter(test => selectedTests.has(test.id))
      .reduce((sum, test) => sum + (test.price || 0), 0);
  }, [allTests, selectedTests]);

  const handleSelectAll = () => {
    const newSelected = new Set(selectedTests);
    allTests.forEach(test => newSelected.add(test.id));
    setSelectedTests(newSelected);
  };

  const handleDeselectAll = () => {
    setSelectedTests(new Set());
  };

  const toggleTest = (testId: string) => {
    const newSelected = new Set(selectedTests);
    if (newSelected.has(testId)) {
      newSelected.delete(testId);
    } else {
      newSelected.add(testId);
    }
    setSelectedTests(newSelected);
  };

  const selectRequiredTests = () => {
    const newSelected = new Set(selectedTests);
    requiredTests.forEach(test => newSelected.add(test.id));
    setSelectedTests(newSelected);
  };

  const handleOrder = () => {
    const testsToOrder = allTests.filter(test => selectedTests.has(test.id));
    onOrder(testsToOrder, priority, clinicalNotes);
    setSelectedTests(new Set());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />
            Order Pre-Operative Lab Tests
          </DialogTitle>
          <DialogDescription>
            {patientName && <>For patient: <strong>{patientName}</strong></>}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {testsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : allTests.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No lab tests configured. Please add lab services in Settings.</p>
            </div>
          ) : (
            <>
              {/* Quick Actions */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Button type="button" variant="outline" size="sm" onClick={selectRequiredTests}>
                    Select Common Tests
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={handleSelectAll}>
                    Select All
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={handleDeselectAll}>
                    Clear
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Label>Priority:</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Routine</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="stat">STAT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Summary Bar */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {selectedTests.size} test{selectedTests.size !== 1 ? 's' : ''} selected
                  </Badge>
                </div>
                <div className="font-medium">
                  Total: {formatCurrency(selectedTotal)}
                </div>
              </div>

              {/* Test List */}
              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
                {allTests.map(test => (
                  <div 
                    key={test.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedTests.has(test.id) ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => toggleTest(test.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={test.id}
                        checked={selectedTests.has(test.id)}
                        onCheckedChange={() => toggleTest(test.id)}
                      />
                      <div>
                        <Label htmlFor={test.id} className="cursor-pointer font-normal">
                          {test.name}
                        </Label>
                        {test.required && (
                          <Badge variant="outline" className="ml-2 text-xs">Common</Badge>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(test.price)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Clinical Notes */}
          <div className="space-y-2">
            <Label>Clinical Notes</Label>
            <Textarea
              placeholder="Add clinical notes for the lab..."
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="text-sm text-muted-foreground flex-1">
            {selectedTests.size > 0 && (
              <>Invoice will be created: <strong>{formatCurrency(selectedTotal)}</strong></>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleOrder} 
              disabled={selectedTests.size === 0 || isLoading || testsLoading}
            >
              Order {selectedTests.size} Test{selectedTests.size !== 1 ? 's' : ''}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
