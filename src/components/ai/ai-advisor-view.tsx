"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bot, RotateCcw, Send, Sparkles, User } from "lucide-react";
import { api } from "@/lib/api";
import { useI18n } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import type { DashboardData, Insight } from "@/types";

type Message = { role: "user" | "assistant"; content: string };

export function AiAdvisorView() {
  const { d } = useI18n();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [mode, setMode] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn: () => api<DashboardData & { insights: Insight[]; aiProvider: string | null }>("/api/analytics"),
    staleTime: 60_000,
  });

  const thread: Message[] = messages.length
    ? messages
    : [{ role: "assistant", content: d.advisor.greeting }];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(raw?: string) {
    const text = (raw ?? input).trim();
    if (!text || streaming) return;

    const history: Message[] = [...messages, { role: "user", content: text }];
    setInput("");
    setMessages([...history, { role: "assistant", content: "" }]);
    setStreaming(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error ?? d.common.error);
      }

      setMode(response.headers.get("x-ai-mode"));
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let acc = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setMessages([...history, { role: "assistant", content: acc }]);
        }
      }

      if (!acc.trim()) {
        setMessages([...history, { role: "assistant", content: d.advisor.noAnswer }]);
      }
    } catch (error) {
      toast({
        title: d.advisor.errorTitle,
        description: error instanceof Error ? error.message : d.common.error,
        tone: "error",
      });
      setMessages(history);
    } finally {
      setStreaming(false);
    }
  }

  function reset() {
    setMessages([]);
    setInput("");
    setMode(null);
  }

  const aiProvider = data?.aiProvider ?? null;
  const localMode = mode === "local" || (!aiProvider && mode !== "ai");

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{d.advisor.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{d.advisor.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={aiProvider ? "success" : "warning"}>
            <Sparkles className="h-3 w-3" />
            {aiProvider ? d.advisor.aiBadge(aiProvider) : d.advisor.localBadge}
          </Badge>
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="h-3.5 w-3.5" /> {d.advisor.newChat}
          </Button>
        </div>
      </div>

      <Card className="flex h-[calc(100dvh-16.5rem)] min-h-[440px] flex-col overflow-hidden">
        <CardHeader className="flex-row items-center gap-2 border-b border-border/70 pb-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15">
            <Bot className="h-4 w-4 text-emerald-500" />
          </span>
          <div>
            <CardTitle>BudgetIQ Assistant</CardTitle>
            <p className="mt-0.5 flex items-center gap-1 text-[10px] text-emerald-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {streaming ? d.advisor.writing : localMode ? d.advisor.localStatus : d.advisor.online}
            </p>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {thread.map((message, index) => (
              <div
                key={index}
                className={`flex gap-2.5 ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <span
                  className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-emerald-500/15 text-emerald-500"
                  }`}
                >
                  {message.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </span>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    message.role === "user"
                      ? "rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md bg-muted text-foreground"
                  }`}
                >
                  {message.content ||
                    (streaming ? (
                      <span className="flex gap-1 py-1">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:0ms]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:120ms]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:240ms]" />
                      </span>
                    ) : null)}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </CardContent>

        <div className="border-t border-border/70 p-3">
          {messages.length === 0 ? (
            <div className="mb-2.5 flex flex-wrap gap-1.5">
              {d.advisor.suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => send(suggestion)}
                  className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          ) : null}
          <form
            className="flex items-end gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              send();
            }}
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              maxLength={2000}
              placeholder={d.advisor.placeholder}
              className="min-h-10 max-h-28 resize-none py-2.5"
              disabled={streaming}
            />
            <Button
              type="submit"
              size="icon"
              disabled={streaming || !input.trim()}
              aria-label={d.advisor.send}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="mt-1.5 text-center text-[10px] text-muted-foreground/70">
            {d.advisor.disclaimer}
          </p>
        </div>
      </Card>
    </div>
  );
}
