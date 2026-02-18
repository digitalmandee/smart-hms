import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCountryConfig } from "@/contexts/CountryConfigContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { Languages, Loader2, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const LANGUAGE_LABELS: Record<string, { label: string; native: string }> = {
  en: { label: "English", native: "English" },
  ar: { label: "Arabic", native: "عربي" },
  ur: { label: "Urdu", native: "اردو" },
};

const ALL_LANGUAGES = ['en', 'ar', 'ur'];

export function LanguageSwitcher({ className }: { className?: string }) {
  const { default_language, supported_languages } = useCountryConfig();
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isSwitching, setIsSwitching] = useState(false);

  if (!profile?.organization_id) return null;

  const switchLanguage = async (lang: string) => {
    if (!profile?.organization_id || isSwitching || lang === default_language) return;
    setIsSwitching(true);
    try {
      const newSupported = supported_languages?.includes(lang)
        ? supported_languages
        : [...(supported_languages || ['en']), lang];
      await supabase.rpc("set_org_language", {
        p_language: lang,
        p_supported_languages: newSupported,
      } as any);
      await queryClient.refetchQueries({ queryKey: ["country-config", profile.organization_id] });
    } finally {
      setIsSwitching(false);
    }
  };

  const currentLang = LANGUAGE_LABELS[default_language] ?? { label: default_language, native: default_language };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={isSwitching}
          className={cn("gap-1.5 font-medium", className)}
        >
          {isSwitching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Languages className="h-4 w-4" />
          )}
          <span className="text-sm">{currentLang.native}</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px] bg-popover">
        {ALL_LANGUAGES.map((lang) => {
          const info = LANGUAGE_LABELS[lang] ?? { label: lang, native: lang };
          const isActive = lang === default_language;
          return (
            <DropdownMenuItem
              key={lang}
              onClick={() => switchLanguage(lang)}
              className="flex items-center justify-between gap-3 cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium">{info.native}</span>
                <span className="text-xs text-muted-foreground">{info.label}</span>
              </div>
              {isActive && <Check className="h-4 w-4 text-primary shrink-0" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
