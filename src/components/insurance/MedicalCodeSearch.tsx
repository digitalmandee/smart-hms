import { useState } from "react";
import { X, Search, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useSearchMedicalCodes, MedicalCode } from "@/hooks/useMedicalCodes";
import { useTranslation } from "@/lib/i18n";

interface MedicalCodeSearchProps {
  codeType: "icd10" | "cpt";
  selectedCodes: string[];
  onCodesChange: (codes: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MedicalCodeSearch({
  codeType,
  selectedCodes,
  onCodesChange,
  placeholder,
  disabled,
}: MedicalCodeSearchProps) {
  const { t, language } = useTranslation();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customCode, setCustomCode] = useState("");
  const { results, isLoading } = useSearchMedicalCodes(searchQuery, codeType);

  const isArabic = language === "ar";

  const handleSelect = (code: string) => {
    if (!selectedCodes.includes(code)) {
      onCodesChange([...selectedCodes, code]);
    }
    setSearchQuery("");
  };

  const handleRemove = (code: string) => {
    onCodesChange(selectedCodes.filter((c) => c !== code));
  };

  const handleAddCustom = () => {
    const trimmed = customCode.trim().toUpperCase();
    if (trimmed && !selectedCodes.includes(trimmed)) {
      onCodesChange([...selectedCodes, trimmed]);
      setCustomCode("");
    }
  };

  const getDescription = (item: MedicalCode) => {
    if (isArabic && item.description_ar) return item.description_ar;
    return item.description;
  };

  const defaultPlaceholder =
    codeType === "icd10"
      ? t("medicalCoding.searchIcd" as any, "Search ICD-10 codes...")
      : t("medicalCoding.searchCpt" as any, "Search CPT codes...");

  return (
    <div className="space-y-2">
      {/* Selected codes as badges */}
      {selectedCodes.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedCodes.map((code) => (
            <Badge
              key={code}
              variant="secondary"
              className="gap-1 pr-1"
            >
              {code}
              <button
                type="button"
                onClick={() => handleRemove(code)}
                className="ml-1 rounded-full hover:bg-muted p-0.5"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search popover */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-start text-muted-foreground font-normal"
            disabled={disabled}
            type="button"
          >
            <Search className="mr-2 h-4 w-4 shrink-0" />
            {placeholder || defaultPlaceholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={placeholder || defaultPlaceholder}
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>
                {isLoading
                  ? t("common.loading")
                  : t("medicalCoding.noCodesFound" as any, "No codes found")}
              </CommandEmpty>
              {results.length > 0 && (
                <CommandGroup>
                  {results.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.code}
                      onSelect={() => handleSelect(item.code)}
                      disabled={selectedCodes.includes(item.code)}
                    >
                      <span className="font-mono font-medium mr-2 text-primary">
                        {item.code}
                      </span>
                      <span className="text-sm text-muted-foreground truncate">
                        {getDescription(item)}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
          {/* Custom code input */}
          <div className="border-t p-2 flex gap-2">
            <Input
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              placeholder={t("medicalCoding.addCustomCode" as any, "Add custom code...")}
              className="h-8 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCustom();
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleAddCustom}
              className="h-8 px-2"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
