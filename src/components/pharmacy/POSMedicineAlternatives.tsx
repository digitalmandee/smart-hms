import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAIChat } from "@/hooks/useAIChat";
import { Sparkles, Search, Loader2, RefreshCw, ChevronDown } from "lucide-react";

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
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full flex items-center justify-between px-3 py-2 h-auto text-sm font-medium hover:bg-muted/50"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>AI Medicine Alternatives</span>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="px-3 pb-3 space-y-2">
        {/* Search input + toggle */}
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
            Show Salt Composition
          </Label>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-2 justify-center">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Finding alternatives...
          </div>
        )}

        {/* Salt badge */}
        {saltInfo && (
          <Badge variant="secondary" className="text-xs font-normal w-full justify-center py-1">
            {saltInfo}
          </Badge>
        )}

        {/* Results */}
        {results && results.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {results.map((name, i) => (
              <Badge
                key={i}
                variant="outline"
                className="text-xs cursor-default hover:bg-muted/50"
              >
                {name}
              </Badge>
            ))}
          </div>
        )}

        {/* Fallback text */}
        {searched && !isLoading && !results && lastAssistant?.content && (
          <p className="text-xs text-muted-foreground text-center py-1">
            {lastAssistant.content.slice(0, 150)}
          </p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
