import { formatHijriDate, formatDualDate, gregorianToHijri } from "@/lib/hijriCalendar";
import { useCountryConfig } from "@/contexts/CountryConfigContext";
import { cn } from "@/lib/utils";

interface HijriDateDisplayProps {
  date: Date | string;
  showDual?: boolean;
  format?: 'short' | 'long' | 'numeric';
  className?: string;
}

/**
 * Displays dates with Hijri calendar support for KSA
 * Shows dual format (Gregorian + Hijri) when in Saudi Arabia
 */
export function HijriDateDisplay({ 
  date, 
  showDual = true,
  format = 'long',
  className 
}: HijriDateDisplayProps) {
  const { country_code, default_language } = useCountryConfig();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const locale = default_language === 'ar' ? 'ar' : 'en';

  // Only show Hijri for KSA
  if (country_code !== 'SA') {
    return (
      <span className={className}>
        {dateObj.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
          year: 'numeric',
          month: format === 'short' ? 'numeric' : 'short',
          day: 'numeric'
        })}
      </span>
    );
  }

  if (showDual) {
    return (
      <span className={cn("inline-flex flex-col", className)}>
        <span className="text-foreground">
          {formatDualDate(dateObj, locale)}
        </span>
      </span>
    );
  }

  return (
    <span className={className}>
      {formatHijriDate(dateObj, locale, format)} هـ
    </span>
  );
}

interface HijriDateBadgeProps {
  date: Date | string;
  className?: string;
}

/**
 * Compact badge showing current Hijri date
 */
export function HijriDateBadge({ date, className }: HijriDateBadgeProps) {
  const { country_code, default_language } = useCountryConfig();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (country_code !== 'SA') return null;
  
  const hijri = gregorianToHijri(dateObj);
  const locale = default_language === 'ar' ? 'ar' : 'en';
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full",
      "bg-primary/10 text-primary text-xs font-medium",
      className
    )}>
      <span>{formatHijriDate(hijri, locale, 'short')}</span>
      <span className="text-muted-foreground">هـ</span>
    </span>
  );
}
