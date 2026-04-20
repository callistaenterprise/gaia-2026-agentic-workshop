import { db } from "@/backend/db/dbClient";
import { snacks } from "@/backend/db/schema";
import { eq, like } from "drizzle-orm";

export type SnackRow = {
  id: string;
  name: string;
  description: string | null;
  pricePerUnit: number | null;
  internalDescription: string | null;
};

export async function createSnack(
  name: string,
  description?: string,
  pricePerUnit?: number,
  internalDescription?: string
): Promise<SnackRow> {
  const existing = await searchSnacks(name);
  const exact = existing.find(s => s.name.toLowerCase() === name.
    toLowerCase());
  if (exact) return exact;
  const id = crypto.randomUUID();
  await db.insert(snacks).values({ id, name, description, pricePerUnit, internalDescription });
  return {
    id,
    name,
    description: description ?? null,
    pricePerUnit: pricePerUnit ?? null,
    internalDescription: internalDescription ?? null,
  };
}

export async function deleteSnack(id: string): Promise<boolean> {
  const deleted = await db.delete(snacks).where(eq(snacks.id, id)).returning({ id: snacks.id });
  return deleted.length > 0;
}

export async function updateSnack(
  id: string,
  updates: Partial<{ name: string; description: string; pricePerUnit: number; internalDescription: string }>
): Promise<SnackRow | null> {
  const [updated] = await db.update(snacks).set(updates).where(eq(snacks.id, id)).returning();
  return updated ?? null;
}

export async function searchSnacks(
  name?: string
): Promise<SnackRow[]> {
  if (name) {
    return db.select().from(snacks).where(like(snacks.name, `%${name}%`));
  }
  return db.select().from(snacks);
}
