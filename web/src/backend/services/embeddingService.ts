import { google } from "@ai-sdk/google";
import { PCA } from 'ml-pca';
import * as lancedb from "@lancedb/lancedb";
import path from "path";

import { db } from "@/backend/db/dbClient";
import { snacks } from "@/backend/db/schema";
import { inArray } from "drizzle-orm";
import { embed, embedMany } from "ai";
import type { Snack } from "@/lib/types";

const EMBEDDING_MODEL = "gemini-embedding-001";
const LANCEDB_PATH = path.resolve(process.cwd(), "../.lancedb-data");
const TABLE_NAME = "snacks";
const VECTOR_DIMS = 768;

type SnackRecord = {
  id: string;
  vector: number[];
  name: string;
  price: number;
};

let _db: lancedb.Connection | null = null;
let _table: lancedb.Table | null = null;

async function getDb(): Promise<lancedb.Connection> {
  if (!_db) _db = await lancedb.connect(LANCEDB_PATH);
  return _db;
}

async function getTable(): Promise<lancedb.Table> {
  if (_table) return _table;
  const conn = await getDb();
  const tableNames = await conn.tableNames();
  if (tableNames.includes(TABLE_NAME)) {
    _table = await conn.openTable(TABLE_NAME);
  } else {
    // Create table with a placeholder row so the schema is established
    _table = await conn.createTable(TABLE_NAME, [
      { id: "__init__", vector: new Array(VECTOR_DIMS).fill(0), name: "", price: 0 },
    ]);
    await _table.delete('id = "__init__"');
  }
  return _table;
}

async function embedText(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: google.textEmbeddingModel(EMBEDDING_MODEL),
    value: text,
    providerOptions: { google: { outputDimensionality: VECTOR_DIMS } },
  });
  return embedding;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  return embedText(text);
}

export async function updateSnackEmbeddings(snack: Snack) {
  if (!snack.internalDescription && !snack.name) return;
  const table = await getTable();
  const document = [snack.name, snack.internalDescription].filter(Boolean).join(": ");
  const vector = await embedText(document);
  // LanceDB upsert: delete existing then add
  try { await table.delete(`id = "${snack.id}"`); } catch { /* not found is fine */ }
  await table.add([{ id: snack.id, vector, name: snack.name, price: snack.pricePerUnit ?? 0 }]);
}

export async function deleteSnackEmbeddings(id: string) {
  try {
    const table = await getTable();
    await table.delete(`id = "${id}"`);
  } catch { /* ignore if not found */ }
}

export async function getSimilarSnacks(
  embedding: number[],
  nResults: number = 3,
  excludeSnacks?: string[],
  maxPrice?: number
): Promise<Snack[]> {
  const table = await getTable();

  const filters: string[] = [];
  if (maxPrice !== undefined) filters.push(`price <= ${maxPrice}`);
  if (excludeSnacks && excludeSnacks.length > 0) {
    const quoted = excludeSnacks.map((id) => `'${id}'`).join(", ");
    filters.push(`id NOT IN (${quoted})`);
  }

  let query = table.search(embedding).limit(nResults);
  if (filters.length > 0) query = query.where(filters.join(" AND "));

  const rows = await query.toArray() as SnackRecord[];
  const ids = rows.map((r) => r.id);
  if (ids.length === 0) return [];

  const snackRows = await db.select().from(snacks).where(inArray(snacks.id, ids));
  const snackMap = new Map(snackRows.map((s) => [s.id, s]));
  return ids.map((id) => snackMap.get(id)!).filter(Boolean);
}

export async function semanticSearchSnacks(
  query: string,
  nResults: number = 5
): Promise<Array<{ id: string; score: number }>> {
  const table = await getTable();
  const vector = await embedText(query);
  const rows = await table.search(vector).limit(nResults).toArray() as Array<SnackRecord & { _distance: number }>;
  return rows.map((r) => ({ id: r.id, score: parseFloat((1 - (r._distance ?? 0)).toFixed(4)) }));
}

export async function indexAllSnacks() {
  const allSnacks = await db.select().from(snacks);
  const withDescription = allSnacks.filter((s) => s.internalDescription || s.name);
  if (withDescription.length === 0) return;

  const documents = withDescription.map((s) =>
    [s.name, s.internalDescription].filter(Boolean).join(": ")
  );
  const { embeddings } = await embedMany({
    model: google.textEmbeddingModel(EMBEDDING_MODEL),
    values: documents,
    providerOptions: { google: { outputDimensionality: VECTOR_DIMS } },
  });

  const table = await getTable();
  // Clear existing and re-index
  try { await table.delete("id IS NOT NULL"); } catch { /* ignore */ }
  const records: SnackRecord[] = withDescription.map((s, i) => ({
    id: s.id,
    vector: embeddings[i],
    name: s.name,
    price: s.pricePerUnit ?? 0,
  }));
  await table.add(records);
}

// ─── PCA / visualization ──────────────────────────────────────────────────────

export type TsnePoint = { id: string; name: string; x: number; y: number }

function runPca(embeddings: number[][]): number[][] {
  const pca = new PCA(embeddings);
  const projected = pca.predict(embeddings, { nComponents: 2 });
  return projected.to2DArray();
}

async function fetchSnackEmbeddings() {
  const table = await getTable();
  const rows = await table.query().toArray() as Array<SnackRecord & { vector: number[] | Float32Array }>;
  return {
    ids: rows.map((r) => r.id),
    // LanceDB returns vectors as Float32Array — convert to plain number[] for ml-pca
    embeddings: rows.map((r) => Array.from(r.vector)),
    names: rows.map((r) => r.name),
  };
}

export async function getSnackTsneCoordinates(): Promise<TsnePoint[]> {
  const { ids, embeddings, names } = await fetchSnackEmbeddings();
  if (embeddings.length < 3) return [];
  const coords = runPca(embeddings);
  return ids.map((id, i) => ({ id, name: names[i] ?? id, x: coords[i][0], y: coords[i][1] }));
}

export async function getSnackTsneCoordinatesWithQuery(
  query: string
): Promise<{ snackPoints: TsnePoint[]; queryPoint: TsnePoint }> {
  const { ids, embeddings, names } = await fetchSnackEmbeddings();
  if (embeddings.length < 3) return { snackPoints: [], queryPoint: { id: 'query', name: query, x: 0, y: 0 } };

  const queryEmbedding = await embedText(query);
  const coords = runPca([...embeddings, Array.from(queryEmbedding)]);

  const snackPoints = ids.map((id, i) => ({ id, name: names[i] ?? id, x: coords[i][0], y: coords[i][1] }));
  const last = coords[coords.length - 1];
  return { snackPoints, queryPoint: { id: 'query', name: query, x: last[0], y: last[1] } };
}

// Legacy export — kept for any code that imported this name
export const getSnacksCollection = getTable;
