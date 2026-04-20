import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { db } from "@/backend/db/dbClient";
import { snacks } from "@/backend/db/schema";
import { inArray } from "drizzle-orm";
import { updateSnackEmbeddings, deleteSnackEmbeddings, semanticSearchSnacks } from "@/backend/services/embeddingService";
import {
  createSnack,
  deleteSnack,
  updateSnack,
  searchSnacks,
} from "@/backend/services/snackService";
import { snackSchema } from "./schemas";

export const addSnackTool = createTool({
  id: "addSnackTool",
  description: "Create a new snack with a name and optional description",
  inputSchema: z.object({
    name: z.string().describe("Name of the snack"),
    description: z.string().optional().describe("Optional snack description"),
    pricePerUnit: z.number().optional().describe("Price per unit"),
    internalDescription: z.string().optional().describe("Internal description for vector indexing"),
  }),
  outputSchema: snackSchema,
  execute: async ({ name, description, pricePerUnit, internalDescription }) => {
    const result = await createSnack(name, description, pricePerUnit, internalDescription);
    await updateSnackEmbeddings(result);
    return result;
  },
});

export const deleteSnackTool = createTool({
  id: "deleteSnackTool",
  description: "Delete a snack by its ID",
  inputSchema: z.object({
    id: z.string().describe("ID of the snack to delete"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async ({ id }) => {
    const deleted = await deleteSnack(id);
    if (!deleted) {
      return { success: false, message: `Snack with id "${id}" not found` };
    }
    await deleteSnackEmbeddings(id);
    return { success: true, message: `Snack "${id}" deleted successfully` };
  },
});

export const updateSnackTool = createTool({
  id: "updateSnackTool",
  description: "Update an existing snack's name or description",
  inputSchema: z.object({
    id: z.string().describe("ID of the snack to update"),
    name: z.string().optional().describe("New snack name"),
    description: z.string().optional().describe("New description"),
    pricePerUnit: z.number().optional().describe("New price per unit"),
    internalDescription: z.string().optional().describe("New internal description for vector indexing"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    snack: snackSchema.optional(),
  }),
  execute: async ({ id, name, description, pricePerUnit, internalDescription }) => {
    const updates: Partial<{ name: string; description: string; pricePerUnit: number; internalDescription: string }> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (pricePerUnit !== undefined) updates.pricePerUnit = pricePerUnit;
    if (internalDescription !== undefined) updates.internalDescription = internalDescription;

    const snack = await updateSnack(id, updates);
    if (!snack) {
      return { success: false, message: `Snack with id "${id}" not found` };
    }
    await updateSnackEmbeddings(snack);
    return { success: true, message: "Snack updated", snack };
  },
});

export const searchSnacksTool = createTool({
  id: "searchSnacksTool",
  description: "Search snacks by name (partial match). Returns all snacks if no filter given.",
  inputSchema: z.object({
    name: z.string().optional().describe("Partial name to search for (case-insensitive)"),
  }),
  outputSchema: z.array(snackSchema),
  execute: async ({ name }) => {
    const results = await searchSnacks(name);
    return results;
  },
});

export const semanticSearchSnacksTool = createTool({
  id: "semanticSearchSnacksTool",
  description:
    "Search snacks by semantic similarity using a natural language query against the internalDescription field. Use this when the user describes what kind of snack they want rather than a specific name.",
  inputSchema: z.object({
    query: z.string().describe("Natural language description of the desired snack"),
    nResults: z.number().optional().default(5).describe("Max number of results to return"),
  }),
  outputSchema: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().nullable(),
      pricePerUnit: z.number().nullable(),
      internalDescription: z.string().nullable(),
      similarity: z.number().describe("Similarity score 0-1, higher is more similar"),
    })
  ),
  execute: async ({ query, nResults = 5 }) => {
    const hits = await semanticSearchSnacks(query, nResults);
    if (hits.length === 0) return [];

    const ids = hits.map((h) => h.id);
    const snackRecords = await db.select().from(snacks).where(inArray(snacks.id, ids));

    return hits
      .map(({ id, score }) => {
        const snack = snackRecords.find((s) => s.id === id);
        if (!snack) return null;
        return {
          id,
          name: snack.name,
          description: snack.description ?? null,
          pricePerUnit: snack.pricePerUnit ?? null,
          internalDescription: snack.internalDescription ?? null,
          similarity: score,
        };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);
  },
});

export const snackTools = {
  addSnackTool,
  deleteSnackTool,
  updateSnackTool,
  searchSnacksTool,
  semanticSearchSnacksTool,
};
