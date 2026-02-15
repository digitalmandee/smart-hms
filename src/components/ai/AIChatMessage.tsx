import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { DoctorAvatar } from "./DoctorAvatar";

interface AIChatMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
  isStreaming?: boolean;
  isFirst?: boolean;
}

function formatMarkdown(text: string): string {
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // Italic
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  // Unordered lists
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul class="list-disc pl-4 my-1">${match}</ul>`);
  // Ordered lists
  html = html.replace(/^\d+\.\s(.+)$/gm, "<li>$1</li>");
  // Headers
  html = html.replace(/^### (.+)$/gm, '<h4 class="font-semibold mt-2">$1</h4>');
  html = html.replace(/^## (.+)$/gm, '<h3 class="font-semibold text-base mt-2">$1</h3>');
  // Line breaks
  html = html.replace(/\n/g, "<br/>");

  return html;
}

export function AIChatMessage({ role, content, isStreaming, isFirst }: AIChatMessageProps) {
  const isUser = role === "user";
  const formattedContent = useMemo(() => (isUser ? null : formatMarkdown(content)), [content, isUser]);

  return (
    <div className={cn(
      "flex gap-3 py-3 px-3 animate-fade-in",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      {isUser ? (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
          <User className="h-4 w-4" />
        </div>
      ) : (
        <div className="shrink-0 mt-1">
          <DoctorAvatar
            state={isStreaming ? (content ? "speaking" : "thinking") : "idle"}
            size="sm"
          />
        </div>
      )}

      {/* Message bubble */}
      <div className={cn("flex flex-col gap-1 max-w-[80%]", isUser ? "items-end" : "items-start")}>
        {/* Doctor label on first assistant message */}
        {!isUser && isFirst && (
          <span className="text-[11px] font-medium text-primary ml-1">Dr. Tabeebi</span>
        )}
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-md"
              : "bg-muted text-foreground rounded-tl-md border border-border/50"
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
          {isStreaming && !content && (
            <div className="flex items-center gap-1.5 py-1">
              <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          )}
          {isStreaming && content && (
            <span className="inline-block w-0.5 h-4 bg-primary/60 animate-pulse ml-0.5 align-text-bottom" />
          )}
        </div>
      </div>
    </div>
  );
}
