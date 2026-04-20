# Exercise 4: Giving the agent memory

[◀ Go back to Exercise 3](../exercise-3/exercise-3.md)

In this exercise you will configure persistent memory for the chat agent, so it can remember things across turns in a conversation.

---

## Background

By default a language model is **stateless** — each API call is independent and the model has no recollection of previous messages unless you explicitly include them.

Mastra's [`Memory`](https://mastra.ai/docs/memory/overview) module solves this by maintaining a **conversation thread** that is stored between requests. There are two main mechanisms:

| Mechanism | What it stores | Scope |
|---|---|---|
| **Message history** | The raw back-and-forth messages | Per thread |
| **Working memory** | Structured facts the agent writes to and reads from (e.g. user name) | Per thread or global |

**Key trade-offs to keep in mind:**
- Including more history = better context, but more tokens per request (= higher cost and latency)
- Working memory lets you keep a compact, structured summary instead of replaying every message
- Long-running assistants benefit from *context trimming* — discarding old messages while preserving a summary
- Global (cross-thread) memory enables personalisation across sessions, but requires careful scoping to avoid mixing users' data

---

# Step-by-step instructions

## 1. Demonstrate the problem

Start a fresh conversation at http://localhost:3000 and type:
> "My name is [your name]"

Now **reload the page** to start a new session, and ask:
> "What is my name?"

Without memory configured the agent will not know your name — it has no way to recall information from a previous session.

> **Why does it remember within the same conversation?**
> The chat UI sends the full message history with every request, so the model sees your name in the current context. The problem only becomes visible across sessions (page reloads), where no history is carried over.

## 2. Add memory to the agent

Open [web/src/mastra/agents/chatAgent.ts](../../web/src/mastra/agents/chatAgent.ts) and add a `Memory` instance:

```ts
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";

export const chatAgent = new Agent({
  // ... existing config ...
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
```

## 3. Verify memory works

Tell the agent your name:
> "My name is [your name]"

Now **reload the page** to start a new session, and ask:
> "What is my name?"

The agent should now correctly recall your name across sessions.

---

## Reflection questions

Think about these before moving on — no need to implement them:

- What would happen if two users share the same thread ID?
- When would you use global memory (across threads) vs thread-scoped memory?
- If a conversation grows very long, how could you reduce the number of tokens sent per request without losing important context?

---

## Next steps

Once you've confirmed that:
- [ ] After a page reload, the agent cannot recall your name without memory
- [ ] After a page reload, the agent correctly recalls your name after memory is configured

You are ready to proceed to Exercise 5.

[▶ Click here to proceed to Exercise 5](../exercise-5/exercise-5.md)
