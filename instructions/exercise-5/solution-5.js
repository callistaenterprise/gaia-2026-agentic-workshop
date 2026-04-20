import { google } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { eventTools } from "../tools/eventTools";
import { participantTools } from "../tools/participantTools";
import { GEMINI_DEFAULT } from "../../lib/geminiModels";

export const chatAgent = new Agent({
  id: "chat-agent",
  name: "Chat Agent",
  model: google(GEMINI_DEFAULT),
  tools: {
    ...eventTools,
    ...participantTools,
  },
  instructions: `You are an assistant for managing conference events.
    You help users create and look up events, manage participants, and handle snack orders.
    If the user asks about topics unrelated to events or participants, politely let them know that is outside your scope.
    If you learn the user's name during the conversation, store it in memory.`,
  memory: new Memory({
    storage: new LibSQLStore({
      id: "chat-agent-memory",
      url: "file:../db/chat-agent.db",
    }),
  }),
});
