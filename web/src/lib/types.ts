import { z } from 'zod'
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import type { snacks, events, eventParticipants } from '@/backend/db/schema'

// ─── Order workflow types ──────────────────────────────────────────────────────

export const SnackSchema = z.object({
  id: z.string().describe('The snack id'),
  name: z.string().describe('The snack name'),
  pricePerUnit: z.number().nullable().describe('The snack price per unit'),
});

export const participantAtEventSchema = z.object({
  participantId: z.string().describe('The participant id'),
  participantName: z.string().describe('The participant name'),
  snackPreference: z.string().describe('The snack preference'),
  selectedSnackId: z.string().nullable().describe('The snack id'),
  snackOptions: z.array(SnackSchema).describe('The snack options'),
  selectedSnackPrice: z.number().nullable().describe('The price of the selected snack'),
  customerSatisfaction: z.number().default(0).describe('Match quality: 5=first option selected, 1=last option, 0=no eligible option'),
});

/* 
The data structure used by the order workflow. 
This data is passed around the workflow steps. It is also available in the UI. 
*/
export const OrderWorkflowSchema = z.object({
  eventId: z.string().describe('The event id'),
  totalCost: z.number().describe('The total cost of the event'),
  noOfSnackTypes: z.number().describe('The number of snack types'),
  customerSatisfaction: z.number().default(0).describe('Average satisfaction rate across all participants (0–5)'),
  participants: z.array(participantAtEventSchema).describe('The participants at the event'),
  instructions: z.string().optional().describe('User instructions, e.g. prioritize low cost or fewer snack types'),
  excludedSnackIds: z.array(z.string()).default([]).describe('Snack IDs excluded from selection'),
  snackMaxPrice: z.number().nullable().optional().describe('Maximum price per snack unit'),
  meetsInstructions: z.boolean().optional().describe('Whether the current order meets the instructions'),
  orderId: z.string().optional().describe('The created order ID'),
  workflowRunId: z.string().optional().describe('Mastra workflow run ID, used to resume a suspended workflow'),
  awaitingApproval: z.boolean().default(false).describe('True when the workflow is suspended and waiting for human approval'),
  optimizationHistory: z.array(z.object({
    iteration: z.number().describe('The iteration number'),
    excludedSnackIds: z.array(z.string()).describe('The snack ids excluded from selection'),
    snackMaxPrice: z.number().nullable().optional().describe('Maximum price per snack unit'),
    totalCost: z.number().describe('The total cost of the event'),
    noOfSnackTypes: z.number().describe('The number of snack types'),
    customerSatisfaction: z.number().default(0).describe('Average satisfaction rate across all participants (0–5)'),
    reason: z.string().describe('The reason for the optimization attempt'),
    meetsInstructions: z.boolean().describe('Whether the current order meets the instructions'),
  })).default([]).describe('History of optimization attempts'),
});

// ─── Domain types inferred from Drizzle schema ────────────────────────────────

export type Snack             = InferSelectModel<typeof snacks>

export type Participant = {
  id: string
  firstName: string
  lastName: string
  snackPreference: string | null
  hasEmbeddings: boolean
}

// Named AppEvent to avoid collision with the DOM built-in Event type
export type AppEvent          = InferSelectModel<typeof events>
export type EventParticipant  = InferSelectModel<typeof eventParticipants>
