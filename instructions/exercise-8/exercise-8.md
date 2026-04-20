# Exercise 8: Agentic workflows and order optimization

[◀ Go back to Exercise 7](../exercise-7/exercise-7.md)

In this exercise you will run and extend a multi-step workflow for creating a snack order. You will observe the workflow without suspension, add human-in-the-loop approval, and finally switch to an AI-driven optimization loop.

---

## Background

### What is a workflow?

An **agentic workflow** is a sequence of steps where each step has a defined input and output schema. Unlike a single LLM call, a workflow can span multiple steps, conditionally branch, loop, and pause for human input.

Steps are composable and independently testable. The framework guarantees that the output of one step matches the input schema of the next.

### Human-in-the-loop

Some decisions should not be made by an AI alone. A **suspension point** (`suspend`) pauses the workflow and serializes its entire state to persistent storage. The workflow can later be **resumed** with a human decision (e.g. approved/rejected).

This is useful for:
- High-stakes actions (placing orders, sending emails)
- Cases where the AI is uncertain
- Regulatory requirements for human oversight

When a workflow is suspended, Mastra stores the full execution state so the workflow can be resumed at any point — even after a server restart or a long delay. The data the user provides on resume is validated against the step's `resumeSchema` before being injected as `resumeData` into the next execution.

### Optimization loop

The order optimization uses a `dountil` loop: the workflow repeats a sub-workflow until either the instructions are satisfied or a maximum number of iterations is reached. At each iteration, an LLM evaluates whether the current order meets the user's instructions and, if not, proposes new constraints (e.g. "exclude expensive snacks", "lower the price limit").

---

# Step-by-step instructions

## Part 8.1 — Run the simple workflow

### 1. Register the workflows

Two workflows have been prepared for this exercise: `simpleOrderWorkflow` and `optimizingOrderWorkflow`. Open [web/src/mastra/index.ts](../../web/src/mastra/index.ts) and register them with the Mastra instance:

```ts
import { simpleOrderWorkflow } from "./workflows/simpleOrderWorkflow";
import { optimizingOrderWorkflow } from "./workflows/optimizingOrderWorkflow";

export const mastra = new Mastra({
  // ... existing config ...
  workflows: {
    simpleOrderWorkflow,
    optimizingOrderWorkflow,
  },
});
```

### 2. Confirm the active workflow

Open `web/.env` and verify that the order workflow is set to the simple variant:

```
ORDER_WORKFLOW_ID=simpleOrderWorkflow
```

This controls which workflow is used by the order API routes. With this value, the simple linear workflow is used.

### 3. Understand the workflow steps

Open [web/src/mastra/workflows/simpleOrderWorkflow.ts](../../web/src/mastra/workflows/simpleOrderWorkflow.ts). You will see this pipeline:

```
fillSnacks → selectSnacks → approveStep → createOrder
```

- **fillSnacks** — uses vector similarity to find the 5 most suitable snacks for each participant based on their snack preference
- **selectSnacks** — picks the best eligible snack per participant given current constraints; computes total cost and customer satisfaction
- **approveStep** — human confirmation step (currently empty — more on this in Part 8.2)
- **createOrder** — saves the finalized order to the database

### 4. Trigger the workflow from the UI

Navigate to an event in the app and open its order page (`/events/[id]/order`). Click **Prepare Order**.

Since `approveStep` is currently empty, the workflow runs straight through all steps and creates the order immediately. Observe the snack selections and order summary in the UI.

---

## Part 8.2 — Add human-in-the-loop approval

### 1. Understand the approveStep structure

Open [web/src/mastra/workflows/steps/approveStep.ts](../../web/src/mastra/workflows/steps/approveStep.ts). The step is already declared with:

- `inputSchema` / `outputSchema` — both use `OrderWorkflowSchema`, so order data flows through unchanged
- `resumeSchema: z.object({ approved: z.boolean() })` — defines the shape of data the user must provide to resume the workflow (the Approve/Reject decision from the UI)

The `execute` function body is currently empty. Your task is to implement it.

### 2. Implement the suspend logic

Add the following body to the `execute` function:

```ts
execute: async ({ inputData, resumeData, suspend }) => {
  const { approved } = resumeData ?? {};
  if (!approved) {
    await suspend({ ...inputData, awaitingApproval: true });
    return inputData;
  }
  return { ...inputData, awaitingApproval: false };
},
```

**What this does, step by step:**

