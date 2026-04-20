"use client";

import { useState } from "react";
import { DefaultChatTransport, DynamicToolUIPart } from "ai";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const TOOL_LABELS: Record<string, string> = {
  eventAgentTool: "Event Agent",
  participantAgentTool: "Participant Agent",
  searchSnacksTool: "Searching snacks",
  semanticSearchSnacksTool: "Searching snacks",
  addSnackTool: "Adding snack",
  updateSnackTool: "Updating snack",
  deleteSnackTool: "Deleting snack",
  createOrderTool: "Creating order",
  getOrderTool: "Fetching order",
  updateOrderTool: "Updating order",
};

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [threadId, setThreadId] = useState<string>(() => crypto.randomUUID());

  const transport = new DefaultChatTransport({ api: "/api/chat", body: { threadId } });
  const { messages, setMessages, sendMessage, status } = useChat({ transport });

  const isLoading = status === "streaming" || status === "submitted";

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h1 className="font-semibold">Chat</h1>
        <button
          onClick={() => {
            const newId = crypto.randomUUID();
            setThreadId(newId);
            setMessages([]);
          }}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear history
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="text-muted-foreground text-sm text-center py-16">
            Ask me about events, participants, or snacks.
          </div>
        )}

        {status === "submitted" && (
          <div className="flex justify-start">
            <div className="px-3 py-2 rounded-xl bg-muted/30 border border-border font-mono text-xs text-muted-foreground animate-pulse">
              Thinking...
            </div>
          </div>
        )}

        {messages.map((message) => {
          const toolParts = (message.parts?.filter((p) =>
            p.type === "dynamic-tool"
          ) ?? []) as DynamicToolUIPart[];
          const textParts =
            message.parts?.filter((p) => p.type === "text") ?? [];

          return (
            <div key={message.id}>
              {message.role === "assistant" && toolParts.length > 0 && (
                <div className="flex justify-start mb-1">
                  <div className="max-w-[75%] px-3 py-2 rounded-xl border border-border bg-muted/30 font-mono text-xs space-y-0.5">
                    {toolParts.map((t, i) => {
                      const label = TOOL_LABELS[t.toolName] ?? t.toolName;
                      const done = t.state === "output-available";
                      return (
                        <div key={i} className="flex items-center gap-2 py-0.5">
                          <span className="text-muted-foreground/40">⎿</span>
                          <span className="text-muted-foreground">
                            {label}{!done ? "..." : ""}
                          </span>
                          <span className="ml-auto">
                            {done ? (
                              <span className="text-green-500">✓</span>
                            ) : (
                              <svg className="animate-spin h-3 w-3 text-indigo-500" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                              </svg>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {textParts.map((part, i) => (
                <div
                  key={i}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${message.role === "user"
                      ? "bg-primary text-primary-foreground whitespace-pre-wrap"
                      : "bg-muted text-foreground"
                      }`}
                  >
                    {message.role === "user"
                      ? (part as { type: "text"; text: string }).text
                      : (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
                            li: ({ children }) => <li>{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                            em: ({ children }) => <em className="italic">{children}</em>,
                            code: ({ children }) => <code className="bg-black/10 rounded px-1 py-0.5 text-xs font-mono">{children}</code>,
                            pre: ({ children }) => <pre className="bg-black/10 rounded p-2 text-xs font-mono overflow-x-auto mb-2">{children}</pre>,
                            h1: ({ children }) => <h1 className="font-bold text-base mb-1">{children}</h1>,
                            h2: ({ children }) => <h2 className="font-bold mb-1">{children}</h2>,
                            h3: ({ children }) => <h3 className="font-semibold mb-1">{children}</h3>,
                          }}
                        >
                          {(part as { type: "text"; text: string }).text}
                        </ReactMarkdown>
                      )
                    }
                  </div>
                </div>
              ))}
            </div>
          );
        })}
        <div />
      </div>

      <div className="border-t p-4">
        <form onSubmit={(e) => { e.preventDefault(); if (!input.trim() || isLoading) return; sendMessage({ text: input }); setInput(""); }} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-1"
            autoFocus
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
