import { google } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { createTool } from "@mastra/core/tools";
import { eventAgent } from "./eventAgent";
import { participantAgent } from "./participantAgent";
import { eventOutputSchema, participantOutputSchema } from "../tools/schemas";
import { GEMINI_DEFAULT } from "../../lib/geminiModels";

const eventAgentTool = createTool({
  id: "eventAgentTool",
  description:
    "Delegate any event-related request to the Event Agent. This covers searching, creating, updating, and deleting events, as well as adding or removing participants from events.",
  inputSchema: z.object({
    message: z.string().describe("The full request to pass to the Event Agent, including all relevant details."),
  }),
  outputSchema: eventOutputSchema,
  execute: async ({ message }) => {
    const response = await eventAgent.generate(
      [{ role: "user", content: message }],
      { structuredOutput: { schema: eventOutputSchema } },
    );
    return response.object;
  },
});

const participantAgentTool = createTool({
  id: "participantAgentTool",
  description:
    "Delegate any participant-related request to the Participant Agent. This covers searching, creating, updating, and deleting participants. Returns structured data.",
  inputSchema: z.object({
    message: z.string().describe("The full request to pass to the Participant Agent, including all relevant details."),
  }),
  outputSchema: participantOutputSchema,
  execute: async ({ message }) => {
    const response = await participantAgent.generate(
      [{ role: "user", content: message }],
      { structuredOutput: { schema: participantOutputSchema } },
    );
    return response.object;
  },
});

export const chatAgent = new Agent({
  id: "chat-agent",
  name: "Chat Agent",
  model: google(GEMINI_DEFAULT),
  tools: {
    eventAgentTool,
    participantAgentTool,
  },
  instructions: `You are a helpful assistant that can answer questions and help with tasks.

For any request related to events (searching, creating, updating, deleting events, or managing event participants), delegate to the Event Agent using the eventAgentTool. Pass the full user request as the message, and include any relevant IDs (event IDs, participant IDs) that are already known from the conversation history.

For any request related to participants (searching, creating, updating, deleting participants), delegate to the Participant Agent using the participantAgentTool. Pass the full user request as the message, and include any relevant IDs that are already known from the conversation history.

After completing any task, give a single brief summary of what was done (one or two sentences). Do not narrate individual tool call steps.

If you learn the user's name during the conversation, store it in memory.
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
        template: `# User Profile
        - **Name**: {{name}}
        `,
      },
    },
  }),
});
