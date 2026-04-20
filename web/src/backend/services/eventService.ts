import { db } from "@/backend/db/dbClient";
import { events, eventParticipants, participants } from "@/backend/db/schema";
import { eq, and, like } from "drizzle-orm";

export type EventRow = {
  id: string;
  name: string;
  date: string;
  description: string | null;
};

export type EventParticipantRow = {
  id: string;
  firstName: string;
  lastName: string;
  snackPreference: string | null;
  hasEmbeddings: boolean;
};

export async function createEvent(
  id: string,
  name: string,
  date: string,
  description?: string
): Promise<EventRow> {
  const existing = await searchEvents(name, date);
  const exact = existing.find(e => e.name.toLowerCase() === name.
    toLowerCase() && e.date === date);
  if (exact) return exact;
  await db.insert(events).values({ id, name, date, description });
  return { id, name, date, description: description ?? null };
}

export async function deleteEvent(id: string): Promise<boolean> {
  const deleted = await db.delete(events).where(eq(events.id, id)).returning({ id: events.id });
  return deleted.length > 0;
}

export async function updateEvent(
  id: string,
  updates: Partial<{ name: string; date: string; description: string }>
): Promise<EventRow | null> {
  const [updated] = await db.update(events).set(updates).where(eq(events.id, id)).returning();
  return updated ?? null;
}

export async function searchEvents(
  name?: string,
  date?: string
): Promise<EventRow[]> {
  if (name && date) {
    return db.select().from(events).where(and(like(events.name, `%${name}%`), eq(events.date, date)));
  }
  if (name) {
    return db.select().from(events).where(like(events.name, `%${name}%`));
  }
  if (date) {
    return db.select().from(events).where(eq(events.date, date));
  }
  return db.select().from(events);
}

export type AddParticipantResult =
  | { success: true }
  | { success: false; reason: "eventNotFound" | "participantNotFound" };

export async function getEventById(id: string): Promise<EventRow | null> {
  const [event] = await db.select().from(events).where(eq(events.id, id));
  return event ?? null;
}

export async function addParticipantToEvent(
  eventId: string,
  participantId: string
): Promise<AddParticipantResult> {
  const [event] = await db.select().from(events).where(eq(events.id, eventId));
  if (!event) return { success: false, reason: "eventNotFound" };
  const [participant] = await db.select().from(participants).where(eq(participants.id, participantId));
  if (!participant) return { success: false, reason: "participantNotFound" };
  await db.insert(eventParticipants).values({ eventId, participantId }).onConflictDoNothing();
  return { success: true };
}

export async function removeParticipantFromEvent(
  eventId: string,
  participantId: string
): Promise<boolean> {
  const existing = await db
    .select()
    .from(eventParticipants)
    .where(and(eq(eventParticipants.eventId, eventId), eq(eventParticipants.participantId, participantId)));
  if (existing.length === 0) return false;
  await db
    .delete(eventParticipants)
    .where(and(eq(eventParticipants.eventId, eventId), eq(eventParticipants.participantId, participantId)));
  return true;
}

export async function getEventParticipants(
  eventId: string
): Promise<{ event: EventRow | null; participants: EventParticipantRow[] }> {
  const [event] = await db.select().from(events).where(eq(events.id, eventId));
  if (!event) return { event: null, participants: [] };
  const rows = await db
    .select({
      id: participants.id,
      firstName: participants.firstName,
      lastName: participants.lastName,
      snackPreference: participants.snackPreference,
      embeddings: participants.embeddings,
    })
    .from(eventParticipants)
    .innerJoin(participants, eq(eventParticipants.participantId, participants.id))
    .where(eq(eventParticipants.eventId, eventId));
  return {
    event,
    participants: rows.map(({ embeddings, ...rest }) => ({
      ...rest,
      hasEmbeddings: embeddings !== null,
    })),
  };
}
