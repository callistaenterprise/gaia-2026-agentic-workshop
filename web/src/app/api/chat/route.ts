import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { mastra } from "@/mastra";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const agent = mastra.getAgent("chatAgent");

  const hasMemory = agent.hasOwnMemory();

  const toCoreMessage = (msg: { role: string; content?: string; parts?: { type: string; text?: string }[] }) => ({
    role: msg.role as "user" | "assistant",
    content: msg.content ?? msg.parts?.filter(p => p.type === "text").map(p => p.text ?? "").join("") ?? "",
  });

  const allCoreMessages = messages.map(toCoreMessage);
  const messagesToSend = hasMemory ? [allCoreMessages[allCoreMessages.length - 1]] : allCoreMessages;

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const result = await agent.stream(messagesToSend, {
        memory: { thread: "workshop-thread", resource: "workshop-user" },
        providerOptions: {
          google: { thinkingConfig: { thinkingBudget: 0 } },
        },
      });
      const reader = result.fullStream.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        switch (value.type) {
          case "text-start":
            writer.write({ type: "text-start", id: value.payload.id });
            break;
          case "text-delta":
            writer.write({
              type: "text-delta",
              id: value.payload.id,
              delta: value.payload.text,
            });
            break;
          case "text-end":
            writer.write({ type: "text-end", id: value.payload.id });
            break;
          case "tool-call":
            writer.write({
              type: "tool-input-available",
              toolCallId: value.payload.toolCallId,
              toolName: value.payload.toolName,
              input: value.payload.args ?? {},
              dynamic: true,
            });
            break;
          case "tool-result":
            writer.write({
              type: "tool-output-available",
              toolCallId: value.payload.toolCallId,
              output: value.payload.result,
              dynamic: true,
            });
            break;
        }
      }
    },
    onError: (error) => String(error),
  });

  return createUIMessageStreamResponse({ stream });
}
