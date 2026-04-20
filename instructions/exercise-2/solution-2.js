import { google } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";
import { GEMINI_DEFAULT } from "../../lib/geminiModels";

export const chatAgent = new Agent({
  id: "chat-agent",
  name: "Chat Agent",
  model: google(GEMINI_DEFAULT),
  instructions: `You are a helpful assistant.`,
});
