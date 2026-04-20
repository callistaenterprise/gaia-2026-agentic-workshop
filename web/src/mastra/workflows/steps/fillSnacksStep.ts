import { getSimilarSnacks } from '@/backend/services/embeddingService';
import { getParticipantEmbeddings } from '@/backend/services/participantService';
import { OrderWorkflowSchema } from '@/lib/types';
import { createStep } from '@mastra/core/workflows';

export const fillSnacks = createStep({
  id: 'fillPossibleSnacks',
  description: 'Find 5 most suitable snacks for a participant',
  inputSchema: OrderWorkflowSchema,
  outputSchema: OrderWorkflowSchema,
  execute: async ({ inputData }) => {

    const participants = await Promise.all(
      inputData.participants.map(async (p) => {
        const embedding = await getParticipantEmbeddings(p.participantId);
        const snackOptions = embedding ? await getSimilarSnacks(embedding, 5) : [];
        return { ...p, snackOptions };
      })
    );

    return {
      ...inputData,
      participants,
    };
  },
});
