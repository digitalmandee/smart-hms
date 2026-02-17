import { useState, useCallback, useEffect, useRef } from "react";
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
import { Search, RefreshCw, ChevronDown, FlaskConical, Plus, Package, Check, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CartItem } from "@/hooks/usePOS";
import { StockLevelBadge } from "./StockLevelBadge";

interface SaltResult {
  salt: string;
  alternatives: string[];
}

interface InventoryMatch {
  id: string;
  medicine_id: string;
  medicine_name: string;
  batch_number: string | null;
  quantity: number;
  selling_price: number;
  reorder_level: number;
}

interface POSMedicineAlternativesProps {
  onAddToCart?: (item: CartItem) => void;
}

export function POSMedicineAlternatives({ onAddToCart }: POSMedicineAlternativesProps) {
  const [query, setQuery] = useState("");
  const [showSalt, setShowSalt] = useState(false);
  const [results, setResults] = useState<string[] | null>(null);
  const [saltInfo, setSaltInfo] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [inventoryMap, setInventoryMap] = useState<Record<string, InventoryMatch>>({});
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [searchPhase, setSearchPhase] = useState<"correct" | "alternatives">("correct");
  const [correctedName, setCorrectedName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { profile } = useAuth();

  const { messages, isLoading, sendMessage, clearChat } = useAIChat({
    mode: "pharmacy_lookup",
  });

  const handleSearch = useCallback(async () => {
    if (!query.trim() || isLoading) return;
    setResults(null);
    setSaltInfo(null);
    setSearched(true);
    setInventoryMap({});
    setCorrectedName(null);
    setSearchPhase("correct");

    // Step 1: Ask AI to correct the medicine name
    const correctionPrompt = `Correct this medicine name to the closest real medicine: "${query.trim()}". Return ONLY the corrected name, nothing else.`;
    await sendMessage(correctionPrompt);
  }, [query, isLoading, sendMessage]);

  const handleConfirmCorrection = useCallback(async () => {
    if (!correctedName || isLoading) return;
    setQuery(correctedName);
    setSearchPhase("alternatives");
    setResults(null);
    setSaltInfo(null);

    const prompt = showSalt
      ? `For medicine "${correctedName}": return JSON {"salt":"generic/salt composition with strength","alternatives":["Brand1","Brand2","Brand3","Brand4","Brand5"]}. Include 5 alternatives available in Pakistan. No other text.`
      : `List 5 alternative brand names for "${correctedName}" available in Pakistan. Return ONLY a JSON array of strings. No explanation.`;

    await sendMessage(prompt);
  }, [correctedName, isLoading, sendMessage, showSalt]);

  const handleEditCorrection = useCallback(() => {
    setCorrectedName(null);
    setSearchPhase("correct");
    setSearched(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  // Parse AI response based on searchPhase
  useEffect(() => {
    if (isLoading || !searched) return;
    const lastAssistant = messages.filter((m) => m.role === "assistant").pop();
    if (!lastAssistant?.content) return;

    if (searchPhase === "correct" && correctedName === null) {
      // Extract corrected name (plain text response)
      const cleaned = lastAssistant.content.trim().replace(/^["']|["']$/g, "").trim();
      if (cleaned) {
        // If corrected name matches query, skip confirmation and go straight to alternatives
        if (cleaned.toLowerCase() === query.trim().toLowerCase()) {
          setCorrectedName(cleaned);
          // Auto-proceed
          setSearchPhase("alternatives");
          setResults(null);
          setSaltInfo(null);
          const prompt = showSalt
            ? `For medicine "${cleaned}": return JSON {"salt":"generic/salt composition with strength","alternatives":["Brand1","Brand2","Brand3","Brand4","Brand5"]}. Include 5 alternatives available in Pakistan. No other text.`
            : `List 5 alternative brand names for "${cleaned}" available in Pakistan. Return ONLY a JSON array of strings. No explanation.`;
          sendMessage(prompt);
        } else {
          setCorrectedName(cleaned);
        }
      }
    } else if (searchPhase === "alternatives" && results === null) {
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
    }
  }, [messages, isLoading, searched, showSalt, results, searchPhase, correctedName]);

  // Inventory lookup after results are parsed
  useEffect(() => {
    if (!results || results.length === 0 || !profile?.branch_id) return;

    const lookupInventory = async () => {
      setLoadingInventory(true);
      try {
        // Step 1: Find medicines by name (fuzzy match)
        const nameFilter = results
          .map((name) => `name.ilike.%${name.replace(/[%_]/g, "")}%`)
          .join(",");

        const { data: medicines } = await supabase
          .from("medicines")
          .select("id, name")
          .or(nameFilter);

        if (!medicines || medicines.length === 0) {
          setInventoryMap({});
          setLoadingInventory(false);
          return;
        }

        // Step 2: Get inventory for matched medicine IDs at this branch
        const medicineIds = medicines.map((m) => m.id);
        const { data: inventory } = await supabase
          .from("medicine_inventory")
          .select("id, medicine_id, quantity, batch_number, selling_price, reorder_level")
          .eq("branch_id", profile.branch_id)
          .in("medicine_id", medicineIds)
          .gt("quantity", 0)
          .order("quantity", { ascending: false });

        if (inventory) {
          // Build a medicine_id -> medicine name map
          const medNameMap: Record<string, string> = {};
          for (const m of medicines) {
            medNameMap[m.id] = m.name;
          }

          const map: Record<string, InventoryMatch> = {};
          for (const item of inventory) {
            const medName = medNameMap[item.medicine_id] || "";
            // Match against each result name (case-insensitive)
            for (const resultName of results) {
              const normalizedResult = resultName.toLowerCase().trim();
              const normalizedMed = medName.toLowerCase().trim();
              if (
                normalizedMed.includes(normalizedResult) ||
                normalizedResult.includes(normalizedMed)
              ) {
                if (!map[resultName] || item.quantity > (map[resultName]?.quantity || 0)) {
                  map[resultName] = {
                    id: item.id,
                    medicine_id: item.medicine_id,
                    medicine_name: medName,
                    batch_number: item.batch_number,
                    quantity: item.quantity,
                    selling_price: item.selling_price || 0,
                    reorder_level: item.reorder_level || 10,
                  };
                }
              }
            }
          }
          setInventoryMap(map);
        }
      } catch (err) {
        console.error("Inventory lookup failed:", err);
      } finally {
        setLoadingInventory(false);
      }
    };

    lookupInventory();
  }, [results, profile?.branch_id]);

  const handleAddItem = (name: string) => {
    const match = inventoryMap[name];
    if (!match || !onAddToCart) return;

    const cartItem: CartItem = {
      id: crypto.randomUUID(),
      inventory_id: match.id,
      medicine_id: match.medicine_id,
      medicine_name: match.medicine_name,
      batch_number: match.batch_number,
      quantity: 1,
      unit_price: match.selling_price,
      selling_price: match.selling_price,
      available_quantity: match.quantity,
      discount_percent: 0,
      tax_percent: 0,
    };

    onAddToCart(cartItem);
  };

  const handleReset = () => {
    setQuery("");
    setResults(null);
    setSaltInfo(null);
    setSearched(false);
    setInventoryMap({});
    setCorrectedName(null);
    setSearchPhase("correct");
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
                  ref={inputRef}
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

            {/* "Did you mean?" confirmation strip */}
            {correctedName && searchPhase === "correct" && !isLoading && (
              <div className="animate-fade-in flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-primary/30 bg-primary/5">
                <DoctorAvatar size="xs" state="idle" />
                <p className="flex-1 text-xs">
                  Did you mean <span className="font-semibold text-primary">{correctedName}</span>?
                </p>
                <Button
                  size="sm"
                  onClick={handleConfirmCorrection}
                  className="h-7 w-7 p-0 rounded-full"
                  title="Confirm"
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleEditCorrection}
                  className="h-7 w-7 p-0 rounded-full"
                  title="Edit"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}

            {/* Loading state */}
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

            {/* Results list with stock info */}
            {results && results.length > 0 && !isLoading && (
              <div className="space-y-1.5">
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide px-1">
                  Alternatives Available
                </p>
                {results.map((name, i) => {
                  const match = inventoryMap[name];
                  const inStock = !!match && match.quantity > 0;

                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg border transition-all duration-200 animate-fade-in ${
                        inStock
                          ? "border-primary/10 bg-background hover:bg-primary/5 hover:border-primary/25 hover:-translate-y-0.5"
                          : "border-border/50 bg-muted/30 opacity-60"
                      }`}
                      style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
                    >
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-primary/80 to-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center shadow-sm">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-medium block">{name}</span>
                        {loadingInventory ? (
                          <Skeleton className="h-3 w-16 mt-0.5 bg-primary/10" />
                        ) : inStock ? (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Package className="h-3 w-3 text-green-600" />
                            <span className="text-[10px] text-green-600 font-medium">
                              In Stock ({match.quantity})
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">Not in inventory</span>
                        )}
                      </div>
                      {inStock && onAddToCart && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddItem(name)}
                          className="h-7 px-2 text-[10px] gap-1 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                        >
                          <Plus className="h-3 w-3" />
                          Add
                        </Button>
                      )}
                    </div>
                  );
                })}
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
