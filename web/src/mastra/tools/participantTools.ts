import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import {
  createParticipant,
  deleteParticipant,
  updateParticipant,
  searchParticipants,
} from "@/backend/services/participantService";
import { participantSchema } from "./schemas";

export const addParticipantTool = createTool({
  id: "addParticipantTool",
  description: "Create a new participant with a first name, last name, and optional snack preference",
  inputSchema: z.object({
    firstName: z.string().describe("First name of the participant"),
    lastName: z.string().describe("Last name of the participant"),
    snackPreference: z.string().optional().describe("Optional snack preference of the participant (free text)"),
  }),
  outputSchema: participantSchema,
  execute: async ({ firstName, lastName, snackPreference }) => {
    const result = await createParticipant(firstName, lastName, snackPreference);
    return result;
  },
});

export const deleteParticipantTool = createTool({
  id: "deleteParticipantTool",
  description: "Delete a participant by their ID",
  inputSchema: z.object({
    id: z.string().describe("ID of the participant to delete"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async ({ id }) => {
    const deleted = await deleteParticipant(id);
    if (!deleted) {
      return { success: false, message: `Participant with id "${id}" not found` };
    }
    return { success: true, message: `Participant "${id}" deleted successfully` };
  },
});

export const updateParticipantTool = createTool({
  id: "updateParticipantTool",
  description: "Update an existing participant's first name, last name, or snack preference",
  inputSchema: z.object({
    id: z.string().describe("ID of the participant to update"),
    firstName: z.string().optional().describe("New first name"),
    lastName: z.string().optional().describe("New last name"),
    snackPreference: z.string().optional().describe("New snack preference (free text)"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    participant: participantSchema.optional(),
  }),
  execute: async ({ id, firstName, lastName, snackPreference }) => {
    const updates: Partial<{ firstName: string; lastName: string; snackPreference: string }> = {};
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (snackPreference !== undefined) updates.snackPreference = snackPreference;

    const participant = await updateParticipant(id, updates);
    if (!participant) {
      return { success: false, message: `Participant with id "${id}" not found` };
    }
    return { success: true, message: "Participant updated", participant };
  },
});

export const searchParticipantsTool = createTool({
  id: "searchParticipantsTool",
  description: "Search participants by first name and/or last name (partial match). Returns all participants if no filters given.",
  inputSchema: z.object({
    firstName: z.string().optional().describe("Partial first name to search for (case-insensitive)"),
    lastName: z.string().optional().describe("Partial last name to search for (case-insensitive)"),
  }),
  outputSchema: z.array(participantSchema),
  execute: async ({ firstName, lastName }) => {
    const results = await searchParticipants(firstName, lastName);
    return results;
  },
});

export const participantTools = {
  addParticipantTool,
  deleteParticipantTool,
  updateParticipantTool,
  searchParticipantsTool,
};
