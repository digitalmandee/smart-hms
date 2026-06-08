import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Lang = "en" | "ur" | "ar";
const STORAGE_KEY = "ho24_cookie_consent_v1";

const COPY: Record<Lang, {
  title: string; body: string; accept: string; reject: string; learn: string; dir: "ltr" | "rtl";
}> = {
  en: {
    title: "We value your privacy",
    body: "We use strictly necessary cookies to run the platform, and optional analytics cookies to improve it. You can accept or reject the optional ones.",
    accept: "Accept all",
    reject: "Reject optional",
    learn: "Cookie Policy",
    dir: "ltr",
  },
  ur: {
    title: "ہم آپ کی پرائیویسی کی قدر کرتے ہیں",
    body: "ہم پلیٹ فارم چلانے کے لیے لازمی کوکیز اور اسے بہتر بنانے کے لیے اختیاری تجزیاتی کوکیز استعمال کرتے ہیں۔",
    accept: "سب قبول کریں",
    reject: "اختیاری مسترد کریں",
    learn: "کوکی پالیسی",
    dir: "rtl",
  },
  ar: {
    title: "نحن نقدر خصوصيتك",
    body: "نستخدم ملفات تعريف الارتباط الضرورية لتشغيل المنصة وملفات اختيارية للتحليلات لتحسينها.",
    accept: "قبول الكل",
    reject: "رفض الاختياري",
    learn: "سياسة ملفات تعريف الارتباط",
    dir: "rtl",
  },
};

function detectLang(): Lang {
  try {
    const fromStorage = localStorage.getItem("org_default_language");
    if (fromStorage === "ur" || fromStorage === "ar" || fromStorage === "en") return fromStorage;
    const nav = (navigator.language || "en").slice(0, 2);
    if (nav === "ur") return "ur";
    if (nav === "ar") return "ar";
  } catch {
    /* ignore */
  }
  return "en";
}

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      if (!existing) {
        setLang(detectLang());
        setVisible(true);
      }
    } catch {
      /* storage unavailable */
    }
  }, []);

  const persist = (choice: "all" | "essential") => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ choice, ts: new Date().toISOString() })
      );
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;
  const c = COPY[lang];

  return (
    <div
      dir={c.dir}
      role="dialog"
      aria-label={c.title}
      className="fixed bottom-0 inset-x-0 z-[70] p-3 sm:p-4 pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto max-w-3xl rounded-lg border border-border bg-card/95 backdrop-blur shadow-lg p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <Cookie className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-foreground">{c.title}</h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              {c.body}{" "}
              <Link to="/cookies" className="underline text-primary hover:text-primary/80">
                {c.learn}
              </Link>
              .
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => persist("all")}>{c.accept}</Button>
              <Button size="sm" variant="outline" onClick={() => persist("essential")}>
                {c.reject}
              </Button>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => persist("essential")}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
