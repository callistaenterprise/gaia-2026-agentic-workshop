"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  orderId: string;
}

export function OrderActions({ orderId }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirm("Delete this order?")) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Unknown error");
      }
      router.push("/orders");
    } catch (e) {
      setError(String(e));
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-3 mt-6">
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 disabled:opacity-50"
      >
        {deleting ? "Deleting…" : "Delete order"}
      </button>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
}
