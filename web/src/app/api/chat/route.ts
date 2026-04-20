import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { mastra } from "@/mastra";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { messages, threadId } = await req.json();

  const agent = mastra.getAgent("chatAgent");

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const result = await agent.stream(messages, {
        memory: { thread: threadId, resource: "default-user" },
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
