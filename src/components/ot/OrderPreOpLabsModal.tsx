import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FlaskConical, AlertCircle } from "lucide-react";

interface OrderPreOpLabsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrder: (tests: PreOpLabTest[], priority: string, notes: string) => void;
  isLoading?: boolean;
  patientName?: string;
}

interface PreOpLabTest {
  id: string;
  name: string;
  category: string;
  required: boolean;
}

const PRE_OP_PANELS: { name: string; tests: PreOpLabTest[] }[] = [
  {
    name: 'Basic Pre-Op Panel',
    tests: [
      { id: 'cbc', name: 'Complete Blood Count (CBC)', category: 'Hematology', required: true },
      { id: 'blood_group', name: 'Blood Group & Rh Typing', category: 'Blood Bank', required: true },
      { id: 'pt_inr', name: 'PT/INR', category: 'Coagulation', required: true },
      { id: 'aptt', name: 'aPTT', category: 'Coagulation', required: false },
      { id: 'rbs', name: 'Random Blood Sugar', category: 'Biochemistry', required: true },
      { id: 'serum_creatinine', name: 'Serum Creatinine', category: 'Biochemistry', required: true },
      { id: 'urea', name: 'Blood Urea', category: 'Biochemistry', required: false },
    ]
  },
  {
    name: 'Extended Pre-Op Panel',
    tests: [
      { id: 'lft', name: 'Liver Function Tests (LFT)', category: 'Biochemistry', required: false },
      { id: 'rft', name: 'Renal Function Tests (RFT)', category: 'Biochemistry', required: false },
      { id: 'electrolytes', name: 'Serum Electrolytes (Na, K, Cl)', category: 'Biochemistry', required: false },
      { id: 'ecg', name: 'ECG', category: 'Cardiology', required: false },
      { id: 'chest_xray', name: 'Chest X-Ray PA View', category: 'Radiology', required: false },
      { id: 'covid', name: 'COVID-19 RT-PCR', category: 'Microbiology', required: false },
    ]
  },
  {
    name: 'Cardiac Surgery Panel',
    tests: [
      { id: 'echo', name: 'Echocardiography', category: 'Cardiology', required: false },
      { id: 'tmt', name: 'TMT / Stress Test', category: 'Cardiology', required: false },
      { id: 'bnp', name: 'BNP / NT-proBNP', category: 'Biochemistry', required: false },
      { id: 'lipid', name: 'Lipid Profile', category: 'Biochemistry', required: false },
    ]
  }
];

export function OrderPreOpLabsModal({ 
  open, 
  onOpenChange, 
  onOrder, 
  isLoading,
  patientName 
}: OrderPreOpLabsModalProps) {
  const [selectedTests, setSelectedTests] = useState<Set<string>>(new Set());
  const [priority, setPriority] = useState('routine');
  const [clinicalNotes, setClinicalNotes] = useState('Pre-operative workup');

  const allTests = PRE_OP_PANELS.flatMap(panel => panel.tests);
  const requiredTests = allTests.filter(t => t.required);

  const handleSelectAll = (panelTests: PreOpLabTest[]) => {
    const newSelected = new Set(selectedTests);
    panelTests.forEach(test => newSelected.add(test.id));
    setSelectedTests(newSelected);
  };

  const handleDeselectAll = (panelTests: PreOpLabTest[]) => {
    const newSelected = new Set(selectedTests);
    panelTests.forEach(test => newSelected.delete(test.id));
    setSelectedTests(newSelected);
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
          {/* Quick Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={selectRequiredTests}>
                Select Required Tests
              </Button>
              <Badge variant="outline">
                {selectedTests.size} tests selected
              </Badge>
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

          {/* Test Panels */}
          {PRE_OP_PANELS.map(panel => (
            <div key={panel.name} className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{panel.name}</h4>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleSelectAll(panel.tests)}
                  >
                    Select All
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeselectAll(panel.tests)}
                  >
                    Clear
                  </Button>
                </div>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {panel.tests.map(test => (
                  <div 
                    key={test.id}
                    className={`flex items-center space-x-3 p-2 rounded-lg border ${
                      selectedTests.has(test.id) ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <Checkbox
                      id={test.id}
                      checked={selectedTests.has(test.id)}
                      onCheckedChange={() => toggleTest(test.id)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={test.id} className="cursor-pointer font-normal">
                        {test.name}
                      </Label>
                      <p className="text-xs text-muted-foreground">{test.category}</p>
                    </div>
                    {test.required && (
                      <Badge variant="secondary" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

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

          {/* Warning if required tests not selected */}
          {requiredTests.some(t => !selectedTests.has(t.id)) && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium">Some required tests are not selected</p>
                <p className="text-amber-700">
                  Consider adding: {requiredTests.filter(t => !selectedTests.has(t.id)).map(t => t.name).join(', ')}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleOrder} 
            disabled={selectedTests.size === 0 || isLoading}
          >
            Order {selectedTests.size} Test{selectedTests.size !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
