"use client";

import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Snack } from "@/lib/types";

type Props = {
  snacks?: Snack[];
  loading?: boolean;
};

export function SnackTable({ snacks, loading }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Price / unit</TableHead>
          <TableHead>Internal description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-64" /></TableCell>
              </TableRow>
            ))
          : snacks?.map((snack) => (
              <TableRow key={snack.id}>
                <TableCell className="font-medium">
                  <Link href={`/snacks/${snack.id}`} className="hover:underline">
                    {snack.name}
                  </Link>
                </TableCell>
                <TableCell>{snack.description ?? "—"}</TableCell>
                <TableCell>
                  {snack.pricePerUnit != null ? `${snack.pricePerUnit.toFixed(2)} kr` : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm max-w-xs">
                  <p className="truncate">{snack.internalDescription ?? "—"}</p>
                </TableCell>
              </TableRow>
            ))}
      </TableBody>
    </Table>
  );
}
