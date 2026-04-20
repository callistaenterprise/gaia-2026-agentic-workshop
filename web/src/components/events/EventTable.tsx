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
import type { AppEvent } from "@/lib/types";

type Props = {
  events?: AppEvent[];
  loading?: boolean;
};

export function EventTable({ events, loading }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-48" /></TableCell>
              </TableRow>
            ))
          : events?.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">
                  <Link href={`/events/${event.id}`} className="hover:underline">
                    {event.name}
                  </Link>
                </TableCell>
                <TableCell>{event.date}</TableCell>
                <TableCell>{event.description ?? "—"}</TableCell>
              </TableRow>
            ))}
      </TableBody>
    </Table>
  );
}
