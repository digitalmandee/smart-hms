import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Stethoscope, Plus, X } from "lucide-react";
import { useConfigSymptoms } from "@/hooks/useClinicConfig";

interface SymptomsInputProps {
  symptoms: string[];
  onChange: (symptoms: string[]) => void;
  readOnly?: boolean;
}

export function SymptomsInput({ symptoms, onChange, readOnly = false }: SymptomsInputProps) {
  const [inputValue, setInputValue] = useState("");
  const { data: COMMON_SYMPTOMS = [] } = useConfigSymptoms();

  const addSymptom = (symptom: string) => {
    const trimmed = symptom.trim();
    if (trimmed && !symptoms.includes(trimmed)) {
      onChange([...symptoms, trimmed]);
    }
    setInputValue("");
  };

  const removeSymptom = (symptom: string) => {
    onChange(symptoms.filter((s) => s !== symptom));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSymptom(inputValue);
    }
  };

  const availableSuggestions = COMMON_SYMPTOMS.filter(
    (s) => !symptoms.includes(s) && s.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-primary" />
          Symptoms
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Current Symptoms */}
        <div className="flex flex-wrap gap-2 min-h-[40px]">
          {symptoms.length === 0 ? (
            <p className="text-sm text-muted-foreground">No symptoms added</p>
          ) : (
            symptoms.map((symptom) => (
              <Badge key={symptom} variant="secondary" className="gap-1 pr-1">
                {symptom}
                {!readOnly && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 hover:bg-transparent"
                    onClick={() => removeSymptom(symptom)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </Badge>
            ))
          )}
        </div>

        {!readOnly && (
          <>
            {/* Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Type symptom and press Enter..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button
                onClick={() => addSymptom(inputValue)}
                disabled={!inputValue.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Suggestions */}
            {(inputValue.length > 0 || symptoms.length === 0) && (
              <div>
                <Label className="text-xs text-muted-foreground">Quick add:</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {availableSuggestions.slice(0, 8).map((symptom) => (
                    <Button
                      key={symptom}
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => addSymptom(symptom)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {symptom}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