1. On the **first execution**, `resumeData` is `undefined`, so `approved` is falsy.
2. `await suspend({ ...inputData, awaitingApproval: true })` serializes the full workflow state (including the `awaitingApproval` flag) to Mastra's persistence layer and pauses execution. The UI uses this flag to show the Approve/Reject buttons, and receives a `workflowRunId` to know which workflow to resume.
3. When the user clicks **Approve** or **Reject** in the UI, the frontend sends `{ approved: true/false }` to the Mastra resume endpoint. Mastra validates this against `resumeSchema` and re-runs the step with `resumeData` populated.
4. On the **resumed execution**, `approved` is `true` — the step returns `inputData` with `awaitingApproval: false` and the workflow continues to `createOrder`.

### 3. Test the approval flow

Click **Prepare Order** again. The workflow should now pause at the approve step and display **Approve / Reject** buttons. Approve the order and verify it is saved to the database. Try rejecting an order to confirm the workflow stops cleanly.

---

## Part 8.3 — Optimize the order with an AI loop

### 1. Switch to the optimizing workflow

Open `web/.env` and change the value:

```
ORDER_WORKFLOW_ID=optimizingOrderWorkflow
```

Restart the development server (`npm run dev` in `web/`).

### 2. Understand the optimization workflow

Open [web/src/mastra/workflows/optimizingOrderWorkflow.ts](../../web/src/mastra/workflows/optimizingOrderWorkflow.ts). The pipeline is:

```
fillSnacks → [dountil: selectSnacks → reviewAndOptimizeStep] → approveStep → createOrder
```

The `dountil` loop repeats the inner sub-workflow (`optimizationLoop`) until one of these conditions is true:
- `meetsInstructions` is `true` (the LLM confirmed the order satisfies the user's instructions)
- The loop has run 5 times (safety cap to prevent infinite loops)

At each iteration:
- **selectSnacks** applies the current constraints (excluded snack IDs, price limit) and picks the best eligible snack per participant
- **reviewAndOptimizeStep** calls the LLM to evaluate whether the order meets the instructions. If it does not, it proposes new constraints for the next iteration.

### 3. Implement the prompt functions

Open [web/src/mastra/workflows/steps/reviewAndOptimizeStep.ts](../../web/src/mastra/workflows/steps/reviewAndOptimizeStep.ts).

The step calls two prompt builder functions — `buildReviewPrompt` and `buildOptimizerPrompt` — that currently contain placeholder text. Your task is to write the actual prompts.

**`buildReviewPrompt`** — sent to the LLM to evaluate whether the current order satisfies the user's instructions. The LLM must respond with `meetsInstructions` (boolean) and a brief `reason`.

Your prompt should include:
- The user's instructions (`state.instructions`)
- The current order: which snack each participant received, its price, and their satisfaction score — the variable `participantSummary` is already built for you
- The totals: `state.totalCost`, `state.noOfSnackTypes`, `state.customerSatisfaction`
- A clear question asking whether the order meets the instructions

**`buildOptimizerPrompt`** — sent to the LLM when the order does _not_ meet the instructions, to propose new constraints for the next iteration. The LLM must respond with `excludedSnackIds`, `snackMaxPrice`, and `reason`.

Your prompt should include:
- The user's instructions
- The current order including all available snack options per participant (so the LLM can reference specific snack IDs to exclude) — `participantSummary` includes options in this function
- The optimization history so the LLM does not repeat constraint combinations that already failed — the variable `historyText` is already built for you
- Instructions on what to output: a list of snack IDs to exclude, a maximum price per snack unit (or `null`), and a reason explaining why the new constraints should help

> **_TIP:_** Both functions already compute `participantSummary` and `historyText` at the top — include them in your prompt string using template literals.

> **_NOTE:_** The LLM response is parsed into a structured object by the framework, so you do not need to describe the JSON format in the prompt. Focus on giving the model enough context to make a good decision.

### 4. Test with optimization instructions

Navigate to the order page and enter instructions in the text field, for example:

> Keep the total cost under 50 SEK

Click **Prepare Order**. Watch the terminal logs and the **Optimization history** table in the UI to see each iteration's constraints and outcome.

After the loop completes, the workflow pauses at `approveStep` for human approval — just as in Part 8.2. Approve the optimized order.

---

## Reflection questions

- What is the maximum number of optimization iterations, and why might you want a cap?
- When is a workflow preferable to a single LLM call with many tools?

---

## Checklist

Once you've confirmed that:
- [ ] The simple workflow runs end-to-end and creates an order without suspension
- [ ] `approveStep` suspends the workflow and resumes correctly after Approve/Reject
- [ ] The prompt functions in `reviewAndOptimizeStep.ts` are implemented
- [ ] The optimization loop adjusts snack selections based on instructions
- [ ] The approved optimized order is saved to the database

**Congratulations — you have completed the workshop!**

[◀ Go back to start page](../../README.md)
