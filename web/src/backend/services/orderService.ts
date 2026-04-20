import { db } from "@/backend/db/dbClient";
import { orders, orderSnacks, snacks } from "@/backend/db/schema";
import { eq } from "drizzle-orm";

export type OrderItem = {
  snackId: string;
  snackName: string;
  quantity: number;
};

export type OrderRow = {
  id: string;
  name: string;
  createdAt: string;
  items: OrderItem[];
};

async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  return db
    .select({ snackId: orderSnacks.snackId, snackName: snacks.name, quantity: orderSnacks.quantity })
    .from(orderSnacks)
    .innerJoin(snacks, eq(orderSnacks.snackId, snacks.id))
    .where(eq(orderSnacks.orderId, orderId));
}

export async function createOrder(
  name: string,
  items: Array<{ snackId: string; quantity: number }>
): Promise<OrderRow> {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  await db.insert(orders).values({ id, name, createdAt });

  for (const item of items) {
    await db.insert(orderSnacks).values({ orderId: id, snackId: item.snackId, quantity: item.quantity });
  }

  const orderItems = await getOrderItems(id);
  return { id, name, createdAt, items: orderItems };
}

export async function getOrder(id: string): Promise<OrderRow | null> {
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order) return null;

  const items = await getOrderItems(id);
  return { ...order, items };
}
