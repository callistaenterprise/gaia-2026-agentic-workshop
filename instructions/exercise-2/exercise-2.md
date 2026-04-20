# Exercise 2: Your first AI response

[◀ Go back to Exercise 1](../exercise-1/exercise-1.md)

In this exercise you will wire up a minimal chat agent and verify that it can respond to messages. No tools, no memory — just a model and an instruction.

---

## Background

An **AI agent** is a program that uses a language model to decide what to do next. At its simplest, an agent receives a message, sends it to the model together with a system prompt (_instructions_), and returns the response.

The application uses [Mastra](https://mastra.ai/) as the agent framework. Agents are defined in `web/src/mastra/agents/`.

---

# Step-by-step instructions

## 1. Open the chat agent file

Open [web/src/mastra/agents/chatAgent.ts](../../web/src/mastra/agents/chatAgent.ts).

You will see that the agent has a placeholder model (`NOT_SPECIFIED`) and empty instructions. Your task is to replace the placeholder with the real Gemini model and write the first instructions.

## 2. Set the model and instructions

Replace `NOT_SPECIFIED` with `GEMINI_DEFAULT` and add instructions:

```ts
import { Agent } from "@mastra/core/agent";
import { google } from "@ai-sdk/google";
import { GEMINI_DEFAULT } from "../../lib/geminiModels";

export const chatAgent = new Agent({
  id: "chat-agent",
  name: "Chat Agent",
  model: google(GEMINI_DEFAULT),
  instructions: `You are a helpful assistant.`,
});
```

> **_NOTE:_** The application reads your `GOOGLE_GENERATIVE_AI_API_KEY` from the `.env.local` file you created in exercise 1.

## 3. Register the agent

Open [web/src/mastra/index.ts](../../web/src/mastra/index.ts) and verify that `chatAgent` is registered with the Mastra instance. It should look something like:

```ts
import { chatAgent } from "./agents/chatAgent";

export const mastra = new Mastra({
  agents: { chatAgent },
});
```

## 4. Test in the UI

Make sure the application is running (`npm run dev`), then open http://localhost:3000.

Type a question such as:
> "What is the capital of Sweden?"

Verify that the chat responds with a relevant answer.

---

## Next steps

Once you've confirmed that:
- [ ] The agent is defined with a model and instructions
- [ ] The agent is registered with Mastra
- [ ] The chat responds to a question

You are ready to proceed to Exercise 3.

[▶ Click here to proceed to Exercise 3](../exercise-3/exercise-3.md)
