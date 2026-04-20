import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import {
  createEvent,
  deleteEvent,
  updateEvent,
  searchEvents,
  addParticipantToEvent,
  removeParticipantFromEvent,
  getEventParticipants,
} from "@/backend/services/eventService";
import { eventSchema } from "./schemas";

export const addEventTool = createTool({
  id: "addEventTool",
  description: "Create a new event with a name, date, and optional description",
  inputSchema: z.object({
    name: z.string().describe("Name of the event"),
    date: z.string().describe("Event date in ISO 8601 format, e.g. 2026-06-15"),
    description: z.string().optional().describe("Optional event description"),
  }),
  outputSchema: eventSchema,
  execute: async ({ name, date, description }) => {
    const id = crypto.randomUUID();
    const result = await createEvent(id, name, date, description);
    return result;
  },
});

export const deleteEventTool = createTool({
  id: "deleteEventTool",
  description: "Delete an event by its ID",
  inputSchema: z.object({
    id: z.string().describe("ID of the event to delete"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async ({ id }) => {
    const deleted = await deleteEvent(id);
    if (!deleted) {
      return { success: false, message: `Event with id "${id}" not found` };
    }
    return { success: true, message: `Event "${id}" deleted successfully` };
  },
});

export const updateEventTool = createTool({
  id: "updateEventTool",
  description: "Update an existing event's name, date, or description",
  inputSchema: z.object({
    id: z.string().describe("ID of the event to update"),
    name: z.string().optional().describe("New event name"),
    date: z.string().optional().describe("New date in ISO 8601 format"),
    description: z.string().optional().describe("New description"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    event: eventSchema.optional(),
  }),
  execute: async ({ id, name, date, description }) => {
    const updates: Partial<{ name: string; date: string; description: string }> = {};
    if (name !== undefined) updates.name = name;
    if (date !== undefined) updates.date = date;
    if (description !== undefined) updates.description = description;

    const event = await updateEvent(id, updates);
    if (!event) {
      return { success: false, message: `Event with id "${id}" not found` };
    }
    return { success: true, message: "Event updated", event };
  },
});

export const searchEventsTool = createTool({
  id: "searchEventsTool",
  description: "Search events by name (partial match) and/or exact date. Returns all events if no filters given.",
  inputSchema: z.object({
    name: z.string().optional().describe("Partial name to search for (case-insensitive)"),
    date: z.string().optional().describe("Exact date to filter by, e.g. 2026-03-15"),
  }),
  outputSchema: z.array(eventSchema),
  execute: async ({ name, date }) => {
    const results = await searchEvents(name, date);
    return results;
  },
});

export const addParticipantToEventTool = createTool({
  id: "addParticipantToEventTool",
  description: "Add a participant to an event",
  inputSchema: z.object({
    eventId: z.string().describe("ID of the event"),
    participantId: z.string().describe("ID of the participant to add"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async ({ eventId, participantId }) => {
    const result = await addParticipantToEvent(eventId, participantId);
    if (!result.success) {
      const msg = result.reason === "eventNotFound"
        ? `Event "${eventId}" not found`
        : `Participant "${participantId}" not found`;
      return { success: false, message: msg };
    }
    const ok = { success: true, message: "Participant added to event successfully" };
    return ok;
  },
});

export const removeParticipantFromEventTool = createTool({
  id: "removeParticipantFromEventTool",
  description: "Remove a participant from an event",
  inputSchema: z.object({
    eventId: z.string().describe("ID of the event"),
    participantId: z.string().describe("ID of the participant to remove"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async ({ eventId, participantId }) => {
    const removed = await removeParticipantFromEvent(eventId, participantId);
    if (!removed) {
      return { success: false, message: `Participant "${participantId}" is not linked to event "${eventId}"` };
    }
    return { success: true, message: "Participant removed from event successfully" };
  },
});

export const getEventParticipantsTool = createTool({
  id: "getEventParticipantsTool",
  description: "Get all participants for a specific event, including their snack preferences",
  inputSchema: z.object({
    eventId: z.string().describe("ID of the event"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    participants: z.array(z.object({
      id: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      snackPreference: z.string().nullable(),
    })).optional(),
  }),
  execute: async ({ eventId }) => {
    const { event, participants } = await getEventParticipants(eventId);
    if (!event) {
      return { success: false, message: `Event "${eventId}" not found` };
    }
    return {
      success: true,
      message: `Found ${participants.length} participant(s) for event "${event.name}"`,
      participants,
    };
  },
});

export const eventTools = {
  addEventTool,
  deleteEventTool,
  updateEventTool,
  searchEventsTool,
  addParticipantToEventTool,
  removeParticipantFromEventTool,
  getEventParticipantsTool,
};
