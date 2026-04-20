"use client";

import { useState } from "react";
import { Pencil, X, Check } from "lucide-react";
import type { Participant, AppEvent } from "@/lib/types";
import { EventTable } from "@/components/events/EventTable";

type Props = {
  participant: Participant;
  events: AppEvent[];
};

export function ParticipantDetail({ participant: initial, events }: Props) {
  const [participant, setParticipant] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Omit<Participant, "id" | "hasEmbeddings">>({
    firstName: "",
    lastName: "",
    snackPreference: null,
  });

  function startEdit() {
    setForm({
      firstName: participant.firstName,
      lastName: participant.lastName,
      snackPreference: participant.snackPreference,
    });
    setEditing(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/participants/${participant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          snackPreference: form.snackPreference || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const updated: Participant = await res.json();
      setParticipant(updated);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <main className="p-6 max-w-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold mb-2">Edit Participant</h1>
          <div>
            <label className="text-xs font-medium text-muted-foreground">First name</label>
            <input
              required
              className="mt-0.5 w-full rounded border px-2 py-1 text-sm"
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Last name</label>
            <input
              required
              className="mt-0.5 w-full rounded border px-2 py-1 text-sm"
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Snack preference</label>
            <input
              className="mt-0.5 w-full rounded border px-2 py-1 text-sm"
              value={form.snackPreference ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, snackPreference: e.target.value }))}
            />
          </div>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded border text-sm text-muted-foreground hover:bg-muted transition-colors"
            >
              <X size={14} /> Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !form.firstName.trim() || !form.lastName.trim()}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <Check size={14} /> {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-lg">
      <h1 className="text-2xl font-bold mb-6">
        {participant.firstName} {participant.lastName}
      </h1>
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground">First name</p>
          <p className="text-sm mt-0.5">{participant.firstName}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Last name</p>
          <p className="text-sm mt-0.5">{participant.lastName}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Snack preference</p>
          <p className="text-sm mt-0.5">
            {participant.snackPreference ?? <span className="italic text-muted-foreground">—</span>}
          </p>
        </div>
      </div>
      <button
        onClick={startEdit}
        className="mt-8 inline-flex items-center gap-1.5 px-3 py-1.5 rounded border text-sm text-green-700 border-green-300 hover:bg-green-50 transition-colors"
      >
        <Pencil size={14} /> Edit
      </button>

      <h2 className="text-lg font-semibold mt-10 mb-3">Events ({events.length})</h2>
      {events.length === 0 ? (
        <p className="text-gray-500">Not registered for any events.</p>
      ) : (
        <EventTable events={events} />
      )}
    </main>
  );
}
