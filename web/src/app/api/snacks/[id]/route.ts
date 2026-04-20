import { updateSnack } from "@/backend/services/snackService";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, description, pricePerUnit, internalDescription } = await req.json();

  const updates: Partial<{ name: string; description: string; pricePerUnit: number; internalDescription: string }> = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (pricePerUnit !== undefined) updates.pricePerUnit = pricePerUnit;
  if (internalDescription !== undefined) updates.internalDescription = internalDescription;

  const snack = await updateSnack(id, updates);
  if (!snack) {
    return NextResponse.json({ error: "Snack not found" }, { status: 404 });
  }
  return NextResponse.json(snack);
}
