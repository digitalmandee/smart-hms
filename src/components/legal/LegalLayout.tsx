import { useState, ReactNode } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export type LegalLang = "en" | "ur" | "ar";

interface LegalLayoutProps {
  titleByLang: Record<LegalLang, string>;
  taglineByLang: Record<LegalLang, string>;
  lastUpdated: string; // ISO date
  children: (lang: LegalLang, dir: "ltr" | "rtl") => ReactNode;
}

const LANG_LABELS: Record<LegalLang, string> = {
  en: "English",
  ur: "اردو",
  ar: "العربية",
};

const LAST_UPDATED_LABEL: Record<LegalLang, string> = {
  en: "Last updated",
  ur: "آخری تازہ کاری",
  ar: "آخر تحديث",
};

export const LegalLayout = ({ titleByLang, taglineByLang, lastUpdated, children }: LegalLayoutProps) => {
  const [lang, setLang] = useState<LegalLang>("en");
  const dir = lang === "en" ? "ltr" : "rtl";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto max-w-4xl px-4">
          {/* Language switcher */}
          <div className="flex justify-end mb-6 gap-2">
            {(Object.keys(LANG_LABELS) as LegalLang[]).map((l) => (
              <Button
                key={l}
                variant={lang === l ? "default" : "outline"}
                size="sm"
                onClick={() => setLang(l)}
              >
                {LANG_LABELS[l]}
              </Button>
            ))}
          </div>

          <div dir={dir} className={dir === "rtl" ? "text-right" : "text-left"}>
            <header className="mb-8 pb-6 border-b border-border">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                {titleByLang[lang]}
              </h1>
              <p className="text-muted-foreground">{taglineByLang[lang]}</p>
              <p className="text-xs text-muted-foreground mt-3">
                {LAST_UPDATED_LABEL[lang]}: {new Date(lastUpdated).toLocaleDateString(
                  lang === "ar" ? "ar" : lang === "ur" ? "ur-PK" : "en-US",
                  { year: "numeric", month: "long", day: "numeric" }
                )}
              </p>
            </header>

            <Card className="p-6 md:p-10 space-y-8 leading-relaxed text-foreground">
              {children(lang, dir)}
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

interface LegalSectionProps {
  heading: string;
  children: ReactNode;
}

export const LegalSection = ({ heading, children }: LegalSectionProps) => (
  <section className="space-y-3">
    <h2 className="text-xl md:text-2xl font-semibold text-foreground">{heading}</h2>
    <div className="text-sm md:text-base text-muted-foreground space-y-3 [&_ul]:list-disc [&_ul]:ps-6 [&_ul]:space-y-1.5 [&_li]:marker:text-primary">
      {children}
    </div>
  </section>
);
