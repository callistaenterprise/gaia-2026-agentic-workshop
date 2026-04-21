import { GEMINI_DEFAULT } from '@/lib/geminiModels';
import { OrderWorkflowSchema } from '@/lib/types';
import { google } from '@ai-sdk/google';
import { createStep } from '@mastra/core/workflows';
import { generateText, Output } from 'ai';
import { z } from 'zod';

type OrderWorkflowState = ReturnType<typeof OrderWorkflowSchema.parse>;

function buildReviewPrompt(state: OrderWorkflowState): string {
  const participantSummary = state.participants
    .map((p) => {
      const snack = p.snackOptions.find((s) => s.id === p.selectedSnackId);
      return `  - ${p.participantName}: ${snack?.name ?? 'none'} (${snack?.pricePerUnit != null ? `${snack.pricePerUnit} kr` : 'no price'}, satisfaction: ${p.customerSatisfaction.toFixed(1)}/5)`;
    })
    .join('\n');

  return `You are reviewing a snack order for an event.

Instructions from the user: "${state.instructions}"

Current order:
${participantSummary}

Total cost: ${state.totalCost} kr
Number of different snack types: ${state.noOfSnackTypes}
Average customer satisfaction: ${state.customerSatisfaction.toFixed(2)} / 5 (5=best match, 1=worst match, 0=no eligible snack)

Does this order meet the user's instructions? Reply with meetsInstructions (true/false) and a brief reason.`;
}

function buildOptimizerPrompt(state: OrderWorkflowState): string {
  const participantSummary = state.participants
    .map((p) => {
      const snack = p.snackOptions.find((s) => s.id === p.selectedSnackId);
      const options = p.snackOptions.map((s) => `${s.name} (${s.pricePerUnit ?? '?'} kr, id: ${s.id})`).join(', ');
      return `  - ${p.participantName}: selected "${snack?.name ?? 'none'}" (satisfaction: ${p.customerSatisfaction.toFixed(1)}/5), options: [${options}]`;
    })
    .join('\n');

  const historyText =
    state.optimizationHistory.length === 0
      ? 'No previous attempts.'
      : state.optimizationHistory
        .map(
          (h) =>
            `  Iteration ${h.iteration}: excluded=[${h.excludedSnackIds.join(', ')}], maxPrice=${h.snackMaxPrice ?? 'none'}, totalCost=${h.totalCost} kr, types=${h.noOfSnackTypes}, satisfaction=${h.customerSatisfaction.toFixed(2)}, met=${h.meetsInstructions} — ${h.reason}`,
        )
        .join('\n');

  return `You are optimizing a snack order for an event.

Instructions from the user: "${state.instructions}"

Current order (does NOT meet instructions):
${participantSummary}

Total cost: ${state.totalCost} kr
Number of different snack types: ${state.noOfSnackTypes}
Average customer satisfaction: ${state.customerSatisfaction.toFixed(2)} / 5 (5=best match, 1=worst match, 0=no eligible snack)

Optimization history (do NOT repeat these):
${historyText}

Propose new constraints to help meet the instructions:
- excludedSnackIds: snack IDs to exclude (use the ids shown above)
- snackMaxPrice: maximum allowed price per snack unit (or null for no limit)
- reason: brief explanation of why these constraints should help

Only use snack IDs that appear in the options above.`;
}

export const reviewAndOptimizeStep = createStep({
  id: 'review-and-optimize',
  description: 'Reviews order and proposes new constraints if instructions are not met',
  inputSchema: OrderWorkflowSchema,
  outputSchema: OrderWorkflowSchema,
  execute: async ({ inputData }) => {


    const attempt = {
      iteration: inputData.optimizationHistory.length + 1,
      excludedSnackIds: inputData.excludedSnackIds,
      snackMaxPrice: inputData.snackMaxPrice ?? null,
      totalCost: inputData.totalCost,
      noOfSnackTypes: inputData.noOfSnackTypes,
      customerSatisfaction: inputData.customerSatisfaction,
      reason: 'There are no instructions, everything passes.',
      meetsInstructions: true,
    };

    if (!inputData.instructions) {
      return { ...inputData, meetsInstructions: true, optimizationHistory: [...inputData.optimizationHistory, attempt] };
    }

    const { output: review } = await generateText({
      model: google(GEMINI_DEFAULT),
      output: Output.object({ schema: z.object({ meetsInstructions: z.boolean(), reason: z.string() }) }),
      prompt: buildReviewPrompt(inputData),
    });

    attempt.reason = review.reason;
    attempt.meetsInstructions = review.meetsInstructions;

    const updatedHistory = [...inputData.optimizationHistory, attempt];

    if (review.meetsInstructions) {
      return { ...inputData, meetsInstructions: true, optimizationHistory: updatedHistory };
    }

    const stateForOptimizer = { ...inputData, meetsInstructions: false, optimizationHistory: updatedHistory };
    const { output: constraints } = await generateText({
      model: google(GEMINI_DEFAULT),
      output: Output.object({
        schema: z.object({
          excludedSnackIds: z.array(z.string()),
          snackMaxPrice: z.number().nullable(),
          reason: z.string(),
        }),
      }),
      prompt: buildOptimizerPrompt(stateForOptimizer),
    });

    return {
      ...inputData,
      meetsInstructions: false,
      optimizationHistory: updatedHistory,
      excludedSnackIds: constraints.excludedSnackIds,
      snackMaxPrice: constraints.snackMaxPrice,
    };
  },
});
