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
}

function formatMarkdown(text: string): string {
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, "<em>$1</em>");
  html = html.replace(/_(.+?)_/g, "<em class='text-muted-foreground text-xs'>$1</em>");
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul class="list-disc pl-4 my-1.5 space-y-1">${match}</ul>`);
  html = html.replace(/^\d+\.\s(.+)$/gm, "<li>$1</li>");
  html = html.replace(/^### (.+)$/gm, '<h4 class="font-semibold mt-3 mb-1">$1</h4>');
  html = html.replace(/^## (.+)$/gm, '<h3 class="font-semibold text-base mt-3 mb-1">$1</h3>');
  html = html.replace(/\n/g, "<br/>");

  return html;
}

export function AIChatMessage({ role, content, isStreaming, timestamp }: AIChatMessageProps) {
  const isUser = role === "user";
  const formattedContent = useMemo(() => {
    if (isUser) return null;
    const rawHtml = formatMarkdown(content);
    return DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: ['strong', 'em', 'ul', 'li', 'h3', 'h4', 'br'],
      ALLOWED_ATTR: ['class', 'style'],
    });
  }, [content, isUser]);

  const displayTime = useMemo(() => {
    const t = timestamp || new Date();
    return t.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }, [timestamp]);

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

          {/* Thinking indicator — smooth breathing dots */}
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
