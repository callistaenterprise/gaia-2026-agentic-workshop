import { OrderWorkflowSchema } from '@/lib/types';
import { createWorkflow } from '@mastra/core/workflows';
import { fillSnacks } from './steps/fillSnacksStep';
import { selectSnacks } from './steps/selectSnacksStep';
import { reviewAndOptimizeStep } from './steps/reviewAndOptimizeStep';
import { approveStep } from './steps/approveStep';
import { createOrder } from './steps/createOrderStep';

type OrderWorkflowState = ReturnType<typeof OrderWorkflowSchema.parse>;

// Sub-workflow used as the dountil loop body
// selectSnacks picks snacks → reviewAndOptimizeStep evaluates and proposes new constraints if not met
const optimizationLoop = createWorkflow({
  id: 'optimizationLoop',
  inputSchema: OrderWorkflowSchema,
  outputSchema: OrderWorkflowSchema,
})
  .then(selectSnacks)
  .then(reviewAndOptimizeStep)
  .commit();

const optimizingOrderWorkflow = createWorkflow({
  id: 'optimizingOrderWorkflow',
  inputSchema: OrderWorkflowSchema,
  outputSchema: OrderWorkflowSchema,
})
  .then(fillSnacks)
  .dountil(
    optimizationLoop,
    async ({ inputData, iterationCount }) =>
      (inputData as OrderWorkflowState).meetsInstructions === true || iterationCount >= 5,
  )
  .then(approveStep)
  .then(createOrder)
  .commit();

export { optimizingOrderWorkflow };
