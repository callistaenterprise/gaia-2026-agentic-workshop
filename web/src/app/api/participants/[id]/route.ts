import { updateParticipant } from "@/backend/services/participantService";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { firstName, lastName, snackPreference } = await req.json();

  const updates: Partial<{ firstName: string; lastName: string; snackPreference: string }> = {};
  if (firstName !== undefined) updates.firstName = firstName;
  if (lastName !== undefined) updates.lastName = lastName;
  if (snackPreference !== undefined) updates.snackPreference = snackPreference;

  const participant = await updateParticipant(id, updates);
  if (!participant) {
    return NextResponse.json({ error: "Participant not found" }, { status: 404 });
  }
  return NextResponse.json(participant);
}
