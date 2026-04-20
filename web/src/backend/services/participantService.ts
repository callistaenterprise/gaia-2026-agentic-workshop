import { db } from "@/backend/db/dbClient";
import { participants } from "@/backend/db/schema";
import { eq, and, like, asc } from "drizzle-orm";
import { generateEmbedding } from "@/backend/services/embeddingService";
import type { Participant, AppEvent } from "@/lib/types";

type DbParticipantRow = {
  id: string;
  firstName: string;
  lastName: string;
  snackPreference: string | null;
  embeddings: unknown;
};

function toParticipant(row: DbParticipantRow): Participant {
  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    snackPreference: row.snackPreference,
    hasEmbeddings: row.embeddings !== null,
  };
}

export async function getParticipants(): Promise<Participant[]> {
  const rows = await db
    .select()
    .from(participants)
    .orderBy(asc(participants.lastName), asc(participants.firstName));
  return rows.map(toParticipant);
}

export async function getParticipantById(
  id: string
): Promise<{ participant: Participant; events: AppEvent[] } | null> {
  const result = await db.query.participants.findFirst({
    where: eq(participants.id, id),
    with: { events: { with: { event: true } } },
  });
  if (!result) return null;
  return {
    participant: toParticipant(result),
    events: result.events.map(({ event }) => event),
  };
}

export async function createParticipant(
  firstName: string,
  lastName: string,
  snackPreference?: string
): Promise<Participant> {
  const existing = await searchParticipants(firstName, lastName);
  const exact = existing.find(
    p => p.firstName.toLowerCase() === firstName.toLowerCase() &&
      p.lastName.toLowerCase() === lastName.toLowerCase()
  );
  if (exact) return exact;
  const id = crypto.randomUUID();
  await db.insert(participants).values({ id, firstName, lastName, snackPreference });
  return { id, firstName, lastName, snackPreference: snackPreference ?? null, hasEmbeddings: false };
}

export async function deleteParticipant(id: string): Promise<boolean> {
  const deleted = await db.delete(participants).where(eq(participants.id, id)).returning({ id: participants.id });
  return deleted.length > 0;
}

export async function updateParticipant(
  id: string,
  updates: Partial<{ firstName: string; lastName: string; snackPreference: string }>
): Promise<Participant | null> {
  const existing = await db.select().from(participants).where(eq(participants.id, id));
  if (existing.length === 0) return null;
  await db.update(participants).set(updates).where(eq(participants.id, id));

  const snackPref = updates.snackPreference ?? existing[0].snackPreference;
  if (snackPref) {
    const embedding = await generateEmbedding(snackPref);
    const embeddingsBlob = Buffer.from(new Float32Array(embedding).buffer);
    await db.update(participants).set({ embeddings: embeddingsBlob }).where(eq(participants.id, id));
  }

  const [updated] = await db.select().from(participants).where(eq(participants.id, id));
  return toParticipant(updated);
}

export async function getParticipantEmbeddings(id: string): Promise<number[] | null> {
  const [row] = await db
    .select({ embeddings: participants.embeddings })
    .from(participants)
    .where(eq(participants.id, id));
  if (!row || row.embeddings === null) return null;
  const buffer = row.embeddings as Buffer;
  return Array.from(new Float32Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 4));
}

export async function searchParticipants(
  firstName?: string,
  lastName?: string
): Promise<Participant[]> {
  let rows: DbParticipantRow[];
  if (firstName && lastName) {
    rows = await db.select().from(participants).where(
      and(like(participants.firstName, `%${firstName}%`), like(participants.lastName, `%${lastName}%`))
    );
  } else if (firstName) {
    rows = await db.select().from(participants).where(like(participants.firstName, `%${firstName}%`));
  } else if (lastName) {
    rows = await db.select().from(participants).where(like(participants.lastName, `%${lastName}%`));
  } else {
    rows = await db.select().from(participants);
  }
  return rows.map(toParticipant);
}
