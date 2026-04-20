# Exercise 5: Connecting tools to the agent

[◀ Go back to Exercise 4](../exercise-4/exercise-4.md)

In this exercise you will connect the event and participant tools directly to the chat agent, enabling it to interact with the database.

---

## Background

A **tool** is a function the model can choose to call when it needs to take an action or fetch information. The model does not execute the function itself — it emits a structured call, and the framework executes it on the model's behalf and returns the result.

Tools give an agent access to the outside world: databases, APIs, file systems, and more.

Each tool (in Mastra) has:
- an **id** and **description** — used by the model to decide when to call it
- an **inputSchema** — validated with Zod before execution
- an **outputSchema** — what the tool returns
- an **execute** function — the actual implementation

The description is critical: if it is vague, the model might call the wrong tool or none at all.

---

# Step-by-step instructions

## 1. Inspect the available tools

Open the following files and read through the tools that are already implemented:

- [web/src/mastra/tools/eventTools.ts](../../web/src/mastra/tools/eventTools.ts) — create, update, delete, and search events; manage event participants
- [web/src/mastra/tools/participantTools.ts](../../web/src/mastra/tools/participantTools.ts) — create, update, delete, and search participants

## 2. Add the tools to the agent

Open [web/src/mastra/agents/chatAgent.ts](../../web/src/mastra/agents/chatAgent.ts) and add the tools to the `tools` field:

```ts
import { eventTools } from "../tools/eventTools";
import { participantTools } from "../tools/participantTools";

export const chatAgent = new Agent({
  // ... existing config ...
  tools: {
    ...eventTools,
    ...participantTools,
  },
});
```

## 3. Test in the UI

Open http://localhost:3000 and try the following requests:

**Create a participant:**
> "Add a participant named Anna Svensson with a snack preference for something sweet"

**Create an event:**
> "Create an event called 'Spring Meetup' on 2026-05-20"

**Add the participant to the event:**
> "Add Anna Svensson to the Spring Meetup event"

**Query:**
> "Who is attending the Spring Meetup?"

Verify that the agent uses the correct tools and returns meaningful responses.

---

## Next steps

Once you've confirmed that:
- [ ] The agent can create and search events via chat
- [ ] The agent can create and search participants via chat
- [ ] The agent can link participants to events via chat

You are ready to proceed to Exercise 6.

[▶ Click here to proceed to Exercise 6](../exercise-6/exercise-6.md)
