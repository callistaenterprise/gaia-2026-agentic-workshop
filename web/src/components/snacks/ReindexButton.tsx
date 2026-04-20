"use client";

import { useState } from "react";

export function ReindexButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleReindex() {
    setStatus("loading");
    try {
      const res = await fetch("/api/snacks/embeddings", { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  return (
    <button
      onClick={handleReindex}
      disabled={status === "loading"}
      className="text-sm px-3 py-1.5 rounded border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {status === "loading" && "Indexing…"}
      {status === "success" && "✓ Indexed"}
      {status === "error" && "✗ Failed"}
      {status === "idle" && "Re-index snacks"}
    </button>
  );
}
