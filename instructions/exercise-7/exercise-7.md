# Exercise 7: Semantic search with MCP

[◀ Go back to Exercise 6](../exercise-6/exercise-6.md)

In this exercise you will connect the Snacks MCP server to the chat agent, enabling semantic (meaning-based) search over snacks using vector embeddings.

---

## Background

### Keyword search vs semantic search

A traditional keyword search finds records that contain the exact words you searched for. Semantic search instead converts both the query and the stored content into **embedding vectors** — lists of numbers that capture meaning — and finds records whose vectors are closest to the query vector.

This means a query like _"something crunchy and salty"_ can match a snack described as _"crispy salted pretzel sticks"_, even though none of those exact words appear in both.

```
Query: "something sweet and fruity"
         ↓  embed
    [0.12, -0.43, 0.87, ...]

Snack A: "gummy bears"       → [0.11, -0.41, 0.85, ...] ← high similarity ✓
Snack B: "salt crackers"     → [0.72,  0.31, -0.12, ...] ← low similarity ✗
```

### How this app uses it

Each snack has an `internalDescription` field (e.g. _"sweet, chewy, fruit-flavoured candy"_). When a snack is created or updated, it is embedded and stored in **LanceDB** (a vector database running locally alongside the app).

The `semanticSearchSnacksTool` accepts a natural-language query, embeds it, and retrieves the most similar snacks from Lance.

### What is MCP?

**Model Context Protocol (MCP)** is a standard for exposing tools to language models over a well-defined interface, similar to how REST is a standard for web APIs. Instead of registering tools directly on an agent, you can expose them through an MCP server. This makes tools reusable across agents and frameworks.

**Pros:**
- Tools are decoupled from any single agent
- The same MCP server can be used by different agents or even different applications

**Cons:**
- An extra layer of indirection (adds a small overhead)
- Slightly more setup than direct tool registration

---

# Step-by-step instructions

## 1. Check that LanceDB is running

LanceDB is embedded — it runs inside the app process with no separate server.

To verify it is set up correctly:

1. **Index the snacks** by running:
   ```bash
   npm run db:index
   ```
   The seed script calls `indexAllSnacks()` which generates embeddings and writes them to LanceDB.

2. **Confirm the data directory was created.** After seeding, a `.lancedb-data/` folder should appear in the root folder. Inside it you should see a `snacks.lance/` directory.

## 2. Connect the MCP server to the chat agent

Open [web/src/mastra/agents/chatAgent.ts](../../web/src/mastra/agents/chatAgent.ts) and add the snack MCP tools:

```ts
import { snacksMcpServer } from "../mcp/snacksMcp";

export const chatAgent = new Agent({
  // ... existing config ...
  tools: {
    ...snacksMcpServer.tools(),
    eventAgentTool,
    participantAgentTool,
  },
});
```

Also add snack guidance to the instructions:

```ts
instructions: `...
For any request related to snacks, use the snack tools available directly (they come from the MCP server).`,
```

## 3. Test keyword search

In the chat, ask:
> "What snacks do we have available?"

This should use `searchSnacksTool` and return a list of snacks from the database.

## 4. Test semantic search

Ask:
> "Find me a snack that is sweet and chocolatey"

This should use `semanticSearchSnacksTool` and return snacks whose internal descriptions are semantically similar — even if the word "chocolatey" does not appear verbatim.

Try a few different natural-language queries and observe the similarity scores returned.

---

## Reflection questions

- What is the difference between the `searchSnacksTool` (keyword) and `semanticSearchSnacksTool` (vector)?
- What would happen if the `internalDescription` of a snack is empty or vague?
- When would keyword search be more appropriate than semantic search?

---

## Next steps

Once you've confirmed that:
- [ ] The agent can list available snacks via chat
- [ ] The agent returns semantically relevant snacks for a natural-language preference
- [ ] You understand the difference between keyword and semantic search

**This is a good time for a break — grab a fika before continuing.**

After the break, check out the stable branch for the workflow exercises:

```bash
git checkout workflow-exercises
```

Then proceed to Exercise 8.

[▶ Click here to proceed to Exercise 8](../exercise-8/exercise-8.md)
