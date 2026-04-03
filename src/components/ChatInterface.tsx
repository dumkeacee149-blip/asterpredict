"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/lib/types";

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let assistantText = "";

      setMessages([...newMessages, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                assistantText += parsed.content;
                setMessages([
                  ...newMessages,
                  { role: "assistant", content: assistantText },
                ]);
              }
            } catch {}
          }
        }
      }
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "The shadows are unclear... Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="border-b border-white/5 px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          🥷 Ask the Shadow
        </h3>
        <p className="text-xs text-muted">Ask Kage about $ASTER, DeFi perps, or market conditions</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[400px]">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-sm text-muted/50 italic">
            The shadow awaits your question...
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-accent/20 text-foreground"
                  : "bg-surface-light text-foreground"
              }`}
            >
              {msg.role === "assistant" && (
                <span className="text-accent text-xs font-medium">Kage: </span>
              )}
              {msg.content || (
                <span className="text-muted animate-pulse">Thinking...</span>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-white/5 p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about $ASTER, market trends..."
            className="flex-1 rounded-lg bg-surface-light border border-white/10 px-4 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-background transition-all hover:bg-accent/90 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
