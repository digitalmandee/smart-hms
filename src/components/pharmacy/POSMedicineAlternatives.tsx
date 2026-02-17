import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAIChat } from "@/hooks/useAIChat";
import { DoctorAvatar } from "@/components/ai/DoctorAvatar";
import { Search, Loader2, RefreshCw, ChevronDown } from "lucide-react";

interface SaltResult {
  salt: string;
  alternatives: string[];
}

export function POSMedicineAlternatives() {
  const [query, setQuery] = useState("");
  const [showSalt, setShowSalt] = useState(false);
  const [results, setResults] = useState<string[] | null>(null);
  const [saltInfo, setSaltInfo] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const { messages, isLoading, sendMessage, clearChat } = useAIChat({
    mode: "doctor_assist",
  });

  const handleSearch = useCallback(async () => {
    if (!query.trim() || isLoading) return;
    setResults(null);
    setSaltInfo(null);
    setSearched(true);

    const prompt = showSalt
      ? `For medicine "${query.trim()}": return JSON {"salt":"generic/salt composition with strength","alternatives":["Brand1","Brand2","Brand3","Brand4","Brand5"]}. Include 5 alternatives available in Pakistan. No other text.`
      : `List 5 alternative brand names for "${query.trim()}" available in Pakistan. Return ONLY a JSON array of strings. No explanation.`;

    await sendMessage(prompt);
  }, [query, isLoading, sendMessage, showSalt]);

  // Parse results from last assistant message
  const lastAssistant = messages.filter((m) => m.role === "assistant").pop();
  if (lastAssistant?.content && searched && !isLoading && results === null) {
    try {
      if (showSalt) {
        const objMatch = lastAssistant.content.match(/\{[\s\S]*\}/);
        if (objMatch) {
          const parsed = JSON.parse(objMatch[0]) as SaltResult;
          if (parsed.salt && Array.isArray(parsed.alternatives)) {
            setSaltInfo(parsed.salt);
            setResults(parsed.alternatives);
          }
        }
      } else {
        const arrMatch = lastAssistant.content.match(/\[[\s\S]*\]/);
        if (arrMatch) {
          const parsed = JSON.parse(arrMatch[0]) as string[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            setResults(parsed);
          }
        }
      }
    } catch {
      // Parse failed
    }
  }

  const handleReset = () => {
    setQuery("");
    setResults(null);
    setSaltInfo(null);
    setSearched(false);
    clearChat();
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="p-3 cursor-pointer hover:bg-primary/10 transition-colors rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DoctorAvatar size="xs" state={isLoading ? "thinking" : "idle"} />
                <span className="text-sm font-medium">Tabeebi Medicine Check</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="p-3 pt-0 space-y-2.5">
            {/* Search input */}
            <div className="flex gap-1.5 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="e.g. Panadol"
                  className="pl-7 h-8 text-xs"
                  disabled={isLoading}
                />
              </div>
              <Button
                size="sm"
                onClick={handleSearch}
                disabled={isLoading || !query.trim()}
                className="h-8 w-8 p-0"
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Search className="h-3.5 w-3.5" />
                )}
              </Button>
              {searched && (
                <Button size="sm" variant="ghost" onClick={handleReset} className="h-8 w-8 p-0">
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            {/* Salt toggle */}
            <div className="flex items-center gap-2">
              <Switch
                id="salt-toggle"
                checked={showSalt}
                onCheckedChange={(v) => {
                  setShowSalt(v);
                  if (searched) handleReset();
                }}
                className="scale-75 origin-left"
              />
              <Label htmlFor="salt-toggle" className="text-xs text-muted-foreground cursor-pointer">
                Include Salt/Generic Info
              </Label>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-primary py-2 justify-center">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Tabeebi is checking...
              </div>
            )}

            {/* Salt badge */}
            {saltInfo && (
              <>
                <Badge variant="outline" className="text-xs font-normal w-full justify-center py-1.5 bg-primary/10 text-primary border-primary/20">
                  {saltInfo}
                </Badge>
                <Separator className="bg-primary/10" />
              </>
            )}

            {/* Results */}
            {results && results.length > 0 && (
              <div className="space-y-1">
                {results.map((name, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-primary/10 transition-colors"
                  >
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-semibold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="font-medium">{name}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Fallback text */}
            {searched && !isLoading && !results && lastAssistant?.content && (
              <p className="text-xs text-muted-foreground text-center py-1">
                {lastAssistant.content.slice(0, 150)}
              </p>
            )}

            {/* Empty state */}
            {!searched && !isLoading && (
              <p className="text-[10px] text-muted-foreground text-center py-1">
                Type a medicine name to find alternatives
              </p>
            )}

            {/* Powered by */}
            {(results || isLoading) && (
              <p className="text-[9px] text-muted-foreground/60 text-center pt-1">
                Powered by Tabeebi
              </p>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
