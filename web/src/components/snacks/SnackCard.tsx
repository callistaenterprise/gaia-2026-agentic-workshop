"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Cookie, Pencil, X, Check } from "lucide-react";
import type { Snack } from "@/lib/types";

type Props = {
  snack?: Snack;
  loading?: boolean;
  onUpdated?: (snack: Snack) => void;
};

export function SnackCard({ snack, loading, onUpdated }: Props) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Omit<Snack, "id">>({
    name: "",
    description: null,
    pricePerUnit: null,
    internalDescription: null,
  });

  if (loading) {
    return (
      <div className="p-4 border rounded space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    );
  }

  if (!snack) return null;

  function startEdit(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setForm({
      name: snack!.name,
      description: snack!.description,
      pricePerUnit: snack!.pricePerUnit ?? null,
      internalDescription: snack!.internalDescription ?? null,
    });
    setEditing(true);
  }

  function cancelEdit(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setEditing(false);
  }

  async function save(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setSaving(true);
    try {
      const res = await fetch(`/api/snacks/${snack!.id}`, {
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
      setEditing(false);
      onUpdated?.(updated);
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div
        className="p-4 border rounded bg-amber-50 border-amber-300 flex flex-col gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <Cookie className="shrink-0 text-amber-500" size={20} />
          <span className="text-sm font-medium text-amber-700">Editing snack</span>
        </div>
        <div className="flex flex-col gap-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Name</label>
            <input
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
              rows={2}
              className="mt-0.5 w-full rounded border px-2 py-1 text-sm resize-none"
              value={form.internalDescription ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, internalDescription: e.target.value }))}
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={cancelEdit}
            className="inline-flex items-center gap-1 px-3 py-1 rounded border text-sm text-muted-foreground hover:bg-muted transition-colors"
          >
            <X size={14} /> Cancel
          </button>
          <button
            onClick={save}
            disabled={saving || !form.name.trim()}
            className="inline-flex items-center gap-1 px-3 py-1 rounded bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 disabled:opacity-50 transition-colors"
          >
            <Check size={14} /> {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded bg-amber-50 border-amber-200 flex gap-3 group">
      <Cookie className="mt-0.5 shrink-0 text-amber-500" size={20} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold">{snack.name}</p>
        {snack.description && (
          <p className="text-sm text-muted-foreground mt-1">{snack.description}</p>
        )}
        {snack.pricePerUnit != null && (
          <p className="text-xs text-muted-foreground mt-1">{snack.pricePerUnit.toFixed(2)} kr / unit</p>
        )}
      </div>
      <button
        onClick={startEdit}
        className="self-start opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-amber-100 text-amber-600 transition-opacity"
        title="Edit snack"
      >
        <Pencil size={15} />
      </button>
    </div>
  );
}
