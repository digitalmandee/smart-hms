import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAIChat } from "@/hooks/useAIChat";
import { Pill, Search, Loader2, ArrowRight, RefreshCw } from "lucide-react";

interface Alternative {
  name: string;
  generic_name?: string;
  type: string; // "generic" | "brand" | "therapeutic"
  note?: string;
}

interface MedicineAlternativesProps {
  onSelectAlternative?: (medicineName: string) => void;
}

export function MedicineAlternatives({ onSelectAlternative }: MedicineAlternativesProps) {
  const [query, setQuery] = useState("");
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [searched, setSearched] = useState(false);

  const { messages, isLoading, sendMessage, clearChat } = useAIChat({
    mode: "doctor_assist",
  });

  const handleSearch = useCallback(async () => {
    if (!query.trim() || isLoading) return;
    setAlternatives([]);
    setSearched(true);
    await sendMessage(
      `List alternatives for the medicine "${query.trim()}". Return ONLY a JSON array with objects: {"name":"Brand Name","generic_name":"Generic","type":"generic|brand|therapeutic","note":"optional note"}. Include the generic equivalent and 3-4 brand alternatives available in Pakistan. No other text.`
    );
  }, [query, isLoading, sendMessage]);

  // Parse alternatives from last assistant response
  const lastAssistant = messages.filter((m) => m.role === "assistant").pop();
  if (lastAssistant?.content && searched && !isLoading && alternatives.length === 0) {
    try {
      const match = lastAssistant.content.match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]) as Alternative[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAlternatives(parsed);
        }
      }
    } catch {
      // Parse failed
    }
  }

  const handleReset = () => {
    setQuery("");
    setAlternatives([]);
    setSearched(false);
    clearChat();
  };

  const typeColor: Record<string, string> = {
    generic: "bg-blue-100 text-blue-700 border-blue-200",
    brand: "bg-green-100 text-green-700 border-green-200",
    therapeutic: "bg-purple-100 text-purple-700 border-purple-200",
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Pill className="h-4 w-4 text-primary" />
          Medicine Alternatives
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="e.g. Augmentin 625mg"
              className="pl-8 h-9 text-sm"
              disabled={isLoading}
            />
          </div>
          <Button size="sm" onClick={handleSearch} disabled={isLoading || !query.trim()} className="h-9">
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
          </Button>
          {searched && (
            <Button size="sm" variant="ghost" onClick={handleReset} className="h-9">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-3 justify-center">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Finding alternatives...
          </div>
        )}

        {alternatives.length > 0 && (
          <ScrollArea className="max-h-[200px]">
            <div className="space-y-2">
              {alternatives.map((alt, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded border text-sm hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{alt.name}</span>
                      <Badge variant="outline" className={`text-[10px] ${typeColor[alt.type] || ""}`}>
                        {alt.type}
                      </Badge>
                    </div>
                    {alt.generic_name && (
                      <p className="text-xs text-muted-foreground truncate">{alt.generic_name}</p>
                    )}
                    {alt.note && (
                      <p className="text-xs text-muted-foreground mt-0.5">{alt.note}</p>
                    )}
                  </div>
                  {onSelectAlternative && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs shrink-0 ml-2"
                      onClick={() => onSelectAlternative(alt.name)}
                    >
                      Use <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {searched && !isLoading && alternatives.length === 0 && lastAssistant?.content && (
          <p className="text-xs text-muted-foreground text-center py-2">
            {lastAssistant.content.slice(0, 200)}
          </p>
        )}

        {!searched && (
          <p className="text-xs text-muted-foreground text-center py-2">
            Search for a medicine to see generic equivalents and brand alternatives
          </p>
        )}
      </CardContent>
    </Card>
  );
}
