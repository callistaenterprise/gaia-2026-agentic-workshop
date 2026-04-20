import { OrderWorkflowSchema } from '@/lib/types';
import { createStep } from '@mastra/core/workflows';

export const selectSnacks = createStep({
  id: 'select-snacks',
  description: 'Select best eligible snack per participant and compute totals',
  inputSchema: OrderWorkflowSchema,
  outputSchema: OrderWorkflowSchema,
  execute: async ({ inputData }) => {

    console.log("selectSnacksStep: execute");

    const participants = inputData.participants.map((p) => {
      const eligible = p.snackOptions.filter((s) => {
        if (inputData.excludedSnackIds.includes(s.id)) return false;
        if (inputData.snackMaxPrice != null && (s.pricePerUnit ?? 0) > inputData.snackMaxPrice) return false;
        return true;
      });
      const selected = eligible[0] ?? p.snackOptions[0];
      const selectedIndex = eligible[0] ? p.snackOptions.findIndex((s) => s.id === selected.id) : -1;
      const customerSatisfaction = selectedIndex >= 0 ? Math.max(1, p.snackOptions.length - selectedIndex) : 0;
      return {
        ...p,
        selectedSnackId: selected?.id ?? null,
        selectedSnackPrice: selected?.pricePerUnit ?? null,
        customerSatisfaction,
      };
    });

    const totalCost = participants.reduce((sum, p) => {
      const selected = p.snackOptions.find((s) => s.id === p.selectedSnackId);
      return sum + (selected?.pricePerUnit ?? 0);
    }, 0);

    const noOfSnackTypes = new Set(participants.map((p) => p.selectedSnackId)).size;
    const customerSatisfaction = participants.length > 0
      ? participants.reduce((sum, p) => sum + p.customerSatisfaction, 0) / participants.length
      : 0;

    return {
      ...inputData,
      totalCost,
      noOfSnackTypes,
      customerSatisfaction,
      participants,
      meetsInstructions: true,
    };
  },
});
