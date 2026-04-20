import { OrderWorkflowSchema } from '@/lib/types';
import { createWorkflow } from '@mastra/core/workflows';
import { fillSnacks } from './steps/fillSnacksStep';
import { selectSnacks } from './steps/selectSnacksStep';
import { approveStep } from './steps/approveStep';
import { createOrder } from './steps/createOrderStep';

const simpleOrderWorkflow = createWorkflow({
  id: 'simpleOrderWorkflow',
  inputSchema: OrderWorkflowSchema,
  outputSchema: OrderWorkflowSchema,
})
  .then(fillSnacks)
  .then(selectSnacks)
  .then(approveStep)
  .then(createOrder)
  .commit();

export { simpleOrderWorkflow };
