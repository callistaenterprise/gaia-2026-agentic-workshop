import { google } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";
import { participantTools } from "../tools/participantTools";
import { GEMINI_DEFAULT, GEMINI_REASONING } from "../../lib/geminiModels";

export const participantAgent = new Agent({
  id: "participant-agent",
  name: "Participant Agent",
  tools: { ...participantTools },
  model: google(GEMINI_REASONING),
  instructions: `
    You are a specialized agent for managing participants. 
  
    Use your tools to fulfil requests, when possible. 

    Ask the user for clarification if needed.
`,
});
