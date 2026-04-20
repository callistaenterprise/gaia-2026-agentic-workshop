import { OrderWorkflowSchema } from '@/lib/types';
import { createStep } from '@mastra/core/workflows';
import { z } from 'zod';

export const approveStep = createStep({
  id: 'approve-order',
  description: 'Human confirms the order before finalizing',
  inputSchema: OrderWorkflowSchema,
  outputSchema: OrderWorkflowSchema,
  resumeSchema: z.object({ approved: z.boolean() }),
  execute: async ({ inputData }) => {
    return inputData;
  },
});
