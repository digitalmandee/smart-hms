import { useState, useCallback, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useAIChat } from "@/hooks/useAIChat";
import { Search, ArrowRight, RefreshCw, Check, Pencil } from "lucide-react";
import { DoctorAvatar } from "@/components/ai/DoctorAvatar";

interface Alternative {
  name: string;
  generic_name?: string;
  type: string;
  note?: string;
}

interface MedicineAlternativesProps {
  onSelectAlternative?: (medicineName: string) => void;
}

export function MedicineAlternatives({ onSelectAlternative }: MedicineAlternativesProps) {
  const [query, setQuery] = useState("");
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [searched, setSearched] = useState(false);
  const [searchPhase, setSearchPhase] = useState<"correct" | "alternatives">("correct");
  const [correctedName, setCorrectedName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, isLoading, sendMessage, clearChat } = useAIChat({
    mode: "doctor_assist",
  });

  const handleSearch = useCallback(async () => {
    if (!query.trim() || isLoading) return;
    setAlternatives([]);
    setSearched(true);
    setCorrectedName(null);
    setSearchPhase("correct");

    await sendMessage(
      `Correct this medicine name to the closest real medicine: "${query.trim()}". Return ONLY the corrected name, nothing else.`
    );
  }, [query, isLoading, sendMessage]);

  const handleConfirmCorrection = useCallback(async () => {
    if (!correctedName || isLoading) return;
    setQuery(correctedName);
    setSearchPhase("alternatives");
    setAlternatives([]);

    await sendMessage(
      `List alternatives for the medicine "${correctedName}". Return ONLY a JSON array with objects: {"name":"Brand Name","generic_name":"Generic","type":"generic|brand|therapeutic","note":"optional note"}. Include the generic equivalent and 3-4 brand alternatives available in Pakistan. No other text.`
    );
  }, [correctedName, isLoading, sendMessage]);

  const handleEditCorrection = useCallback(() => {
    setCorrectedName(null);
    setSearchPhase("correct");
    setSearched(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  // Parse AI response based on phase
  useEffect(() => {
    if (isLoading || !searched) return;
    const lastAssistant = messages.filter((m) => m.role === "assistant").pop();
    if (!lastAssistant?.content) return;

    if (searchPhase === "correct" && correctedName === null) {
      const cleaned = lastAssistant.content.trim().replace(/^["']|["']$/g, "").trim();
      if (cleaned) {
        if (cleaned.toLowerCase() === query.trim().toLowerCase()) {
          // Exact match — skip confirmation
          setCorrectedName(cleaned);
          setSearchPhase("alternatives");
          setAlternatives([]);
          sendMessage(
            `List alternatives for the medicine "${cleaned}". Return ONLY a JSON array with objects: {"name":"Brand Name","generic_name":"Generic","type":"generic|brand|therapeutic","note":"optional note"}. Include the generic equivalent and 3-4 brand alternatives available in Pakistan. No other text.`
          );
        } else {
          setCorrectedName(cleaned);
        }
      }
    } else if (searchPhase === "alternatives" && alternatives.length === 0) {
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
  }, [messages, isLoading, searched, searchPhase, correctedName, alternatives.length]);

  const handleReset = () => {
    setQuery("");
    setAlternatives([]);
    setSearched(false);
    setCorrectedName(null);
    setSearchPhase("correct");
    clearChat();
  };

  const typeColor: Record<string, string> = {
    generic: "bg-blue-100 text-blue-700 border-blue-200",
    brand: "bg-green-100 text-green-700 border-green-200",
    therapeutic: "bg-purple-100 text-purple-700 border-purple-200",
  };

  const lastAssistant = messages.filter((m) => m.role === "assistant").pop();

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-2 p-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <DoctorAvatar size="xs" state={isLoading ? "thinking" : "idle"} />
          Tabeebi Medicine Alternatives
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-3 pt-0">
        {/* Search input */}
        <div className="flex gap-1.5 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="e.g. Augmentin, pana, brufen..."
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

        {/* "Did you mean?" confirmation */}
        {correctedName && searchPhase === "correct" && !isLoading && (
          <div className="animate-fade-in flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-primary/30 bg-primary/5">
            <DoctorAvatar size="xs" state="idle" />
            <p className="flex-1 text-xs">
              Did you mean <span className="font-semibold text-primary">{correctedName}</span>?
            </p>
            <Button size="sm" onClick={handleConfirmCorrection} className="h-7 w-7 p-0 rounded-full" title="Confirm">
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleEditCorrection} className="h-7 w-7 p-0 rounded-full" title="Edit">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {/* Loading */}
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

        {/* Results */}
        {alternatives.length > 0 && !isLoading && (
          <ScrollArea className="max-h-[220px]">
            <div className="space-y-1.5">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide px-1">
                Alternatives Available
              </p>
              {alternatives.map((alt, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-primary/10 bg-background text-sm hover:bg-primary/5 hover:border-primary/25 transition-all animate-fade-in"
                  style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-primary/80 to-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center shadow-sm">
                        {i + 1}
                      </span>
                      <span className="font-medium truncate text-xs">{alt.name}</span>
                      <Badge variant="outline" className={`text-[10px] ${typeColor[alt.type] || ""}`}>
                        {alt.type}
                      </Badge>
                    </div>
                    {alt.generic_name && (
                      <p className="text-[10px] text-muted-foreground truncate ml-8">{alt.generic_name}</p>
                    )}
                    {alt.note && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 ml-8">{alt.note}</p>
                    )}
                  </div>
                  {onSelectAlternative && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[10px] shrink-0 ml-2 gap-1 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                      onClick={() => onSelectAlternative(alt.name)}
                    >
                      Use <ArrowRight className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Fallback text */}
        {searched && !isLoading && alternatives.length === 0 && searchPhase === "alternatives" && lastAssistant?.content && (
          <p className="text-xs text-muted-foreground text-center py-2">
            {lastAssistant.content.slice(0, 200)}
          </p>
        )}

        {/* Empty state */}
        {!searched && (
          <p className="text-xs text-muted-foreground text-center py-2">
            Search for a medicine to see generic equivalents and brand alternatives
            <span className="block text-[9px] text-muted-foreground/60 mt-1">Powered by Tabeebi</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
