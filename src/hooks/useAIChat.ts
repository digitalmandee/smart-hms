import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface UseAIChatOptions {
  mode?: "patient_intake" | "doctor_assist" | "general";
  language?: "en" | "ar" | "ur";
  patientContext?: Record<string, unknown>;
  onConversationCreated?: (id: string) => void;
  onAssistantResponse?: (content: string) => void;
  initialGreeting?: string;
}

export function useAIChat(options: UseAIChatOptions = {}) {
  const { mode = "general", language = "en", patientContext, onConversationCreated, onAssistantResponse, initialGreeting } = options;
  const { profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialGreeting ? [{ role: "assistant", content: initialGreeting }] : []
  );

  // React to initialGreeting changes (e.g. language switch) — only if no real conversation yet
  useEffect(() => {
    if (initialGreeting && messages.length <= 1 && !conversationId) {
      setMessages([{ role: "assistant", content: initialGreeting }]);
    }
  }, [initialGreeting]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const createConversation = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const orgId = profile?.organization_id || null;

    const { data, error } = await supabase
      .from("ai_conversations")
      .insert([{
        ...(orgId ? { organization_id: orgId } : {}),
        user_id: user.id,
        context_type: mode,
        language,
        messages: JSON.parse("[]"),
        metadata: patientContext ? JSON.parse(JSON.stringify(patientContext)) : JSON.parse("{}"),
      }])
      .select("id")
      .single();

    if (error) {
      console.error("Failed to create conversation:", error);
      return null;
    }

    setConversationId(data.id);
    onConversationCreated?.(data.id);
    return data.id;
  }, [profile?.organization_id, mode, language, patientContext, onConversationCreated]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMessage: ChatMessage = { role: "user", content: content.trim() };
      const updatedMessages = [...messages, userMessage];
      const messagesForAPI = updatedMessages.filter((m, i) => !(i === 0 && m.role === "assistant" && initialGreeting && m.content === initialGreeting));
      setMessages(updatedMessages);
      setIsLoading(true);

      let convId = conversationId;
      if (!convId) {
        convId = await createConversation();
      }

      try {
        abortRef.current = new AbortController();

        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;
        const currentUser = sessionData?.session?.user;

        if (!accessToken) {
          toast.error("Please sign in to use AI chat");
          setIsLoading(false);
          return;
        }

        // Inject user profile data into patient_context
        const enrichedContext = {
          ...patientContext,
          name: patientContext?.name || currentUser?.user_metadata?.full_name || "",
          gender: patientContext?.gender || currentUser?.user_metadata?.gender || "",
        };

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
            body: JSON.stringify({
              mode,
              messages: messagesForAPI,
              patient_context: enrichedContext,
              language,
              conversation_id: convId,
              stream: true,
              country_code: (window as any).__COUNTRY_CODE || "PK",
            }),
            signal: abortRef.current.signal,
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`AI request failed: ${errorText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let assistantContent = "";

        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) {
                  assistantContent += delta;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      role: "assistant",
                      content: assistantContent,
                    };
                    return updated;
                  });
                }
              } catch {
                // Skip malformed JSON chunks
              }
            }
          }
        }

        if (convId && assistantContent) {
          onAssistantResponse?.(assistantContent);
          const finalMessages = [
            ...updatedMessages,
            { role: "assistant" as const, content: assistantContent },
          ];
          await supabase
            .from("ai_conversations")
            .update({
              messages: JSON.parse(JSON.stringify(finalMessages)),
              updated_at: new Date().toISOString(),
            })
            .eq("id", convId);
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        console.error("AI chat error:", error);
        toast.error("Failed to get AI response. Please try again.");
        setMessages((prev) => prev.filter((m) => m.content !== ""));
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [messages, isLoading, conversationId, createConversation, mode, language, patientContext, onAssistantResponse]
  );

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
  }, []);

  const clearChat = useCallback(() => {
    setMessages(initialGreeting ? [{ role: "assistant", content: initialGreeting }] : []);
    setConversationId(null);
  }, [initialGreeting]);

  const loadConversation = useCallback((id: string, msgs: ChatMessage[]) => {
    setConversationId(id);
    setMessages(msgs);
  }, []);

  return {
    messages,
    isLoading,
    conversationId,
    sendMessage,
    stopGeneration,
    clearChat,
    loadConversation,
  };
}
