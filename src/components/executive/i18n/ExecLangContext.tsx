import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import arTranslations from "./ar.json";

type Lang = "en" | "ar";

interface ExecLangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  dir: "ltr" | "rtl";
}

const Ctx = createContext<ExecLangCtx>({ lang: "en", setLang: () => {}, dir: "ltr" });

export const useExecLang = () => useContext(Ctx);

const STORAGE_KEY = "exec_deck_lang";
const AR: Record<string, string> = arTranslations as Record<string, string>;

export function ExecLangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    return (localStorage.getItem(STORAGE_KEY) as Lang) || "en";
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch {}
  };

  return (
    <Ctx.Provider value={{ lang, setLang, dir: lang === "ar" ? "rtl" : "ltr" }}>
      {children}
    </Ctx.Provider>
  );
}

/**
 * Wraps the deck content. When Arabic is active:
 * - Sets dir="rtl" and Arabic font family.
 * - Walks the DOM and replaces matching English text nodes with their Arabic
 *   translations from the dictionary. Re-runs whenever the language changes
 *   or new content is mounted (MutationObserver).
 */
export function ExecLangBoundary({ children }: { children: ReactNode }) {
  const { lang, dir } = useExecLang();
  const ref = useRef<HTMLDivElement>(null);

  // Use layout effect so the swap happens before paint to avoid English flash.
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    const translateNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const raw = node.nodeValue || "";
        const trimmed = raw.trim();
        if (!trimmed) return;
        if (lang === "ar") {
          const ar = AR[trimmed];
          if (ar && ar !== trimmed) {
            // Preserve any leading/trailing whitespace.
            const leading = raw.match(/^\s*/)?.[0] ?? "";
            const trailing = raw.match(/\s*$/)?.[0] ?? "";
            // Store original on the node's parent so we can restore.
            const parent = node.parentNode as (Element & { __execOrig?: Map<Node, string> }) | null;
            if (parent) {
              if (!parent.__execOrig) parent.__execOrig = new Map();
              if (!parent.__execOrig.has(node)) parent.__execOrig.set(node, raw);
            }
            node.nodeValue = leading + ar + trailing;
          }
        } else {
          // Restore originals when switching back to English.
          const parent = node.parentNode as (Element & { __execOrig?: Map<Node, string> }) | null;
          if (parent?.__execOrig?.has(node)) {
            node.nodeValue = parent.__execOrig.get(node)!;
          }
        }
        return;
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        // Skip script/style and inputs
        const tag = el.tagName;
        if (tag === "SCRIPT" || tag === "STYLE") return;
        el.childNodes.forEach(translateNode);
      }
    };

    translateNode(root);

    // Watch for new nodes (slides render lazily, hover states, etc.)
    const obs = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach(translateNode);
        if (m.type === "characterData" && m.target) {
          translateNode(m.target);
        }
      }
    });
    obs.observe(root, { childList: true, subtree: true, characterData: true });
    return () => obs.disconnect();
  }, [lang]);

  return (
    <div
      ref={ref}
      dir={dir}
      lang={lang}
      className={lang === "ar" ? "font-arabic" : undefined}
      style={lang === "ar" ? { fontFamily: '"Noto Naskh Arabic","Noto Sans Arabic","Segoe UI",system-ui,sans-serif' } : undefined}
    >
      {children}
    </div>
  );
}
