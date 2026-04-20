"use client";

import { useState } from "react";

export interface ApprovalItem {
  snackId: string;
  snackName: string;
  quantity: number;
}

interface Props {
  details: string;
  items: ApprovalItem[];
}

type CardState = "awaiting" | "creating" | "created" | "rejected";

export function OrderApprovalCard({ details, items }: Props) {
  const [state, setState] = useState<CardState>("awaiting");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setState("creating");
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ details, items: items.map(({ snackId, quantity }) => ({ snackId, quantity })) }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Unknown error");
      }
      const data = await res.json();
      setOrderId(data?.results?.draftOrder?.output?.orderId ?? null);
      setState("created");
    } catch (e) {
      setError(String(e));
      setState("awaiting");
    }
  };

  if (state === "created") {
    return (
      <div className="border rounded-lg p-4 bg-green-50 border-green-200 my-2">
        <p className="text-sm font-medium text-green-800">Order created.</p>
        {orderId && <p className="text-xs text-green-700 mt-1">Order ID: {orderId}</p>}
      </div>
    );
  }

  if (state === "rejected") {
    return (
      <div className="border rounded-lg p-4 bg-gray-50 border-gray-200 my-2 text-sm text-gray-600">
        Order cancelled.
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-indigo-50 border-indigo-200 my-2">
      <h3 className="font-semibold text-indigo-900 mb-1 text-sm">Order Summary</h3>
      {details && <p className="text-sm text-indigo-700 mb-3">{details}</p>}
      {items.length > 0 && (
        <ul className="mb-4 divide-y divide-indigo-100">
          {items.map((item, i) => (
            <li key={i} className="flex justify-between text-sm py-1">
              <span className="text-indigo-900">{item.snackName}</span>
              <span className="text-indigo-600 font-mono">× {item.quantity}</span>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
      <div className="flex gap-3 mt-1">
        <button
          onClick={handleApprove}
          disabled={state === "creating"}
          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 disabled:opacity-50"
        >
          {state === "creating" ? "Creating..." : "Approve"}
        </button>
        <button
          onClick={() => setState("rejected")}
          disabled={state === "creating"}
          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
