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
import type { Participant } from "@/lib/types";

type Props = {
  participants?: Participant[];
  loading?: boolean;
};

export function ParticipantTable({ participants, loading }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Snack preference</TableHead>
          <TableHead>Embeddings</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              </TableRow>
            ))
          : participants?.map((participant) => (
              <TableRow key={participant.id}>
                <TableCell className="font-medium">
                  <Link href={`/participants/${participant.id}`} className="hover:underline">
                    {participant.firstName} {participant.lastName}
                  </Link>
                </TableCell>
                <TableCell>{participant.snackPreference ?? "—"}</TableCell>
                <TableCell>{participant.hasEmbeddings ? "✓" : ""}</TableCell>
              </TableRow>
            ))}
      </TableBody>
    </Table>
  );
}
