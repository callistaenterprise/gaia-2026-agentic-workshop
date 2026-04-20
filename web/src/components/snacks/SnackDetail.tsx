"use client";

import { useState } from "react";
import { Pencil, X, Check } from "lucide-react";
import type { Snack } from "@/lib/types";

type Props = {
  snack: Snack;
};

export function SnackDetail({ snack: initial }: Props) {
  const [snack, setSnack] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Omit<Snack, "id" | "embeddings">>({
    name: "",
    description: null,
    pricePerUnit: null,
    internalDescription: null,
  });

  function startEdit() {
    setForm({
      name: snack.name,
      description: snack.description,
      pricePerUnit: snack.pricePerUnit ?? null,
      internalDescription: snack.internalDescription ?? null,
    });
    setEditing(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/snacks/${snack.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          pricePerUnit: form.pricePerUnit,
          internalDescription: form.internalDescription || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const updated: Snack = await res.json();
      await fetch("/api/snacks/embeddings", { method: "POST" });
      setSnack(updated);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <main className="p-6 max-w-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold mb-2">Edit Snack</h1>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Name</label>
            <input
              required
              className="mt-0.5 w-full rounded border px-2 py-1 text-sm"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <input
              className="mt-0.5 w-full rounded border px-2 py-1 text-sm"
              value={form.description ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Price per unit</label>
            <input
              type="number"
              min={0}
              step={0.01}
              className="mt-0.5 w-full rounded border px-2 py-1 text-sm"
              value={form.pricePerUnit ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  pricePerUnit: e.target.value === "" ? null : parseFloat(e.target.value),
                }))
              }
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Internal description</label>
            <textarea
              rows={3}
              className="mt-0.5 w-full rounded border px-2 py-1 text-sm resize-none"
              value={form.internalDescription ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, internalDescription: e.target.value }))}
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
              disabled={saving || !form.name.trim()}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 disabled:opacity-50 transition-colors"
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
      <h1 className="text-2xl font-bold mb-6">{snack.name}</h1>
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Name</p>
          <p className="text-sm mt-0.5">{snack.name}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Description</p>
          <p className="text-sm mt-0.5">{snack.description ?? <span className="italic text-muted-foreground">—</span>}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Price per unit</p>
          <p className="text-sm mt-0.5">
            {snack.pricePerUnit != null ? `${snack.pricePerUnit.toFixed(2)} kr` : <span className="italic text-muted-foreground">—</span>}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Internal description</p>
          <p className="text-sm mt-0.5">{snack.internalDescription ?? <span className="italic text-muted-foreground">—</span>}</p>
        </div>
      </div>
      <button
        onClick={startEdit}
        className="mt-8 inline-flex items-center gap-1.5 px-3 py-1.5 rounded border text-sm text-amber-700 border-amber-300 hover:bg-amber-50 transition-colors"
      >
        <Pencil size={14} /> Edit
      </button>
    </main>
  );
}
