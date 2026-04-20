import { google } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { z } from "zod";
import { GEMINI_DEFAULT } from "../../lib/geminiModels";

export const chatAgent = new Agent({
  id: "chat-agent",
  name: "Chat Agent",
  model: google(GEMINI_DEFAULT),
  instructions: `You are an assistant for managing conference events.
    You help users create and look up events, manage participants, and handle snack orders.
    If the user asks about topics unrelated to events or participants, politely let them know that is outside your scope.
    If you learn the user's name during the conversation, store it memory
    IMPORTANT: You MUST always write a text response to the user after every tool call. Never finish silently.
    After completing any task, always give a brief summary of the results (one or two sentences)
    including the relevant details (e.g. names, dates, list of participants). Do not narrate individual toll call steps.
`,
  memory: new Memory({
    storage: new LibSQLStore({
      id: "chat-agent-memory",
      url: "file:../db/chat-agent.db",
    }),
    options: {
      workingMemory: {
        enabled: true,
        scope: "resource",
        schema: z.object({
          userProfile: z.object({
            name: z.string().nullable().describe("The name of the chat user, if known"),
          }),
        }),
      },
    },
  }),
});
