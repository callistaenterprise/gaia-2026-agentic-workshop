# Exercise 6: Agent-to-agent delegation

[◀ Go back to Exercise 5](../exercise-5/exercise-5.md)

In this exercise you will replace the directly wired tools with two specialised sub-agents — one for events and one for participants — and connect them to the chat agent as tools.

---

## Background

As an agent takes on more responsibilities, its tool list grows and the system prompt becomes longer and harder to maintain. One way to manage this complexity is **agent-to-agent delegation**: instead of handling everything in one agent, you split responsibilities across specialised agents and let a coordinator delegate to them.

```
User ──▶ Chat Agent ──▶ Event Agent    (manages events)
                   └──▶ Participant Agent  (manages participants)
```

The coordinator (Chat Agent) wraps each sub-agent as a tool. When the model decides that a request is event-related, it calls the `eventAgentTool`, which internally calls the Event Agent. The Event Agent has its own focused set of tools and a tight, domain-specific system prompt.

**When to use tools directly vs agent-to-agent:**

| Approach | Good when |
|---|---|
| Direct tools | Logic is simple; a single LLM call is enough |
| Sub-agent | The task is complex, requires multi-step reasoning, or has its own set of tools |
| Sub-agent | You want to isolate prompt context for a specific domain |

The trade-off: agent-to-agent adds latency (one extra LLM call per delegation) and cost. Don't over-architect.

---

# Step-by-step instructions

## 1. Inspect the sub-agents

Open and read:
- [web/src/mastra/agents/eventAgent.ts](../../web/src/mastra/agents/eventAgent.ts)
- [web/src/mastra/agents/participantAgent.ts](../../web/src/mastra/agents/participantAgent.ts)

Notice that each already has its own focused set of tools and instructions.

## 2. Register the sub-agents with Mastra

Open [web/src/mastra/index.ts](../../web/src/mastra/index.ts) and add the sub-agents to the Mastra instance so they are available at runtime:

```ts
import { eventAgent } from "./agents/eventAgent";
import { participantAgent } from "./agents/participantAgent";

export const mastra = new Mastra({
  agents: { chatAgent, eventAgent, participantAgent },
});
```

## 3. Create agent tools in the chat agent

Open [web/src/mastra/agents/chatAgent.ts](../../web/src/mastra/agents/chatAgent.ts). Remove the direct `eventTools` and `participantTools` imports, and replace them with wrapper tools that delegate to the sub-agents:

```ts
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { eventAgent } from "./eventAgent";
import { participantAgent } from "./participantAgent";
import { eventOutputSchema, participantOutputSchema } from "../tools/schemas";

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
  // ... existing config ...
  tools: {
    eventAgentTool,
    participantAgentTool,
  },
});
```

Also update `instructions` to guide when to delegate:

```ts
instructions: `You are a helpful assistant that can answer questions and help with tasks.

For any request related to events (searching, creating, updating, deleting events, or managing event participants), delegate to the Event Agent using the eventAgentTool. Pass the full user request as the message, and include any relevant IDs (event IDs, participant IDs) that are already known from the conversation history.

For any request related to participants (searching, creating, updating, deleting participants), delegate to the Participant Agent using the participantAgentTool. Pass the full user request as the message, and include any relevant IDs that are already known from the conversation history.

After completing any task, give a single brief summary of what was done (one or two sentences). Do not narrate individual tool call steps.

If you learn the user's name during the conversation, store it in memory.`,
```

## 4. Test in the UI

Repeat the same tests from Exercise 5 to verify delegation works correctly:

> "Add a participant named Erik Karlsson"

> "Create an event called 'Autumn Conference' on 2026-10-10"

> "Add Erik Karlsson to the Autumn Conference"

> "Who is attending the Autumn Conference?"

---

## Reflection questions

- What does the Event Agent's focused system prompt give you that a single large system prompt does not?

---

## Next steps

Once you've confirmed that:
- [ ] The chat agent delegates event requests to the Event Agent
- [ ] The chat agent delegates participant requests to the Participant Agent
- [ ] The end-to-end functionality from Exercise 5 still works

You are ready to proceed to Exercise 7.

[▶ Click here to proceed to Exercise 7](../exercise-7/exercise-7.md)
