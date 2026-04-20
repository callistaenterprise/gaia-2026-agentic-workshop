import { z } from "zod";

export const snackSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  pricePerUnit: z.number().nullable(),
  internalDescription: z.string().nullable(),
});

export const eventSchema = z.object({
  id: z.string(),
  name: z.string(),
  date: z.string(),
  description: z.string().nullable(),
});

export const eventOutputSchema = z.object({
  events: z.array(eventSchema).optional().describe("List of events (search results)"),
  event: eventSchema.optional().describe("Single event (create/update result)"),
  participants: z.array(z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    snackPreference: z.string().nullable(),
  })).optional().describe("List of participants for an event"),
  success: z.boolean().optional().describe("Whether the operation succeeded"),
  message: z.string().optional().describe("Human-readable result summary"),
});

export const participantSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  snackPreference: z.string().nullable(),
  hasEmbeddings: z.boolean(),
});

export const participantOutputSchema = z.object({
  participants: z.array(participantSchema).optional().describe("List of participants (search results)"),
  participant: participantSchema.optional().describe("Single participant (create/update result)"),
  success: z.boolean().optional().describe("Whether the operation succeeded (update/delete)"),
  message: z.string().optional().describe("Human-readable result summary"),
});
