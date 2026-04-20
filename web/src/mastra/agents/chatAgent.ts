import { google } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";
import { NOT_SPECIFIED } from "../../lib/geminiModels";


export const chatAgent = new Agent({
  id: "chat-agent",
  name: "Chat Agent",
  model: google(NOT_SPECIFIED),
  instructions: ``,
});
