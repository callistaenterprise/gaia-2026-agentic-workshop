"use client";

import { useState } from "react";
import type { Snack } from "@/lib/types";
import { SnackTable } from "./SnackTable";

type Props = {
  initialSnacks: Snack[];
};

export function SnackList({ initialSnacks }: Props) {
  const [snacks] = useState<Snack[]>(initialSnacks);

  if (snacks.length === 0) {
    return <p className="text-gray-500">No snacks found.</p>;
  }

  return <SnackTable snacks={snacks} />;
}
