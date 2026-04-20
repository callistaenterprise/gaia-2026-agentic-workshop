# Exercise 3: Shaping behaviour with a system prompt

[◀ Go back to Exercise 2](../exercise-2/exercise-2.md)

In this exercise you will change the agent's system prompt and observe how it affects responses.

---

## Background

The **system prompt** (called `instructions` in Mastra) is sent to the model before any user message. It sets the persona, rules, and scope of the agent. Even a small wording change can significantly alter how the model responds.

Because the system prompt is part of every request, it also contributes to your token budget — keep it focused.

---

# Step-by-step instructions

## 1. Observe the current behaviour

Open http://localhost:3000 and ask the agent something outside its intended domain, for example:
> "Can you help me write a poem?"

Note how it responds.

## 2. Add a domain-specific system prompt

Open [web/src/mastra/agents/chatAgent.ts](../../web/src/mastra/agents/chatAgent.ts) and replace the `instructions` field with something more specific:

```ts
instructions: `You are an assistant for managing conference events.
You help users create and look up events, manage participants, and handle snack orders.
If the user asks about topics unrelated to events or participants, politely let them know that is outside your scope.`,
```

Save the file. Next.js will hot-reload the change automatically.

## 3. Verify the change

In the chat, ask the same off-topic question again:
> "Can you help me write a poem?"

The agent should now decline or redirect. Then try an on-topic question:
> "What can you help me with?"

Verify the answer reflects the new instructions.

---

## Next steps

Once you've confirmed that:
- [ ] The system prompt controls what topics the agent engages with
- [ ] Off-topic requests are handled differently after the change

You are ready to proceed to Exercise 4.

[▶ Click here to proceed to Exercise 4](../exercise-4/exercise-4.md)
