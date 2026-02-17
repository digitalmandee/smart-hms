import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAIChat } from "@/hooks/useAIChat";
import { DoctorAvatar } from "@/components/ai/DoctorAvatar";
import { Search, RefreshCw, ChevronDown, FlaskConical } from "lucide-react";

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
    mode: "pharmacy_lookup",
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

  // Parse results from assistant message via useEffect (not in render)
  useEffect(() => {
    if (isLoading || !searched) return;
    const lastAssistant = messages.filter((m) => m.role === "assistant").pop();
    if (!lastAssistant?.content || results !== null) return;

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
      // Parse failed — fallback text will show
    }
  }, [messages, isLoading, searched, showSalt, results]);

  const handleReset = () => {
    setQuery("");
    setResults(null);
    setSaltInfo(null);
    setSearched(false);
    clearChat();
  };

  const lastAssistant = messages.filter((m) => m.role === "assistant").pop();

  return (
    <Card className="border-primary/20 bg-primary/5 overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="p-3 cursor-pointer hover:bg-primary/10 transition-colors rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DoctorAvatar size="xs" state={isLoading ? "thinking" : "idle"} />
                <span className="text-sm font-medium">Tabeebi Medicine Check</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="p-3 pt-0 space-y-3">
            {/* Search input */}
            <div className="flex gap-1.5 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="e.g. Panadol, Augmentin..."
                  className="pl-8 h-8 text-xs border-primary/20 focus-visible:ring-primary/30"
                  disabled={isLoading}
                />
              </div>
              <Button
                size="sm"
                onClick={handleSearch}
                disabled={isLoading || !query.trim()}
                className="h-8 px-3 text-xs gap-1"
              >
                <Search className="h-3.5 w-3.5" />
                Search
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

            {/* Loading state — animated avatar + skeletons */}
            {isLoading && (
              <div className="py-4 space-y-3">
                <div className="flex flex-col items-center gap-2">
                  <DoctorAvatar size="sm" state="thinking" />
                  <span className="text-xs font-medium text-primary animate-pulse">
                    Tabeebi is checking...
                  </span>
                </div>
                <div className="space-y-2 px-1">
                  <Skeleton className="h-10 w-full rounded-lg bg-primary/10" />
                  <Skeleton className="h-10 w-full rounded-lg bg-primary/10" style={{ animationDelay: "0.15s" }} />
                  <Skeleton className="h-10 w-3/4 rounded-lg bg-primary/10" style={{ animationDelay: "0.3s" }} />
                </div>
              </div>
            )}

            {/* Salt composition card */}
            {saltInfo && !isLoading && (
              <div className="animate-fade-in">
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <FlaskConical className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Salt Composition</p>
                    <p className="text-xs font-semibold text-primary truncate">{saltInfo}</p>
                  </div>
                </div>
                <Separator className="bg-primary/10 mt-3" />
              </div>
            )}

            {/* Results list — card-style with staggered animation */}
            {results && results.length > 0 && !isLoading && (
              <div className="space-y-1.5">
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide px-1">
                  Alternatives Available
                </p>
                {results.map((name, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg border border-primary/10 bg-background hover:bg-primary/5 hover:border-primary/25 hover:-translate-y-0.5 transition-all duration-200 animate-fade-in"
                    style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-primary/80 to-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center shadow-sm">
                      {i + 1}
                    </span>
                    <span className="text-xs font-medium">{name}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Fallback text when parsing failed */}
            {searched && !isLoading && !results && lastAssistant?.content && (
              <div className="animate-fade-in p-2.5 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground">
                  {lastAssistant.content.slice(0, 200)}
                </p>
              </div>
            )}

            {/* Empty state */}
            {!searched && !isLoading && (
              <div className="flex flex-col items-center gap-2 py-3">
                <DoctorAvatar size="xs" state="idle" />
                <p className="text-[10px] text-muted-foreground text-center">
                  Type a medicine name to find alternatives
                </p>
              </div>
            )}

            {/* Powered by Tabeebi */}
            {(results || isLoading) && (
              <p className="text-[9px] text-muted-foreground/50 text-center pt-1">
                Powered by Tabeebi
              </p>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
