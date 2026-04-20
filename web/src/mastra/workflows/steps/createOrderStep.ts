import { getEventById } from "@/backend/services/eventService";
import { db } from "@/backend/db/dbClient";
import { orders, orderSnacks } from "@/backend/db/schema";
import { OrderWorkflowSchema } from "@/lib/types";
import { createStep } from "@mastra/core/workflows";
import z from "zod";

const orderItemInput = z.object({
  snackId: z.string(),
  quantity: z.number().int().positive(),
});

export { orderItemInput };

export const createOrder = createStep({
  id: "createOrder",
  inputSchema: OrderWorkflowSchema,
  outputSchema: OrderWorkflowSchema,
  execute: async ({ inputData }) => {


    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const event = await getEventById(inputData.eventId);
    const orderName = "Snack order for " + event?.name;

    // Create order
    await db.insert(orders).values({ id, name: orderName, createdAt });

    // Find the quantity for each snack
    const snackQuantities = new Map<string, number>();
    for (const participant of inputData.participants) {
      if (participant.selectedSnackId) {
        snackQuantities.set(
          participant.selectedSnackId,
          (snackQuantities.get(participant.selectedSnackId) ?? 0) + 1
        );
      }
    }

    // Insert line items
    for (const [snackId, quantity] of snackQuantities) {
      await db.insert(orderSnacks).values({ orderId: id, snackId, quantity });
    }

    return { ...inputData, orderId: id };
  },
});
