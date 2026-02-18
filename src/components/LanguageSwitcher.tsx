import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCountryConfig } from "@/contexts/CountryConfigContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { Languages, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { default_language, supported_languages } = useCountryConfig();
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isSwitching, setIsSwitching] = useState(false);

  // Only show if org supports Arabic
  if (!supported_languages.includes("ar")) return null;

  const toggleLanguage = async () => {
    if (!profile?.organization_id || isSwitching) return;
    const newLang = default_language === "ar" ? "en" : "ar";
    setIsSwitching(true);
    try {
      await supabase
        .from("organizations")
        .update({ default_language: newLang } as any)
        .eq("id", profile.organization_id);
      // Invalidate so CountryConfigContext refetches
      queryClient.invalidateQueries({ queryKey: ["country-config", profile.organization_id] });
    } finally {
      setIsSwitching(false);
    }
  };

  const isArabic = default_language === "ar";

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      disabled={isSwitching}
      className={cn("gap-2 font-medium", className)}
      title={isArabic ? "Switch to English" : "التبديل إلى العربية"}
    >
      {isSwitching ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Languages className="h-4 w-4" />
      )}
      <span className="text-sm">{isArabic ? "EN" : "ع"}</span>
    </Button>
  );
}
