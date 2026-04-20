import { db } from "@/backend/db/dbClient";
import { orders } from "@/backend/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const deleted = await db.delete(orders).where(eq(orders.id, id)).returning({ id: orders.id });
    if (deleted.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Failed to delete order", id, e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
