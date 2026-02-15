import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface AIChatMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
  isStreaming?: boolean;
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

export function AIChatMessage({ role, content, isStreaming }: AIChatMessageProps) {
  const isUser = role === "user";
  const formattedContent = useMemo(() => (isUser ? null : formatMarkdown(content)), [content, isUser]);

  return (
    <div className={cn("flex gap-3 py-4 px-4", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={cn(
          "flex-1 space-y-2 overflow-hidden rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground ml-12"
            : "bg-muted text-foreground mr-12"
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
          <span className="inline-flex gap-1">
            <span className="animate-pulse">●</span>
            <span className="animate-pulse delay-100">●</span>
            <span className="animate-pulse delay-200">●</span>
          </span>
        )}
        {isStreaming && content && (
          <span className="inline-block w-1 h-4 bg-foreground/50 animate-pulse ml-0.5 align-text-bottom" />
        )}
      </div>
    </div>
  );
}
