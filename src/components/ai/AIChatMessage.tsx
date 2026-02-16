import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import DOMPurify from "dompurify";
import { DoctorAvatar } from "./DoctorAvatar";

interface AIChatMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
  isStreaming?: boolean;
  timestamp?: Date;
  isLatest?: boolean;
  onOptionSelect?: (option: string) => void;
  onOtherSelect?: () => void;
  language?: "en" | "ar" | "ur";
}

const OTHER_LABELS: Record<string, string> = {
  en: "✏️ Other (type your own answer)",
  ar: "✏️ غير ذلك (اكتب إجابتك)",
  ur: "✏️ کوئی اور (اپنا جواب لکھیں)",
};

const OPTION_REGEX = /^[A-D]\) .+$/;

function parseOptions(content: string): { questionText: string; options: string[] } {
  const lines = content.split("\n");
  const optionLines: string[] = [];
  const textLines: string[] = [];

  for (const line of lines) {
    if (OPTION_REGEX.test(line.trim())) {
      optionLines.push(line.trim());
    } else {
      textLines.push(line);
    }
  }

  // Remove trailing empty lines from question text
  while (textLines.length > 0 && textLines[textLines.length - 1].trim() === "") {
    textLines.pop();
  }

  return {
    questionText: textLines.join("\n"),
    options: optionLines,
  };
}

function formatMarkdown(text: string): string {
  const lines = text.split("\n");
  const output: string[] = [];
  let inUl = false;
  let inOl = false;

  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const inlineFormat = (line: string): string => {
    line = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    line = line.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, "<em>$1</em>");
    line = line.replace(/_(.+?)_/g, "<em class='text-muted-foreground text-xs'>$1</em>");
    return line;
  };

  for (let i = 0; i < lines.length; i++) {
    let raw = lines[i];
    let escaped = esc(raw);

    const h3 = escaped.match(/^### (.+)$/);
    if (h3) {
      if (inUl) { output.push("</ul>"); inUl = false; }
      if (inOl) { output.push("</ol>"); inOl = false; }
      output.push(`<h4 class="font-semibold mt-3 mb-1">${inlineFormat(h3[1])}</h4>`);
      continue;
    }
    const h2 = escaped.match(/^## (.+)$/);
    if (h2) {
      if (inUl) { output.push("</ul>"); inUl = false; }
      if (inOl) { output.push("</ol>"); inOl = false; }
      output.push(`<h3 class="font-semibold text-base mt-3 mb-1">${inlineFormat(h2[1])}</h3>`);
      continue;
    }

    const ul = escaped.match(/^- (.+)$/);
    if (ul) {
      if (inOl) { output.push("</ol>"); inOl = false; }
      if (!inUl) { output.push('<ul class="list-disc pl-4 my-1.5 space-y-1">'); inUl = true; }
      output.push(`<li>${inlineFormat(ul[1])}</li>`);
      continue;
    }

    const ol = escaped.match(/^\d+\.\s(.+)$/);
    if (ol) {
      if (inUl) { output.push("</ul>"); inUl = false; }
      if (!inOl) { output.push('<ol class="list-decimal pl-4 my-1.5 space-y-1">'); inOl = true; }
      output.push(`<li>${inlineFormat(ol[1])}</li>`);
      continue;
    }

    if (inUl) { output.push("</ul>"); inUl = false; }
    if (inOl) { output.push("</ol>"); inOl = false; }

    if (escaped.trim() === "") {
      output.push("<br/>");
    } else {
      output.push(inlineFormat(escaped));
      const next = i + 1 < lines.length ? lines[i + 1] : "";
      if (next && !next.match(/^(#{2,3} |- |\d+\.\s)/) && next.trim() !== "") {
        output.push("<br/>");
      }
    }
  }

  if (inUl) output.push("</ul>");
  if (inOl) output.push("</ol>");

  return output.join("\n");
}

export function AIChatMessage({ role, content, isStreaming, timestamp, isLatest, onOptionSelect, onOtherSelect, language = "en" }: AIChatMessageProps) {
  const isUser = role === "user";

  const { questionText, options } = useMemo(() => {
    if (isUser || !content) return { questionText: content, options: [] };
    return parseOptions(content);
  }, [content, isUser]);

  const formattedContent = useMemo(() => {
    if (isUser) return null;
    const rawHtml = formatMarkdown(questionText);
    return DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: ['strong', 'em', 'ul', 'ol', 'li', 'h3', 'h4', 'br'],
      ALLOWED_ATTR: ['class', 'style'],
    });
  }, [questionText, isUser]);

  const displayTime = useMemo(() => {
    const t = timestamp || new Date();
    return t.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }, [timestamp]);

  const showInteractiveOptions = !isUser && options.length > 0 && isLatest && !isStreaming;

  return (
    <div className={cn(
      "flex gap-2.5 py-2 px-3",
      "animate-fade-in",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      {isUser ? (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
          <User className="h-3 w-3" />
        </div>
      ) : (
        <div className="shrink-0 mt-0.5">
          <DoctorAvatar
            state={isStreaming ? (content ? "speaking" : "thinking") : "idle"}
            size="xs"
          />
        </div>
      )}

      {/* Message bubble */}
      <div className={cn("flex flex-col gap-0.5 max-w-[82%]", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-card text-foreground rounded-tl-sm border border-border/50 shadow-sm"
          )}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap break-words">{content}</div>
          ) : (
            <div
              className="break-words prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: formattedContent || "" }}
            />
          )}

          {/* Non-interactive options (for older messages) */}
          {!isUser && options.length > 0 && !showInteractiveOptions && (
            <div className="mt-2 space-y-1">
              {options.map((opt, i) => (
                <div key={i} className="text-[13px] text-muted-foreground">{opt}</div>
              ))}
            </div>
          )}

          {/* Thinking indicator */}
          {isStreaming && !content && (
            <div className="flex items-center gap-1.5 py-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-2 w-2 rounded-full bg-primary/50"
                  style={{
                    animation: `breathe 1.4s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Streaming cursor */}
          {isStreaming && content && (
            <span
              className="inline-block w-0.5 h-4 bg-primary/70 ml-0.5 align-text-bottom"
              style={{ animation: "blink 1s steps(2) infinite" }}
            />
          )}
        </div>

        {/* Interactive option buttons — rendered OUTSIDE the bubble */}
        {showInteractiveOptions && (
          <div className="flex flex-col gap-1.5 mt-1.5 w-full">
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={() => onOptionSelect?.(opt)}
                className="text-left text-[13px] px-4 py-2.5 rounded-2xl border border-primary/30 bg-card hover:bg-primary/10 hover:border-primary/50 text-foreground transition-all active:scale-[0.98] shadow-sm"
              >
                {opt}
              </button>
            ))}
            <button
              onClick={() => onOtherSelect?.()}
              className="text-left text-[13px] px-4 py-2.5 rounded-2xl border border-dashed border-muted-foreground/30 bg-card hover:bg-muted/50 hover:border-muted-foreground/50 text-muted-foreground transition-all active:scale-[0.98]"
            >
              {OTHER_LABELS[language] || OTHER_LABELS.en}
            </button>
          </div>
        )}

        <span className="text-[10px] text-muted-foreground/50 px-1">{displayTime}</span>
      </div>

      <style>{`
        @keyframes breathe {
          0%, 100% { opacity: 0.3; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
